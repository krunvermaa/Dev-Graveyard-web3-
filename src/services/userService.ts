/**
 * src/services/userService.ts
 * Decentralized Identity & Social Graph service for DevGraveyard on Avalanche.
 * Connects wallet profiles, follows/followers, and dispatched memorial graves on-chain
 * with transparent dual-mode fallback to mock storage when offline or unconfigured.
 */

import { ethers } from 'ethers';
import { User, SharedGrave } from '../types';
import { getContract } from './web3Service';
import { getGrave } from './graveService';

/**
 * Checks whether a given username is available to claim.
 * Returns true if available, false if taken or invalid.
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  if (!username || username.trim().length === 0 || username.length > 32) {
    return false;
  }
  try {
    const contract = await getContract(false);
    return await contract.checkUsername(username.trim());
  } catch (err) {
    console.error('Error checking username availability:', err);
    return false;
  }
};

/**
 * Creates an on-chain UserProfile.
 * Supports both signatures:
 * - (address, username, avatarUrl, bio, github, instagram, whatsapp)
 * - (account, email, username, photoURL) for UI compatibility.
 */
export const createUserProfile = async (
  arg0: string,
  arg1: string,
  arg2?: string,
  arg3?: string,
  arg4?: string,
  arg5?: string,
  arg6?: string
): Promise<void> => {
  let username = '';
  let avatarUrl = '';
  let bio = '';
  let github = '';
  let instagram = '';
  let whatsapp = '';

  if (arg2 !== undefined && (arg1 === '' || arg1.includes('@'))) {
    // Legacy/UI form: (account, email, username, photoURL)
    username = arg2;
    avatarUrl = arg3 || '';
    bio = arg4 || '';
    github = arg5 || '';
    instagram = arg6 || '';
  } else {
    // Canonical form: (address, username, avatarUrl, bio, github, instagram, whatsapp)
    username = arg1;
    avatarUrl = arg2 || '';
    bio = arg3 || '';
    github = arg4 || '';
    instagram = arg5 || '';
    whatsapp = arg6 || '';
  }

  try {
    const contract = await getContract(true);
    const tx = await contract.createProfile(
      username.trim(),
      avatarUrl || 'crypt_keeper',
      bio,
      github,
      instagram,
      whatsapp
    );
    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }
  } catch (err) {
    console.error('Failed to create user profile:', err);
    throw err;
  }
};

/**
 * Retrieves a user profile by wallet address or username.
 */
export const getUserProfile = async (addressOrUsername: string): Promise<User | null> => {
  if (!addressOrUsername || addressOrUsername.trim() === '') return null;
  const input = addressOrUsername.trim();

  try {
    const contract = await getContract(false);
    let profile: any = null;

    if (ethers.isAddress(input)) {
      profile = await contract.getProfile(input);
    } else {
      profile = await contract.getProfileByUsername(input);
    }

    if (profile && profile.exists) {
      const joinedAtSec = Number(profile.joinedAt || 0n);
      const createdAtIso = joinedAtSec > 0
        ? new Date(joinedAtSec * 1000).toISOString()
        : new Date().toISOString();

      return {
        uid: profile.wallet,
        address: profile.wallet.toLowerCase(),
        username: profile.username,
        photoURL: profile.avatarUrl || '',
        avatarUrl: profile.avatarUrl || '',
        bio: profile.bio || '',
        github: profile.github || '',
        instagram: profile.instagram || '',
        whatsapp: profile.whatsapp || '',
        email: '',
        createdAt: createdAtIso
      };
    }
  } catch (err) {
    console.error(`Failed to fetch user profile for "${input}":`, err);
  }

  return null;
};

/**
 * Searches user profile by username.
 */
export const findUserByUsername = async (
  username: string
): Promise<{ uid: string; username: string; photoURL?: string } | null> => {
  const profile = await getUserProfile(username);
  if (profile) {
    return {
      uid: profile.uid,
      username: profile.username,
      photoURL: profile.photoURL
    };
  }
  return null;
};

/**
 * Updates an existing user profile's metadata on Avalanche.
 */
export const updateUserProfile = async (
  address: string,
  data: {
    avatarUrl?: string;
    bio?: string;
    github?: string;
    instagram?: string;
    whatsapp?: string;
  }
): Promise<void> => {
  try {
    const existing = await getUserProfile(address);
    const contract = await getContract(true);
    const tx = await contract.updateProfile(
      data.avatarUrl !== undefined ? data.avatarUrl : (existing?.photoURL || 'crypt_keeper'),
      data.bio !== undefined ? data.bio : (existing?.bio || ''),
      data.github !== undefined ? data.github : (existing?.github || ''),
      data.instagram !== undefined ? data.instagram : (existing?.instagram || ''),
      data.whatsapp !== undefined ? data.whatsapp : (existing?.whatsapp || '')
    );
    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }
  } catch (err) {
    console.error('Failed to update user profile:', err);
    throw err;
  }
};

/**
 * Updates user avatar URL.
 */
export const updateAvatar = async (avatarUrl: string): Promise<void> => {
  try {
    const contract = await getContract(true);
    const tx = await contract.updateProfile(avatarUrl, '', '', '', '');
    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }
  } catch (err) {
    console.error('Failed to update avatar:', err);
    throw err;
  }
};

