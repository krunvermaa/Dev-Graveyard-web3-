import { AVATARS } from "../pixelAvatars";
import { User, FriendRequest, Friend, SharedGrave } from '../types';
import { getContract } from './web3Service';

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  if (!username) return false;
  try {
    const contract = await getContract();
    return await contract.checkUsername(username);
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const createUserProfile = async (uid: string, email: string, username: string, photoURL: string): Promise<void> => {
  try {
    const contract = await getContract(true);
    const tx = await contract.createProfile(username, photoURL);
    await tx.wait();
  } catch (err) {
    console.error("Failed to create profile:", err);
    throw err;
  }
};

import { ethers } from 'ethers';
export const getUserProfile = async (uid: string): Promise<User | null> => {
  if (!uid || !ethers.isAddress(uid)) return null;
  try {
    const contract = await getContract();
    const profile = await contract.getProfile(uid);
    if (profile.exists) {
       return {
          uid: profile.wallet,
          username: profile.username,
          photoURL: profile.avatarUrl,
          email: "",
          createdAt: new Date(Number(profile.joinedAt) * 1000).toISOString()
       };
    }
  } catch (err) {
    console.error(err);
  }
  return null;
};

export const findUserByUsername = async (username: string): Promise<{uid: string, username: string} | null> => {
  try {
     const contract = await getContract();
     const profile = await contract.getProfileByUsername(username);
     if (profile.exists) {
        return { uid: profile.wallet, username: profile.username };
     }
  } catch (err) {
    console.error(err);
  }
  return null;
};

// Friend requests and shared graves are not supported on-chain right now
export const sendFriendRequest = async (fromUserId: string, fromUsername: string, toUserId: string): Promise<void> => {
  console.log("Not supported in Web3 mode");
};

export const respondToFriendRequest = async (requestId: string, fromUserId: string, toUserId: string, toUsername: string, fromUsername: string, accept: boolean): Promise<void> => {
  console.log("Not supported in Web3 mode");
};

export const shareGraveWithFriend = async (graveId: string, graveName: string, fromUserId: string, fromUsername: string, toUserId: string): Promise<void> => {
  console.log("Not supported in Web3 mode");
};

export const followUser = async (currentUserId: string, currentUsername: string, targetUserId: string, targetUsername: string): Promise<void> => {
  try {
    const contract = await getContract(true);
    const tx = await contract.follow(targetUserId);
    await tx.wait();
  } catch (err) {
    console.error("Failed to follow user:", err);
    throw err;
  }
};

export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    const contract = await getContract(true);
    const tx = await contract.unfollow(targetUserId);
    await tx.wait();
  } catch (err) {
    console.error("Failed to unfollow user:", err);
    throw err;
  }
};

export const removeFriend = async (currentUserId: string, targetUserId: string): Promise<void> => {
  console.log("Not supported in Web3 mode");
};

export const removeFollower = async (currentUserId: string, followerId: string): Promise<void> => {
  console.log("Not supported in Web3 mode"); // Typically user can't force someone to unfollow them in this basic contract
};


export const updateAvatar = async (avatarUrl: string): Promise<void> => {
  try {
    const contract = await getContract(true);
    const tx = await contract.updateProfile(avatarUrl);
    await tx.wait();
  } catch (err) {
    console.error("Failed to update avatar:", err);
    throw err;
  }
};
