/**
 * src/services/mockContract.ts
 * In-memory / LocalStorage mock contract replicating DevGraveyard.sol for local development,
 * testing, and zero-configuration Web3 fallback.
 */

// In-memory storage for non-browser/SSR/test environments
const inMemoryStore: Record<string, string> = {};

export const getStorage = () => ({
  getItem: (key: string): string | null => {
    if (typeof localStorage !== 'undefined') {
      try {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      } catch (e) {
        // Fall back to in-memory
      }
    }
    return inMemoryStore[key] || null;
  },
  setItem: (key: string, val: string): void => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, val);
      } catch (e) {
        // Fall back to in-memory
      }
    }
    inMemoryStore[key] = val;
  },
  removeItem: (key: string): void => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Fall back to in-memory
      }
    }
    delete inMemoryStore[key];
  },
  clear: (): void => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.clear();
      } catch (e) {
        // Fall back to in-memory
      }
    }
    for (const k of Object.keys(inMemoryStore)) {
      delete inMemoryStore[k];
    }
  }
});

let customCaller: string | null = null;

export const setMockCaller = (address: string | null) => {
  customCaller = address ? address.toLowerCase() : null;
};

export const getMockCaller = (): string => {
  if (customCaller) return customCaller;
  if (typeof window !== 'undefined' && (window as any).ethereum && (window as any).ethereum.selectedAddress) {
    return (window as any).ethereum.selectedAddress.toLowerCase();
  }
  return '0x1234567890123456789012345678901234567890';
};

