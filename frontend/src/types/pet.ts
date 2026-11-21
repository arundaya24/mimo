export type PetState =
  | 'idle'
  | 'walking'
  | 'sitting'
  | 'sleeping'
  | 'eating'
  | 'playing'
  | 'happy'
  | 'scared'
  | 'angry'
  | 'curious'
  | 'grooming'
  | 'affectionate';

export type EarStyle = 'pointy' | 'folded' | 'round';
export type PatternType = 'solid' | 'stripes' | 'tuxedo' | 'calico' | 'socks';
export type AccessoryType = 'none' | 'bow' | 'flower' | 'scarf' | 'glasses';

export interface CatCustomization {
  fur_color: string;
  fur_secondary_color: string;
  pattern: PatternType;
  pattern_color: string;
  eye_color: string;
  ear_style: EarStyle;
  collar_color: string;
  bell: boolean;
  accessory: AccessoryType;
}

export interface CatStats {
  hunger: number;     // 0 = full, 100 = starving
  happiness: number;  // 0 - 100
  energy: number;     // 0 - 100
  trust: number;      // 0 - 100
  fear: number;       // 0 - 100
  affection: number;  // 0 - 100
  comfort: number;    // 0 - 100
  cleanliness: number;// 0 - 100
}

export interface CatPersonality {
  id: number;
  name: string;
  code: string;
  description: string;
  preferred_activity: string;
  traits?: {
    hunger_rate: number;
    energy_rate: number;
    trust_speed: number;
    fear_sensitivity: number;
    affection_gain: number;
  };
}

export interface Cat {
  id: number;
  name: string;
  gender: 'male' | 'female';
  is_sleeping: boolean;
  current_room: string;
  current_state: PetState;
  current_thought: string;
  personality: CatPersonality;
  stats: CatStats;
  customization: CatCustomization;
  favorite_food?: string;
  boredom_counter?: number;
  last_interaction_at?: string;
  last_fed_at?: string;
  last_slept_at?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  accent_color: 'terracotta' | 'sage' | 'amber' | 'slate' | 'rose';
  ui_scale: 'compact' | 'default' | 'comfortable';
  master_volume: number;
  sfx_enabled: boolean;
  ambient_sound: boolean;
  notifications: boolean;
  feeding_reminder: boolean;
  activity_simulation: boolean;
}

export interface InteractionResult {
  success: boolean;
  action?: string;
  message: string;
  stat_changes?: Record<string, number | boolean>;
  cat: Cat;
}

export interface InventoryItem {
  id: number;
  item_code: string;
  name: string;
  category: 'food' | 'toy' | 'comfort' | 'care';
  quantity: number;
  icon: string;
  description: string;
  effect_summary: string;
}

export interface InteractionLog {
  id: number;
  action_type: string;
  stat_changes: Record<string, number | boolean>;
  notes: string;
  created_at: string;
  time_ago: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  hasCat: boolean;
  isAuthenticated: boolean;
}
