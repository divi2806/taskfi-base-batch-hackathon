import { Link, useLocation } from "react-router-dom";
import { 
  Wallet, 
  Trophy, 
  Home, 
  Info,
  Menu, 
  X, 
  User, 
  BarChart,
  MessageSquare,
  ChevronDown,
  Building,
  Medal,
  Coins,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWeb3 } from "@/contexts/Web3Context";
import { shortenAddress } from "@/lib/web3Utils";
import NavLinks from "./NavLinks";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ERC20 ABI - Minimal for token balance checking
const ERC20_ABI = [
  // balanceOf function - returns the token balance of a given address
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  // decimals function - returns the number of decimals the token uses
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function"
  }
];

// Token balance hook embedded directly in the file to avoid import issues
const useTokenBalance = () => {
  const { address, isConnected } = useWeb3();
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const TOKEN_CONTRACT_ADDRESS = '0x55811C42441E0E77364D531B8C4B987A8Dc1308e';
  
  const fetchTokenBalance = async () => {
    if (!isConnected || !address || !window.ethereum) {
      setBalance('0');
      return;
    }
    
    try {
      setIsLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_ABI, provider);
      
      // Get token decimals
      const decimals = await tokenContract.decimals();
      
      // Get raw balance
      const rawBalance = await tokenContract.balanceOf(address);
      
      // Format the balance with appropriate decimals
      const formattedBalance = ethers.utils.formatUnits(rawBalance, decimals);
      
      // Limit to 2 decimal places for display
      const displayBalance = parseFloat(formattedBalance).toFixed(2);
      
      setBalance(displayBalance);
    } catch (error) {
      console.error("Error fetching token balance:", error);
      setBalance('0');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch balance on component mount and when address changes
  useEffect(() => {
    fetchTokenBalance();
    
    // Set up listeners for events that should trigger a balance refresh
    if (window.ethereum) {
      const handleAccountsChanged = () => fetchTokenBalance();
      const handleChainChanged = () => fetchTokenBalance();
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Clean up listeners
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address, isConnected]);
  
  return { balance, isLoading, refreshBalance: fetchTokenBalance };
};

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const Header = ({ mobileMenuOpen, setMobileMenuOpen }: HeaderProps) => {
  const location = useLocation();
  const { isConnected, address, user, connectWallet, disconnectWallet } = useWeb3();
  const { balance, isLoading, refreshBalance } = useTokenBalance();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-purple/20 bg-brand-dark-darker/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-r from-brand-purple to-brand-purple-dark purple-glow group-hover:animate-pulse transition-all duration-300">
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                $
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-purple to-brand-purple-dark text-transparent bg-clip-text group-hover:from-brand-purple-dark group-hover:to-brand-purple transition-all duration-300">
              TASK-fi
            </span>
          </Link>
        </div>

        <NavLinks className="hidden md:flex" />

        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="hidden md:flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="px-3 py-1.5 rounded-full bg-brand-dark-lighter text-xs font-medium border border-yellow-500/20 flex items-center gap-1 group">
                      <Coins className="h-3 w-3 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">
                        {isLoading ? "..." : balance}
                      </span>
                      <span className="text-gray-400">$TASK</span>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          refreshBalance();
                        }}
                        className="ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your current TASK token balance</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {user?.stage && (
                <div className="px-2 py-1 rounded-full bg-brand-dark-lighter text-xs font-medium border border-brand-purple/20 flex items-center gap-1">
                  <Medal className="h-3 w-3 text-brand-purple" />
                  <span>{user.stage}</span>
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-brand-dark-lighter/50 transition-colors">
                    <Avatar className="h-8 w-8 border border-brand-purple/30 ring-2 ring-brand-purple/10">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="bg-brand-dark-lighter text-brand-purple">
                        {user?.username?.[0] || user?.address?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-1">
                        {user?.username || shortenAddress(address || "")}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-brand-purple/20">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.username || "User"}</span>
                      <span className="text-xs text-gray-400">{shortenAddress(address || "")}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-brand-purple/10" />
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <BarChart className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/chat" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat with Zappy</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-brand-purple/10" />
                  <DropdownMenuItem className="cursor-pointer text-red-500" onClick={disconnectWallet}>
                    <Wallet className="h-4 w-4 mr-2" />
                    <span>Disconnect</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button 
              className="gap-1 purple-gradient" 
              size="sm" 
              onClick={connectWallet}
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden md:inline">Connect Wallet</span>
            </Button>
          )}
          
          <button 
            className="block md:hidden p-2 text-gray-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
