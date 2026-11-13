# TASKS.md — Master Tasks for Avalanche Web3 Migration

## Wave A: Architecture & Foundation (Done)
- [x] T-A.1: Clean up root repository, remove patch scripts, sensitive configs, and old Firebase artifacts.
- [x] T-A.2: Create structured `src/` directory hierarchy and define unified TypeScript interfaces in `src/types/index.ts`.
- [x] T-A.3: Configure `.env.example`, `.gitignore`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`.

## Wave B: Parallel Development (Current)
- [ ] T-B.1 (Web3-Contracts): Implement `DevGraveyard.sol` with OpenZeppelin, export ABI `src/abis/DevGraveyard.json`, create deployment script, and implement decentralized services (`web3Service.ts`, `graveService.ts`, `userService.ts`, `confessionService.ts`).
- [ ] T-B.2 (Frontend-UI): Refactor and complete all gothic UI components (`Layout.tsx`, `Atmosphere.tsx`, `SoulBackground.tsx`, `GraveCard.tsx`, `GraveModal.tsx`, `ShareCardModal.tsx`, `DispatchGraveModal.tsx`, `FriendsManager.tsx`, `GithubRepoPicker.tsx`, `SettingsModal.tsx`, `UsernameSelection.tsx`).
- [ ] T-B.3 (Frontend-Pages): Refactor and complete all 13 application pages (`Landing.tsx`, `Cemetery.tsx`, `Home.tsx`, `SubmitGrave.tsx`, `GraveView.tsx`, `Confessions.tsx`, `Leaderboard.tsx`, `Profile.tsx`, `UserProfile.tsx`, `Chats.tsx`, `Upcoming.tsx`, `PrivacyPolicy.tsx`, `TermsOfService.tsx`, `Login.tsx`) and wire up `App.tsx` and `AuthContext.tsx`.

## Wave C: Security, QA & Documentation
- [ ] T-C.1 (Security): Audit codebase for zero secrets, enforce strict CSP and security headers in `vercel.json`.
- [ ] T-C.2 (QA): Create and run smart contract and service unit tests with Vitest.
- [ ] T-C.3 (DevOps & Docs): Comprehensive `README.md`, `DEPLOYMENT.md`, Vercel target domain config.

## Wave D: Final Integration & Delivery
- [ ] T-D.1: Full TypeScript build validation (`tsc --noEmit && npm run build`).
- [ ] T-D.2: Git commit, remote push, and Vercel production deployment setup.
