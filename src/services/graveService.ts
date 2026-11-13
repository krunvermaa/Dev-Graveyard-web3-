/**
 * src/services/graveService.ts
 * Decentralized grave operations on Avalanche C-Chain / Fuji Testnet.
 * Dual-mode operation: Reads & writes directly on-chain if contract address configured,
 * or gracefully executes via mockContract if offline, unconfigured, or wallet disconnected.
 */

import { ethers } from 'ethers';
import { Grave, GraveFormData, Eulogy } from '../types';
import { getContract } from './web3Service';

// Profile cache to prevent redundant on-chain RPC calls when listing graves
const profileCache: Record<string, { username: string; avatarUrl: string }> = {};

const resolveProfile = async (
  contract: any,
  ownerAddress: string
): Promise<{ username: string; avatarUrl: string }> => {
  const normalized = ownerAddress.toLowerCase();
  if (profileCache[normalized]) {
    return profileCache[normalized];
  }

  try {
    const profile = await contract.getProfile(ownerAddress);
    if (profile && profile.exists) {
      const data = {
        username: profile.username || '',
        avatarUrl: profile.avatarUrl || ''
      };
      profileCache[normalized] = data;
      return data;
    }
  } catch (err) {
    // Non-critical; fallback to empty
  }

  const empty = { username: '', avatarUrl: '' };
  profileCache[normalized] = empty;
  return empty;
};

const mapOnChainGrave = async (contract: any, g: any): Promise<Grave> => {
  const isAnon = Boolean(g.isAnonymous);
  let userName = '';
  let userAvatar = '';

  if (!isAnon && g.owner && g.owner !== ethers.ZeroAddress) {
    const p = await resolveProfile(contract, g.owner);
    userName = p.username;
    userAvatar = p.avatarUrl;
  }

  const createdAtSec = Number(g.createdAt || 0n);
  const createdAtIso = createdAtSec > 0
    ? new Date(createdAtSec * 1000).toISOString()
    : new Date().toISOString();

  return {
    id: g.id.toString(),
    user_id: g.owner,
    user_name: isAnon ? 'Anonymous Developer' : (userName || g.owner.slice(0, 8)),
    user_avatar: isAnon ? '' : userAvatar,
    project_name: g.projectName,
    cause_of_death: g.causeOfDeath,
    lived_for: g.livedFor || '',
    lesson_learned: g.lessonLearned,
    tech_stack: g.techStack || '',
    github_link: g.githubLink || '',
    is_anonymous: isAnon,
    respects: Number(g.respects || 0n),
    created_at: createdAtIso,
    is_resurrected: Boolean(g.isResurrected),
    resurrection_note: g.resurrectionNote || ''
  };
};

/**
 * Fetch a single grave by its ID.
 */
export const getGrave = async (graveId: string | number): Promise<Grave | null> => {
  try {
    const contract = await getContract(false);
    const g = await contract.getGrave(graveId);
    if (!g || g.id === 0n || g.id === '0') {
      return null;
    }
    return await mapOnChainGrave(contract, g);
  } catch (error) {
    console.error(`Error fetching grave #${graveId}:`, error);
    return null;
  }
};

/**
 * Fetch all graves from the cemetery.
 */
