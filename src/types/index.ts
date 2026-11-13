export interface User {
  uid: string; // Wallet address (0x...) or username
  address?: string; // Standardized lowercase 0x wallet address
  username: string;
  email?: string;
  createdAt: string;
  photoURL?: string;
  avatarUrl?: string;
  instagram?: string;
  whatsapp?: string;
  github?: string;
  bio?: string;
  gravesBuriedCount?: number;
  respectsReceivedCount?: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Friend {
  uid: string;
  username: string;
  addedAt: string;
}

export interface SharedGrave {
  id: string;
  graveId: string;
  graveName: string;
  fromUserId: string;
  fromUsername: string;
  toUserId?: string;
  toUsername?: string;
  direction?: 'sent' | 'received';
  createdAt: string;
}

export interface Eulogy {
  id: string;
  graveId?: string;
  text: string;
  user_name: string;
  user_id?: string;
  author_address?: string;
  created_at: string;
  timestamp?: number;
}

export interface Grave {
  id: string;
  project_name: string;
  cause_of_death: string;
  lived_for: string;
  lesson_learned: string;
  tech_stack: string;
  is_anonymous: boolean;
  created_at: string;
  user_id?: string;
  user_name?: string;
  user_avatar?: string;
  github_link?: string;
  respects?: number;
  rips?: string[];
  eulogies?: Eulogy[];
  is_resurrected?: boolean;
  resurrection_note?: string;
}

export type GraveFormData = Omit<
  Grave,
  'id' | 'created_at' | 'user_id' | 'user_name' | 'respects' | 'eulogies' | 'is_resurrected' | 'resurrection_note' | 'rips'
>;

export interface Confession {
  id: string;
  text: string;
  color: string;
  rotation: number;
  createdAt: number;
  author?: string;
  tag?: string;
  reactions?: {
    skulls: number;
    candles: number;
  };
}

export enum CauseOfDeath {
  LACK_OF_TIME = "Lack of Time",
  LOSS_OF_INTEREST = "Loss of Interest",
  TECHNICAL_ROADBLOCKS = "Technical Roadblocks",
  MARKET_FIT_MISSING = "Market Fit Missing",
  SCOPE_CREEP = "Scope Creep",
  CO_FOUNDER_CONFLICT = "Co-founder Conflict",
  OTHER = "Other"
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
