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
  
  frontendChanges: {
    selectedItemIds?: string[];
    previousSelectedItemIds?: string[];
    deletedItems?: OrderItem[];
    updatedItems?: Partial<OrderItem>[];
    createdItems?: OrderItem[];
    statusChanges?: { itemId: string; from: string; to: string }[];
  };
  
  backendChanges: {
    tableName: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'BATCH_UPDATE';
    data: any;
    where?: any;
  };
  
  metadata: {
    userId?: string;
    sessionId?: string;
    deviceInfo?: string;
  };
}

interface OfflineUndoStore {
  // 離線狀態管理
  isOnline: boolean;
  pendingActions: UndoAction[];
  syncedActions: string[]; // 已同步的操作 ID
  
  // 本地儲存
  localHistory: UndoAction[];
  currentIndex: number;
  
  // 當前狀態
  items: OrderItem[];
  selectedItemIds: string[];
  
  // 同步狀態
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncErrors: string[];
  
  // Actions
  recordAction: (action: Omit<UndoAction, 'id' | 'timestamp'>) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // 離線支援
  setOnlineStatus: (isOnline: boolean) => void;
  syncPendingActions: () => Promise<void>;
  resolveConflicts: (localState: any, serverState: any) => any;
  
  // 本地儲存
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  clearLocalStorage: () => void;
  
  // 狀態更新
  updateItems: (items: OrderItem[]) => void;
  updateSelectedItems: (itemIds: string[]) => void;
}

