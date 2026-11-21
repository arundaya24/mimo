import { apiRequest } from './api';
import { Cat, CatPersonality, InteractionResult, InventoryItem, InteractionLog } from '../types/pet';

interface CatResponse {
  has_cat: boolean;
  cat?: Cat;
  message?: string;
}

interface PersonalitiesResponse {
  personalities: CatPersonality[];
}

interface InventoryResponse {
  inventory: InventoryItem[];
}

interface HistoryResponse {
  history: InteractionLog[];
}

export const petService = {
  async getCat(): Promise<CatResponse> {
    return apiRequest<CatResponse>('/cat');
  },

  async getPersonalities(): Promise<CatPersonality[]> {
    const res = await apiRequest<PersonalitiesResponse>('/personalities');
    return res.personalities;
  },

  async adoptCat(data: {
    name: string;
    gender?: string;
    personality_code: string;
    fur_color: string;
    fur_secondary_color?: string;
    pattern: string;
    pattern_color?: string;
    eye_color: string;
    ear_style?: string;
    collar_color?: string;
    bell?: boolean;
    accessory?: string;
  }): Promise<{ message: string; cat: Cat }> {
    return apiRequest<{ message: string; cat: Cat }>('/cat/adopt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async interact(action: string, itemCode?: string): Promise<InteractionResult> {
    return apiRequest<InteractionResult>('/cat/interact', {
      method: 'POST',
      body: JSON.stringify({ action, item_code: itemCode }),
    });
  },

  async updateCustomization(customization: Partial<Cat['customization']>): Promise<{ message: string; cat: Cat }> {
    return apiRequest<{ message: string; cat: Cat }>('/cat/customization', {
      method: 'PATCH',
      body: JSON.stringify(customization),
    });
  },

  async updateRoom(room: string): Promise<{ message: string; cat: Cat }> {
    return apiRequest<{ message: string; cat: Cat }>('/cat/room', {
      method: 'PATCH',
      body: JSON.stringify({ room }),
    });
  },

  async getInventory(): Promise<InventoryItem[]> {
    const res = await apiRequest<InventoryResponse>('/inventory');
    return res.inventory;
  },

  async useItem(itemCode: string): Promise<InteractionResult & { remaining_quantity: number }> {
    return apiRequest<InteractionResult & { remaining_quantity: number }>('/inventory/use', {
      method: 'POST',
      body: JSON.stringify({ item_code: itemCode }),
    });
  },

  async getHistory(): Promise<InteractionLog[]> {
    const res = await apiRequest<HistoryResponse>('/cat/history');
    return res.history;
  },
};
