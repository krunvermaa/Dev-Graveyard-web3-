/**
 * src/services/web3Service.ts
 * Avalanche Web3 Provider & Smart Contract integration layer.
 * Seamlessly handles Avalanche C-Chain Mainnet (43114) and Fuji Testnet (43113)
 * with automatic fallback to mockContract when unconfigured or wallet disconnected.
 */

import { ethers } from 'ethers';
import devGraveyardAbi from '../abis/DevGraveyard.json';
import { getMockContract } from './mockContract';
import {
  AVALANCHE_MAINNET_ID,
  AVALANCHE_FUJI_ID,
  DEFAULT_AVALANCHE_RPC,
  DEFAULT_FUJI_RPC
} from '../config/contracts';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const DEV_GRAVEYARD_ABI = devGraveyardAbi;
export const CONTRACT_ABI = devGraveyardAbi;

/**
 * Retrieves the currently configured Avalanche contract address.
 */
export const getContractAddress = (): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('avax_contract_address');
    if (stored && ethers.isAddress(stored) && stored !== ZERO_ADDRESS) {
      return stored;
    }
  }

  // Check Vite environment variable
  const envAddress = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTRACT_ADDRESS) as string | undefined;
  if (envAddress && ethers.isAddress(envAddress) && envAddress !== ZERO_ADDRESS) {
    return envAddress;
  }

  return ZERO_ADDRESS;
};

/**
 * Checks if the system should operate in mock mode.
 */
export const isMockMode = (): boolean => {
  const address = getContractAddress();
  return !address || address === ZERO_ADDRESS;
};

/**
 * Obtains an ethers Provider connected to BrowserProvider (MetaMask / Core / Rainbow)
 * or public Avalanche RPC fallback.
 */
export const getProvider = (): ethers.BrowserProvider | ethers.JsonRpcProvider => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(DEFAULT_AVALANCHE_RPC);
};

/**
 * Requests signer from the active wallet provider.
 */
export const getSigner = async (): Promise<ethers.Signer | null> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return await provider.getSigner();
  } catch (err) {
    console.warn('Signer unavailable, returning null:', err);
    return null;
  }
};

/**
 * Returns either the on-chain Avalanche Contract instance or the high-fidelity mockContract
 * if contract address is zero or wallet is not connected.
 */
export const getContract = async (withSigner = false): Promise<any> => {
  const address = getContractAddress();

  // If contract address is zero or unconfigured, use mock contract
  if (!address || address === ZERO_ADDRESS) {
    return getMockContract();
  }

  try {
    if (withSigner) {
      const signer = await getSigner();
      if (!signer) {
        console.warn('Wallet not connected for signer. Falling back to mock contract.');
        return getMockContract();
      }
      return new ethers.Contract(address, DEV_GRAVEYARD_ABI, signer);
    }

    const provider = getProvider();
    return new ethers.Contract(address, DEV_GRAVEYARD_ABI, provider);
  } catch (error) {
    console.error('Failed to instantiate on-chain contract, falling back to mock:', error);
    return getMockContract();
  }
};

/**
 * Helper to prompt the wallet to switch to Avalanche C-Chain or Fuji Testnet.
 */
export const switchAvalancheChain = async (chainId = AVALANCHE_MAINNET_ID): Promise<void> => {
  if (typeof window === 'undefined' || !window.ethereum) return;

  const hexChainId = `0x${chainId.toString(16)}`;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }]
    });
  } catch (switchError: any) {
    // Chain has not been added to wallet (code 4902)
    if (switchError.code === 4902) {
      const isFuji = chainId === AVALANCHE_FUJI_ID;
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: hexChainId,
            chainName: isFuji ? 'Avalanche Fuji Testnet' : 'Avalanche C-Chain',
            nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
            rpcUrls: [isFuji ? DEFAULT_FUJI_RPC : DEFAULT_AVALANCHE_RPC],
            blockExplorerUrls: [isFuji ? 'https://testnet.snowtrace.io' : 'https://snowtrace.io']
          }
        ]
      });
    } else {
      throw switchError;
    }
  }
};
