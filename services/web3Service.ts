import { getMockContract } from './mockContract';
import { ethers } from 'ethers';
import { Grave, Eulogy, GraveFormData } from '../types';

export const getContractAddress = () => {
  return localStorage.getItem('avax_contract_address') || "0x0000000000000000000000000000000000000000";
};

export const CONTRACT_ABI = [
  "function createProfile(string _username, string _avatarUrl) public",
  "function updateProfile(string _avatarUrl) public",
  "function getProfile(address _wallet) public view returns (tuple(address wallet, string username, string avatarUrl, uint256 joinedAt, bool exists))",
  "function getProfileByUsername(string _username) public view returns (tuple(address wallet, string username, string avatarUrl, uint256 joinedAt, bool exists))",
  "function checkUsername(string _username) public view returns (bool)",
  
  "function createGrave(string _projectName, string _causeOfDeath, string _lessonLearned, string _githubLink, bool _isAnonymous) public returns (uint256)",
  "function pressF(uint256 _graveId) public",
  "function unpressF(uint256 _graveId) public",
  "function dropEulogy(uint256 _graveId, string _text) public",
  "function deleteGrave(uint256 _graveId) public",
  "function deleteEulogy(uint256 _graveId, uint256 _eulogyId) public",
  
  "function getGraveCount() public view returns (uint256)",
  "function graves(uint256) public view returns (uint256 id, address owner, string projectName, string causeOfDeath, string lessonLearned, string githubLink, bool isAnonymous, uint256 respects, uint256 createdAt)",
  "function getEulogies(uint256 _graveId) public view returns (tuple(uint256 id, address author, string text, uint256 timestamp)[])",
  "function hasRespected(uint256, address) public view returns (bool)",
  "function allGraveIds(uint256) public view returns (uint256)",
  
  "function follow(address _target) public",
  "function unfollow(address _target) public",
  "function getFollowers(address _user) public view returns (address[])",
  "function getFollowing(address _user) public view returns (address[])",
  "function isFollowing(address follower, address following) public view returns (bool)"
];

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to a public Avalanche RPC if not connected
  return new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
};

export const getContract = async (withSigner = false) => {
  const address = getContractAddress();
  if (address === "0x0000000000000000000000000000000000000000") return getMockContract();
  const provider = getProvider();
  
  if (withSigner) {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error("No crypto wallet found. Please install it.");
    }
    const signer = await provider.getSigner();
    return new ethers.Contract(address, CONTRACT_ABI, signer);
  }
  return new ethers.Contract(address, CONTRACT_ABI, provider);
};