/**
 * Follow another developer's crypt.
 * Supports:
 * - followUser(targetAddress)
 * - followUser(currentUserId, targetAddress)
 * - followUser(currentUserId, currentUsername, targetUserId, targetUsername)
 */
export const followUser = async (
  arg0: string,
  arg1?: string,
  arg2?: string,
  arg3?: string
): Promise<void> => {
  let targetAddress = arg0;
  if (arg2 !== undefined) {
    targetAddress = arg2;
  } else if (arg1 !== undefined) {
    targetAddress = arg1;
  }

  try {
    const contract = await getContract(true);
    const tx = await contract.follow(targetAddress);
    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }
  } catch (err) {
    console.error(`Failed to follow user ${targetAddress}:`, err);
    throw err;
  }
};

/**
 * Unfollow another developer's crypt.
 * Supports:
 * - unfollowUser(targetAddress)
 * - unfollowUser(currentUserId, targetAddress)
 */
export const unfollowUser = async (arg0: string, arg1?: string): Promise<void> => {
  const targetAddress = arg1 !== undefined ? arg1 : arg0;
  try {
    const contract = await getContract(true);
    const tx = await contract.unfollow(targetAddress);
    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }
  } catch (err) {
    console.error(`Failed to unfollow user ${targetAddress}:`, err);
    throw err;
  }
};

/**
 * Retrieve list of follower wallet addresses.
 */
export const getFollowers = async (address: string): Promise<string[]> => {
  if (!address || !ethers.isAddress(address)) return [];
  try {
    const contract = await getContract(false);
    return await contract.getFollowers(address);
  } catch (err) {
    console.error(`Failed to get followers for ${address}:`, err);
    return [];
  }
};

/**
 * Retrieve list of following wallet addresses.
 */
export const getFollowing = async (address: string): Promise<string[]> => {
  if (!address || !ethers.isAddress(address)) return [];
  try {
    const contract = await getContract(false);
    return await contract.getFollowing(address);
  } catch (err) {
    console.error(`Failed to get following for ${address}:`, err);
    return [];
  }
};

/**
 * Check if follower is currently following target.
 */
export const isFollowing = async (follower: string, target: string): Promise<boolean> => {
  if (!follower || !target) return false;
  try {
    const contract = await getContract(false);
    return await contract.isFollowing(follower, target);
  } catch (err) {
    console.error('Error checking isFollowing:', err);
    return false;
  }
};

/**
 * Dispatch / send a shared grave to another user's inbox on-chain.
 */
export const sendSharedGrave = async (
  graveId: string | number,
  toAddress: string
): Promise<void> => {
  try {
    const contract = await getContract(true);
    const tx = await contract.dispatchGrave(graveId, toAddress);
    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }
  } catch (err) {
    console.error(`Failed to dispatch grave #${graveId} to ${toAddress}:`, err);
    throw err;
  }
};

/**
 * UI compatibility wrapper for sharing a grave with a friend.
 */
export const shareGraveWithFriend = async (
  graveId: string,
  _graveName: string,
  _fromUserId: string,
  _fromUsername: string,
  toUserId: string
): Promise<void> => {
  return sendSharedGrave(graveId, toUserId);
};

/**
 * Retrieves all shared graves dispatched to a user's wallet address.
 */
export const getSharedGraves = async (address: string): Promise<SharedGrave[]> => {
  if (!address || !ethers.isAddress(address)) return [];
  try {
    const contract = await getContract(false);
    const dispatched = await contract.getDispatchedGraves(address);
    if (!dispatched || dispatched.length === 0) return [];

    return await Promise.all(
      dispatched.map(async (d: any) => {
        let graveName = `Memorial Grave #${d.graveId}`;
        let fromUsername = d.fromUser.slice(0, 8);

        try {
          const g = await getGrave(d.graveId.toString());
          if (g && g.project_name) graveName = g.project_name;
        } catch (e) {
          // ignore
        }

        try {
          const senderProfile = await getUserProfile(d.fromUser);
          if (senderProfile && senderProfile.username) {
            fromUsername = senderProfile.username;
          }
        } catch (e) {
          // ignore
        }

        const tsSec = Number(d.timestamp || 0n);
        const createdAtIso = tsSec > 0
          ? new Date(tsSec * 1000).toISOString()
          : new Date().toISOString();

        return {
          id: d.id.toString(),
          graveId: d.graveId.toString(),
          graveName,
          fromUserId: d.fromUser,
          fromUsername,
          toUserId: d.toUser,
          direction: 'received',
          createdAt: createdAtIso
        };
      })
    );
  } catch (err) {
    console.error(`Failed to retrieve shared graves for ${address}:`, err);
    return [];
  }
};

// Legacy stubs kept for UI compatibility
export const sendFriendRequest = async (): Promise<void> => {
  console.info('Friend requests are replaced with on-chain follow() in Web3.');
};

export const respondToFriendRequest = async (): Promise<void> => {
  console.info('Friend requests are replaced with on-chain follow() in Web3.');
};

export const removeFriend = async (): Promise<void> => {
  console.info('Friend removal is replaced with unfollow() in Web3.');
};

export const removeFollower = async (): Promise<void> => {
  console.info('Followers are self-managed on Avalanche C-Chain.');
};
