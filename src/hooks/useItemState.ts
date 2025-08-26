import { useState, useCallback } from 'react';

export interface ItemState {
  id: string;
  name: string;
  count: number;
  table: string;
  note?: string;
  status: 'making' | 'completed' | 'hold';
  completedCount: number;
  holdCount: number;
  originalCount: number;
}

export interface ItemAction {
  type: 'complete' | 'hold' | 'reset';
  itemId: string;
  count?: number;
}

export function useItemState(initialItems: any[]) {
  const [items, setItems] = useState<ItemState[]>(
    initialItems.map(item => ({
      ...item,
      id: `${item.table}-${item.name}-${item.note || 'no-note'}`,
      status: 'making',
      completedCount: 0,
      holdCount: 0,
      originalCount: item.count
    }))
  );

  const [selectedItem, setSelectedItem] = useState<ItemState | null>(null);
  const [isHoldMode, setIsHoldMode] = useState(false);

  // 完成品項
  const completeItem = useCallback(async (itemId: string) => {
    try {
      // 呼叫完成API
      const response = await fetch('/api/items/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });

      if (response.ok) {
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, completedCount: item.completedCount + 1 }
            : item
        ));
        
        // 如果全部完成，更新狀態
        setItems(prev => prev.map(item => 
          item.id === itemId && item.completedCount + 1 >= item.originalCount
            ? { ...item, status: 'completed' }
            : item
        ));
      }
    } catch (error) {
      console.error('完成品項失敗:', error);
    }
  }, []);

  // 進入HOLD模式
  const enterHoldMode = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item && item.completedCount > 0) {
      setSelectedItem(item);
      setIsHoldMode(true);
    }
  }, [items]);

  // 處理HOLD操作
  const handleHold = useCallback(async (itemId: string, holdCount: number) => {
    try {
      // 呼叫HOLD API
      const response = await fetch('/api/items/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, holdCount })
      });

      if (response.ok) {
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { 
                ...item, 
                holdCount: item.holdCount + holdCount,
                completedCount: item.completedCount - holdCount
              }
            : item
        ));
        
        setIsHoldMode(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('HOLD品項失敗:', error);
    }
  }, []);

  // 處理品項點擊
  const handleItemClick = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (item.completedCount === 0) {
      // 第一次點擊：完成品項
      completeItem(itemId);
    } else if (item.completedCount > 0 && !isHoldMode) {
      // 第二次點擊：進入HOLD模式
      enterHoldMode(itemId);
    }
  }, [items, isHoldMode, completeItem, enterHoldMode]);

  // 重置品項狀態
  const resetItem = useCallback(async (itemId: string) => {
    try {
      const response = await fetch('/api/items/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });

      if (response.ok) {
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { 
                ...item, 
                completedCount: 0,
                holdCount: 0,
                status: 'making'
              }
            : item
        ));
      }
    } catch (error) {
      console.error('重置品項失敗:', error);
    }
  }, []);

  return {
    items,
    selectedItem,
    isHoldMode,
    handleItemClick,
    handleHold,
    resetItem,
    setIsHoldMode,
    setSelectedItem
  };
}










