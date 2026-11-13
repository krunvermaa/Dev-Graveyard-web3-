# DEPLOYMENT.md — Avalanche C-Chain & Vercel Deployment Guide

_Target Production Domain: `originaldevgraveyard-avalanche.vercel.app`_

## 1. Quick Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link and deploy
vercel --prod
```

## 2. Vercel Project Settings
- **Framework Preset:** Vite
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Custom Domain / Production Alias:**  
  Add `originaldevgraveyard-avalanche.vercel.app` in **Project Settings -> Domains**.

### Environment Variables on Vercel
Set the following in Vercel Project Settings (Environment Variables):
| Variable | Value (Mainnet) | Value (Fuji Testnet) |
|---|---|---|
| `VITE_AVALANCHE_RPC_URL` | `https://api.avax.network/ext/bc/C/rpc` | `https://api.avax-test.network/ext/bc/C/rpc` |
| `VITE_AVALANCHE_FUJI_RPC_URL` | `https://api.avax-test.network/ext/bc/C/rpc` | `https://api.avax-test.network/ext/bc/C/rpc` |
| `VITE_CHAIN_ID` | `43114` | `43113` |
| `VITE_CONTRACT_ADDRESS` | `0x...` (your deployed contract) | `0x...` |
| `VITE_WALLETCONNECT_PROJECT_ID` | `3a8170812b534d0ff9d794f19a901d64` | `3a8170812b534d0ff9d794f19a901d64` |

> **Note:** If `VITE_CONTRACT_ADDRESS` is not set or set to zero, the application runs seamlessly in resilient fallback mode with rich interactive memorials, allowing immediate preview testing.

## 3. Smart Contract Deployment (Avalanche C-Chain)
Deploy `DevGraveyard.sol` to Avalanche Mainnet or Fuji Testnet using Hardhat/ethers:
```bash
# Set your deployment private key and RPC in environment
export DEPLOYER_PRIVATE_KEY="your_private_key_here"
export RPC_URL="https://api.avax-test.network/ext/bc/C/rpc"

# Run deployment script
npm run deploy:contract
```
The script outputs the verified contract address. Copy it into `VITE_CONTRACT_ADDRESS` on Vercel.
