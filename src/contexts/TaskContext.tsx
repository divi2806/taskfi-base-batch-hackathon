import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useWeb3 } from './Web3Context';
import { mockTasks } from '../lib/mockData';
import { Task } from '../types';
import leetCodeService from '../services/leetcodeService';
import TokenService from '../lib/tokenContract';
import QuizService, { QuizQuestion, QuizAnswer } from '@/services/quizService';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Twitter, 
  Linkedin, 
  Instagram, 
  Share2, 
  CheckCircle2, 
  Coins,
  Loader2,
  ExternalLink
} from "lucide-react";

// Add transaction info to the Task type
interface TransactionInfo {
  txHash: string;
  network: string;
}

// Extend Task to include transaction info
interface ExtendedTask extends Task {
  transactionInfo?: TransactionInfo;
}

interface TaskContextType {
  tasks: ExtendedTask[];
  loading: boolean;
  addTask: (task: Partial<Task>) => void;
  completeTask: (taskId: string) => Promise<void>;
  verifyTaskCompletion: (taskId: string) => Promise<void>;
  verifyQuizCompletion: (taskId: string, quizAnswers: QuizAnswer[]) => Promise<boolean>;
  deleteTask: (taskId: string) => void;
  getTaskTransactionLink: (taskId: string) => string | null;
  generateTaskQuiz: (task: Task) => Promise<QuizQuestion[]>;
}

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  loading: false,
  addTask: () => {},
  completeTask: async () => {},
  verifyTaskCompletion: async () => {},
  verifyQuizCompletion: async () => false,
  deleteTask: () => {},
  getTaskTransactionLink: () => null,
  generateTaskQuiz: async () => [],
});

export const useTasks = () => useContext(TaskContext);