export const getGraves = async (): Promise<Grave[]> => {
  try {
    const contract = await getContract(false);
    const count = await contract.getGraveCount();
    const countNum = Number(count);
    if (countNum === 0) return [];

    // If batch function available, use it for optimal single-round-trip RPC
    try {
      const allIds = await contract.getAllGraveIds();
      if (allIds && allIds.length > 0) {
        const batch = await contract.getGravesBatch(allIds);
        const mapped = await Promise.all(
          batch.filter((g: any) => g.id !== 0n && g.id !== '0').map((g: any) => mapOnChainGrave(contract, g))
        );
        return mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    } catch (e) {
      // Fall back to index iteration
    }

    const graves: Grave[] = [];
    for (let i = 0; i < countNum; i++) {
      try {
        const id = await contract.allGraveIds(i);
        const g = await contract.getGrave(id);
        if (g && g.id !== 0n && g.id !== '0') {
          graves.push(await mapOnChainGrave(contract, g));
        }
      } catch (err) {
        console.error(`Error loading grave index ${i}:`, err);
      }
    }

    return graves.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error fetching cemetery graves:', error);
    return [];
  }
};

/**
 * Fetch all graves owned by a specific user wallet address.
 */
export const getUserGraves = async (userId: string): Promise<Grave[]> => {
  if (!userId) return [];
  try {
    const graves = await getGraves();
    const target = userId.toLowerCase();
    return graves.filter((g) => g.user_id?.toLowerCase() === target);
  } catch (error) {
    console.error(`Error fetching graves for user ${userId}:`, error);
    return [];
  }
};

/**
 * Creates a new grave on Avalanche C-Chain or in mock contract.
 */
export const createGrave = async (
  data: GraveFormData,
  userAddress?: string,
  isAnonymous?: boolean
): Promise<Grave> => {
  const contract = await getContract(true);
  const anonymousFlag = isAnonymous !== undefined ? isAnonymous : Boolean(data.is_anonymous);

  const tx = await contract.createGrave(
    data.project_name,
    data.cause_of_death,
    data.lived_for || '',
    data.lesson_learned,
    data.tech_stack || '',
    data.github_link || '',
    anonymousFlag
  );

  if (tx && typeof tx.wait === 'function') {
    await tx.wait();
  }

  return {
    id: tx?.id ? tx.id.toString() : 'new',
    project_name: data.project_name,
    cause_of_death: data.cause_of_death,
    lived_for: data.lived_for || '',
    lesson_learned: data.lesson_learned,
    tech_stack: data.tech_stack || '',
    github_link: data.github_link || '',
    is_anonymous: anonymousFlag,
    respects: 0,
    created_at: new Date().toISOString(),
    user_id: userAddress || '',
    user_name: anonymousFlag ? 'Anonymous Developer' : undefined,
    is_resurrected: false,
    resurrection_note: ''
  };
};

/**
 * UI submitGrave alias supporting optional userName and userAvatar.
 */
export const submitGrave = async (
  data: GraveFormData,
  userId?: string,
  userName?: string,
  userAvatar?: string
): Promise<Grave> => {
  const created = await createGrave(data, userId, data.is_anonymous);
  if (!data.is_anonymous) {
    if (userName) created.user_name = userName;
    if (userAvatar) created.user_avatar = userAvatar;
  }
  return created;
};

/**
 * Delete a grave (restricted to grave owner).
 */
export const deleteGrave = async (graveId: string | number): Promise<void> => {
  try {
    const contract = await getContract(true);
    const tx = await contract.deleteGrave(graveId);
    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }
  } catch (error) {
    console.error(`Error deleting grave #${graveId}:`, error);
    throw error;
  }
};

/**
 * Resurrect an abandoned project with a note.
 */
export const resurrectGrave = async (graveId: string | number, note: string): Promise<void> => {
  try {
    const contract = await getContract(true);
    const tx = await contract.resurrectGrave(graveId, note);
    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }
  } catch (error) {
    console.error(`Error resurrecting grave #${graveId}:`, error);
    throw error;
  }
};

/**
 * Pay respects to a project tombstone (press F).
 */
export const pressF = async (graveId: string | number, userAddressOrName?: string): Promise<void> => {
  const contract = await getContract(true);
  const tx = await contract.pressF(graveId);
  if (tx && typeof tx.wait === 'function') {
    await tx.wait();
  }
};

/**
 * Remove respects from a tombstone (unpress F).
 */
export const unpressF = async (graveId: string | number, userAddressOrName?: string): Promise<void> => {
  const contract = await getContract(true);
  const tx = await contract.unpressF(graveId);
  if (tx && typeof tx.wait === 'function') {
    await tx.wait();
  }
};

/**
 * Check whether a user wallet has already paid respects to a grave.
 */
export const checkHasPressedF = async (
  graveId: string | number,
  address: string
): Promise<boolean> => {
  if (!address || !ethers.isAddress(address)) return false;
  try {
    const contract = await getContract(false);
    return await contract.hasRespected(graveId, address);
  } catch (error) {
    console.error(`Error checking respects for grave #${graveId}:`, error);
    return false;
  }
};

