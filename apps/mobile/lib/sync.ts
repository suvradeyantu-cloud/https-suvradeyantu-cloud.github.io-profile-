import { create } from 'zustand';
import { supabase } from './supabase-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Draft {
  id: string;
  data: any;
  timestamp: number;
}

interface SyncStore {
  queue: Draft[];
  addDraft: (draft: Omit<Draft, 'timestamp'>) => Promise<void>;
  removeDraft: (id: string) => Promise<void>;
  syncAll: () => Promise<void>;
  loadQueue: () => Promise<void>;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  queue: [],

  loadQueue: async () => {
    try {
      const stored = await AsyncStorage.getItem('prescriply_offline_queue');
      if (stored) {
        set({ queue: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load offline drafts queue:', e);
    }
  },

  addDraft: async (draft) => {
    const newDraft = { ...draft, timestamp: Date.now() };
    const nextQueue = [...get().queue, newDraft];
    set({ queue: nextQueue });
    
    try {
      await AsyncStorage.setItem('prescriply_offline_queue', JSON.stringify(nextQueue));
    } catch (e) {
      console.error('Failed to persist draft locally:', e);
    }
  },

  removeDraft: async (id) => {
    const nextQueue = get().queue.filter((d) => d.id !== id);
    set({ queue: nextQueue });
    try {
      await AsyncStorage.setItem('prescriply_offline_queue', JSON.stringify(nextQueue));
    } catch (e) {
      console.error('Failed to persist updated local queue:', e);
    }
  },

  syncAll: async () => {
    const { queue, removeDraft } = get();
    if (queue.length === 0) return;

    // Check netinfo status
    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    for (const draft of queue) {
      try {
        const { error } = await supabase.from('visits').upsert(draft.data);
        if (!error) {
          await removeDraft(draft.id);
        }
      } catch (e) {
        console.warn('Sync failed for draft ID:', draft.id, e);
      }
    }
  },
}));

// Setup NetInfo subscription to trigger auto-sync on reconnect
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    useSyncStore.getState().syncAll();
  }
});