// Extending the User type to include the missing addUserXP method
interface ExtendedUser extends Record<string, any> {
  id: string;
  leetcodeUsername?: string;
  addUserXP?: (xp: number) => Promise<void>;
}

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
  const { user, address, refreshUser, fetchTokenBalance } = useWeb3();
  
  // Type assertion for user to include our extended properties
  const extendedUser = user as ExtendedUser | null;

  // Load tasks when user changes
  useEffect(() => {
    if (extendedUser) {
      // Filter tasks for the current user
      setTasks(mockTasks.filter(task => task.userId === extendedUser.id) as ExtendedTask[]);
    } else {
      setTasks([]);
    }
  }, [extendedUser]);

  const addTask = (taskData: Partial<Task>) => {
    if (!extendedUser) {
      toast.error('You need to connect your wallet first');
      return;
    }

    // Generate random rewards based on task type
    const randomReward = Math.floor(Math.random() * 20) + 5;  // 5-25 tokens
    const randomXP = Math.floor(Math.random() * 150) + 50;   // 50-200 XP

    const newTask: ExtendedTask = {
      id: Math.random().toString(36).substring(2, 10),
      userId: extendedUser.id,
      title: taskData.title || '',
      description: taskData.description || '',
      type: taskData.type || 'leetcode',
      status: 'pending',
      reward: taskData.reward || randomReward,
      xpReward: taskData.xpReward || randomXP,
      url: taskData.url,
      dateCreated: new Date().toISOString(),
    };

    mockTasks.push(newTask);
    setTasks([...tasks, newTask]);
    toast.success('Task added successfully');
  };

  const completeTask = async (taskId: string) => {
    try {
      setLoading(true);
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        toast.error('Task not found');
        return;
      }

      const updatedTask: ExtendedTask = {
        ...tasks[taskIndex],
        status: 'completed',
        dateCompleted: new Date().toISOString(),
      };

      mockTasks[mockTasks.findIndex(t => t.id === taskId)] = updatedTask;
      
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      setTasks(updatedTasks);
      
      // Open sharing dialog
      setCompletedTaskId(taskId);
      setShareDialogOpen(true);
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform: 'twitter' | 'linkedin' | 'instagram') => {
    if (!completedTaskId) return;
    
    const task = tasks.find(t => t.id === completedTaskId);
    if (!task) return;
    
    // In a real app, this would open the respective sharing dialog
    // For now, we'll simulate it with a toast
    toast.success(`Shared your achievement to ${platform}!`);
    
    // Give bonus tokens for sharing
    const bonusTokens = 5;
    toast.success(`Earned ${bonusTokens} bonus $TASK tokens for sharing!`, {
      icon: <Coins className="h-4 w-4 text-yellow-500" />
    });
    
    // Close dialog
    setShareDialogOpen(false);
    setCompletedTaskId(null);
  };

  const getTaskTransactionLink = (taskId: string): string | null => {
    const task = tasks.find(t => t.id === taskId) as ExtendedTask;
    if (task?.transactionInfo?.txHash) {
      // For Sepolia network
      return `https://basescan.org/tx/${task.transactionInfo.txHash}`;
    }
    return null;
  };

  const verifyTaskCompletion = async (taskId: string) => {
    try {
      setLoading(true);
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        toast.error('Task not found');
        return;
      }

      const task = tasks[taskIndex];
      
      // Check if it's a LeetCode task
      if (task.type === 'leetcode' && task.url) {
        // Make sure we have the user's LeetCode username
        if (!extendedUser?.leetcodeUsername) {
          toast.error('Please verify your LeetCode account first');
          return;
        }
        
        // Show verification in progress toast
        const verifyingToast = toast.loading('Verifying LeetCode solution...');
        
        try {
          // Call our verification API
          const response = await fetch('https://backend-insightquest-eth-333055764507.asia-south2.run.app/api/verify/leetcode-task', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              leetcodeUsername: extendedUser.leetcodeUsername,
              problemUrl: task.url,
              walletAddress: address,
              taskCreatedAt: task.dateCreated
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
          }
          
          const result = await response.json();
          
          // Close the loading toast
          toast.dismiss(verifyingToast);
          
          if (result.success) {
            // Generate a mock transaction hash if not provided
            const txHash = result.txHash || `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
            
            // Update the task status with transaction info
            const updatedTask: ExtendedTask = {
              ...task,
              status: 'verified',
              reward: result.reward || task.reward, // Update with actual reward amount
              transactionInfo: {
                txHash: txHash,
                network: 'sepolia'
              }
            };
            
            mockTasks[mockTasks.findIndex(t => t.id === taskId)] = updatedTask;
            
            const updatedTasks = [...tasks];
            updatedTasks[taskIndex] = updatedTask;
            setTasks(updatedTasks);
            
            // Set the completed task ID to show the share dialog
            setCompletedTaskId(taskId);
            setShareDialogOpen(true);
            
            // Show success message with transaction details
            toast.success(result.message || 'Task verified successfully!', {
              description: `Transaction: ${txHash.substring(0, 10)}...`,
              action: {
                label: 'View',
                onClick: () => window.open(`https://basescan.org/tx/${txHash}`, '_blank')
              }
            });
            
            // Refresh user's token balance
            await fetchTokenBalance();
            
            // Also update user's XP
            if (extendedUser?.addUserXP) {
              await extendedUser.addUserXP(task.xpReward);
            }
          } else {
            toast.error('Verification failed', {
              description: result.message
            });
          }
        } catch (error: any) {
          console.error('Error verifying LeetCode task:', error);
          toast.dismiss(verifyingToast);
          toast.error('Verification failed', {
            description: error.message || 'An unexpected error occurred'
          });
        }
      } else {
        // For non-LeetCode tasks, use the mock verification
        const verified = true; // Simplified for this example
        
        if (verified) {
          // Generate a mock transaction hash
          const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
          
          const updatedTask: ExtendedTask = {
            ...task,
            status: 'verified',
            transactionInfo: {
              txHash,
              network: 'sepolia'
            }
          };
          
          mockTasks[mockTasks.findIndex(t => t.id === taskId)] = updatedTask;
          
          const updatedTasks = [...tasks];
          updatedTasks[taskIndex] = updatedTask;
          setTasks(updatedTasks);
          
          // Set the completed task ID to show the share dialog
          setCompletedTaskId(taskId);
          setShareDialogOpen(true);
          
          toast.success('Task verified successfully!', {
            description: `Transaction: ${txHash.substring(0, 10)}...`,
            action: {
              label: 'View',
              onClick: () => window.open(`https://basescan.org/tx/${txHash}`, '_blank')
            }
          });
        } else {
          toast.error('Task verification failed');
        }
      }
    } catch (error) {
      console.error('Error verifying task:', error);
      toast.error('Failed to verify task');
    } finally {
      setLoading(false);
    }
  };

  // New function to verify quiz completion
  const verifyQuizCompletion = async (taskId: string, quizAnswers: QuizAnswer[]): Promise<boolean> => {
    try {
      setLoading(true);
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        toast.error('Task not found');
        return false;
      }

      const task = tasks[taskIndex];
      
      // Show verification in progress toast
      const verifyingToast = toast.loading('Verifying quiz answers...');
      
      try {
        // Call our verification API
        const response = await QuizService.verifyQuiz(
          extendedUser?.id || '',
          taskId,
          quizAnswers,
          address || ''
        );
        
        // Close the loading toast
        toast.dismiss(verifyingToast);
        
        if (response.success && response.passed) {
          // Update the task status with transaction info
          const updatedTask: ExtendedTask = {
            ...task,
            status: 'verified',
            reward: response.reward || task.reward, // Update with actual reward amount
            transactionInfo: response.txHash ? {
              txHash: response.txHash,
              network: 'sepolia'
            } : undefined
          };
          
          mockTasks[mockTasks.findIndex(t => t.id === taskId)] = updatedTask;
          
          const updatedTasks = [...tasks];
          updatedTasks[taskIndex] = updatedTask;
          setTasks(updatedTasks);
          
          // Set the completed task ID to show the share dialog
          setCompletedTaskId(taskId);
          setShareDialogOpen(true);
          
          // Show success message with transaction details
          toast.success(response.message || 'Quiz completed successfully!', {
            description: response.txHash ? `Transaction: ${response.txHash.substring(0, 10)}...` : undefined,
            action: response.txHash ? {
              label: 'View',
              onClick: () => window.open(`https://basescan.org/tx/${response.txHash}`, '_blank')
            } : undefined
          });
          
          // Refresh user's token balance
          await fetchTokenBalance();
          
          // Also update user's XP
          if (extendedUser?.addUserXP) {
            await extendedUser.addUserXP(task.xpReward);
          }
          
          return true;
        } else {
          toast.error(response.message || 'Quiz verification failed');
          return false;
        }
      } catch (error: any) {
        console.error('Error verifying quiz:', error);
        toast.dismiss(verifyingToast);
        toast.error('Verification failed', {
          description: error.message || 'An unexpected error occurred'
        });
        return false;
      }
    } catch (error) {
      console.error('Error verifying quiz task:', error);
      toast.error('Failed to verify quiz');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to generate quiz questions for a task
  const generateTaskQuiz = async (task: Task): Promise<QuizQuestion[]> => {
    try {
      const quizResponse = await QuizService.generateQuiz(
        task.type,
        task.title,
        task.description,
        5 // Number of questions
      );
      
      if (!quizResponse.success || quizResponse.questions.length === 0) {
        toast.error("Failed to generate quiz questions");
        return [];
      }
      
      return quizResponse.questions;
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz questions");
      return [];
    }
  };

  const deleteTask = (taskId: string) => {
    const taskIndex = mockTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      mockTasks.splice(taskIndex, 1);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        completeTask,
        verifyTaskCompletion,
        verifyQuizCompletion,
        deleteTask,
        getTaskTransactionLink,
        generateTaskQuiz
      }}
    >
      {children}
      
      {/* Share Achievement Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Congratulations on completing your task!
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {completedTaskId && (
              <>
                <div className="mb-4">
                  <p className="font-medium">
                    {tasks.find(t => t.id === completedTaskId)?.title}
                  </p>
                  
                  {tasks.find(t => t.id === completedTaskId)?.transactionInfo?.txHash && (
                    <a 
                      href={`https://basescan.org/tx/${tasks.find(t => t.id === completedTaskId)?.transactionInfo?.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 text-sm flex items-center gap-1 text-brand-purple hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View transaction on Sepolia
                    </a>
                  )}
                </div>
              </>
            )}
            
            <p className="mb-6">
              Would you like to share your achievement and earn 5 bonus $TASK tokens?
            </p>
            
            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => handleShare('twitter')} 
                variant="outline" 
                className="flex items-center gap-3 border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
              >
                <Twitter className="h-5 w-5" />
                Share on Twitter
              </Button>
              <Button 
                onClick={() => handleShare('linkedin')} 
                variant="outline"
                className="flex items-center gap-3 border-blue-700/30 text-blue-700 hover:bg-blue-700/10"
              >
                <Linkedin className="h-5 w-5" />
                Share on LinkedIn
              </Button>
              <Button 
                onClick={() => handleShare('instagram')} 
                variant="outline"
                className="flex items-center gap-3 border-pink-600/30 text-pink-600 hover:bg-pink-600/10"
              >
                <Instagram className="h-5 w-5" />
                Share on Instagram
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShareDialogOpen(false)}
            >
              Maybe later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TaskContext.Provider>
  );
};

export default TaskProvider;
