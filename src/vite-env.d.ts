/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AVALANCHE_RPC_URL?: string;
  readonly VITE_AVALANCHE_FUJI_RPC_URL?: string;
  readonly VITE_CONTRACT_ADDRESS?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
