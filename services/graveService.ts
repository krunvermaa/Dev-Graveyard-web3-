import { Grave, GraveFormData, Eulogy } from '../types';
import { getContract } from './web3Service';

export const getGrave = async (graveId: string): Promise<Grave | null> => {
  try {
    const contract = await getContract();
    const g = await contract.graves(graveId);
    if (g.id === 0n) return null;
    
    let userName = "";
    let userAvatar = "";
    try {
       const profile = await contract.getProfile(g.owner);
       if (profile.exists) {
           userName = profile.username;
           userAvatar = profile.avatarUrl;
       }
    } catch (e) {
       console.error(e);
    }
    
    return {
      id: g.id.toString(),
      user_id: g.owner,
      user_name: userName,
      user_avatar: userAvatar,
      project_name: g.projectName,
      cause_of_death: g.causeOfDeath,
      lesson_learned: g.lessonLearned,
      github_link: g.githubLink,
      is_anonymous: g.isAnonymous,
      respects: Number(g.respects),
      created_at: new Date(Number(g.createdAt) * 1000).toISOString(),
      lived_for: "",
      tech_stack: ""
    };
  } catch (error) {
    console.error("Error fetching grave:", error);
    return null;
  }
};

export const getGraves = async (): Promise<Grave[]> => {
  try {
    const contract = await getContract();
    const count = await contract.getGraveCount();
    const graves: Grave[] = [];
    
    for (let i = 0; i < Number(count); i++) {
      const graveId = await contract.allGraveIds(i);
      const g = await contract.graves(graveId);
      
      let userName = "";
      let userAvatar = "";
      try {
         const profile = await contract.getProfile(g.owner);
         if (profile.exists) {
             userName = profile.username;
             userAvatar = profile.avatarUrl;
         }
      } catch (e) {
         console.error(e);
      }
      
      graves.push({
        id: g.id.toString(),
        user_id: g.owner,
        user_name: userName,
        user_avatar: userAvatar,
        project_name: g.projectName,
        cause_of_death: g.causeOfDeath,
        lesson_learned: g.lessonLearned,
        github_link: g.githubLink,
        is_anonymous: g.isAnonymous,
        respects: Number(g.respects),
        created_at: new Date(Number(g.createdAt) * 1000).toISOString(),
        lived_for: "",
        tech_stack: ""
      });
    }
    
    return graves.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error("Error fetching graves:", error);
    return [];
  }
};

export const getUserGraves = async (userId: string): Promise<Grave[]> => {
  try {
    const graves = await getGraves();
    return graves.filter(g => g.user_id.toLowerCase() === userId.toLowerCase());
  } catch (error) {
    console.error("Error fetching user graves:", error);
    return [];
  }
};

export const submitGrave = async (data: GraveFormData, userId?: string, userName?: string, userAvatar?: string): Promise<Grave> => {
  const contract = await getContract(true); // requires signer
  const tx = await contract.createGrave(
    data.project_name,
    data.cause_of_death,
    data.lesson_learned,
    data.github_link || "",
    data.is_anonymous
  );
  
  await tx.wait();
  
  // A bit hard to fetch the exact newly created grave ID if not waiting for events, 
  // but let's mock the return for UI purposes:
  return {
    id: "new",
    ...data,
    created_at: new Date().toISOString(),
    ...(userId && { user_id: userId }),
    ...(userName && !data.is_anonymous && { user_name: userName }),
    ...(userAvatar && !data.is_anonymous && { user_avatar: userAvatar }),
  } as Grave;
};

export const pressF = async (graveId: string, userName?: string): Promise<void> => {
  const contract = await getContract(true);
  const tx = await contract.pressF(graveId);
  await tx.wait();
};

export const unpressF = async (graveId: string, userName: string): Promise<void> => {
  const contract = await getContract(true);
  const tx = await contract.unpressF(graveId);
  await tx.wait();
};

export const dropEulogy = async (graveId: string, text: string, userName: string, userId?: string): Promise<Eulogy> => {
  const contract = await getContract(true);
  const tx = await contract.dropEulogy(graveId, text);
  await tx.wait();
  
  return {
    id: crypto.randomUUID(),
    text,
    user_name: userName,
    ...(userId && { user_id: userId }),
    created_at: new Date().toISOString()
  };
};

export const getEulogies = async (graveId: string): Promise<Eulogy[]> => {
  try {
    const contract = await getContract();
    const eulogies = await contract.getEulogies(graveId);
    
    return await Promise.all(eulogies.map(async (e: any) => {
      let userName = "Anonymous Mourner";
      try {
         const profile = await contract.getProfile(e.author);
         if (profile.exists) {
             userName = profile.username;
         }
      } catch (err) {
         console.error(err);
      }
      
      return {
        id: e.id.toString(),
        text: e.text,
        user_name: userName,
        user_id: e.author,
        created_at: new Date(Number(e.timestamp) * 1000).toISOString()
      };
    }));
  } catch (error) {
    console.error("Error fetching eulogies", error);
    return [];
  }
};

import { ethers } from 'ethers';
export const checkHasPressedF = async (graveId: string, address: string): Promise<boolean> => {
  if (!address || !ethers.isAddress(address)) return false;
  try {
    const contract = await getContract();
    return await contract.hasRespected(graveId, address);
  } catch (error) {
    console.error("Error checking has pressed f:", error);
    return false;
  }
};

export const deleteEulogy = async (graveId: string, eulogy: Eulogy): Promise<void> => {
  try {
    const contract = await getContract(true);
    const tx = await contract.deleteEulogy(graveId, eulogy.id);
    await tx.wait();
  } catch (error) {
    console.error("Error deleting eulogy:", error);
    throw error;
  }
};

export const deleteGrave = async (graveId: string): Promise<void> => {
  try {
    const contract = await getContract(true);
    const tx = await contract.deleteGrave(graveId);
    await tx.wait();
  } catch (error) {
    console.error("Error deleting grave:", error);
    throw error;
  }
};