export const useOfflineUndoStore = create<OfflineUndoStore>()(
  subscribeWithSelector((set, get) => ({
    isOnline: navigator.onLine,
    pendingActions: [],
    syncedActions: [],
    
    localHistory: [],
    currentIndex: -1,
    
    items: [],
    selectedItemIds: [],
    
    isSyncing: false,
    lastSyncTime: null,
    syncErrors: [],
    
    recordAction: async (action) => {
      const { isOnline, localHistory, currentIndex } = get();
      
      // 創建新的操作記錄
      const newAction: UndoAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };
      
      // 更新本地歷史記錄
      const newHistory = localHistory.slice(0, currentIndex + 1);
      newHistory.push(newAction);
      
      // 限制本地歷史記錄大小
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      
      set({
        localHistory: newHistory,
        currentIndex: newHistory.length - 1,
      });
      
      // 儲存到本地儲存
      get().saveToLocalStorage();
      
      // 如果離線，加入待同步列表
      if (!isOnline) {
        set(state => ({
          pendingActions: [...state.pendingActions, newAction]
        }));
        console.log('離線模式：操作已加入待同步列表');
      } else {
        // 線上模式：立即同步
        try {
          await syncToBackend(newAction);
          set(state => ({
            syncedActions: [...state.syncedActions, newAction.id],
            lastSyncTime: new Date()
          }));
        } catch (error) {
          console.error('同步失敗，加入待同步列表:', error);
          set(state => ({
            pendingActions: [...state.pendingActions, newAction],
            syncErrors: [...state.syncErrors, error.message]
          }));
        }
      }
    },
    
    undo: async () => {
      const { localHistory, currentIndex, isOnline } = get();
      
      if (currentIndex < 0) return;
      
      const action = localHistory[currentIndex];
      if (!action) return;
      
      try {
        // 執行撤銷操作
        await executeUndo(action);
        
        // 更新歷史記錄位置
        set({ currentIndex: currentIndex - 1 });
        
        // 儲存到本地儲存
        get().saveToLocalStorage();
        
        // 如果線上，同步撤銷操作
        if (isOnline) {
          await syncUndoToBackend(action);
        } else {
          // 離線模式：記錄撤銷操作
          const undoAction: UndoAction = {
            ...action,
            id: `undo_${action.id}`,
            type: 'UNDO' as any,
            description: `撤銷: ${action.description}`,
            timestamp: new Date(),
          };
          
          set(state => ({
            pendingActions: [...state.pendingActions, undoAction]
          }));
        }
        
      } catch (error) {
        console.error('撤銷操作失敗:', error);
      }
    },
    
    redo: async () => {
      const { localHistory, currentIndex, isOnline } = get();
      
      if (currentIndex >= localHistory.length - 1) return;
      
      const action = localHistory[currentIndex + 1];
      if (!action) return;
      
      try {
        // 執行重做操作
        await executeRedo(action);
        
        // 更新歷史記錄位置
        set({ currentIndex: currentIndex + 1 });
        
        // 儲存到本地儲存
        get().saveToLocalStorage();
        
        // 如果線上，同步重做操作
        if (isOnline) {
          await syncRedoToBackend(action);
        } else {
          // 離線模式：記錄重做操作
          const redoAction: UndoAction = {
            ...action,
            id: `redo_${action.id}`,
            type: 'REDO' as any,
            description: `重做: ${action.description}`,
            timestamp: new Date(),
          };
          
          set(state => ({
            pendingActions: [...state.pendingActions, redoAction]
          }));
        }
        
      } catch (error) {
        console.error('重做操作失敗:', error);
      }
    },
    
    canUndo: () => {
      const { currentIndex } = get();
      return currentIndex >= 0;
    },
    
    canRedo: () => {
      const { localHistory, currentIndex } = get();
      return currentIndex < localHistory.length - 1;
    },
    
    setOnlineStatus: (isOnline) => {
      set({ isOnline });
      
      // 網路恢復時自動同步
      if (isOnline) {
        const { pendingActions } = get();
        if (pendingActions.length > 0) {
          console.log('網路恢復，開始同步待處理操作...');
          get().syncPendingActions();
        }
      }
    },
    
    syncPendingActions: async () => {
      const { pendingActions, isOnline } = get();
      
      if (!isOnline || pendingActions.length === 0) return;
      
      set({ isSyncing: true });
      
      try {
        const successfulActions: string[] = [];
        const failedActions: UndoAction[] = [];
        
        for (const action of pendingActions) {
          try {
            await syncToBackend(action);
            successfulActions.push(action.id);
          } catch (error) {
            console.error('同步操作失敗:', action.id, error);
            failedActions.push(action);
          }
        }
        
        set(state => ({
          syncedActions: [...state.syncedActions, ...successfulActions],
          pendingActions: failedActions,
          lastSyncTime: new Date(),
          syncErrors: failedActions.length > 0 ? 
            [...state.syncErrors, `同步失敗: ${failedActions.length} 個操作`] : 
            state.syncErrors
        }));
        
        console.log(`同步完成: ${successfulActions.length} 成功, ${failedActions.length} 失敗`);
        
      } catch (error) {
        console.error('批量同步失敗:', error);
        set(state => ({
          syncErrors: [...state.syncErrors, error.message]
        }));
      } finally {
        set({ isSyncing: false });
      }
    },
    
    resolveConflicts: (localState, serverState) => {
      // 簡單的衝突解決策略：以時間戳為準
      const localTimestamp = new Date(localState.timestamp).getTime();
      const serverTimestamp = new Date(serverState.timestamp).getTime();
      
      if (localTimestamp > serverTimestamp) {
        console.log('使用本地狀態（更新）');
        return localState;
      } else {
        console.log('使用伺服器狀態（更新）');
        return serverState;
      }
    },
    
    saveToLocalStorage: () => {
      const { localHistory, currentIndex, items, selectedItemIds, pendingActions } = get();
      
      const dataToSave = {
        localHistory,
        currentIndex,
        items,
        selectedItemIds,
        pendingActions,
        timestamp: new Date().toISOString()
      };
      
      try {
        localStorage.setItem('kds_undo_redo_state', JSON.stringify(dataToSave));
        console.log('狀態已儲存到本地儲存');
      } catch (error) {
        console.error('儲存到本地儲存失敗:', error);
      }
    },
    
    loadFromLocalStorage: () => {
      try {
        const savedData = localStorage.getItem('kds_undo_redo_state');
        if (savedData) {
          const data = JSON.parse(savedData);
          
          // 檢查資料是否過期（24小時）
          const savedTime = new Date(data.timestamp).getTime();
          const currentTime = new Date().getTime();
          const maxAge = 24 * 60 * 60 * 1000; // 24小時
          
          if (currentTime - savedTime < maxAge) {
            set({
              localHistory: data.localHistory || [],
              currentIndex: data.currentIndex || -1,
              items: data.items || [],
              selectedItemIds: data.selectedItemIds || [],
              pendingActions: data.pendingActions || []
            });
            console.log('已從本地儲存恢復狀態');
          } else {
            console.log('本地儲存資料已過期，清除舊資料');
            get().clearLocalStorage();
          }
        }
      } catch (error) {
        console.error('從本地儲存載入失敗:', error);
        get().clearLocalStorage();
      }
    },
    
    clearLocalStorage: () => {
      try {
        localStorage.removeItem('kds_undo_redo_state');
        console.log('本地儲存已清除');
      } catch (error) {
        console.error('清除本地儲存失敗:', error);
      }
    },
    
    updateItems: (items) => {
      set({ items });
      get().saveToLocalStorage();
    },
    
    updateSelectedItems: (itemIds) => {
      set({ selectedItemIds: itemIds });
      get().saveToLocalStorage();
    },
  }))
);

