import { create } from 'zustand';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  status: 'waiting' | 'making' | 'completed' | 'hold';
  timestamp: Date;
}

interface UndoAction {
  type: 'DELETE' | 'UPDATE' | 'CREATE' | 'SELECT_ITEM';
  items: OrderItem[];
  timestamp: Date;
  description: string;
  selectedItemId?: string; // 新增：記錄選中的品項ID
  previousSelectedItemId?: string; // 新增：記錄上一個選中的品項ID
}

interface UndoStore {
  // 操作歷史
  history: UndoAction[];
  currentIndex: number;
  
  // 當前狀態
  currentItems: OrderItem[];
  selectedItemId: string | null; // 新增：當前選中的品項ID
  
  // Actions
  addAction: (action: Omit<UndoAction, 'timestamp'>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  updateCurrentItems: (items: OrderItem[]) => void;
  updateSelectedItem: (itemId: string | null) => void; // 新增：更新選中的品項
}

export const useUndoStore = create<UndoStore>((set, get) => ({
  history: [],
  currentIndex: -1,
  currentItems: [],
  selectedItemId: null,
  
  addAction: (action) => {
    const newAction: UndoAction = {
      ...action,
      timestamp: new Date(),
    };
    
    set((state) => {
      // 移除當前位置之後的歷史記錄
      const newHistory = state.history.slice(0, state.currentIndex + 1);
      newHistory.push(newAction);
      
      return {
        history: newHistory,
        currentIndex: newHistory.length - 1,
      };
    });
  },
  
  undo: () => {
    set((state) => {
      if (state.currentIndex > 0) {
        const newIndex = state.currentIndex - 1;
        const previousAction = state.history[newIndex];
        
        return {
          currentIndex: newIndex,
          currentItems: previousAction.items,
        };
      }
      return state;
    });
  },
  
  redo: () => {
    set((state) => {
      if (state.currentIndex < state.history.length - 1) {
        const newIndex = state.currentIndex + 1;
        const nextAction = state.history[newIndex];
        
        return {
          currentIndex: newIndex,
          currentItems: nextAction.items,
        };
      }
      return state;
    });
  },
  
  canUndo: () => {
    const state = get();
    return state.currentIndex > 0;
  },
  
  canRedo: () => {
    const state = get();
    return state.currentIndex < state.history.length - 1;
  },
  
  clearHistory: () => {
    set({
      history: [],
      currentIndex: -1,
    });
  },
  
  updateCurrentItems: (items) => {
    set({ currentItems: items });
  },
  
  updateSelectedItem: (itemId) => {
    set({ selectedItemId: itemId });
  },
})); 