// Seed initial demo data
export const seedInitialMockData = (force = false) => {
  const storage = getStorage();

  if (!force && storage.getItem('mock_graves_seeded') === 'true') {
    return;
  }

  // 1. Seed Profiles
  const profiles: Record<string, any> = {
    '0x1111111111111111111111111111111111111111': {
      wallet: '0x1111111111111111111111111111111111111111',
      username: 'cryptokeeper',
      avatarUrl: 'crypt_keeper',
      bio: 'Eternal guardian of abandoned smart contracts and forgotten dApps on Avalanche.',
      github: 'https://github.com/cryptokeeper',
      instagram: '',
      whatsapp: '',
      joinedAt: Math.floor(Date.now() / 1000) - 86400 * 30,
      exists: true
    },
    '0x2222222222222222222222222222222222222222': {
      wallet: '0x2222222222222222222222222222222222222222',
      username: 'satoshi_ghost',
      avatarUrl: 'necromancer',
      bio: 'Transmuting dead code into on-chain wisdom.',
      github: 'https://github.com/satoshighost',
      instagram: '',
      whatsapp: '',
      joinedAt: Math.floor(Date.now() / 1000) - 86400 * 60,
      exists: true
    }
  };
  storage.setItem('mock_profiles', JSON.stringify(profiles));

  // 2. Seed Graves
  const graves = [
    {
      id: 1,
      owner: '0x1111111111111111111111111111111111111111',
      projectName: 'CryptoGraveyard',
      causeOfDeath: 'Technical Roadblocks',
      livedFor: '6 months',
      lessonLearned: 'Avalanche sub-second finality was incredible, but we underestimated liquidity bootstrapping without early community evangelism.',
      techStack: 'Solidity, Avalanche C-Chain, React, Ethers.js',
      githubLink: 'https://github.com/cryptokeeper/crypto-graveyard',
      isAnonymous: false,
      respects: 42,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 15,
      isResurrected: false,
      resurrectionNote: ''
    },
    {
      id: 2,
      owner: '0x2222222222222222222222222222222222222222',
      projectName: 'Web3Chat',
      causeOfDeath: 'Scope Creep',
      livedFor: '1 year',
      lessonLearned: 'Tried to combine IPFS, Whisper, zero-knowledge proofs, and multi-chain messaging in MVP. Simplicity and tight focus win every time.',
      techStack: 'TypeScript, Solidity, IPFS, WebRTC',
      githubLink: 'https://github.com/satoshighost/web3-chat',
      isAnonymous: false,
      respects: 88,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 25,
      isResurrected: false,
      resurrectionNote: ''
    },
    {
      id: 3,
      owner: '0x1111111111111111111111111111111111111111',
      projectName: 'DeFiYieldMatrix',
      causeOfDeath: 'Market Fit Missing',
      livedFor: '3 months',
      lessonLearned: 'Built algorithmic yield rebalancing with 18 tunable parameters. Users just wanted a single "Deposit" button and clear APY.',
      techStack: 'Solidity, Hardhat, Next.js, Avalanche C-Chain',
      githubLink: 'https://github.com/cryptokeeper/yield-matrix',
      isAnonymous: false,
      respects: 19,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 5,
      isResurrected: false,
      resurrectionNote: ''
    },
    {
      id: 4,
      owner: '0x2222222222222222222222222222222222222222',
      projectName: 'PixelUndead MMORPG',
      causeOfDeath: 'Lack of Time',
      livedFor: '9 months',
      lessonLearned: 'Solo development of an on-chain pixel MMO while working 50 hours a week. Scope ruthlessly or burn out.',
      techStack: 'Phaser.js, TypeScript, Tailwind, Avalanche Fuji',
      githubLink: 'https://github.com/satoshighost/pixel-undead',
      isAnonymous: true,
      respects: 35,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 2,
      isResurrected: false,
      resurrectionNote: ''
    }
  ];
  storage.setItem('mock_graves', JSON.stringify(graves));

  // 3. Seed Eulogies
  const eulogies = [
    {
      id: 1,
      graveId: '1',
      author: '0x2222222222222222222222222222222222222222',
      text: 'Pressing F for CryptoGraveyard. The UI was gorgeous, rest in eternal peace.',
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 10
    },
    {
      id: 2,
      graveId: '2',
      author: '0x1111111111111111111111111111111111111111',
      text: 'Scope creep claims another victim. Your architectural diagrams were works of art.',
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 20
    }
  ];
  storage.setItem('mock_eulogies', JSON.stringify(eulogies));

  // 4. Seed Confessions
  const confessions = [
    {
      id: 1,
      author: '0x1111111111111111111111111111111111111111',
      text: 'I pushed straight to production mainnet at 3 AM on a Friday and went to sleep with Discord notifications muted.',
      color: '#3f3f46',
      rotation: -2,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 3,
      skulls: 14,
      candles: 28
    },
    {
      id: 2,
      author: '0x2222222222222222222222222222222222222222',
      text: 'I still do not completely understand useEffect dependency arrays after 5 years of full-time React engineering.',
      color: '#52525b',
      rotation: 3,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 2,
      skulls: 32,
      candles: 19
    },
    {
      id: 3,
      author: '0x1111111111111111111111111111111111111111',
      text: 'I told our enterprise client an RPC bug was "Avalanche validator jitter". It was a missing comma in my contract ABI.',
      color: '#44403c',
      rotation: -4,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 1,
      skulls: 45,
      candles: 12
    },
    {
      id: 4,
      author: '0x2222222222222222222222222222222222222222',
      text: 'My smart contract has zero unit tests. I deploy directly onto Fuji testnet and pray to the gas gods.',
      color: '#334155',
      rotation: 1,
      createdAt: Math.floor(Date.now() / 1000) - 3600 * 4,
      skulls: 60,
      candles: 40
    }
  ];
  storage.setItem('mock_confessions', JSON.stringify(confessions));

  // 5. Seed Respects mapping
  const respects: Record<string, string[]> = {
    '1': ['0x2222222222222222222222222222222222222222'],
    '2': ['0x1111111111111111111111111111111111111111']
  };
  storage.setItem('mock_respects', JSON.stringify(respects));

  // 6. Seed Socials
  const following: Record<string, string[]> = {
    '0x1111111111111111111111111111111111111111': ['0x2222222222222222222222222222222222222222']
  };
  const followers: Record<string, string[]> = {
    '0x2222222222222222222222222222222222222222': ['0x1111111111111111111111111111111111111111']
  };
  storage.setItem('mock_following', JSON.stringify(following));
  storage.setItem('mock_followers', JSON.stringify(followers));

  storage.setItem('mock_graves_seeded', 'true');
};

// Automatically seed on module load
seedInitialMockData(false);

export const resetMockContractStorage = () => {
  const storage = getStorage();
  storage.clear();
  seedInitialMockData(true);
};

