import { ethers } from 'ethers';

// ABI for standard ERC-20 functions we need
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)'
];

// Your custom token contract address
const TOKEN_CONTRACT_ADDRESS = '0x55811C42441E0E77364D531B8C4B987A8Dc1308e';
// The address where contest entry fees should be sent
const RECEIVER_ADDRESS = '0xcA3a9B528C159bf10C96d5059A00165cDF22b5E6';

export const TokenService = {
  // Get the token balance for a user
  async getTokenBalance(userAddress: string): Promise<number> {
    try {
      if (!window.ethereum) throw new Error('No Ethereum provider found');
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_ABI, provider);
      
      const balance = await tokenContract.balanceOf(userAddress);
      // Convert from wei to token units (assuming 18 decimals like most ERC-20 tokens)
      return Number(ethers.utils.formatUnits(balance, 18));
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  },
  
  // Transfer tokens for contest entry
  async enterContest(userAddress: string, amount: number): Promise<string> {
    try {
      if (!window.ethereum) throw new Error('No Ethereum provider found');
      
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Get the signer for the connected account
      const signer = provider.getSigner();
      
      // Verify the signer address matches the expected user address
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('Connected wallet address does not match the expected address');
      }
      
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_ABI, signer);
      
      // Convert amount to wei
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
      
      // Send the transaction
      const tx = await tokenContract.transfer(RECEIVER_ADDRESS, amountInWei);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      return receipt.transactionHash;
    } catch (error: any) {
      console.error('Error entering contest:', error);
      throw new Error(error.message || 'Failed to process transaction');
    }
  }
};

export default TokenService;
