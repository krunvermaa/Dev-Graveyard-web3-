import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as UserProfile } from '../types';
import { getUserProfile } from '../services/userService';
import { ethers } from 'ethers';
import { AVALANCHE_MAINNET_ID, AVALANCHE_FUJI_ID } from '../config/contracts';

export interface AuthContextType {
  account: string | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAvalanche: boolean;
  connectWallet: (targetChainId?: number) => Promise<void>;
  disconnectWallet: () => void;
  refreshProfile: () => Promise<void>;
  switchNetwork: (targetChainId?: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  account: null, 
  userProfile: null, 
  loading: true, 
  isAvalanche: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  refreshProfile: async () => {},
  switchNetwork: async () => {}
});

const AVALANCHE_CHAINS: Record<number, {
  hexId: string;
  name: string;
  rpc: string;
  explorer: string;
}> = {
  [AVALANCHE_MAINNET_ID]: {
    hexId: '0xa86a',
    name: 'Avalanche C-Chain',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io/'
  },
  [AVALANCHE_FUJI_ID]: {
    hexId: '0xa869',
    name: 'Avalanche Fuji Testnet',
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorer: 'https://testnet.snowtrace.io/'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAvalanche, setIsAvalanche] = useState(false);

  const checkIsAvalancheChain = (chainId: string | number): boolean => {
    const numericId = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
    return numericId === AVALANCHE_MAINNET_ID || numericId === AVALANCHE_FUJI_ID;
  };

  const fetchProfile = useCallback(async (address: string) => {
    try {
      const lowerAddress = address.toLowerCase();
      const profile = await getUserProfile(lowerAddress);
      setUserProfile(profile);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (account) {
      await fetchProfile(account);
    }
  }, [account, fetchProfile]);

  const switchNetwork = async (targetChainId: number = AVALANCHE_MAINNET_ID) => {
    if (!window.ethereum) {
      throw new Error("No Web3 wallet detected");
    }

    const chainConfig = AVALANCHE_CHAINS[targetChainId] || AVALANCHE_CHAINS[AVALANCHE_MAINNET_ID];

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainConfig.hexId }],
      });
      setIsAvalanche(true);
    } catch (switchError: any) {
      // Error code 4902 indicates that the chain has not been added to MetaMask/Wallet
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainConfig.hexId,
            chainName: chainConfig.name,
            nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
            rpcUrls: [chainConfig.rpc],
            blockExplorerUrls: [chainConfig.explorer]
          }]
        });
        setIsAvalanche(true);
      } else {
        throw switchError;
      }
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setIsAvalanche(checkIsAvalancheChain(chainId));

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const rawAddress = accounts[0].address;
          const lowerAddress = rawAddress.toLowerCase();
          setAccount(lowerAddress);
          await fetchProfile(lowerAddress);
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
      }
    }
    setLoading(false);
  };

  const connectWallet = async (targetChainId: number = AVALANCHE_MAINNET_ID) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert("Please install a Web3 wallet like Core, MetaMask, or Rabby.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (!checkIsAvalancheChain(currentChainId)) {
        await switchNetwork(targetChainId);
      } else {
        setIsAvalanche(true);
      }

      const signer = await provider.getSigner();
      const rawAddress = await signer.getAddress();
      const lowerAddress = rawAddress.toLowerCase();
      setAccount(lowerAddress);
      await fetchProfile(lowerAddress);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      throw err;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setUserProfile(null);
  };

  useEffect(() => {
    checkWalletConnection();

    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          const lowerAddress = accounts[0].toLowerCase();
          setAccount(lowerAddress);
          fetchProfile(lowerAddress);
        } else {
          setAccount(null);
          setUserProfile(null);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setIsAvalanche(checkIsAvalancheChain(chainId));
        // Refresh connection on chain change
        checkWalletConnection();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [fetchProfile]);

  return (
    <AuthContext.Provider 
      value={{ 
        account, 
        userProfile, 
        loading, 
        isAvalanche,
        connectWallet, 
        disconnectWallet, 
        refreshProfile,
        switchNetwork
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
