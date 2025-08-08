import { create } from 'zustand';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  status: 'waiting' | 'making' | 'completed' | 'hold';
  timestamp: Date;
}

interface OptimizedUndoAction {
  type: 'SELECT_ITEM' | 'DELETE' | 'UPDATE' | 'CREATE';
  timestamp: Date;
  description: string;
  
  // 只記錄變化的資料
  changes: {
    selectedItemId?: string;
    previousSelectedItemId?: string;
    deletedItems?: string[]; // 只記錄被刪除的 ID
    updatedItems?: Partial<OrderItem>[]; // 只記錄變化的欄位
    createdItems?: OrderItem[]; // 新創建的項目
  };
}

interface OptimizedUndoStore {
  // 只保存上一動的記錄
  lastAction: OptimizedUndoAction | null;
  
  // 當前狀態
  currentItems: OrderItem[];
  selectedItemId: string | null;
  
  // Actions
  recordAction: (action: Omit<OptimizedUndoAction, 'timestamp'>) => void;
  undo: () => void;
  canUndo: () => boolean;
  updateCurrentItems: (items: OrderItem[]) => void;
  updateSelectedItem: (itemId: string | null) => void;
}

export const useOptimizedUndoStore = create<OptimizedUndoStore>((set, get) => ({
  lastAction: null,
  currentItems: [],
  selectedItemId: null,
  
  recordAction: (action) => {
    const newAction: OptimizedUndoAction = {
      ...action,
      timestamp: new Date(),
    };
    
    set({ lastAction: newAction });
  },
  
  undo: () => {
    const { lastAction, currentItems, selectedItemId } = get();
    
    if (!lastAction) return;
    
    switch (lastAction.type) {
      case 'SELECT_ITEM':
        // 恢復到上一個選中的品項
        if (lastAction.changes.previousSelectedItemId !== undefined) {
          set({ selectedItemId: lastAction.changes.previousSelectedItemId });
        }
        break;
        
      case 'DELETE':
        // 恢復被刪除的項目
        if (lastAction.changes.deletedItems) {
          // 這裡需要從後端或其他地方獲取被刪除的完整資料
          // 或者在前端保留一份備份
          console.log('恢復被刪除的項目:', lastAction.changes.deletedItems);
        }
        break;
        
      case 'UPDATE':
        // 恢復更新的項目
        if (lastAction.changes.updatedItems) {
          console.log('恢復更新的項目:', lastAction.changes.updatedItems);
        }
        break;
        
      case 'CREATE':
        // 移除新創建的項目
        if (lastAction.changes.createdItems) {
          const newItems = currentItems.filter(
            item => !lastAction.changes.createdItems!.some(
              createdItem => createdItem.id === item.id
            )
          );
          set({ currentItems: newItems });
        }
        break;
    }
    
    // 清除上一動記錄
    set({ lastAction: null });
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