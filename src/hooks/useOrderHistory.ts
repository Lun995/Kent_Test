import { useCallback } from 'react';
import { useUndoStore } from '../store/undoStore';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  status: 'waiting' | 'making' | 'completed' | 'hold';
  timestamp: Date;
}

export const useOrderHistory = () => {
  const { addAction, currentItems, updateCurrentItems } = useUndoStore();

  // 記錄刪除操作
  const recordDelete = useCallback(async (deletedItems: OrderItem[], description: string) => {
    // 記錄刪除前的狀態
    addAction({
      type: 'DELETE',
      items: deletedItems,
      description: `刪除 ${deletedItems.length} 筆訂單: ${description}`,
    });

    // 同步到後端
    try {
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          items: deletedItems,
          description,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('刪除操作同步失敗');
      }
    } catch (error) {
      console.error('刪除操作同步時發生錯誤:', error);
    }
  }, [addAction]);

  // 記錄更新操作
  const recordUpdate = useCallback(async (updatedItems: OrderItem[], description: string) => {
    addAction({
      type: 'UPDATE',
      items: updatedItems,
      description: `更新 ${updatedItems.length} 筆訂單: ${description}`,
    });

    // 同步到後端
    try {
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          items: updatedItems,
          description,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('更新操作同步失敗');
      }
    } catch (error) {
      console.error('更新操作同步時發生錯誤:', error);
    }
  }, [addAction]);

  // 記錄創建操作
  const recordCreate = useCallback(async (createdItems: OrderItem[], description: string) => {
    addAction({
      type: 'CREATE',
      items: createdItems,
      description: `創建 ${createdItems.length} 筆訂單: ${description}`,
    });

    // 同步到後端
    try {
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          items: createdItems,
          description,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('創建操作同步失敗');
      }
    } catch (error) {
      console.error('創建操作同步時發生錯誤:', error);
    }
  }, [addAction]);

  // 批量刪除訂單
  const batchDeleteOrders = useCallback(async (itemsToDelete: OrderItem[]) => {
    if (itemsToDelete.length === 0) return;

    // 記錄刪除操作
    await recordDelete(itemsToDelete, `批量刪除 ${itemsToDelete.length} 筆訂單`);

    // 更新當前顯示的項目（移除被刪除的項目）
    const updatedItems = currentItems.filter(
      item => !itemsToDelete.some(deletedItem => deletedItem.id === item.id)
    );
    updateCurrentItems(updatedItems);
  }, [recordDelete, currentItems, updateCurrentItems]);

  // 恢復被刪除的訂單
  const restoreDeletedOrders = useCallback(async (itemsToRestore: OrderItem[]) => {
    if (itemsToRestore.length === 0) return;

    // 記錄恢復操作
    await recordCreate(itemsToRestore, `恢復 ${itemsToRestore.length} 筆訂單`);

    // 更新當前顯示的項目（添加恢復的項目）
    const updatedItems = [...currentItems, ...itemsToRestore];
    updateCurrentItems(updatedItems);
  }, [recordCreate, currentItems, updateCurrentItems]);

  return {
    recordDelete,
    recordUpdate,
    recordCreate,
    batchDeleteOrders,
    restoreDeletedOrders,
    currentItems,
    updateCurrentItems,
  };
}; 