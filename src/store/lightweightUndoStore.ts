import { create } from 'zustand';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  status: 'waiting' | 'making' | 'completed' | 'hold';
  timestamp: Date;
}

interface LightweightUndoAction {
  type: 'SELECT_ITEM' | 'DELETE' | 'UPDATE' | 'CREATE';
  timestamp: Date;
  description: string;
  
  // 只記錄必要的資料
  selectedItemId?: string;
  previousSelectedItemId?: string;
  affectedItemIds?: string[]; // 只記錄受影響的項目 ID
}

interface LightweightUndoStore {
  // 限制歷史記錄數量（最多保存 5 個操作）
  history: LightweightUndoAction[];
  maxHistorySize: number;
  
  // 當前狀態
  currentItems: OrderItem[];
  selectedItemId: string | null;
  
  // Actions
  addAction: (action: Omit<LightweightUndoAction, 'timestamp'>) => void;
  undo: () => void;
  canUndo: () => boolean;
  updateCurrentItems: (items: OrderItem[]) => void;
  updateSelectedItem: (itemId: string | null) => void;
}

export const useLightweightUndoStore = create<LightweightUndoStore>((set, get) => ({
  history: [],
  maxHistorySize: 5, // 最多保存 5 個操作
  currentItems: [],
  selectedItemId: null,
  
  addAction: (action) => {
    const newAction: LightweightUndoAction = {
      ...action,
      timestamp: new Date(),
    };
    
    set((state) => {
      const newHistory = [...state.history, newAction];
      
      // 如果超過最大數量，移除最舊的記錄
      if (newHistory.length > state.maxHistorySize) {
        newHistory.shift(); // 移除第一個（最舊的）記錄
      }
      
      return {
        history: newHistory,
      };
    });
  },
  
  undo: () => {
    set((state) => {
      if (state.history.length === 0) return state;
      
      const lastAction = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1); // 移除最後一個操作
      
      // 根據操作類型進行復原
      switch (lastAction.type) {
        case 'SELECT_ITEM':
          return {
            ...state,
            history: newHistory,
            selectedItemId: lastAction.previousSelectedItemId || null,
          };
          
        case 'DELETE':
          // 需要從後端重新獲取被刪除的資料
          console.log('恢復被刪除的項目:', lastAction.affectedItemIds);
          return {
            ...state,
            history: newHistory,
          };
          
        default:
          return {
            ...state,
            history: newHistory,
          };
      }
    });
  },
  
  canUndo: () => {
    const state = get();
    return state.history.length > 0;
  },
  
  updateCurrentItems: (items) => {
    set({ currentItems: items });
  },
  
  updateSelectedItem: (itemId) => {
    set({ selectedItemId: itemId });
  },
})); 