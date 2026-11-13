# CHANGELOG.md

All notable changes to DevGraveyard Avalanche Web3 will be documented here.

## [1.0.0] - 2026-11-14

### Added
- Complete Avalanche C-Chain smart contract (`DevGraveyard.sol`) with OpenZeppelin `ReentrancyGuard` and `Ownable`.
- Web3 wallet connectivity via RainbowKit v2, Wagmi v2, and Viem targeting Avalanche Mainnet (`43114`) and Fuji Testnet (`43113`).
- All 13 application pages from Web2 ported to Web3 with responsive mobile-first gothic UI:
  - Landing, Cemetery, Home, SubmitGrave, GraveView, Confessions, Leaderboard, Profile, UserProfile, Chats, Upcoming, PrivacyPolicy, TermsOfService.
- High-definition 2x Retina downloadable memorial tombstones using `html2canvas` and `qrcode.react`.
- Built-in Web Audio API Gothic Synthesizer generating procedural ambient drone, wind howl, stone clicks, and tribute chimes with zero external audio assets.
- Dual-mode resilient service architecture with zero-secret guarantee and mock fallback.
- Vitest test suite with 15 passing tests validating smart contract and Web3 service features.
- Vercel production deployment configuration for `originaldevgraveyard-avalanche.vercel.app`.

### Removed
- Centralized Firebase Authentication, Firestore databases, and hardcoded Google API credentials.
- All temporary `.sh` and `.cjs` patch scripts and unneeded build artifacts.