export const getMockContract = () => {
  // Ensure seed data is initialized
  seedInitialMockData(false);
  const storage = getStorage();

  const getProfiles = () => JSON.parse(storage.getItem('mock_profiles') || '{}');
  const setProfiles = (p: any) => storage.setItem('mock_profiles', JSON.stringify(p));

  const getGraves = () => JSON.parse(storage.getItem('mock_graves') || '[]');
  const setGraves = (g: any) => storage.setItem('mock_graves', JSON.stringify(g));

  const getEulogiesData = () => JSON.parse(storage.getItem('mock_eulogies') || '[]');
  const setEulogiesData = (e: any) => storage.setItem('mock_eulogies', JSON.stringify(e));

  const getConfessionsData = () => JSON.parse(storage.getItem('mock_confessions') || '[]');
  const setConfessionsData = (c: any) => storage.setItem('mock_confessions', JSON.stringify(c));

  const getRespectsData = () => JSON.parse(storage.getItem('mock_respects') || '{}');
  const setRespectsData = (r: any) => storage.setItem('mock_respects', JSON.stringify(r));

  const getFollowingData = () => JSON.parse(storage.getItem('mock_following') || '{}');
  const setFollowingData = (f: any) => storage.setItem('mock_following', JSON.stringify(f));

  const getFollowersData = () => JSON.parse(storage.getItem('mock_followers') || '{}');
  const setFollowersData = (f: any) => storage.setItem('mock_followers', JSON.stringify(f));

  const getDispatchedData = () => JSON.parse(storage.getItem('mock_dispatched') || '{}');
  const setDispatchedData = (d: any) => storage.setItem('mock_dispatched', JSON.stringify(d));

  const getConfessionReactions = () => JSON.parse(storage.getItem('mock_confession_reactions') || '{}');
  const setConfessionReactions = (r: any) => storage.setItem('mock_confession_reactions', JSON.stringify(r));

  return {
    // ---- Profiles ----
    getProfile: async (wallet: string) => {
      const profiles = getProfiles();
      const p = profiles[wallet.toLowerCase()];
      if (p) {
        return {
          wallet: p.wallet,
          username: p.username,
          avatarUrl: p.avatarUrl || '',
          bio: p.bio || '',
          github: p.github || '',
          instagram: p.instagram || '',
          whatsapp: p.whatsapp || '',
          joinedAt: BigInt(p.joinedAt),
          exists: true
        };
      }
      return {
        wallet: '0x0000000000000000000000000000000000000000',
        username: '',
        avatarUrl: '',
        bio: '',
        github: '',
        instagram: '',
        whatsapp: '',
        joinedAt: 0n,
        exists: false
      };
    },

    getProfileByUsername: async (username: string) => {
      const profiles = getProfiles();
      const lower = username.toLowerCase();
      const p = Object.values(profiles).find((prof: any) => prof.username.toLowerCase() === lower) as any;
      if (p) {
        return {
          wallet: p.wallet,
          username: p.username,
          avatarUrl: p.avatarUrl || '',
          bio: p.bio || '',
          github: p.github || '',
          instagram: p.instagram || '',
          whatsapp: p.whatsapp || '',
          joinedAt: BigInt(p.joinedAt),
          exists: true
        };
      }
      return {
        wallet: '0x0000000000000000000000000000000000000000',
        username: '',
        avatarUrl: '',
        bio: '',
        github: '',
        instagram: '',
        whatsapp: '',
        joinedAt: 0n,
        exists: false
      };
    },

    checkUsername: async (username: string) => {
      if (!username || username.trim().length === 0 || username.length > 32) return false;
      const profiles = getProfiles();
      const lower = username.toLowerCase();
      const taken = Object.values(profiles).some((prof: any) => prof.username.toLowerCase() === lower);
      return !taken; // true if available!
    },

    getUserCount: async () => {
      const profiles = getProfiles();
      return BigInt(Object.keys(profiles).length);
    },

    createProfile: async (
      username: string,
      avatarUrl: string,
      bio = '',
      github = '',
      instagram = '',
      whatsapp = ''
    ) => {
      const caller = getMockCaller();
      const profiles = getProfiles();

      if (profiles[caller]) {
        throw new Error('Profile already exists');
      }

      const lower = username.toLowerCase();
      const taken = Object.values(profiles).some((prof: any) => prof.username.toLowerCase() === lower);
      if (taken) {
        throw new Error('Username taken');
      }

      profiles[caller] = {
        wallet: caller,
        username,
        avatarUrl,
        bio,
        github,
        instagram,
        whatsapp,
        joinedAt: Math.floor(Date.now() / 1000),
        exists: true
      };
      setProfiles(profiles);

      return {
        wait: async () => ({
          status: 1,
          blockNumber: 12345
        })
      };
    },

    updateProfile: async (
      avatarUrl: string,
      bio = '',
      github = '',
      instagram = '',
      whatsapp = ''
    ) => {
      const caller = getMockCaller();
      const profiles = getProfiles();

      if (!profiles[caller]) {
        throw new Error('Profile does not exist');
      }

      profiles[caller].avatarUrl = avatarUrl;
      profiles[caller].bio = bio;
      profiles[caller].github = github;
      profiles[caller].instagram = instagram;
      profiles[caller].whatsapp = whatsapp;

      setProfiles(profiles);

      return {
        wait: async () => ({
          status: 1,
          blockNumber: 12346
        })
      };
    },

    // ---- Graves ----
    createGrave: async (
      projectName: string,
      causeOfDeath: string,
      livedFor: string,
      lessonLearned: string,
      techStack: string,
      githubLink: string,
      isAnonymous: boolean
    ) => {
      const caller = getMockCaller();
      const graves = getGraves();
      const newId = graves.length > 0 ? Math.max(...graves.map((g: any) => Number(g.id))) + 1 : 1;

      const newGrave = {
        id: newId,
        owner: caller,
        projectName,
        causeOfDeath,
        livedFor: livedFor || '',
        lessonLearned,
        techStack: techStack || '',
        githubLink: githubLink || '',
        isAnonymous: Boolean(isAnonymous),
        respects: 0,
        createdAt: Math.floor(Date.now() / 1000),
        isResurrected: false,
        resurrectionNote: ''
      };

      graves.push(newGrave);
      setGraves(graves);

      return {
        wait: async () => ({
          status: 1,
          blockNumber: 12347,
          logs: []
        }),
        id: BigInt(newId)
      };
    },

    deleteGrave: async (id: bigint | string | number) => {
      const caller = getMockCaller();
      let graves = getGraves();
      const g = graves.find((x: any) => x.id.toString() === id.toString());
      if (!g) throw new Error('Grave does not exist');
      if (g.owner.toLowerCase() !== caller.toLowerCase()) throw new Error('Not the owner');

      graves = graves.filter((x: any) => x.id.toString() !== id.toString());
      setGraves(graves);

      return {
        wait: async () => ({ status: 1 })
      };
    },

    resurrectGrave: async (id: bigint | string | number, note: string) => {
      const caller = getMockCaller();
      const graves = getGraves();
      const g = graves.find((x: any) => x.id.toString() === id.toString());
      if (!g) throw new Error('Grave does not exist');
      if (g.owner.toLowerCase() !== caller.toLowerCase()) throw new Error('Not the owner');

      g.isResurrected = true;
      g.resurrectionNote = note;
      setGraves(graves);

      return {
        wait: async () => ({ status: 1 })
      };
    },

    getGrave: async (id: bigint | string | number) => {
      const graves = getGraves();
      const g = graves.find((x: any) => x.id.toString() === id.toString());
      if (g) {
        return {
          id: BigInt(g.id),
          owner: g.owner,
          projectName: g.projectName,
          causeOfDeath: g.causeOfDeath,
          livedFor: g.livedFor || '',
          lessonLearned: g.lessonLearned,
          techStack: g.techStack || '',
          githubLink: g.githubLink || '',
          isAnonymous: g.isAnonymous,
          respects: BigInt(g.respects),
          createdAt: BigInt(g.createdAt),
          isResurrected: Boolean(g.isResurrected),
          resurrectionNote: g.resurrectionNote || ''
        };
      }
      return {
        id: 0n,
        owner: '0x0000000000000000000000000000000000000000',
        projectName: '',
        causeOfDeath: '',
        livedFor: '',
        lessonLearned: '',
        techStack: '',
        githubLink: '',
        isAnonymous: false,
        respects: 0n,
        createdAt: 0n,
        isResurrected: false,
        resurrectionNote: ''
      };
    },

    graves: async (id: bigint | string | number) => {
      const graves = getGraves();
      const g = graves.find((x: any) => x.id.toString() === id.toString());
      if (g) {
        return {
          id: BigInt(g.id),
          owner: g.owner,
          projectName: g.projectName,
          causeOfDeath: g.causeOfDeath,
          livedFor: g.livedFor || '',
          lessonLearned: g.lessonLearned,
          techStack: g.techStack || '',
          githubLink: g.githubLink || '',
          isAnonymous: g.isAnonymous,
          respects: BigInt(g.respects),
          createdAt: BigInt(g.createdAt),
          isResurrected: Boolean(g.isResurrected),
          resurrectionNote: g.resurrectionNote || ''
        };
      }
      return {
        id: 0n,
        owner: '0x0000000000000000000000000000000000000000',
        projectName: '',
        causeOfDeath: '',
        livedFor: '',
        lessonLearned: '',
        techStack: '',
        githubLink: '',
        isAnonymous: false,
        respects: 0n,
        createdAt: 0n,
        isResurrected: false,
        resurrectionNote: ''
      };
    },

    getGraveCount: async () => {
      const graves = getGraves();
      return BigInt(graves.length);
    },

    allGraveIds: async (index: number) => {
      const graves = getGraves();
      if (index >= graves.length) throw new Error('Out of bounds');
      return BigInt(graves[index].id);
    },

    getAllGraveIds: async () => {
      const graves = getGraves();
      return graves.map((g: any) => BigInt(g.id));
    },

    getGravesBatch: async (ids: Array<bigint | string | number>) => {
      const graves = getGraves();
      return ids.map((id) => {
        const g = graves.find((x: any) => x.id.toString() === id.toString());
        if (g) {
          return {
            id: BigInt(g.id),
            owner: g.owner,
            projectName: g.projectName,
            causeOfDeath: g.causeOfDeath,
            livedFor: g.livedFor || '',
            lessonLearned: g.lessonLearned,
            techStack: g.techStack || '',
            githubLink: g.githubLink || '',
            isAnonymous: g.isAnonymous,
            respects: BigInt(g.respects),
            createdAt: BigInt(g.createdAt),
            isResurrected: Boolean(g.isResurrected),
            resurrectionNote: g.resurrectionNote || ''
          };
        }
        return {
          id: 0n,
          owner: '0x0000000000000000000000000000000000000000',
          projectName: '',
          causeOfDeath: '',
          livedFor: '',
          lessonLearned: '',
          techStack: '',
          githubLink: '',
          isAnonymous: false,
          respects: 0n,
          createdAt: 0n,
          isResurrected: false,
          resurrectionNote: ''
        };
      });
    },

    getRecentGraves: async (limit: number | bigint, offset: number | bigint) => {
      const graves = getGraves();
      const total = graves.length;
      const numOffset = Number(offset);
      const numLimit = Number(limit);

      if (numOffset >= total) return [];

      const remaining = total - numOffset;
      const count = remaining < numLimit ? remaining : numLimit;
      const result = [];

      for (let i = 0; i < count; i++) {
        const g = graves[total - 1 - numOffset - i];
        result.push({
          id: BigInt(g.id),
          owner: g.owner,
          projectName: g.projectName,
          causeOfDeath: g.causeOfDeath,
          livedFor: g.livedFor || '',
          lessonLearned: g.lessonLearned,
          techStack: g.techStack || '',
          githubLink: g.githubLink || '',
          isAnonymous: g.isAnonymous,
          respects: BigInt(g.respects),
          createdAt: BigInt(g.createdAt),
          isResurrected: Boolean(g.isResurrected),
          resurrectionNote: g.resurrectionNote || ''
        });
      }
      return result;
    },

    // ---- Respects ----
    pressF: async (id: bigint | string | number) => {
      const caller = getMockCaller();
      const graves = getGraves();
      const g = graves.find((x: any) => x.id.toString() === id.toString());
      if (!g) throw new Error('Grave does not exist');

      const respects = getRespectsData();
      const key = id.toString();
      if (!respects[key]) respects[key] = [];

      if (respects[key].includes(caller)) {
        throw new Error('Already paid respects');
      }

      respects[key].push(caller);
      g.respects++;

      setGraves(graves);
      setRespectsData(respects);

      return {
        wait: async () => ({ status: 1 })
      };
    },

    unpressF: async (id: bigint | string | number) => {
      const caller = getMockCaller();
      const graves = getGraves();
      const g = graves.find((x: any) => x.id.toString() === id.toString());
      if (!g) throw new Error('Grave does not exist');

      const respects = getRespectsData();
      const key = id.toString();
      if (!respects[key] || !respects[key].includes(caller)) {
        throw new Error('Have not paid respects');
      }

      respects[key] = respects[key].filter((addr: string) => addr !== caller);
      g.respects = Math.max(0, g.respects - 1);

      setGraves(graves);
      setRespectsData(respects);

      return {
        wait: async () => ({ status: 1 })
      };
    },

    hasRespected: async (id: bigint | string | number, user: string) => {
      const respects = getRespectsData();
      const key = id.toString();
      return Boolean(respects[key]?.includes(user.toLowerCase()));
    },

    // ---- Eulogies ----
    dropEulogy: async (graveId: bigint | string | number, text: string) => {
      const caller = getMockCaller();
      const eulogies = getEulogiesData();
      const newId = eulogies.length > 0 ? Math.max(...eulogies.map((e: any) => Number(e.id))) + 1 : 1;

      eulogies.push({
        id: newId,
        graveId: graveId.toString(),
        author: caller,
        text,
        timestamp: Math.floor(Date.now() / 1000)
      });
      setEulogiesData(eulogies);

      return {
        wait: async () => ({ status: 1 })
      };
    },

    deleteEulogy: async (graveId: bigint | string | number, eulogyId: bigint | string | number) => {
      const caller = getMockCaller();
      let eulogies = getEulogiesData();
      const e = eulogies.find((x: any) => x.id.toString() === eulogyId.toString() && x.graveId === graveId.toString());
      if (!e) throw new Error('Eulogy not found');

      const graves = getGraves();
      const g = graves.find((x: any) => x.id.toString() === graveId.toString());
      const isOwner = g && g.owner.toLowerCase() === caller.toLowerCase();
      const isAuthor = e.author.toLowerCase() === caller.toLowerCase();

      if (!isOwner && !isAuthor) {
        throw new Error('Not authorized');
      }

      eulogies = eulogies.filter((x: any) => x.id.toString() !== eulogyId.toString());
      setEulogiesData(eulogies);

      return {
        wait: async () => ({ status: 1 })
      };
    },

    getEulogies: async (graveId: bigint | string | number) => {
      const eulogies = getEulogiesData();
      return eulogies
        .filter((e: any) => e.graveId === graveId.toString())
        .map((e: any) => ({
          id: BigInt(e.id),
          author: e.author,
          text: e.text,
          timestamp: BigInt(e.timestamp)
        }));
    },

    // ---- Confessions ----
    postConfession: async (text: string, color: string, rotation: number) => {
      const caller = getMockCaller();
      const confessions = getConfessionsData();
      const newId = confessions.length > 0 ? Math.max(...confessions.map((c: any) => Number(c.id))) + 1 : 1;

      const newC = {
        id: newId,
        author: caller,
        text,
        color: color || '#3f3f46',
        rotation: rotation || 0,
        createdAt: Math.floor(Date.now() / 1000),
        skulls: 0,
        candles: 0
      };

      confessions.push(newC);
      setConfessionsData(confessions);

      return {
        wait: async () => ({ status: 1 }),
        id: BigInt(newId)
      };
    },

    reactConfession: async (id: bigint | string | number, isCandle: boolean) => {
      const caller = getMockCaller();
      const confessions = getConfessionsData();
      const c = confessions.find((x: any) => x.id.toString() === id.toString());
      if (!c) throw new Error('Confession does not exist');

      const reactions = getConfessionReactions();
      const reactionKey = `${id.toString()}_${caller}_${isCandle ? 'candle' : 'skull'}`;
      if (reactions[reactionKey]) {
        throw new Error(isCandle ? 'Already lit candle' : 'Already gave skull');
      }

      reactions[reactionKey] = true;
      if (isCandle) {
        c.candles++;
      } else {
        c.skulls++;
      }

      setConfessionsData(confessions);
      setConfessionReactions(reactions);

      return {
        wait: async () => ({ status: 1 })
      };
    },

    getConfession: async (id: bigint | string | number) => {
      const confessions = getConfessionsData();
      const c = confessions.find((x: any) => x.id.toString() === id.toString());
      if (c) {
        return {
          id: BigInt(c.id),
          author: c.author,
          text: c.text,
          color: c.color,
          rotation: c.rotation,
          createdAt: BigInt(c.createdAt),
          skulls: BigInt(c.skulls),
          candles: BigInt(c.candles)
        };
      }
      return {
        id: 0n,
        author: '0x0000000000000000000000000000000000000000',
        text: '',
        color: '',
        rotation: 0,
        createdAt: 0n,
        skulls: 0n,
        candles: 0n
      };
    },

    getConfessionCount: async () => {
      const confessions = getConfessionsData();
      return BigInt(confessions.length);
    },

    getConfessions: async (limit: number | bigint, offset: number | bigint) => {
      const confessions = getConfessionsData();
      const total = confessions.length;
      const numOffset = Number(offset);
      const numLimit = Number(limit);

      if (numOffset >= total) return [];

      const remaining = total - numOffset;
      const count = remaining < numLimit ? remaining : numLimit;
      const result = [];

      for (let i = 0; i < count; i++) {
        const c = confessions[total - 1 - numOffset - i];
        result.push({
          id: BigInt(c.id),
          author: c.author,
          text: c.text,
          color: c.color,
          rotation: c.rotation,
          createdAt: BigInt(c.createdAt),
          skulls: BigInt(c.skulls),
          candles: BigInt(c.candles)
        });
      }
      return result;
    },

    // ---- Social Graph ----
    follow: async (target: string) => {
      const caller = getMockCaller();
      const targetLower = target.toLowerCase();
      if (caller === targetLower) throw new Error('Cannot follow yourself');

      const following = getFollowingData();
      const followers = getFollowersData();

      if (!following[caller]) following[caller] = [];
      if (following[caller].includes(targetLower)) throw new Error('Already following');
      following[caller].push(targetLower);

      if (!followers[targetLower]) followers[targetLower] = [];
      if (!followers[targetLower].includes(caller)) followers[targetLower].push(caller);

      setFollowingData(following);
      setFollowersData(followers);

      return {
        wait: async () => ({ status: 1 })
      };
    },

    unfollow: async (target: string) => {
      const caller = getMockCaller();
      const targetLower = target.toLowerCase();

      const following = getFollowingData();
      const followers = getFollowersData();

      if (!following[caller] || !following[caller].includes(targetLower)) {
        throw new Error('Not following');
      }

      following[caller] = following[caller].filter((a: string) => a !== targetLower);
      if (followers[targetLower]) {
        followers[targetLower] = followers[targetLower].filter((a: string) => a !== caller);
      }

      setFollowingData(following);
      setFollowersData(followers);

      return {
        wait: async () => ({ status: 1 })
      };
    },

    getFollowers: async (user: string) => {
      const followers = getFollowersData();
      return followers[user.toLowerCase()] || [];
    },

    getFollowing: async (user: string) => {
      const following = getFollowingData();
      return following[user.toLowerCase()] || [];
    },

    isFollowing: async (follower: string, target: string) => {
      const following = getFollowingData();
      return Boolean(following[follower.toLowerCase()]?.includes(target.toLowerCase()));
    },

    // ---- Dispatched Graves ----
    dispatchGrave: async (graveId: bigint | string | number, toUser: string) => {
      const caller = getMockCaller();
      const toLower = toUser.toLowerCase();
      if (toLower === caller) throw new Error('Invalid recipient');

      const graves = getGraves();
      const g = graves.find((x: any) => x.id.toString() === graveId.toString());
      if (!g) throw new Error('Grave does not exist');

      const dispatched = getDispatchedData();
      if (!dispatched[toLower]) dispatched[toLower] = [];

      const newId = Date.now();
      dispatched[toLower].push({
        id: newId,
        graveId: graveId.toString(),
        fromUser: caller,
        toUser: toLower,
        timestamp: Math.floor(Date.now() / 1000)
      });

      setDispatchedData(dispatched);

      return {
        wait: async () => ({ status: 1 })
      };
    },

    getDispatchedGraves: async (user: string) => {
      const dispatched = getDispatchedData();
      const list = dispatched[user.toLowerCase()] || [];
      return list.map((d: any) => ({
        id: BigInt(d.id),
        graveId: BigInt(d.graveId),
        fromUser: d.fromUser,
        toUser: d.toUser,
        timestamp: BigInt(d.timestamp)
      }));
    }
  };
};
