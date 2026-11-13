/**
 * src/services/confessionService.ts
 * Anonymous Developer Confessions service on Avalanche C-Chain.
 * Dual-mode operation: On-chain contract with fallback to lively gothic seed confessions.
 */

import { Confession } from '../types';
import { getContract } from './web3Service';

export const GOTHIC_COLORS = [
  '#3f3f46', // zinc-700
  '#52525b', // zinc-600
  '#44403c', // stone-700
  '#57534e', // stone-600
  '#334155', // slate-700
  '#475569'  // slate-600
];

export const SEED_CONFESSIONS: Confession[] = [
  {
    id: 'seed-1',
    text: 'I pushed straight to production mainnet at 3 AM on a Friday and went to sleep with Discord notifications muted.',
    color: '#3f3f46',
    rotation: -2,
    createdAt: Date.now() - 86400 * 3 * 1000,
    author: '0x1111111111111111111111111111111111111111',
    reactions: { skulls: 14, candles: 28 }
  },
  {
    id: 'seed-2',
    text: 'I still do not completely understand useEffect dependency arrays after 5 years of full-time React engineering.',
    color: '#52525b',
    rotation: 3,
    createdAt: Date.now() - 86400 * 2 * 1000,
    author: '0x2222222222222222222222222222222222222222',
    reactions: { skulls: 32, candles: 19 }
  },
  {
    id: 'seed-3',
    text: 'I told our enterprise client an RPC bug was "Avalanche validator jitter". It was a missing comma in my contract ABI.',
    color: '#44403c',
    rotation: -4,
    createdAt: Date.now() - 86400 * 1 * 1000,
    author: '0x1111111111111111111111111111111111111111',
    reactions: { skulls: 45, candles: 12 }
  },
  {
    id: 'seed-4',
    text: 'My smart contract has zero unit tests. I deploy directly onto Fuji testnet and pray to the gas gods.',
    color: '#334155',
    rotation: 1,
    createdAt: Date.now() - 3600 * 4 * 1000,
    author: '0x2222222222222222222222222222222222222222',
    reactions: { skulls: 60, candles: 40 }
  }
];

const mapOnChainConfession = (c: any): Confession => {
  const createdAtSec = Number(c.createdAt || 0n);
  const createdAtMs = createdAtSec > 0 ? createdAtSec * 1000 : Date.now();

  return {
    id: c.id.toString(),
    text: c.text,
    color: c.color || GOTHIC_COLORS[0],
    rotation: Number(c.rotation || 0),
    createdAt: createdAtMs,
    author: c.author,
    reactions: {
      skulls: Number(c.skulls || 0n),
      candles: Number(c.candles || 0n)
    }
  };
};

/**
 * Retrieves confessions with pagination (most recent first).
 * Returns seed confessions if list is empty so the board is always lively.
 */
export const getConfessions = async (limit = 100, offset = 0): Promise<Confession[]> => {
  try {
    const contract = await getContract(false);
    const onChainList = await contract.getConfessions(limit, offset);

    if (onChainList && onChainList.length > 0) {
      return onChainList.map(mapOnChainConfession);
    }
  } catch (err) {
    console.error('Error fetching on-chain confessions:', err);
  }

  // Fallback to lively gothic seeds if empty
  return SEED_CONFESSIONS;
};

/**
 * Returns total count of on-chain confessions.
 */
export const getConfessionCount = async (): Promise<number> => {
  try {
    const contract = await getContract(false);
    const count = await contract.getConfessionCount();
    return Number(count);
  } catch (err) {
    console.error('Error getting confession count:', err);
    return SEED_CONFESSIONS.length;
  }
};

/**
 * Posts an anonymous confession on-chain.
 */
export const addConfession = async (
  text: string,
  color?: string,
  rotation?: number
): Promise<Confession> => {
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Confession cannot be empty.');
  }
  if (cleanText.length > 280) {
    throw new Error('Confession exceeds 280 characters.');
  }

  const selectedColor = color || GOTHIC_COLORS[Math.floor(Math.random() * GOTHIC_COLORS.length)];
  const selectedRotation = rotation !== undefined
    ? Math.round(rotation)
    : Math.floor(Math.random() * 11) - 5; // -5 to +5 degrees

  try {
    const contract = await getContract(true);
    const tx = await contract.postConfession(cleanText, selectedColor, selectedRotation);
    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }

    return {
      id: tx?.id ? tx.id.toString() : crypto.randomUUID(),
      text: cleanText,
      color: selectedColor,
      rotation: selectedRotation,
      createdAt: Date.now(),
      reactions: { skulls: 0, candles: 0 }
    };
  } catch (err) {
    console.error('Failed to post confession:', err);
    throw err;
  }
};

/**
 * Reacts to a confession with a Skull or a Candle.
 */
export const reactToConfession = async (
  id: string | number,
  type: 'skull' | 'candle'
): Promise<void> => {
  try {
    const isCandle = type === 'candle';
    const contract = await getContract(true);
    const tx = await contract.reactConfession(id, isCandle);
    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }
  } catch (err) {
    console.error(`Failed to react to confession #${id}:`, err);
    throw err;
  }
};
