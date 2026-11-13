# ARCHITECTURE.md — DevGraveyard Avalanche Web3

_Owner: Architect. System Architecture & Component Mapping._

## Architecture Overview
DevGraveyard Avalanche Web3 transitions the original Web2 Firebase architecture into an entirely decentralized, wallet-authenticated application operating on the Avalanche C-Chain (Mainnet 43114 & Fuji Testnet 43113).

```
dev-graveyard-web3/
├── contracts/                  # Solidity smart contracts
│   └── DevGraveyard.sol       # Core contract: Profiles, Graves, Eulogies, Respects, Confessions, Social
├── scripts/                    # Deployment & verification scripts
│   └── deploy.cjs              # Avalanche C-Chain / Fuji deployment script
├── test/                       # Contract & unit test suites
│   └── DevGraveyard.test.ts    # Smart contract validation tests
├── public/
│   └── avatars/                # Gothic SVG pixel avatars
├── src/
│   ├── abis/                   # Compiled Contract ABIs
│   │   └── DevGraveyard.json
│   ├── components/             # Reusable gothic UI components
│   │   ├── ui/                 # Button, Input, Select, Textarea
│   │   ├── Atmosphere.tsx      # Fog, particles, synthetic Web Audio gothic ambience
│   │   ├── GraveCard.tsx       # Tombstone card with F keyboard trigger, respects & RIPs
│   │   ├── GraveModal.tsx      # Deep grave inspection & eulogy board
│   │   ├── ShareCardModal.tsx  # html2canvas tombstone export & QR generator
│   │   ├── DispatchGraveModal.tsx
│   │   ├── FriendsManager.tsx
│   │   ├── GithubRepoPicker.tsx
│   │   ├── Layout.tsx          # Gothic shell, RainbowKit ConnectButton, network badge
│   │   ├── SoulBackground.tsx
│   │   └── SettingsModal.tsx
│   ├── config/                 # Wagmi & Chain definitions
│   │   ├── contracts.ts        # Contract addresses & RPC constants
│   │   └── wagmi.ts            # Wagmi & RainbowKit setup for Avalanche
│   ├── contexts/               # React Context Providers
│   │   └── AuthContext.tsx     # Web3 wallet identity, user profile caching
│   ├── pages/                  # 13 Complete Web2 pages ported to Web3
│   │   ├── Landing.tsx         # Gothic landing & live memorial stats
│   │   ├── Cemetery.tsx        # Filterable grave directory & search
│   │   ├── Home.tsx            # Undertaker dashboard & user graves
│   │   ├── SubmitGrave.tsx     # Project burial ceremony & AI post-mortem
│   │   ├── GraveView.tsx       # Dedicated permalink grave page
│   │   ├── Confessions.tsx     # Anonymous developer confessions board
│   │   ├── Leaderboard.tsx     # Most respected graves & undertaker rankings
│   │   ├── Profile.tsx         # User's personal crypt & profile settings
│   │   ├── UserProfile.tsx     # Public crypt inspection
│   │   ├── Chats.tsx           # Shared grave dispatch inbox
│   │   ├── Upcoming.tsx        # Roadmap & crypt expansion
│   │   ├── PrivacyPolicy.tsx
│   │   ├── TermsOfService.tsx
│   │   └── Login.tsx           # Wallet connect portal
│   ├── services/               # Decentralized service layer
│   │   ├── web3Service.ts      # Contract instantiation & provider management
│   │   ├── graveService.ts     # On-chain / cached grave operations
│   │   ├── userService.ts      # Wallet profiles & social graph
│   │   ├── confessionService.ts# Confessions on-chain & fallback
│   │   ├── aiPostMortemService.ts # Client heuristic AI engine (zero API key leak)
│   │   ├── graveScoreService.ts# Tombstone rank calculation
│   │   └── analyticsService.ts # Privacy-preserving analytics
│   ├── types/                  # Frozen TypeScript interfaces
│   │   └── index.ts
│   ├── styles/
│   ├── index.css
│   ├── pixelAvatars.ts
│   ├── App.tsx
│   └── index.tsx
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vercel.json                 # Security headers & SPA routing
└── vite.config.ts              # Code splitting & vendor chunking
```

## Smart Contract Architecture (DevGraveyard.sol)
- **Profiles**: Wallet address maps to unique lowercase username, avatar URL, bio, and join timestamp.
- **Graves**: On-chain storage of Project Name, Cause of Death, Lived For, Lesson Learned, Tech Stack, Github Link, Anonymous flag, Respect counter.
- **Respects & RIPs**: Single respect per wallet address per grave, toggleable via `pressF` / `unpressF`.
- **Eulogies**: On-chain comments tied to graveId with author attribution.
- **Confessions**: Anonymous confessions wall on Avalanche C-Chain.
- **Social Graph**: On-chain following/followers mappings.
- **Security**: OpenZeppelin `ReentrancyGuard`, `Ownable`, input length bounds, zero secrets.
