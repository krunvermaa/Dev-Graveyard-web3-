export const getMockContract = () => {
  const getCaller = () => {
     if (typeof window !== 'undefined' && (window as any).ethereum && (window as any).ethereum.selectedAddress) {
        return (window as any).ethereum.selectedAddress.toLowerCase();
     }
     return "0x1234567890123456789012345678901234567890";
  };
  
  return {
    getProfile: async (wallet: string) => {
       const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
       const p = profiles[wallet.toLowerCase()];
       if (p) return { wallet, username: p.username, avatarUrl: p.avatarUrl, joinedAt: BigInt(p.joinedAt), exists: true };
       return { exists: false };
    },
    getProfileByUsername: async (username: string) => {
       const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
       const p = Object.values(profiles).find((p: any) => p.username === username);
       if (p) return { wallet: (p as any).wallet, username: (p as any).username, avatarUrl: (p as any).avatarUrl, joinedAt: BigInt((p as any).joinedAt), exists: true };
       return { exists: false };
    },
    checkUsername: async (username: string) => {
       const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
       return Object.values(profiles).some((p: any) => p.username === username);
    },
    createProfile: async (username: string, avatarUrl: string) => {
       const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
       profiles[getCaller()] = { wallet: getCaller(), username, avatarUrl, joinedAt: Math.floor(Date.now() / 1000) };
       localStorage.setItem('mock_profiles', JSON.stringify(profiles));
       return { wait: async () => true };
    },
    updateProfile: async (avatarUrl: string) => {
       const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
       if (profiles[getCaller()]) {
          profiles[getCaller()].avatarUrl = avatarUrl;
          localStorage.setItem('mock_profiles', JSON.stringify(profiles));
       }
       return { wait: async () => true };
    },
    getGraveCount: async () => {
       const graves = JSON.parse(localStorage.getItem('mock_graves') || '[]');
       return BigInt(graves.length);
    },
    allGraveIds: async (index: number) => {
       const graves = JSON.parse(localStorage.getItem('mock_graves') || '[]');
       return BigInt(graves[index].id);
    },
    graves: async (id: bigint | string) => {
       const graves = JSON.parse(localStorage.getItem('mock_graves') || '[]');
       const g = graves.find((g: any) => g.id.toString() === id.toString());
       if (g) {
          return { id: BigInt(g.id), owner: g.owner, projectName: g.projectName, causeOfDeath: g.causeOfDeath, lessonLearned: g.lessonLearned, githubLink: g.githubLink, isAnonymous: g.isAnonymous, respects: BigInt(g.respects), createdAt: BigInt(g.createdAt) };
       }
       return { id: 0n };
    },
    createGrave: async (projectName: string, causeOfDeath: string, lessonLearned: string, githubLink: string, isAnonymous: boolean) => {
       const graves = JSON.parse(localStorage.getItem('mock_graves') || '[]');
       const newId = graves.length > 0 ? Math.max(...graves.map((g: any) => g.id)) + 1 : 1;
       graves.push({
          id: newId, owner: getCaller(), projectName, causeOfDeath, lessonLearned, githubLink, isAnonymous, respects: 0, createdAt: Math.floor(Date.now() / 1000)
       });
       localStorage.setItem('mock_graves', JSON.stringify(graves));
       return { wait: async () => true };
    },
    deleteGrave: async (id: bigint | string) => {
       let graves = JSON.parse(localStorage.getItem('mock_graves') || '[]');
       graves = graves.filter((g: any) => g.id.toString() !== id.toString());
       localStorage.setItem('mock_graves', JSON.stringify(graves));
       return { wait: async () => true };
    },
    pressF: async (id: bigint | string) => {
       const graves = JSON.parse(localStorage.getItem('mock_graves') || '[]');
       const g = graves.find((g: any) => g.id.toString() === id.toString());
       if (g) {
           g.respects++;
           const respects = JSON.parse(localStorage.getItem('mock_respects') || '{}');
           if (!respects[id.toString()]) respects[id.toString()] = [];
           if (!respects[id.toString()].includes(getCaller())) {
               respects[id.toString()].push(getCaller());
           }
           localStorage.setItem('mock_respects', JSON.stringify(respects));
       }
       localStorage.setItem('mock_graves', JSON.stringify(graves));
       return { wait: async () => true };
    },
    unpressF: async (id: bigint | string) => {
       const graves = JSON.parse(localStorage.getItem('mock_graves') || '[]');
       const g = graves.find((g: any) => g.id.toString() === id.toString());
       if (g) {
           g.respects--;
           const respects = JSON.parse(localStorage.getItem('mock_respects') || '{}');
           if (respects[id.toString()]) {
               respects[id.toString()] = respects[id.toString()].filter((addr: string) => addr !== getCaller());
           }
           localStorage.setItem('mock_respects', JSON.stringify(respects));
       }
       localStorage.setItem('mock_graves', JSON.stringify(graves));
       return { wait: async () => true };
    },
    hasRespected: async (id: bigint | string, addr: string) => {
       const respects = JSON.parse(localStorage.getItem('mock_respects') || '{}');
       return respects[id.toString()]?.includes(addr.toLowerCase()) || false;
    },
    dropEulogy: async (id: bigint | string, text: string) => {
       const eulogies = JSON.parse(localStorage.getItem('mock_eulogies') || '[]');
       const newId = eulogies.length > 0 ? Math.max(...eulogies.map((e: any) => e.id)) + 1 : 1;
       eulogies.push({ id: newId, graveId: id.toString(), author: getCaller(), text, timestamp: Math.floor(Date.now() / 1000) });
       localStorage.setItem('mock_eulogies', JSON.stringify(eulogies));
       return { wait: async () => true };
    },
    getEulogies: async (id: bigint | string) => {
       const eulogies = JSON.parse(localStorage.getItem('mock_eulogies') || '[]');
       return eulogies.filter((e: any) => e.graveId === id.toString()).map((e: any) => ({
           id: BigInt(e.id), author: e.author, text: e.text, timestamp: BigInt(e.timestamp)
       }));
    },
    deleteEulogy: async (graveId: bigint | string, eulogyId: bigint | string) => {
       let eulogies = JSON.parse(localStorage.getItem('mock_eulogies') || '[]');
       eulogies = eulogies.filter((e: any) => e.id.toString() !== eulogyId.toString());
       localStorage.setItem('mock_eulogies', JSON.stringify(eulogies));
       return { wait: async () => true };
    },
    follow: async (target: string) => {
       const following = JSON.parse(localStorage.getItem('mock_following') || '{}');
       const caller = getCaller();
       if (!following[caller]) following[caller] = [];
       if (!following[caller].includes(target.toLowerCase())) following[caller].push(target.toLowerCase());
       localStorage.setItem('mock_following', JSON.stringify(following));
       
       const followers = JSON.parse(localStorage.getItem('mock_followers') || '{}');
       if (!followers[target.toLowerCase()]) followers[target.toLowerCase()] = [];
       if (!followers[target.toLowerCase()].includes(caller)) followers[target.toLowerCase()].push(caller);
       localStorage.setItem('mock_followers', JSON.stringify(followers));
       return { wait: async () => true };
    },
    unfollow: async (target: string) => {
       const following = JSON.parse(localStorage.getItem('mock_following') || '{}');
       const caller = getCaller();
       if (following[caller]) following[caller] = following[caller].filter((a: string) => a !== target.toLowerCase());
       localStorage.setItem('mock_following', JSON.stringify(following));
       
       const followers = JSON.parse(localStorage.getItem('mock_followers') || '{}');
       if (followers[target.toLowerCase()]) followers[target.toLowerCase()] = followers[target.toLowerCase()].filter((a: string) => a !== caller);
       localStorage.setItem('mock_followers', JSON.stringify(followers));
       return { wait: async () => true };
    },
    getFollowers: async (user: string) => {
       const followers = JSON.parse(localStorage.getItem('mock_followers') || '{}');
       return followers[user.toLowerCase()] || [];
    },
    getFollowing: async (user: string) => {
       const following = JSON.parse(localStorage.getItem('mock_following') || '{}');
       return following[user.toLowerCase()] || [];
    },
    isFollowing: async (follower: string, followingTarget: string) => {
       const following = JSON.parse(localStorage.getItem('mock_following') || '{}');
       return following[follower.toLowerCase()]?.includes(followingTarget.toLowerCase()) || false;
    }
  };
};