// 執行撤銷操作
async function executeUndo(action: UndoAction) {
  const { frontendChanges, updateItems, updateSelectedItems } = useOfflineUndoStore.getState();
  
  switch (action.type) {
    case 'SELECT_ITEM':
      if (frontendChanges.previousSelectedItemIds) {
        updateSelectedItems(frontendChanges.previousSelectedItemIds);
      }
      break;
      
    case 'DELETE':
      if (frontendChanges.deletedItems) {
        const { items } = useOfflineUndoStore.getState();
        const newItems = [...items, ...frontendChanges.deletedItems];
        updateItems(newItems);
      }
      break;
      
    case 'UPDATE':
      if (frontendChanges.updatedItems) {
        const { items } = useOfflineUndoStore.getState();
        const newItems = items.map(item => {
          const updatedItem = frontendChanges.updatedItems!.find(
            updated => updated.id === item.id
          );
          return updatedItem ? { ...item, ...updatedItem } : item;
        });
        updateItems(newItems);
      }
      break;
      
    case 'CREATE':
      if (frontendChanges.createdItems) {
        const { items } = useOfflineUndoStore.getState();
        const newItems = items.filter(
          item => !frontendChanges.createdItems!.some(
            created => created.id === item.id
          )
        );
        updateItems(newItems);
      }
      break;
      
    case 'BATCH_DELETE':
      if (frontendChanges.deletedItems) {
        const { items } = useOfflineUndoStore.getState();
        const newItems = [...items, ...frontendChanges.deletedItems];
        updateItems(newItems);
      }
      break;
      
    case 'STATUS_CHANGE':
      if (frontendChanges.statusChanges) {
        const { items } = useOfflineUndoStore.getState();
        const newItems = items.map(item => {
          const statusChange = frontendChanges.statusChanges!.find(
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
  const { frontendChanges, updateItems, updateSelectedItems } = useOfflineUndoStore.getState();
  
  switch (action.type) {
    case 'SELECT_ITEM':
      if (frontendChanges.selectedItemIds) {
        updateSelectedItems(frontendChanges.selectedItemIds);
      }
      break;
      
    case 'DELETE':
      if (frontendChanges.deletedItems) {
        const { items } = useOfflineUndoStore.getState();
        const newItems = items.filter(
          item => !frontendChanges.deletedItems!.some(
            deleted => deleted.id === item.id
          )
        );
        updateItems(newItems);
      }
      break;
      
    case 'UPDATE':
      if (frontendChanges.updatedItems) {
        const { items } = useOfflineUndoStore.getState();
        const newItems = items.map(item => {
          const updatedItem = frontendChanges.updatedItems!.find(
            updated => updated.id === item.id
          );
          return updatedItem ? { ...item, ...updatedItem } : item;
        });
        updateItems(newItems);
      }
      break;
      
    case 'CREATE':
      if (frontendChanges.createdItems) {
        const { items } = useOfflineUndoStore.getState();
        const newItems = [...items, ...frontendChanges.createdItems];
        updateItems(newItems);
      }
      break;
      
    case 'BATCH_DELETE':
      if (frontendChanges.deletedItems) {
        const { items } = useOfflineUndoStore.getState();
        const newItems = items.filter(
          item => !frontendChanges.deletedItems!.some(
            deleted => deleted.id === item.id
          )
        );
        updateItems(newItems);
      }
      break;
      
    case 'STATUS_CHANGE':
      if (frontendChanges.statusChanges) {
        const { items } = useOfflineUndoStore.getState();
        const newItems = items.map(item => {
          const statusChange = frontendChanges.statusChanges!.find(
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