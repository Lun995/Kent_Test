import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  status: 'waiting' | 'making' | 'completed' | 'hold';
  timestamp: Date;
  selected?: boolean;
}

interface UndoAction {
  id: string;
  type: 'SELECT_ITEM' | 'DELETE' | 'UPDATE' | 'CREATE' | 'BATCH_DELETE' | 'STATUS_CHANGE';
  timestamp: Date;
  description: string;
  
  // 前端狀態變化
  frontendChanges: {
    selectedItemIds?: string[];
    previousSelectedItemIds?: string[];
    deletedItems?: OrderItem[];
    updatedItems?: Partial<OrderItem>[];
    createdItems?: OrderItem[];
    statusChanges?: { itemId: string; from: string; to: string }[];
  };
  
  // 後端資料庫變化
  backendChanges: {
    tableName: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'BATCH_UPDATE';
    data: any;
    where?: any;
  };
  
  // 元數據
  metadata: {
    userId?: string;
    sessionId?: string;
    deviceInfo?: string;
  };
}

interface EnhancedUndoStore {
  // 歷史記錄（限制數量以維持效能）
  history: UndoAction[];
  currentIndex: number;
  maxHistorySize: number;
  
  // 當前狀態
  items: OrderItem[];
  selectedItemIds: string[];
  
  // 效能優化
  isProcessing: boolean;
  lastSyncTime: Date | null;
  
  // Actions
  recordAction: (action: Omit<UndoAction, 'id' | 'timestamp'>) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // 狀態更新
  updateItems: (items: OrderItem[]) => void;
  updateSelectedItems: (itemIds: string[]) => void;
  
  // 效能控制
  clearHistory: () => void;
  setMaxHistorySize: (size: number) => void;
}

export const useEnhancedUndoStore = create<EnhancedUndoStore>()(
  subscribeWithSelector((set, get) => ({
    history: [],
    currentIndex: -1,
    maxHistorySize: 50, // 限制歷史記錄數量
    
    items: [],
    selectedItemIds: [],
    
    isProcessing: false,
    lastSyncTime: null,
    
    recordAction: async (action) => {
      const { history, currentIndex, maxHistorySize } = get();
      
      // 創建新的操作記錄
      const newAction: UndoAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };
      
      // 移除當前位置之後的歷史記錄（當有新的操作時）
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(newAction);
      
      // 限制歷史記錄大小
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      set({
        history: newHistory,
        currentIndex: newHistory.length - 1,
        isProcessing: true,
      });
      
      try {
        // 同步到後端
        await syncToBackend(newAction);
        set({ lastSyncTime: new Date() });
      } catch (error) {
        console.error('同步到後端失敗:', error);
        // 可以選擇是否要回滾操作
      } finally {
        set({ isProcessing: false });
      }
    },
    
    undo: async () => {
      const { history, currentIndex, isProcessing } = get();
      
      if (isProcessing || currentIndex < 0) return;
      
      const action = history[currentIndex];
      if (!action) return;
      
      set({ isProcessing: true });
      
      try {
        // 執行撤銷操作
        await executeUndo(action);
        
        // 更新歷史記錄位置
        set({ currentIndex: currentIndex - 1 });
        
        // 同步到後端
        await syncUndoToBackend(action);
        
      } catch (error) {
        console.error('撤銷操作失敗:', error);
      } finally {
        set({ isProcessing: false });
      }
    },
    
    redo: async () => {
      const { history, currentIndex, isProcessing } = get();
      
      if (isProcessing || currentIndex >= history.length - 1) return;
      
      const action = history[currentIndex + 1];
      if (!action) return;
      
      set({ isProcessing: true });
      
      try {
        // 執行重做操作
        await executeRedo(action);
        
        // 更新歷史記錄位置
        set({ currentIndex: currentIndex + 1 });
        
        // 同步到後端
        await syncRedoToBackend(action);
        
      } catch (error) {
        console.error('重做操作失敗:', error);
      } finally {
        set({ isProcessing: false });
      }
    },
    
    canUndo: () => {
      const { currentIndex, isProcessing } = get();
      return currentIndex >= 0 && !isProcessing;
    },
    
    canRedo: () => {
      const { history, currentIndex, isProcessing } = get();
      return currentIndex < history.length - 1 && !isProcessing;
    },
    
    updateItems: (items) => {
      set({ items });
    },
    
    updateSelectedItems: (itemIds) => {
      set({ selectedItemIds: itemIds });
    },
    
    clearHistory: () => {
      set({ history: [], currentIndex: -1 });
    },
    
    setMaxHistorySize: (size) => {
      set({ maxHistorySize: size });
    },
  }))
);

