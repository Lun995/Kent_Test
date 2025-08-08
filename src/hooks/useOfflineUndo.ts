import { useCallback, useEffect, useRef } from 'react';
import { useOfflineUndoStore } from '../store/offlineUndoStore';

interface UseOfflineUndoOptions {
  enableNetworkMonitoring?: boolean;
  autoSyncOnReconnect?: boolean;
  syncInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export const useOfflineUndo = (options: UseOfflineUndoOptions = {}) => {
  const {
    enableNetworkMonitoring = true,
    autoSyncOnReconnect = true,
    syncInterval = 30000, // 30秒自動同步
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const {
    isOnline,
    pendingActions,
    syncedActions,
    localHistory,
    currentIndex,
    items,
    selectedItemIds,
    isSyncing,
    lastSyncTime,
    syncErrors,
    recordAction,
    undo,
    redo,
    canUndo,
    canRedo,
    setOnlineStatus,
    syncPendingActions,
    resolveConflicts,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    updateItems,
    updateSelectedItems,
  } = useOfflineUndoStore();

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // 網路狀態監控
  useEffect(() => {
    if (!enableNetworkMonitoring) return;

    const handleOnline = () => {
      console.log('網路已連接');
      setOnlineStatus(true);
      
      if (autoSyncOnReconnect) {
        // 延遲同步，確保網路穩定
        setTimeout(() => {
          syncPendingActions();
        }, 2000);
      }
    };

    const handleOffline = () => {
      console.log('網路已斷開');
      setOnlineStatus(false);
      
      // 清除同步計時器
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableNetworkMonitoring, autoSyncOnReconnect, setOnlineStatus, syncPendingActions]);

  // 自動同步計時器
  useEffect(() => {
    if (!isOnline || !syncInterval) return;

    syncIntervalRef.current = setInterval(() => {
      if (pendingActions.length > 0) {
        console.log('執行定期同步...');
        syncPendingActions();
      }
    }, syncInterval);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [isOnline, syncInterval, pendingActions.length, syncPendingActions]);

  // 應用啟動時載入本地狀態
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // 定期儲存狀態
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveToLocalStorage();
    }, 60000); // 每分鐘儲存一次

    return () => clearInterval(saveInterval);
  }, [saveToLocalStorage]);

  // 重試機制
  const retrySync = useCallback(async () => {
    if (retryCountRef.current >= maxRetries) {
      console.error('同步重試次數已達上限');
      retryCountRef.current = 0;
      return;
    }

    retryCountRef.current++;
    console.log(`重試同步 (${retryCountRef.current}/${maxRetries})...`);

    retryTimeoutRef.current = setTimeout(async () => {
      try {
        await syncPendingActions();
        retryCountRef.current = 0; // 重置重試計數
      } catch (error) {
        console.error('重試同步失敗:', error);
        retrySync(); // 繼續重試
      }
    }, retryDelay * retryCountRef.current);
  }, [maxRetries, retryDelay, syncPendingActions]);

  // 手動同步
  const manualSync = useCallback(async () => {
    if (!isOnline) {
      console.log('離線狀態，無法同步');
      return;
    }

    try {
      await syncPendingActions();
    } catch (error) {
      console.error('手動同步失敗:', error);
      retrySync();
    }
  }, [isOnline, syncPendingActions, retrySync]);

  // 衝突檢測和解決
  const detectAndResolveConflicts = useCallback(async () => {
    if (!isOnline) return;

    try {
      // 獲取伺服器最新狀態
      const response = await fetch('/api/orders/state');
      if (response.ok) {
        const serverState = await response.json();
        const localState = {
          items,
          selectedItemIds,
          timestamp: new Date().toISOString()
        };

        // 檢查是否有衝突
        if (hasConflict(localState, serverState)) {
          console.log('檢測到狀態衝突，正在解決...');
          const resolvedState = resolveConflicts(localState, serverState);
          
          // 更新本地狀態
          updateItems(resolvedState.items || []);
          updateSelectedItems(resolvedState.selectedItemIds || []);
          
          console.log('衝突已解決');
        }
      }
    } catch (error) {
      console.error('衝突檢測失敗:', error);
    }
  }, [isOnline, items, selectedItemIds, resolveConflicts, updateItems, updateSelectedItems]);

  // 衝突檢測函數
  const hasConflict = useCallback((localState: any, serverState: any) => {
    // 簡單的衝突檢測：比較關鍵欄位
    const localItems = localState.items || [];
    const serverItems = serverState.items || [];
    
    if (localItems.length !== serverItems.length) {
      return true;
    }
    
    // 檢查是否有不同的項目狀態
    for (let i = 0; i < localItems.length; i++) {
      const localItem = localItems[i];
      const serverItem = serverItems[i];
      
      if (localItem.id !== serverItem.id || 
          localItem.status !== serverItem.status ||
          localItem.quantity !== serverItem.quantity) {
        return true;
      }
    }
    
    return false;
  }, []);

  // 獲取同步狀態
  const getSyncStatus = useCallback(() => {
    return {
      isOnline,
      isSyncing,
      pendingActionsCount: pendingActions.length,
      syncedActionsCount: syncedActions.length,
      lastSyncTime,
      syncErrors,
      retryCount: retryCountRef.current,
    };
  }, [isOnline, isSyncing, pendingActions.length, syncedActions.length, lastSyncTime, syncErrors]);

  // 清除同步錯誤
  const clearSyncErrors = useCallback(() => {
    // 這裡需要在 store 中添加清除錯誤的方法
    console.log('清除同步錯誤');
  }, []);

  // 強制同步
  const forceSync = useCallback(async () => {
    if (!isOnline) {
      console.log('離線狀態，無法強制同步');
      return;
    }

    console.log('執行強制同步...');
    retryCountRef.current = 0; // 重置重試計數
    
    try {
      await syncPendingActions();
      await detectAndResolveConflicts();
      console.log('強制同步完成');
    } catch (error) {
      console.error('強制同步失敗:', error);
      retrySync();
    }
  }, [isOnline, syncPendingActions, detectAndResolveConflicts, retrySync]);

  // 清理資源
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    // 狀態
    isOnline,
    pendingActions,
    syncedActions,
    localHistory,
    currentIndex,
    items,
    selectedItemIds,
    isSyncing,
    lastSyncTime,
    syncErrors,
    
    // 基本操作
    recordAction,
    undo,
    redo,
    canUndo,
    canRedo,
    
    // 離線支援
    manualSync,
    forceSync,
    detectAndResolveConflicts,
    clearSyncErrors,
    getSyncStatus,
    
    // 本地儲存
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    
    // 狀態更新
    updateItems,
    updateSelectedItems,
    
    // 選項
    options: {
      enableNetworkMonitoring,
      autoSyncOnReconnect,
      syncInterval,
      maxRetries,
      retryDelay,
    },
  };
}; 