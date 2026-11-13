import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as UserProfile } from '../types';
import { getUserProfile } from '../services/userService';
import { ethers } from 'ethers';

interface AuthContextType {
  account: string | null;
  userProfile: UserProfile | null;
  loading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  account: null, 
  userProfile: null, 
  loading: true, 
  connectWallet: async () => {},
  disconnectWallet: () => {},
  refreshProfile: async () => {} 
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (address: string) => {
    try {
      // In Web3, address is used as uid
      const profile = await getUserProfile(address);
      setUserProfile(profile);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  };

  const refreshProfile = async () => {
    if (account) {
      await fetchProfile(account);
    }
  };

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const address = accounts[0].address;
          setAccount(address);
          await fetchProfile(address);
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
      }
    }
    setLoading(false);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        
        // Switch to Avalanche C-Chain
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xA86A' }], // 43114 for mainnet
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xA86A',
                chainName: 'Avalanche C-Chain',
                nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
                rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://snowtrace.io/']
              }]
            });
          } else {
            throw switchError;
          }
        }

        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        await fetchProfile(address);
      } catch (err) {
        console.error("Failed to connect wallet", err);
        throw err;
      }
    } else {
      alert("Please install a Web3 wallet like MetaMask or Core.");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setUserProfile(null);
  };

  useEffect(() => {
    checkWalletConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchProfile(accounts[0]);
        } else {
          setAccount(null);
          setUserProfile(null);
        }
      });
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ account, userProfile, loading, connectWallet, disconnectWallet, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
