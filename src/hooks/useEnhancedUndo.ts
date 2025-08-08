import { useCallback, useEffect, useRef } from 'react';
import { useEnhancedUndoStore } from '../store/enhancedUndoStore';

interface UseEnhancedUndoOptions {
  maxHistorySize?: number;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  enableKeyboardShortcuts?: boolean;
}

export const useEnhancedUndo = (options: UseEnhancedUndoOptions = {}) => {
  const {
    maxHistorySize = 50,
    enableAutoSave = true,
    autoSaveInterval = 30000, // 30秒
    enableKeyboardShortcuts = true,
  } = options;

  const {
    history,
    currentIndex,
    items,
    selectedItemIds,
    isProcessing,
    lastSyncTime,
    recordAction,
    undo,
    redo,
    canUndo,
    canRedo,
    updateItems,
    updateSelectedItems,
    clearHistory,
    setMaxHistorySize,
  } = useEnhancedUndoStore();

  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // 設置最大歷史記錄大小
  useEffect(() => {
    setMaxHistorySize(maxHistorySize);
  }, [maxHistorySize, setMaxHistorySize]);

  // 自動儲存功能
  useEffect(() => {
    if (enableAutoSave) {
      autoSaveRef.current = setInterval(() => {
        if (history.length > 0) {
          console.log('自動儲存操作歷史...');
          // 這裡可以實現自動儲存到 localStorage 或後端
        }
      }, autoSaveInterval);

      return () => {
        if (autoSaveRef.current) {
          clearInterval(autoSaveRef.current);
        }
      };
    }
  }, [enableAutoSave, autoSaveInterval, history.length]);

  // 鍵盤快捷鍵
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z 或 Cmd+Z 撤銷
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canUndo()) {
          handleUndo();
        }
      }
      
      // Ctrl+Y 或 Cmd+Shift+Z 重做
      if ((event.ctrlKey || event.metaKey) && 
          ((event.key === 'y') || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        if (canRedo()) {
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, canUndo, canRedo]);

  // 記錄選擇操作
  const recordSelection = useCallback(async (
    selectedIds: string[],
    previousIds: string[],
    description: string = '選擇項目'
  ) => {
    await recordAction({
      type: 'SELECT_ITEM',
      description,
      frontendChanges: {
        selectedItemIds: selectedIds,
        previousSelectedItemIds: previousIds,
      },
      backendChanges: {
        tableName: 'user_selections',
        operation: 'UPDATE',
        data: { selectedItemIds: selectedIds },
        where: { sessionId: sessionId.current },
      },
      metadata: {
        sessionId: sessionId.current,
        deviceInfo: navigator.userAgent,
      },
    });
  }, [recordAction]);

  // 記錄刪除操作
  const recordDelete = useCallback(async (
    deletedItems: any[],
    description: string = '刪除項目'
  ) => {
    await recordAction({
      type: 'DELETE',
      description,
      frontendChanges: {
        deletedItems,
      },
      backendChanges: {
        tableName: 'orders',
        operation: 'DELETE',
        data: { ids: deletedItems.map(item => item.id) },
      },
      metadata: {
        sessionId: sessionId.current,
        deviceInfo: navigator.userAgent,
      },
    });
  }, [recordAction]);

  // 記錄批量刪除操作
  const recordBatchDelete = useCallback(async (
    deletedItems: any[],
    description: string = '批量刪除項目'
  ) => {
    await recordAction({
      type: 'BATCH_DELETE',
      description,
      frontendChanges: {
        deletedItems,
      },
      backendChanges: {
        tableName: 'orders',
        operation: 'DELETE',
        data: { ids: deletedItems.map(item => item.id) },
      },
      metadata: {
        sessionId: sessionId.current,
        deviceInfo: navigator.userAgent,
      },
    });
  }, [recordAction]);

  // 記錄更新操作
  const recordUpdate = useCallback(async (
    updatedItems: any[],
    description: string = '更新項目'
  ) => {
    await recordAction({
      type: 'UPDATE',
      description,
      frontendChanges: {
        updatedItems,
      },
      backendChanges: {
        tableName: 'orders',
        operation: 'UPDATE',
        data: updatedItems,
      },
      metadata: {
        sessionId: sessionId.current,
        deviceInfo: navigator.userAgent,
      },
    });
  }, [recordAction]);

  // 記錄創建操作
  const recordCreate = useCallback(async (
    createdItems: any[],
    description: string = '創建項目'
  ) => {
    await recordAction({
      type: 'CREATE',
      description,
      frontendChanges: {
        createdItems,
      },
      backendChanges: {
        tableName: 'orders',
        operation: 'INSERT',
        data: createdItems,
      },
      metadata: {
        sessionId: sessionId.current,
        deviceInfo: navigator.userAgent,
      },
    });
  }, [recordAction]);

  // 記錄狀態變更操作
  const recordStatusChange = useCallback(async (
    statusChanges: { itemId: string; from: string; to: string }[],
    description: string = '變更狀態'
  ) => {
    await recordAction({
      type: 'STATUS_CHANGE',
      description,
      frontendChanges: {
        statusChanges,
      },
      backendChanges: {
        tableName: 'orders',
        operation: 'UPDATE',
        data: statusChanges.map(change => ({
          id: change.itemId,
          status: change.to,
        })),
      },
      metadata: {
        sessionId: sessionId.current,
        deviceInfo: navigator.userAgent,
      },
    });
  }, [recordAction]);

  // 撤銷操作
  const handleUndo = useCallback(async () => {
    if (!canUndo() || isProcessing) return;
    
    try {
      await undo();
      console.log('撤銷操作成功');
    } catch (error) {
      console.error('撤銷操作失敗:', error);
      // 可以在這裡顯示錯誤提示
    }
  }, [undo, canUndo, isProcessing]);

  // 重做操作
  const handleRedo = useCallback(async () => {
    if (!canRedo() || isProcessing) return;
    
    try {
      await redo();
      console.log('重做操作成功');
    } catch (error) {
      console.error('重做操作失敗:', error);
      // 可以在這裡顯示錯誤提示
    }
  }, [redo, canRedo, isProcessing]);

  // 清除歷史記錄
  const handleClearHistory = useCallback(() => {
    clearHistory();
    console.log('歷史記錄已清除');
  }, [clearHistory]);

  // 獲取當前操作描述
  const getCurrentActionDescription = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < history.length) {
      return history[currentIndex].description;
    }
    return '';
  }, [history, currentIndex]);

  // 獲取歷史記錄統計
  const getHistoryStats = useCallback(() => {
    return {
      totalActions: history.length,
      currentIndex,
      canUndo: canUndo(),
      canRedo: canRedo(),
      isProcessing,
      lastSyncTime,
    };
  }, [history.length, currentIndex, canUndo, canRedo, isProcessing, lastSyncTime]);

  return {
    // 狀態
    history,
    currentIndex,
    items,
    selectedItemIds,
    isProcessing,
    lastSyncTime,
    
    // 操作記錄函數
    recordSelection,
    recordDelete,
    recordBatchDelete,
    recordUpdate,
    recordCreate,
    recordStatusChange,
    
    // 撤銷/重做函數
    handleUndo,
    handleRedo,
    handleClearHistory,
    
    // 狀態檢查
    canUndo,
    canRedo,
    
    // 狀態更新
    updateItems,
    updateSelectedItems,
    
    // 工具函數
    getCurrentActionDescription,
    getHistoryStats,
    
    // 選項
    options: {
      maxHistorySize,
      enableAutoSave,
      autoSaveInterval,
      enableKeyboardShortcuts,
    },
  };
}; 