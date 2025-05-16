import { Link, useLocation } from "react-router-dom";
import { 
  Trophy, 
  Home, 
  Info,
  BarChart,
  MessageSquare,
  User,
  Building,
  Medal,
  Check,
  Store,
  Fingerprint,
  Loader2
} from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";

interface NavLinksProps {
  className?: string;
  vertical?: boolean;
}

const NavLinks = ({ className = "", vertical = false }: NavLinksProps) => {
  const location = useLocation();
  const { isConnected, user, isSignatureVerified, verifyWalletSignature, signatureVerifying } = useWeb3();
  
  const getNavigation = () => {
    const loggedOutLinks = [
      { name: "Home", to: "/", icon: Home },
      { name: "Leaderboard", to: "/leaderboard", icon: Trophy },
      { name: "Contests", to: "/contests", icon: Medal },
      { name: "Marketplace", to: "/marketplace", icon: Store },
      { name: "For Business", to: "/business", icon: Building },
      { name: "About", to: "/about", icon: Info }
    ];
    
    const loggedInLinks = [
      { name: "Leaderboard", to: "/leaderboard", icon: Trophy },
      { name: "Contests", to: "/contests", icon: Medal },
      { name: "Marketplace", to: "/marketplace", icon: Store },
      { name: "For Business", to: "/business", icon: Building },
    ];
    
    return isConnected ? loggedInLinks : loggedOutLinks;
  };

  const navigation = getNavigation();

  return (
    <nav className={`${className} ${vertical ? 'flex-col gap-2' : 'items-center gap-2'}`}>
      {navigation.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.name}
            to={item.to}
            className={`flex items-center ${vertical ? 'gap-3' : 'gap-1'} ${vertical ? 'px-3 py-2' : 'px-2 py-2'} ${vertical ? 'text-base' : 'text-xs'} font-medium rounded-md transition-colors
              ${isActive 
                ? "bg-brand-purple/20 text-brand-purple" 
                : "text-gray-400 hover:text-brand-purple hover:bg-brand-dark-lighter/30"
              }`}
          >
            <item.icon className={`${vertical ? 'h-5 w-5' : 'h-4 w-4'}`} />
            {item.name}
          </Link>
        );
      })}
      
      {isConnected && (
        <>
          {!isSignatureVerified && (
            <div className={`${vertical ? 'w-full px-2' : 'px-1'} my-1`}>
              <Button 
                onClick={() => verifyWalletSignature()} 
                disabled={signatureVerifying}
                variant="outline" 
                className={`${vertical ? 'w-full' : 'w-auto'} bg-brand-dark-lighter hover:bg-brand-dark border border-brand-border text-brand-purple flex items-center gap-1 text-xs font-medium transition-all`}
              >
                {signatureVerifying ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-3 w-3" />
                    Verify Wallet
                  </>
                )}
              </Button>
            </div>
          )}

          <Link
            to="/dashboard"
            className={`flex items-center ${vertical ? 'gap-3' : 'gap-1'} ${vertical ? 'px-3 py-2' : 'px-2 py-2'} ${vertical ? 'text-base' : 'text-xs'} font-medium rounded-md transition-colors
              ${location.pathname === "/dashboard" 
                ? "bg-brand-purple/20 text-brand-purple" 
                : "text-gray-400 hover:text-brand-purple hover:bg-brand-dark-lighter/30"
              }`}
          >
            <BarChart className={`${vertical ? 'h-5 w-5' : 'h-4 w-4'}`} />
            Dashboard
            {user?.leetcodeVerified && (
              <span className="ml-1 text-green-500 flex items-center gap-1 text-xs">
                <Check className="h-3 w-3" />
                {user.leetcodeUsername ? `(${user.leetcodeUsername})` : "Verified"}
              </span>
            )}
          </Link>
          
          {vertical && isSignatureVerified && (
            <Link
              to="/profile"
              className={`flex items-center ${vertical ? 'gap-3' : 'gap-1'} ${vertical ? 'px-3 py-2' : 'px-2 py-2'} ${vertical ? 'text-base' : 'text-sm'} font-medium rounded-md transition-colors
                ${location.pathname === "/profile" 
                  ? "bg-brand-purple/20 text-brand-purple" 
                  : "text-gray-400 hover:text-brand-purple hover:bg-brand-dark-lighter/30"
                }`}
            >
              <User className={`${vertical ? 'h-5 w-5' : 'h-4 w-4'}`} />
              Profile
            </Link>
          )}
          
          {isSignatureVerified && (
            <Link
              to="/chat"
              className={`flex items-center ${vertical ? 'gap-3' : 'gap-1'} ${vertical ? 'px-3 py-2' : 'px-2 py-2'} ${vertical ? 'text-base' : 'text-xs'} font-medium rounded-md transition-colors
                ${location.pathname === "/chat" 
                  ? "bg-brand-purple/20 text-brand-purple" 
                  : "text-gray-400 hover:text-brand-purple hover:bg-brand-dark-lighter/30"
                }`}
            >
              <MessageSquare className={`${vertical ? 'h-5 w-5' : 'h-4 w-4'}`} />
              Zappy
            </Link>
          )}
        </>
      )}
    </nav>
  );
};

export default NavLinks;
