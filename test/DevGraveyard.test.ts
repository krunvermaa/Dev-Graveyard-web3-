import { describe, it, expect, beforeEach } from 'vitest';
import { ethers } from 'ethers';
import devGraveyardAbi from '../src/abis/DevGraveyard.json';
import {
  getMockContract,
  resetMockContractStorage,
  setMockCaller
} from '../src/services/mockContract';
import {
  checkUsernameAvailability,
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
  sendSharedGrave,
  getSharedGraves
} from '../src/services/userService';
import {
  getGraves,
  getGrave,
  getUserGraves,
  createGrave,
  pressF,
  unpressF,
  checkHasPressedF,
  addEulogy,
  getEulogies,
  deleteEulogy,
  deleteGrave,
  getGravesBatch,
  getRecentGraves
} from '../src/services/graveService';
import {
  getConfessions,
  getConfessionCount,
  addConfession,
  reactToConfession
} from '../src/services/confessionService';
import { CauseOfDeath } from '../src/types';

describe('DevGraveyard Avalanche Web3 Suite', () => {
  const ALICE = '0x1000000000000000000000000000000000000001';
  const BOB = '0x2000000000000000000000000000000000000002';
  const CHARLIE = '0x3000000000000000000000000000000000000003';

  beforeEach(() => {
    // Reset storage to fresh seed state before each test
    resetMockContractStorage();
    setMockCaller(ALICE);
  });

  describe('1. ABI & Smart Contract Interface Verification', () => {
    it('should validate complete JSON ABI fragments with ethers.Interface', () => {
      const iface = new ethers.Interface(devGraveyardAbi);
      expect(iface.fragments.length).toBeGreaterThanOrEqual(40);

      // Check key method signatures
      expect(iface.hasFunction('createProfile')).toBe(true);
      expect(iface.hasFunction('updateProfile')).toBe(true);
      expect(iface.hasFunction('checkUsername')).toBe(true);
      expect(iface.hasFunction('createGrave')).toBe(true);
      expect(iface.hasFunction('deleteGrave')).toBe(true);
      expect(iface.hasFunction('pressF')).toBe(true);
      expect(iface.hasFunction('unpressF')).toBe(true);
      expect(iface.hasFunction('dropEulogy')).toBe(true);
      expect(iface.hasFunction('postConfession')).toBe(true);
      expect(iface.hasFunction('reactConfession')).toBe(true);
      expect(iface.hasFunction('follow')).toBe(true);
      expect(iface.hasFunction('unfollow')).toBe(true);
      expect(iface.hasFunction('dispatchGrave')).toBe(true);
      expect(iface.hasFunction('getGravesBatch')).toBe(true);
      expect(iface.hasFunction('getRecentGraves')).toBe(true);

      // Check key events
      expect(iface.hasEvent('ProfileCreated')).toBe(true);
      expect(iface.hasEvent('GraveCreated')).toBe(true);
      expect(iface.hasEvent('GraveRespected')).toBe(true);
      expect(iface.hasEvent('EulogyAdded')).toBe(true);
      expect(iface.hasEvent('ConfessionPosted')).toBe(true);
      expect(iface.hasEvent('GraveDispatched')).toBe(true);
    });
  });

  describe('2. User Profiles & Username Availability', () => {
    it('should verify username availability correctly', async () => {
      // Seed username 'cryptokeeper' is already taken
      const taken = await checkUsernameAvailability('cryptokeeper');
      expect(taken).toBe(false);

      // Seed check case-insensitivity
      const takenCaps = await checkUsernameAvailability('CryptoKeeper');
      expect(takenCaps).toBe(false);

      // New username should be available
      const available = await checkUsernameAvailability('avalanche_necromancer');
      expect(available).toBe(true);

      // Empty or overlength username should be unavailable
      expect(await checkUsernameAvailability('')).toBe(false);
      expect(await checkUsernameAvailability('a'.repeat(33))).toBe(false);
    });

    it('should create a user profile and retrieve by address and username', async () => {
      setMockCaller(ALICE);
      await createUserProfile(
        ALICE,
        'alice_dev',
        'crypt_keeper',
        'Burying dead Solidity contracts on Avalanche',
        'https://github.com/alice',
        'alice_insta',
        '+123456789'
      );

      // Username now taken
      expect(await checkUsernameAvailability('alice_dev')).toBe(false);

      // Retrieve by address
      const profileByAddr = await getUserProfile(ALICE);
      expect(profileByAddr).not.toBeNull();
      expect(profileByAddr?.username).toBe('alice_dev');
      expect(profileByAddr?.bio).toContain('Burying dead Solidity contracts');
      expect(profileByAddr?.github).toBe('https://github.com/alice');

      // Retrieve by username
      const profileByName = await getUserProfile('alice_dev');
      expect(profileByName).not.toBeNull();
      expect(profileByName?.address).toBe(ALICE.toLowerCase());

      // Attempt duplicate creation should throw
      await expect(
        createUserProfile(ALICE, 'alice_dev2', 'avatar')
      ).rejects.toThrow('Profile already exists');
    });

    it('should update profile metadata successfully', async () => {
      setMockCaller(ALICE);
      await createUserProfile(ALICE, 'alice_builder', 'necromancer');

      await updateUserProfile(ALICE, {
        bio: 'Updated gothic biography',
        github: 'https://github.com/alice-new'
      });

      const updated = await getUserProfile(ALICE);
      expect(updated?.bio).toBe('Updated gothic biography');
      expect(updated?.github).toBe('https://github.com/alice-new');
    });
  });

  describe('3. Grave Memorials & Tombstone Management', () => {
    it('should load initial seed graves', async () => {
      const graves = await getGraves();
      expect(graves.length).toBeGreaterThanOrEqual(4);

      const cryptoGraveyard = graves.find((g) => g.project_name === 'CryptoGraveyard');
      expect(cryptoGraveyard).toBeDefined();
      expect(cryptoGraveyard?.respects).toBe(42);
      expect(cryptoGraveyard?.cause_of_death).toBe('Technical Roadblocks');
    });

    it('should create a new memorial grave on Avalanche and retrieve it', async () => {
      setMockCaller(ALICE);
      await createUserProfile(ALICE, 'alice_undertaker', 'avatar');

      const newGrave = await createGrave(
        {
          project_name: 'DeadDAO Governance',
          cause_of_death: CauseOfDeath.MARKET_FIT_MISSING,
          lived_for: '4 months',
          lesson_learned: '100% quorum required for parameter tweaks caused complete protocol paralysis.',
          tech_stack: 'Solidity, Avalanche, IPFS',
          github_link: 'https://github.com/alice/dead-dao',
          is_anonymous: false
        },
        ALICE,
        false
      );

      expect(newGrave.project_name).toBe('DeadDAO Governance');

      // Verify it appears in cemetery
      const allGraves = await getGraves();
      const found = allGraves.find((g) => g.project_name === 'DeadDAO Governance');
      expect(found).toBeDefined();
      expect(found?.user_id?.toLowerCase()).toBe(ALICE.toLowerCase());
      expect(found?.user_name).toBe('alice_undertaker');

      // Fetch by ID
      const single = await getGrave(found!.id);
      expect(single?.project_name).toBe('DeadDAO Governance');
      expect(single?.tech_stack).toBe('Solidity, Avalanche, IPFS');

      // Check user graves filter
      const aliceGraves = await getUserGraves(ALICE);
      expect(aliceGraves.some((g) => g.project_name === 'DeadDAO Governance')).toBe(true);
    });

    it('should support anonymous grave submission', async () => {
      setMockCaller(BOB);
      await createGrave(
        {
          project_name: 'Anonymous Failure',
          cause_of_death: CauseOfDeath.LOSS_OF_INTEREST,
          lived_for: '2 weeks',
          lesson_learned: 'Built in secret without talking to a single customer.',
          tech_stack: 'Next.js',
          github_link: '',
          is_anonymous: true
        },
        BOB,
        true
      );

      const all = await getGraves();
      const anon = all.find((g) => g.project_name === 'Anonymous Failure');
      expect(anon).toBeDefined();
      expect(anon?.is_anonymous).toBe(true);
      expect(anon?.user_name).toBe('Anonymous Developer');
    });

    it('should delete a grave only if called by the owner', async () => {
      setMockCaller(ALICE);
      await createUserProfile(ALICE, 'grave_owner', 'avatar');
      await createGrave(
        {
          project_name: 'Doomed Project',
          cause_of_death: CauseOfDeath.SCOPE_CREEP,
          lived_for: '1 month',
          lesson_learned: 'Trying to delete this grave.',
          tech_stack: 'C++',
          github_link: '',
          is_anonymous: false
        },
        ALICE,
        false
      );

      const all = await getGraves();
      const doomed = all.find((g) => g.project_name === 'Doomed Project');
      expect(doomed).toBeDefined();

      // Bob tries to delete Alice's grave -> must reject
      setMockCaller(BOB);
      await expect(deleteGrave(doomed!.id)).rejects.toThrow('Not the owner');

      // Alice deletes her own grave -> must succeed
      setMockCaller(ALICE);
      await deleteGrave(doomed!.id);

      const afterDelete = await getGrave(doomed!.id);
      expect(afterDelete).toBeNull();
    });
  });

  describe('4. Paying Respects (pressF / unpressF)', () => {
    it('should toggle respects and prevent double respects', async () => {
      setMockCaller(CHARLIE);
      const graveId = '1'; // CryptoGraveyard

      // Initially Charlie has not paid respects
      expect(await checkHasPressedF(graveId, CHARLIE)).toBe(false);

      const before = await getGrave(graveId);
      const initialRespects = before!.respects || 0;

      // Press F
      await pressF(graveId, CHARLIE);
      expect(await checkHasPressedF(graveId, CHARLIE)).toBe(true);

      const afterF = await getGrave(graveId);
      expect(afterF!.respects).toBe(initialRespects + 1);

      // Second press F must fail
      await expect(pressF(graveId, CHARLIE)).rejects.toThrow('Already paid respects');

      // Unpress F
      await unpressF(graveId, CHARLIE);
      expect(await checkHasPressedF(graveId, CHARLIE)).toBe(false);

      const afterUnF = await getGrave(graveId);
      expect(afterUnF!.respects).toBe(initialRespects);

      // Unpress F again must fail
      await expect(unpressF(graveId, CHARLIE)).rejects.toThrow('Have not paid respects');
    });
  });

  describe('5. Eulogies & Memorial Messages', () => {
    it('should drop and retrieve eulogies on a grave', async () => {
      setMockCaller(ALICE);
      await createUserProfile(ALICE, 'alice_mourner', 'avatar');
      const graveId = '1';

      const eulogy = await addEulogy(graveId, {
        text: 'Rest in code, beloved decentralized project. Your commit history was pure poetry.',
        user_name: 'alice_mourner',
        user_id: ALICE
      });

      expect(eulogy.text).toContain('Rest in code');

      const eulogies = await getEulogies(graveId);
      const posted = eulogies.find((e) => e.text.includes('pure poetry'));
      expect(posted).toBeDefined();
      expect(posted?.author_address?.toLowerCase()).toBe(ALICE.toLowerCase());

      // Alice deletes her eulogy
      await deleteEulogy(graveId, posted!.id);

      const eulogiesAfter = await getEulogies(graveId);
      expect(eulogiesAfter.some((e) => e.id === posted!.id)).toBe(false);
    });
  });

  describe('6. Anonymous Developer Confessions', () => {
    it('should retrieve seed confessions and post a new gothic confession', async () => {
      const initial = await getConfessions();
      expect(initial.length).toBeGreaterThanOrEqual(4);

      setMockCaller(BOB);
      const posted = await addConfession(
        'I once deployed an infinite gas loop on testnet and crashed my local RPC node.',
        '#52525b',
        -3
      );

      expect(posted.text).toContain('infinite gas loop');

      const list = await getConfessions();
      expect(list.some((c) => c.text.includes('infinite gas loop'))).toBe(true);
    });

    it('should react to confessions with skulls and candles, preventing duplicates', async () => {
      setMockCaller(CHARLIE);
      const confessions = await getConfessions();
      const target = confessions[0];

      const initialCandles = target.reactions?.candles || 0;
      const initialSkulls = target.reactions?.skulls || 0;

      // React with candle
      await reactToConfession(target.id, 'candle');
      const updated1 = await getConfessions();
      const afterCandle = updated1.find((c) => c.id === target.id);
      expect(afterCandle?.reactions?.candles).toBe(initialCandles + 1);

      // Duplicate candle reaction rejected
      await expect(reactToConfession(target.id, 'candle')).rejects.toThrow('Already lit candle');

      // React with skull
      await reactToConfession(target.id, 'skull');
      const updated2 = await getConfessions();
      const afterSkull = updated2.find((c) => c.id === target.id);
      expect(afterSkull?.reactions?.skulls).toBe(initialSkulls + 1);

      // Duplicate skull reaction rejected
      await expect(reactToConfession(target.id, 'skull')).rejects.toThrow('Already gave skull');
    });
  });

  describe('7. Social Graph (Follow / Unfollow)', () => {
    it('should allow following and unfollowing developer crypts', async () => {
      setMockCaller(ALICE);
      await createUserProfile(ALICE, 'alice_dev', 'avatar');

      setMockCaller(BOB);
      await createUserProfile(BOB, 'bob_dev', 'avatar');

      // Cannot follow oneself
      await expect(followUser(BOB, BOB)).rejects.toThrow('Cannot follow yourself');

      // Bob follows Alice
      await followUser(BOB, ALICE);
      expect(await isFollowing(BOB, ALICE)).toBe(true);

      const aliceFollowers = await getFollowers(ALICE);
      expect(aliceFollowers).toContain(BOB.toLowerCase());

      const bobFollowing = await getFollowing(BOB);
      expect(bobFollowing).toContain(ALICE.toLowerCase());

      // Duplicate follow rejected
      await expect(followUser(BOB, ALICE)).rejects.toThrow('Already following');

      // Bob unfollows Alice
      await unfollowUser(BOB, ALICE);
      expect(await isFollowing(BOB, ALICE)).toBe(false);

      const bobFollowingAfter = await getFollowing(BOB);
      expect(bobFollowingAfter).not.toContain(ALICE.toLowerCase());
    });
  });

  describe('8. Dispatched Memorial Graves', () => {
    it('should dispatch a grave to another user inbox', async () => {
      setMockCaller(ALICE);
      await createUserProfile(ALICE, 'alice_sender', 'avatar');
      const grave = await createGrave(
        {
          project_name: 'Project to Share',
          cause_of_death: CauseOfDeath.TECHNICAL_ROADBLOCKS,
          lived_for: '5 months',
          lesson_learned: 'Shared memory.',
          tech_stack: 'Rust, Avalanche',
          github_link: '',
          is_anonymous: false
        },
        ALICE,
        false
      );

      // Alice dispatches grave to Bob
      const allGraves = await getGraves();
      const targetGrave = allGraves.find((g) => g.project_name === 'Project to Share');
      await sendSharedGrave(targetGrave!.id, BOB);

      // Bob retrieves shared graves
      const bobShared = await getSharedGraves(BOB);
      expect(bobShared.length).toBeGreaterThanOrEqual(1);
      const found = bobShared.find((s) => s.graveId === targetGrave!.id);
      expect(found).toBeDefined();
      expect(found?.graveName).toBe('Project to Share');
      expect(found?.fromUserId.toLowerCase()).toBe(ALICE.toLowerCase());
    });
  });

  describe('9. Batch Queries & Pagination', () => {
    it('should execute getGravesBatch and getRecentGraves correctly', async () => {
      const all = await getGraves();
      const ids = all.slice(0, 3).map((g) => g.id);

      const batch = await getGravesBatch(ids);
      expect(batch.length).toBe(3);
      expect(batch[0].id).toBe(ids[0]);

      const recent = await getRecentGraves(2, 0);
      expect(recent.length).toBe(2);
    });
  });
});
