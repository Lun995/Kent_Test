import { useCallback } from 'react';
import { useUndoStore } from '../store/undoStore';

export const useItemSelection = () => {
  const { 
    addAction, 
    selectedItemId, 
    updateSelectedItem,
    currentItems 
  } = useUndoStore();

  // 記錄品項選擇操作
  const recordItemSelection = useCallback(async (
    newSelectedItemId: string, 
    previousSelectedItemId: string | null,
    description: string
  ) => {
    // 獲取選中的品項資料
    const selectedItem = currentItems.find(item => item.id === newSelectedItemId);
    
    if (selectedItem) {
      // 記錄選擇操作
      addAction({
        type: 'SELECT_ITEM',
        items: [selectedItem],
        selectedItemId: newSelectedItemId,
        previousSelectedItemId: previousSelectedItemId || undefined,
        description: `選擇品項: ${description}`,
      });

      // 更新當前選中的品項
      updateSelectedItem(newSelectedItemId);

      // 同步到後端（可選）
      try {
        const response = await fetch('/api/orders/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'select_item',
            selectedItemId: newSelectedItemId,
            previousSelectedItemId,
            description,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          console.error('品項選擇同步失敗');
        }
      } catch (error) {
        console.error('品項選擇同步時發生錯誤:', error);
      }
    }
  }, [addAction, updateSelectedItem, currentItems]);

  // 處理品項點擊
  const handleItemClick = useCallback(async (itemId: string, itemName: string) => {
    const previousSelectedItemId = selectedItemId;
    
    // 如果點擊的是同一個品項，則取消選擇
    if (selectedItemId === itemId) {
      updateSelectedItem(null);
      return;
    }

    // 記錄選擇操作
    await recordItemSelection(itemId, previousSelectedItemId, itemName);
  }, [selectedItemId, recordItemSelection, updateSelectedItem]);

  // 獲取當前選中的品項
  const getSelectedItem = useCallback(() => {
    if (!selectedItemId) return null;
    return currentItems.find(item => item.id === selectedItemId) || null;
  }, [selectedItemId, currentItems]);

  // 檢查品項是否被選中
  const isItemSelected = useCallback((itemId: string) => {
    return selectedItemId === itemId;
  }, [selectedItemId]);

  return {
    selectedItemId,
    handleItemClick,
    getSelectedItem,
    isItemSelected,
    recordItemSelection,
  };
}; 