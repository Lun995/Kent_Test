import { create } from 'zustand';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  status: 'waiting' | 'making' | 'completed' | 'hold';
  timestamp: Date;
}

interface SimpleUndoAction {
  type: 'SELECT_ITEM' | 'DELETE' | 'UPDATE' | 'CREATE';
  timestamp: Date;
  description: string;
  
  // 只記錄上一動的關鍵資訊
  previousSelectedItemId?: string;
  affectedItemIds?: string[];
}

interface SimpleUndoStore {
  // 只保存上一動的記錄
  lastAction: SimpleUndoAction | null;
  
  // 當前狀態
  currentItems: OrderItem[];
  selectedItemId: string | null;
  
  // Actions
  recordLastAction: (action: Omit<SimpleUndoAction, 'timestamp'>) => void;
  undo: () => void;
  canUndo: () => boolean;
  updateCurrentItems: (items: OrderItem[]) => void;
  updateSelectedItem: (itemId: string | null) => void;
}

export const useSimpleUndoStore = create<SimpleUndoStore>((set, get) => ({
  lastAction: null,
  currentItems: [],
  selectedItemId: null,
  
  recordLastAction: (action) => {
    const newAction: SimpleUndoAction = {
      ...action,
      timestamp: new Date(),
    };
    
    set({ lastAction: newAction });
  },
  
  undo: () => {
    const { lastAction } = get();
    
    if (!lastAction) return;
    
    switch (lastAction.type) {
      case 'SELECT_ITEM':
        // 恢復到上一個選中的品項
        if (lastAction.previousSelectedItemId !== undefined) {
          set({ 
            selectedItemId: lastAction.previousSelectedItemId,
            lastAction: null // 清除記錄
          });
        }
        break;
        
      case 'DELETE':
        // 對於刪除操作，需要從後端重新獲取資料
        console.log('需要從後端恢復被刪除的項目:', lastAction.affectedItemIds);
        set({ lastAction: null });
        break;
        
      default:
        set({ lastAction: null });
        break;
    }
  },
  
  canUndo: () => {
    const state = get();
    return state.lastAction !== null;
  },
  
  updateCurrentItems: (items) => {
    set({ currentItems: items });
  },
  
  updateSelectedItem: (itemId) => {
    set({ selectedItemId: itemId });
  },
})); 