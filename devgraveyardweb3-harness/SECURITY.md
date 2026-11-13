# SECURITY.md — Secrets, Privacy, and Avalanche C-Chain Protection

_Owner: Security Agent. Reference for Web3, Smart Contract, and Frontend Security._

## 1. Zero-Secret Guarantee & Threat Model
- **Client-Side Bundles Contain Zero Secrets:** The built Vite bundle contains no private keys, mnemonics, API tokens, or server secrets. All Avalanche interactions occur through client-side Web3 wallets (MetaMask, Core, Rabby, Rainbow) or public RPC endpoints.
- **Smart Contract as Source of Truth:** Authorization and access control are strictly enforced on-chain via Solidity modifiers (`onlyOwner`, `msg.sender` equality checks) and OpenZeppelin's `ReentrancyGuard`.
- **Anonymity Guarantee:** When a grave is marked `isAnonymous = true`, the contract and frontend display the undertaker as Anonymous, preventing author deanonymization on public pages.
- **Heuristic Engine:** Post-mortem generation runs client-side using deterministic heuristic synthesis, eliminating the requirement for third-party LLM API keys and avoiding external leakage of abandoned project drafts.

## 2. Environment Variables (.env.example)
Only public, non-sensitive parameters are accepted:
```bash
VITE_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
VITE_AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
VITE_CONTRACT_ADDRESS=
VITE_CHAIN_ID=43114
VITE_WALLETCONNECT_PROJECT_ID=3a8170812b534d0ff9d794f19a901d64
VITE_GEMINI_API_KEY=
```

## 3. Smart Contract Security
- **OpenZeppelin ReentrancyGuard:** Guarding state-mutating functions (`pressF`, `dropEulogy`, `createGrave`, `createProfile`, `dispatchGrave`).
- **Access Control:** `deleteGrave` requires `graves[id].owner == msg.sender`. `deleteEulogy` requires eulogy author or grave owner.
- **Input Bounds & Length Validation:** String lengths bounded to avoid gas griefing and out-of-gas errors.
- **Lowercase Case-Insensitive Usernames:** Prevents impersonation attacks via homoglyphs or alternate casing.

## 4. Frontend & Deployment Hardening
- **Vercel Security Headers (`vercel.json`):**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **No `dangerouslySetInnerHTML`:** All user text is rendered through safe React JSX bindings.
- **Sanitized Links:** External links validate protocol (`https:`, `http:`) and use `rel="noopener noreferrer"`.
- **Target Deployment Domain:** `originaldevgraveyard-avalanche.vercel.app`.
