# DevGraveyard — Avalanche Web3 Edition 🪦⛓️

> **Where abandoned side projects, forgotten repositories, and dead code rest in eternal peace on the Avalanche C-Chain.**

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Avalanche](https://img.shields.io/badge/Network-Avalanche%20C--Chain-E84142.svg)](https://snowtrace.io)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Production-000000.svg)](https://originaldevgraveyard-avalanche.vercel.app)

---

## 🏛️ Overview

**DevGraveyard Avalanche Web3** is a decentralized memorial platform where developers lay abandoned, sunset, and failed code projects to rest. Moving away from centralized databases and auth walls, the entire memorial ledger, respects counter, eulogy archive, and undertaker identity system live directly on the **Avalanche C-Chain**.

- **Production URL:** [https://originaldevgraveyard-avalanche.vercel.app](https://originaldevgraveyard-avalanche.vercel.app)
- **Target Chains:** Avalanche C-Chain Mainnet (`43114`) & Avalanche Fuji Testnet (`43113`)

---

## ⚡ Core Features & Web3 Replication

- 🪦 **Bury a Dead Project (Grave Memorial):**
  - Project name, cause of death taxonomy, lifespan duration, tech stack badges, and lessons learned.
  - Optional verified GitHub repository badge.
  - Optional **Anonymous Burial** preserving total author anonymity on-chain.
  - 3-step burial ceremony with dramatic gravestone descent and death knell toll.
- 🖤 **Pay Respects ("Press [F] to Pay Respects"):**
  - Interactive on-chain tribute with keyboard shortcut (`F` / `f`).
  - Floating soul particle animations and subtle chime synthesis.
  - Anti-spam guard: 1 respect per wallet address per grave.
- 📜 **Eulogies & Memorial Messages:**
  - On-chain comments tied directly to each memorial.
  - Author and grave owner moderation controls.
- 🦇 **Anonymous Developer Confessions Wall:**
  - Anonymous confessions with dynamic rotations, gothic colors, and flying bat animations.
  - Community reaction counters (lighting candles 🕯️ and giving skulls 💀).
- 🏆 **The Pantheon (Leaderboard):**
  - Rankings of the most respected fallen projects and most prolific undertakers.
  - Gothic laurel badges: Gold Skull, Silver Raven, and Bronze Tombstone.
- 🎴 **Shareable Tombstone Cards:**
  - High-definition 2x Retina downloadable memorial cards via `html2canvas` and `qrcode.react`.
  - Themed styles (Minimal Noir, Moonlit, Cyberpunk) with scan-to-visit QR codes.
- 🎵 **Procedural Gothic Synthesizer (Zero External Audio Assets):**
  - Real-time procedural audio synthesis built with the Web Audio API.
  - Haunting ambient wind drone, stone movement clicks, and tribute chimes with zero network requests or heavy MP3 files.
- 🦊 **Decentralized Wallet Identity:**
  - Modern wallet connection via **RainbowKit**, **Wagmi v2**, and **Viem**.
  - Seamless support for Core, MetaMask, Rabby, Rainbow, Coinbase Wallet, and WalletConnect.
  - Custom Undertaker profiles with 10 gothic SVG pixel emblems (`skull`, `ghost`, `reaper`, `tombstone`, `lantern`, `raven`, `candle`, `eye`, `crystal`, `pumpkin`).

---

## 🛡️ Security & Zero-Secret Architecture

1. **Zero Secrets in Repository & Bundle:**
   - No private keys, mnemonics, API tokens, or server secrets exist anywhere in the source or bundle.
   - All environment variables in `.env.example` are strictly public parameters.
2. **OpenZeppelin Hardened Smart Contracts:**
   - `DevGraveyard.sol` utilizes OpenZeppelin's `ReentrancyGuard` on all state-modifying tribute and burial routines.
   - `deleteGrave` and `deleteEulogy` are protected by cryptographic `msg.sender` authorization checks.
3. **Resilient Dual-Mode Architecture:**
   - When browsing without a connected wallet or before contract address configuration, the service layer transparently routes to a high-fidelity local state mock.
   - The application never crashes with unhandled Web3 exceptions on public views.
4. **Strict HTTP Security Headers:**
   - Configured in `vercel.json` with `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and strict `Referrer-Policy`.

---

## 📂 Project Architecture

```
dev-graveyard-web3/
├── contracts/
│   └── DevGraveyard.sol       # Core Avalanche C-Chain Solidity contract
├── scripts/
│   └── deploy.cjs              # Hardhat / Ethers deployment script
├── test/
│   └── DevGraveyard.test.ts    # Vitest contract & service test suite (15/15 passing)
├── public/
│   └── avatars/                # 10 Gothic SVG pixel avatars
├── src/
│   ├── abis/                   # Compiled 50-fragment contract ABI
│   │   └── DevGraveyard.json
│   ├── components/             # Gothic UI components & modals
│   │   ├── Atmosphere.tsx      # Canvas mist particles & Web Audio synth
│   │   ├── GraveCard.tsx       # Tombstone with 'F' key listener & score tier
│   │   ├── GraveModal.tsx      # Epitaph inspection & eulogy ledger
│   │   ├── ShareCardModal.tsx  # html2canvas card exporter + QR code
│   │   └── Layout.tsx          # Gothic shell with RainbowKit ConnectButton
│   ├── config/                 # Wagmi & Avalanche chain config
│   │   ├── contracts.ts
│   │   └── wagmi.ts
│   ├── contexts/
│   │   └── AuthContext.tsx     # Web3 wallet & undertaker profile context
│   ├── pages/                  # 13 Complete pages ported from Web2
│   ├── services/               # Decentralized Web3 service layer
│   │   ├── web3Service.ts      # Contract provider & signer factory
│   │   ├── graveService.ts     # Grave memorial queries & transactions
│   │   ├── userService.ts      # Profile registry & social graph
│   │   ├── confessionService.ts# Confessions wall operations
│   │   └── mockContract.ts     # Local mock fallback
│   ├── types/
│   │   └── index.ts            # Unified TypeScript interfaces
│   ├── App.tsx                 # HashRouter & lazy suspense code-splitting
│   └── index.tsx
├── .env.example
├── vercel.json                 # Security headers & SPA rewrites
└── vite.config.ts              # Code splitting & vendor chunking
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/krunvermaa/Dev-Graveyard-web3-.git
cd Dev-Graveyard-web3-

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Running Tests
```bash
# Execute the Vitest test suite
npm test
```

### Building for Production
```bash
# Typecheck and compile production bundle
npm run typecheck
npm run build
```

---

## ⛓️ Smart Contract Deployment (Avalanche C-Chain)

To deploy the smart contract to Avalanche Fuji Testnet or Avalanche Mainnet:

```bash
# Export deployment credentials securely
export DEPLOYER_PRIVATE_KEY="your_private_key"
export RPC_URL="https://api.avax-test.network/ext/bc/C/rpc"

# Run deployment script
npm run deploy:contract
```

Update your `.env.local` or Vercel Environment Variables:
```env
VITE_CONTRACT_ADDRESS="0xYourDeployedContractAddress"
VITE_CHAIN_ID="43113" # (or 43114 for Mainnet)
```

---

## 🌐 Vercel Deployment

This project is optimized for deployment to Vercel under the target domain:
**`https://originaldevgraveyard-avalanche.vercel.app`**

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set the build settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the domain `originaldevgraveyard-avalanche.vercel.app` under **Project Settings -> Domains**.
5. Deploy!

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