// 執行撤銷操作
async function executeUndo(action: UndoAction) {
  const { updateItems, updateSelectedItems } = useEnhancedUndoStore.getState();
  
  switch (action.type) {
    case 'SELECT_ITEM':
      if (action.frontendChanges.previousSelectedItemIds) {
        updateSelectedItems(action.frontendChanges.previousSelectedItemIds);
      }
      break;
      
    case 'DELETE':
      if (action.frontendChanges.deletedItems) {
        const { items } = useEnhancedUndoStore.getState();
        const newItems = [...items, ...action.frontendChanges.deletedItems];
        updateItems(newItems);
      }
      break;
      
    case 'UPDATE':
      if (action.frontendChanges.updatedItems) {
        const { items } = useEnhancedUndoStore.getState();
        const newItems = items.map(item => {
          const updatedItem = action.frontendChanges.updatedItems!.find(
            updated => updated.id === item.id
          );
          return updatedItem ? { ...item, ...updatedItem } : item;
        });
        updateItems(newItems);
      }
      break;
      
    case 'CREATE':
      if (action.frontendChanges.createdItems) {
        const { items } = useEnhancedUndoStore.getState();
        const newItems = items.filter(
          item => !action.frontendChanges.createdItems!.some(
            created => created.id === item.id
          )
        );
        updateItems(newItems);
      }
      break;
      
    case 'BATCH_DELETE':
      if (action.frontendChanges.deletedItems) {
        const { items } = useEnhancedUndoStore.getState();
        const newItems = [...items, ...action.frontendChanges.deletedItems];
        updateItems(newItems);
      }
      break;
      
    case 'STATUS_CHANGE':
      if (action.frontendChanges.statusChanges) {
        const { items } = useEnhancedUndoStore.getState();
        const newItems = items.map(item => {
          const statusChange = action.frontendChanges.statusChanges!.find(
            change => change.itemId === item.id
          );
          if (statusChange) {
            return { ...item, status: statusChange.from as any };
          }
          return item;
        });
        updateItems(newItems);
      }
      break;
  }
}

// 執行重做操作
async function executeRedo(action: UndoAction) {
  const { updateItems, updateSelectedItems } = useEnhancedUndoStore.getState();
  
  switch (action.type) {
    case 'SELECT_ITEM':
      if (action.frontendChanges.selectedItemIds) {
        updateSelectedItems(action.frontendChanges.selectedItemIds);
      }
      break;
      
    case 'DELETE':
      if (action.frontendChanges.deletedItems) {
        const { items } = useEnhancedUndoStore.getState();
        const newItems = items.filter(
          item => !action.frontendChanges.deletedItems!.some(
            deleted => deleted.id === item.id
          )
        );
        updateItems(newItems);
      }
      break;
      
    case 'UPDATE':
      if (action.frontendChanges.updatedItems) {
        const { items } = useEnhancedUndoStore.getState();
        const newItems = items.map(item => {
          const updatedItem = action.frontendChanges.updatedItems!.find(
            updated => updated.id === item.id
          );
          return updatedItem ? { ...item, ...updatedItem } : item;
        });
        updateItems(newItems);
      }
      break;
      
    case 'CREATE':
      if (action.frontendChanges.createdItems) {
        const { items } = useEnhancedUndoStore.getState();
        const newItems = [...items, ...action.frontendChanges.createdItems];
        updateItems(newItems);
      }
      break;
      
    case 'BATCH_DELETE':
      if (action.frontendChanges.deletedItems) {
        const { items } = useEnhancedUndoStore.getState();
        const newItems = items.filter(
          item => !action.frontendChanges.deletedItems!.some(
            deleted => deleted.id === item.id
          )
        );
        updateItems(newItems);
      }
      break;
      
    case 'STATUS_CHANGE':
      if (action.frontendChanges.statusChanges) {
        const { items } = useEnhancedUndoStore.getState();
        const newItems = items.map(item => {
          const statusChange = action.frontendChanges.statusChanges!.find(
            change => change.itemId === item.id
          );
          if (statusChange) {
            return { ...item, status: statusChange.to as any };
          }
          return item;
        });
        updateItems(newItems);
      }
      break;
  }
}

// 同步到後端
async function syncToBackend(action: UndoAction) {
  try {
    const response = await fetch('/api/orders/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'record',
        data: action,
      }),
    });
    
    if (!response.ok) {
      throw new Error('同步到後端失敗');
    }
    
    return await response.json();
  } catch (error) {
    console.error('同步到後端失敗:', error);
    throw error;
  }
}

// 同步撤銷操作到後端
async function syncUndoToBackend(action: UndoAction) {
  try {
    const response = await fetch('/api/orders/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'undo',
        data: action,
      }),
    });
    
    if (!response.ok) {
      throw new Error('撤銷操作同步失敗');
    }
    
    return await response.json();
  } catch (error) {
    console.error('撤銷操作同步失敗:', error);
    throw error;
  }
}

// 同步重做操作到後端
async function syncRedoToBackend(action: UndoAction) {
  try {
    const response = await fetch('/api/orders/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'redo',
        data: action,
      }),
    });
    
    if (!response.ok) {
      throw new Error('重做操作同步失敗');
    }
    
    return await response.json();
  } catch (error) {
    console.error('重做操作同步失敗:', error);
    throw error;
  }
} 