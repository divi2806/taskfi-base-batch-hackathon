import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { getConnectedAddress, setConnectedAddress, getCurrentUser, initializeUser } from '../lib/mockData';
import { User } from '../types';
import { getUserStage, getStageEmoji } from '../lib/web3Utils';
import { saveUser, getUser, updateUserXP } from '@/services/firebase';
import LevelUpDialog from '@/components/notifications/LevelUpDialog';
import TokenService from '../lib/tokenContract';
import { ethers } from 'ethers';

// Sepolia chain info
const SEPOLIA_CHAIN_ID = '0x2105';  // Hex value for base Sepolia testnet (84532 in decimal)
const SEPOLIA_RPC_URL = 'https://mainnet.base.org/';

// Treasury wallet for token airdrops
const TREASURY_PRIVATE_KEY = import.meta.env.TREASURY_PRIVATE_KEY1;
const TOKEN_CONTRACT_ADDRESS = '0x55811C42441E0E77364D531B8C4B987A8Dc1308e';

interface Web3ContextType {
  isConnected: boolean;
  connecting: boolean;
  address: string | null;
  user: User | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshUser: () => Promise<void>;
  updateUsername: (username: string) => void;
  addUserXP: (amount: number) => Promise<void>;
  tokenBalance: string;
  fetchTokenBalance: () => Promise<void>;
  isSignatureVerified: boolean;
  verifyWalletSignature: () => Promise<boolean>;
  signatureVerifying: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  connecting: false,
  address: null,
  user: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  refreshUser: async () => {},
  updateUsername: () => {},
  addUserXP: async () => {},
  tokenBalance: "0",
  fetchTokenBalance: async () => {},
  isSignatureVerified: false,
  verifyWalletSignature: async () => false,
  signatureVerifying: false
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dailyLoginChecked, setDailyLoginChecked] = useState<boolean>(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [isSignatureVerified, setIsSignatureVerified] = useState<boolean>(false);
  const [signatureVerifying, setSignatureVerifying] = useState<boolean>(false);

  // Function to fetch the token balance
  const fetchTokenBalance = async (): Promise<void> => {
    if (!address || !window.ethereum || !isConnected) return;
    
    try {
      // Use TokenService to get the balance
      const balance = await TokenService.getTokenBalance(address);
      
      // Format to 2 decimal places
      const formattedBalance = balance.toFixed(2);
      
      setTokenBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };

  // Function to airdrop tokens to the user
  const airdropTokens = async (userAddress: string, amount: number = 200): Promise<boolean> => {
    try {
      // Create a provider for the treasury wallet
      const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
      const treasuryWallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);
      
      // Create token contract instance
      const tokenContract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS,
        [
          "function transfer(address to, uint256 amount) returns (bool)",
          "function balanceOf(address account) view returns (uint256)"
        ],
        treasuryWallet
      );
      
      // Convert amount to wei (assuming 18 decimals)
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
      
      // Check if user already has tokens
      const userBalanceWei = await tokenContract.balanceOf(userAddress);
      const userBalance = parseFloat(ethers.utils.formatUnits(userBalanceWei, 18));
      
      if (userBalance > 0) {
        // User already has tokens
        console.log(`User already has ${userBalance} tokens`);
        return true;
      }
      
      // Transfer tokens
      const tx = await tokenContract.transfer(userAddress, amountInWei);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      console.log(`Successfully airdropped ${amount} tokens to ${userAddress}`);
      return true;
    } catch (error) {
      console.error("Error airdropping tokens:", error);
      return false;
    }
  };

  // Function to verify wallet signature
  const verifyWalletSignature = async (): Promise<boolean> => {
    if (!address || !window.ethereum) return false;
    
    try {
      setSignatureVerifying(true);
      
      // Create a unique message for the user to sign
      const message = `Verify your identity for InsightQuest: ${address}`;
      
      // Request signature from user
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });
      
      if (!signature) {
        throw new Error('No signature provided');
      }
      
      // Verify signature
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      
      const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
      
      if (isValid) {
        // Mark as verified in state
        setIsSignatureVerified(true);
        
        // Mark as verified in user data
        if (user) {
          const updatedUser = {
            ...user,
            signatureVerified: true
          };
          
          await saveUser(updatedUser);
          setUser(updatedUser);
        }
        
        // Airdrop tokens to user
        const airdropSuccess = await airdropTokens(address);
        
        if (airdropSuccess) {
          toast.success('Signature verified and tokens airdropped!', {
            description: 'You have been verified as a human and received 200 $TASK tokens',
            duration: 5000
          });
          
          // Refresh token balance
          await fetchTokenBalance();
        } else {
          toast.success('Signature verified!', {
            description: 'You have been verified as a human',
            duration: 5000
          });
        }
        
        return true;
      } else {
        toast.error('Signature verification failed', {
          description: 'The signature could not be verified. Please try again.'
        });
        return false;
      }
    } catch (error) {
      console.error('Error verifying signature:', error);
      toast.error('Signature verification failed', {
        description: 'There was an error while verifying your signature. Please try again.'
      });
      return false;
    } finally {
      setSignatureVerifying(false);
    }
  };

  // Function to add $TASK token to MetaMask
  const addTokenToWallet = async () => {
    if (!window.ethereum) return false;
    
    try {
      // Request to add the token to the wallet
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: TOKEN_CONTRACT_ADDRESS, // TASK token contract address
            symbol: 'TASK',
            decimals: 18,
            image: 'https://imgur.com/a/BzNO9wc', // Replace with your token logo URL
          },
        },
      });
      
      if (wasAdded) {
        toast.success('$TASK token added to your wallet!');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error adding token to wallet:', error);
      return false;
    }
  };
  
  // Check if the user is on the correct network
  const checkAndSwitchNetwork = async () => {
    if (!window.ethereum) return false;
    
    try {
      // Get the current chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // If not on Sepolia, switch
      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
          return true;
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: SEPOLIA_CHAIN_ID,
                    chainName: 'Sepolia Testnet',
                    rpcUrls: [SEPOLIA_RPC_URL],
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    blockExplorerUrls: ['https://basescan.org'],
                  },
                ],
              });
              return true;
            } catch (addError) {
              console.error('Error adding Base  network:', addError);
              return false;
            }
          }
          console.error('Error switching to Base  network:', switchError);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  };

  // Listen for network changes
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleChainChanged = async (chainId: string) => {
      if (chainId !== SEPOLIA_CHAIN_ID && isConnected) {
        toast.warning('Network Change Detected', {
          description: 'Please use Base   for Task-fi',
          action: {
            label: 'Switch Back',
            onClick: checkAndSwitchNetwork,
          },
          duration: 0, // Keep toast visible until dismissed
        });
      }
    };
    
    window.ethereum.on('chainChanged', handleChainChanged);
    
    // Clean up listener on unmount
    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isConnected]);

  const checkDailyLogin = async (currentUser: User) => {
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = currentUser.lastLogin;
    
    // Initialize streak if not present
    if (!currentUser.loginStreak) {
      currentUser.loginStreak = 0;
    }
    
    if (lastLogin !== today) {
      // Check if streak should continue or reset
      let streak = currentUser.loginStreak || 0;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // If last login was yesterday, increment streak
      if (lastLogin === yesterdayStr) {
        streak += 1;
      } 
      // If last login was more than a day ago, reset streak
      else if (lastLogin) {
        streak = 1; // Reset but count today
      } 
      // First time login
      else {
        streak = 1;
      }
      
      // Calculate XP bonus based on streak
      let xpReward = 100; // Base XP reward
      let streakBonus = 0;
      
      if (streak >= 7) {
        streakBonus = 100; // 7+ days streak
      } else if (streak >= 3) {
        streakBonus = 50; // 3-6 days streak
      }
      
      const totalXp = xpReward + streakBonus;
      
      // Update user with new XP and streak info
      const updatedUser = {
        ...currentUser,
        xp: currentUser.xp + totalXp,
        lastLogin: today,
        loginStreak: streak
      };
      
      // Calculate new level
      const oldLevel = currentUser.level;
      const newLevel = Math.floor(Math.sqrt(updatedUser.xp / 100)) + 1;
      updatedUser.level = newLevel;
      
      // Update stage if level changed
      if (oldLevel !== newLevel) {
        updatedUser.stage = getUserStage(newLevel);
      }
      
      // Update user in Firebase
      await saveUser(updatedUser);
      
      // Show toast notification with appropriate message
      if (streak > 1) {
        toast.success(`${streak}-Day Streak! +${totalXp} XP`, {
          description: `You've logged in ${streak} days in a row! Keep it up for more rewards.`,
          duration: 5000,
        });
      } else {
        toast.success(`Daily Login Reward! +${totalXp} XP`, {
          description: `Welcome back! You've earned ${totalXp} XP for logging in today.`,
          duration: 5000,
        });
      }
      
      // Show level up dialog if level changed
      if (oldLevel !== newLevel) {
        setNewLevel(newLevel);
        setShowLevelUp(true);
      }
      
      return updatedUser;
    }
    
    return currentUser;
  };

  // Update checkConnection function
  const checkConnection = async () => {
    try {
      const savedAddress = getConnectedAddress();
      if (savedAddress) {
        // Normalize the address to lowercase
        const normalizedAddress = savedAddress.toLowerCase();
        setAddress(normalizedAddress);
        setIsConnected(true);
        
        // Save the normalized address
        setConnectedAddress(normalizedAddress);
        localStorage.setItem('connectedAddress', normalizedAddress);
        
        // Try to get user from Firebase first
        let fbUser = await getUser(normalizedAddress);
        
        // If not found in Firebase, fall back to local storage or create new
        if (!fbUser) {
          let currentUser = getCurrentUser();
          
          if (currentUser) {
            // Ensure wallet address is stored in lowercase
            currentUser.address = normalizedAddress;
            currentUser.id = normalizedAddress;
            
            // Save to Firebase
            await saveUser(currentUser);
            fbUser = currentUser;
          } else {
            // Create new user if none exists
            const newUser = initializeUser(normalizedAddress);
            await saveUser(newUser);
            fbUser = newUser;
          }
        }
        
        if (fbUser) {
          // Ensure address is normalized
          fbUser.address = normalizedAddress;
          
          // Set stage based on level
          fbUser = {
            ...fbUser,
            stage: getUserStage(fbUser.level)
          };
          
          // Check if user has a verified signature
          if (fbUser.signatureVerified) {
            setIsSignatureVerified(true);
          }
          
          // Check for daily login if not already checked
          if (!dailyLoginChecked) {
            fbUser = await checkDailyLogin(fbUser);
            setDailyLoginChecked(true);
          }
          
          setUser(fbUser);
          
          // Fetch token balance after user is set
          await fetchTokenBalance();
        }
        
        // Ensure correct network
        await checkAndSwitchNetwork();
        
        // Check and add $TASK token to wallet if needed
        try {
          await addTokenToWallet();
        } catch (tokenError) {
          console.error('Error adding token on reconnect:', tokenError);
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
      toast.error("Error connecting to wallet", {
        description: "Please try refreshing the page or reconnecting your wallet"
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);
  
  const updateUsername = async (username: string) => {
    if (!address || !user) return;
    
    const updatedUser = {
      ...user,
      username
    };
    
    // Update user in Firebase
    const success = await saveUser(updatedUser);
    
    if (success) {
      setUser(updatedUser);
      toast.success('Username updated successfully!');
    } else {
      toast.error('Failed to update username');
    }
  };

  const addUserXP = async (amount: number) => {
    if (!user?.id) return;
    
    try {
      const result = await updateUserXP(user.id, amount);
      
      if (result.success) {
        // Update local user state with new XP and level
        const updatedUser = {
          ...user,
          xp: result.newXP,
          level: result.newLevel,
          stage: getUserStage(result.newLevel)
        };
        
        setUser(updatedUser);
        
        // Show toast notification for XP gain
        toast.success(`+${amount} XP earned!`);
        
        // Check for level up
        if (result.oldLevel !== result.newLevel) {
          setNewLevel(result.newLevel);
          setShowLevelUp(true);
        }
      }
    } catch (error) {
      console.error("Error adding XP:", error);
    }
  };

  // Update connectWallet function
  const connectWallet = async () => {
    try {
      setConnecting(true);
      
      // Check if Metamask is installed
      if (typeof window.ethereum === 'undefined') {
        toast.error('Metamask not installed', {
          description: 'Please install Metamask to continue'
        });
        return;
      }
      
      // Try to switch to Sepolia network first
      try {
        // Check and switch to Sepolia network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: 'Sepolia Testnet',
                  rpcUrls: [SEPOLIA_RPC_URL],
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://basescan.org'],
                },
              ],
            });
          } catch (addError) {
            console.error('Error adding Sepolia network:', addError);
            toast.error('Network Switch Failed', {
              description: 'Please manually switch to Base  to continue'
            });
            setConnecting(false);
            return;
          }
        } else {
          console.error('Error switching to Sepolia network:', switchError);
          toast.error('Network Switch Failed', {
            description: 'Please manually switch to Base  to continue'
          });
          setConnecting(false);
          return;
        }
      }
      
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from wallet');
      }
      
      const userAddress = accounts[0].toLowerCase(); // Normalize to lowercase
      
      // Success!
      setAddress(userAddress);
      setConnectedAddress(userAddress); // Save to localStorage
      localStorage.setItem('connectedAddress', userAddress);
      setIsConnected(true);
      
      // Try to get user from Firebase first
      let fbUser = await getUser(userAddress);
      let isNewUser = false;
      
      // If not found in Firebase, check local storage or create new
      if (!fbUser) {
        let currentUser = getCurrentUser();
        
        if (!currentUser) {
          currentUser = initializeUser(userAddress);
          isNewUser = true;
        }
        
        // Ensure ID and address match and are normalized
        currentUser.id = userAddress;
        currentUser.address = userAddress;
        
        // Save to Firebase
        await saveUser(currentUser);
        fbUser = currentUser;
      }
      
      // Set stage based on level
      fbUser = {
        ...fbUser,
        stage: getUserStage(fbUser.level)
      };
      
      // Check if user has a verified signature
      if (fbUser.signatureVerified) {
        setIsSignatureVerified(true);
      }
      
      // Generate a unique avatar for the user if they don't have one already
      if (!fbUser.avatarUrl) {
        // Generate a unique seed based on the user's address to ensure consistency
        const seed = fbUser.address.slice(2, 10); // Use part of the address as seed
        fbUser.avatarUrl = `https://api.dicebear.com/6.x/avataaars/svg?seed=${seed}`;
        await saveUser(fbUser);
      }
      
      setUser(fbUser);
      
      // Fetch token balance
      try {
        await fetchTokenBalance();
      } catch (tokenError) {
        console.error('Error fetching token balance:', tokenError);
        // Don't break the flow if token balance fetching fails
      }
      
      // Show welcome back toast with stage info if returning user
      if (!isNewUser) {
        const emoji = getStageEmoji(fbUser.stage);
        toast.success(`Welcome back to InsightQuest!`, {
          description: `You're currently at the ${emoji} ${fbUser.stage} stage. Keep going!`
        });
        
        // Check daily login reward after a short delay
        setTimeout(async () => {
          try {
            const updatedUser = await checkDailyLogin(fbUser);
            if (updatedUser !== fbUser) {
              setUser(updatedUser);
            }
            setDailyLoginChecked(true);
          } catch (loginError) {
            console.error('Error checking daily login:', loginError);
          }
        }, 1500);
      } else {
        toast.success('Wallet connected successfully!');
        
        // For new users, show a toast about signature verification
        toast.info('Please verify your wallet signature', {
          description: 'Click the "Verify Wallet" button to confirm you are human and receive 200 $TASK tokens',
          duration: 8000,
        });
      }
      
      // Automatically add $TASK token to wallet
      try {
        await addTokenToWallet();
      } catch (tokenError) {
        console.error('Error adding token:', tokenError);
        // Don't show error toast to user as this is a non-critical feature
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet', {
        description: 'Please try again or use a different wallet'
      });
    } finally {
      setConnecting(false);
    }
  };
  
  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setUser(null);
    setTokenBalance("0");
    setIsSignatureVerified(false);
    localStorage.removeItem('connectedAddress');
    toast.info('Wallet disconnected');
  };
  
  const refreshUser = async () => {
    if (address) {
      try {
        // Get fresh user data from Firebase
        let refreshedUser = await getUser(address);
        
        // If not found in Firebase, fall back to local storage or create new
        if (!refreshedUser) {
          refreshedUser = getCurrentUser();
          
          if (!refreshedUser) {
            refreshedUser = initializeUser(address);
          }
          
          // Ensure address is normalized
          refreshedUser.address = address.toLowerCase();
          refreshedUser.id = address.toLowerCase();
          
          // Save to Firebase for future use
          await saveUser(refreshedUser);
        }
        
        if (refreshedUser) {
          // Set stage based on level
          refreshedUser = {
            ...refreshedUser,
            stage: getUserStage(refreshedUser.level)
          };
          
          // Check if user has a verified signature
          if (refreshedUser.signatureVerified) {
            setIsSignatureVerified(true);
          }
          
          setUser(refreshedUser);
          
          // Also refresh token balance
          await fetchTokenBalance();
        }
      } catch (error) {
        console.error("Error refreshing user:", error);
      }
    }
  };
  
  // Check for token balance updates periodically
  useEffect(() => {
    if (isConnected && address) {
      // Initial fetch
      fetchTokenBalance();
      
      // Set up periodic refresh (every 30 seconds)
      const intervalId = setInterval(() => {
        fetchTokenBalance();
      }, 30000);
      
      // Clean up interval
      return () => clearInterval(intervalId);
    }
  }, [isConnected, address]);
  
  return (
    <Web3Context.Provider 
      value={{ 
        isConnected, 
        connecting, 
        address, 
        user,
        connectWallet, 
        disconnectWallet,
        refreshUser,
        updateUsername,
        addUserXP,
        tokenBalance,
        fetchTokenBalance,
        isSignatureVerified,
        verifyWalletSignature,
        signatureVerifying
      }}
    >
      {children}
      
      {/* Level Up Dialog */}
      <LevelUpDialog 
        level={newLevel}
        open={showLevelUp}
        onOpenChange={setShowLevelUp}
      />
    </Web3Context.Provider>
  );
};

// Add TypeScript interface for Ethereum window object
declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}
