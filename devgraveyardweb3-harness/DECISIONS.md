# DECISIONS.md

## ADR 001: Migration to Avalanche C-Chain & Decentralized Identity
- **Context:** Original DevGraveyard relied on Firebase Authentication & Cloud Firestore.
- **Decision:** Replace Firebase with Avalanche C-Chain smart contracts (`DevGraveyard.sol`) and wallet identity via RainbowKit + Wagmi + Viem.
- **Consequences:** Eliminates external server lock-in, hardcoded API keys, and centralized database risks. Provides permanent on-chain memorialization of abandoned code.

## ADR 002: Dual-Mode Web3 Service with Resilient Fallback
- **Context:** Visitors without Web3 wallets or browsing before contract deployment must be able to explore the site seamlessly without errors.
- **Decision:** Service layer checks for active Avalanche contract address. If not connected, it seamlessly reads/writes from interactive local state so the app never shows a blank screen or unhandled exception.
- **Consequences:** 100% uptime and demoability on Vercel preview and production environments.

## ADR 003: Zero-Leak Client-Side AI Post-Mortem Heuristic Engine
- **Context:** AI post-mortems previously required external API endpoints or exposed Gemini API keys.
- **Decision:** Port the rich client-side heuristic engine from `aiPostMortemService.ts` that generates tailored, hilarious, and thoughtful post-mortems and lessons learned locally without requiring external API keys.
- **Consequences:** Zero API key exposure, instant generation, zero latency, offline capable.
