export const AVALANCHE_MAINNET_ID = 43114;
export const AVALANCHE_FUJI_ID = 43113;

export const DEFAULT_AVALANCHE_RPC =
  import.meta.env.VITE_AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc';

export const DEFAULT_FUJI_RPC =
  import.meta.env.VITE_AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

export const CONTRACT_ADDRESS: `0x${string}` = (
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  (typeof window !== 'undefined' ? localStorage.getItem('avax_contract_address') : null) ||
  '0x0000000000000000000000000000000000000000'
) as `0x${string}`;

export const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '3a8170812b534d0ff9d794f19a901d64';