export const hasRespected = checkHasPressedF;

/**
 * Add a eulogy (condolence message) to a grave.
 */
export const addEulogy = async (
  graveId: string | number,
  eulogy: { text: string; user_name?: string; user_id?: string } | string
): Promise<Eulogy> => {
  const contract = await getContract(true);
  const text = typeof eulogy === 'string' ? eulogy : eulogy.text;
  const userName = typeof eulogy === 'object' ? eulogy.user_name : undefined;
  const userId = typeof eulogy === 'object' ? eulogy.user_id : undefined;

  const tx = await contract.dropEulogy(graveId, text);
  if (tx && typeof tx.wait === 'function') {
    await tx.wait();
  }

  return {
    id: crypto.randomUUID(),
    graveId: graveId.toString(),
    text,
    user_name: userName || 'Anonymous Mourner',
    ...(userId && { user_id: userId, author_address: userId }),
    created_at: new Date().toISOString()
  };
};

export const dropEulogy = async (
  graveId: string | number,
  text: string,
  userName?: string,
  userId?: string
): Promise<Eulogy> => {
  return addEulogy(graveId, { text, user_name: userName, user_id: userId });
};

/**
 * Retrieve all eulogies posted to a grave.
 */
export const getEulogies = async (graveId: string | number): Promise<Eulogy[]> => {
  try {
    const contract = await getContract(false);
    const onChainEulogies = await contract.getEulogies(graveId);
    if (!onChainEulogies || onChainEulogies.length === 0) return [];

    return await Promise.all(
      onChainEulogies.map(async (e: any) => {
        let authorName = 'Anonymous Mourner';
        try {
          if (e.author && e.author !== ethers.ZeroAddress) {
            const p = await resolveProfile(contract, e.author);
            if (p.username) authorName = p.username;
          }
        } catch (err) {
          // ignore
        }

        const tsSec = Number(e.timestamp || 0n);
        const createdAtIso = tsSec > 0
          ? new Date(tsSec * 1000).toISOString()
          : new Date().toISOString();

        return {
          id: e.id.toString(),
          graveId: graveId.toString(),
          text: e.text,
          user_name: authorName,
          user_id: e.author,
          author_address: e.author,
          created_at: createdAtIso,
          timestamp: tsSec
        };
      })
    );
  } catch (error) {
    console.error(`Error fetching eulogies for grave #${graveId}:`, error);
    return [];
  }
};

/**
 * Delete a eulogy from a grave.
 */
export const deleteEulogy = async (
  graveId: string | number,
  eulogyOrId: Eulogy | string | number
): Promise<void> => {
  try {
    const eulogyId = typeof eulogyOrId === 'object' && eulogyOrId !== null
      ? eulogyOrId.id
      : eulogyOrId;

    const contract = await getContract(true);
    const tx = await contract.deleteEulogy(graveId, eulogyId);
    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }
  } catch (error) {
    console.error(`Error deleting eulogy #${eulogyOrId} on grave #${graveId}:`, error);
    throw error;
  }
};

/**
 * Fetch a batch of graves by an array of IDs.
 */
export const getGravesBatch = async (ids: Array<string | number>): Promise<Grave[]> => {
  try {
    const contract = await getContract(false);
    const batch = await contract.getGravesBatch(ids);
    return await Promise.all(
      batch.filter((g: any) => g.id !== 0n && g.id !== '0').map((g: any) => mapOnChainGrave(contract, g))
    );
  } catch (error) {
    console.error('Error fetching graves batch:', error);
    return [];
  }
};

/**
 * Fetch recent graves with limit and offset.
 */
export const getRecentGraves = async (limit = 10, offset = 0): Promise<Grave[]> => {
  try {
    const contract = await getContract(false);
    const recent = await contract.getRecentGraves(limit, offset);
    return await Promise.all(
      recent.filter((g: any) => g.id !== 0n && g.id !== '0').map((g: any) => mapOnChainGrave(contract, g))
    );
  } catch (error) {
    console.error('Error fetching recent graves:', error);
    return [];
  }
};
