import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalanche, avalancheFuji } from 'viem/chains';
import { WALLETCONNECT_PROJECT_ID } from './contracts';

export const wagmiConfig = getDefaultConfig({
  appName: 'Dev Graveyard (Avalanche)',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [avalanche, avalancheFuji],
  ssr: false,
});
