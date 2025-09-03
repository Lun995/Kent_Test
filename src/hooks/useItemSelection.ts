import { useState, useCallback } from 'react';

export function useItemSelection() {
  // 製作中品項點擊特效狀態管理
  const [selectedMakingItem, setSelectedMakingItem] = useState<string | null>(null);
  const [clickedMakingItems, setClickedMakingItems] = useState<Set<string>>(new Set());

  // Hold品項點擊特效狀態管理
  const [selectedHoldItem, setSelectedHoldItem] = useState<string | null>(null);
  const [clickedHoldItems, setClickedHoldItems] = useState<Set<string>>(new Set());

  // 製作中品項點擊處理函數
  const handleMakingItemSelect = useCallback((itemId: string) => {
    console.log('handleMakingItemSelect called with:', itemId);
    
    // 檢查品項是否已經被點擊過
    if (clickedMakingItems.has(itemId)) {
      // 如果已經被點擊過，則取消選中（反白）
      setClickedMakingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      setSelectedMakingItem(null);
      console.log('製作中品項已取消選中:', itemId);
    } else {
      // 如果沒有被點擊過，則選中（反灰）
      setClickedMakingItems(prev => new Set([...prev, itemId]));
      setSelectedMakingItem(itemId);
      console.log('製作中品項已選中:', itemId);
    }
    
    // 清除Hold品項的選中狀態
    setSelectedHoldItem(null);
  }, [clickedMakingItems]);

  // Hold品項點擊處理函數
  const handleHoldItemSelect = useCallback((itemId: string) => {
    console.log('handleHoldItemSelect called with:', itemId);
    
    // 檢查品項是否已經被點擊過
    if (clickedHoldItems.has(itemId)) {
      // 如果已經被點擊過，則取消選中（反白）
      setClickedHoldItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      setSelectedHoldItem(null);
      console.log('Hold品項已取消選中:', itemId);
    } else {
      // 如果沒有被點擊過，則選中（反灰）
      setClickedHoldItems(prev => new Set([...prev, itemId]));
      setSelectedHoldItem(itemId);
      console.log('Hold品項已選中:', itemId);
    }
    
    // 清除製作中品項的選中狀態
    setSelectedMakingItem(null);
  }, [clickedHoldItems]);

  // 清除所有選中狀態
  const clearAllSelections = useCallback(() => {
    setSelectedMakingItem(null);
    setSelectedHoldItem(null);
    setClickedMakingItems(new Set());
    setClickedHoldItems(new Set());
  }, []);

  // 檢查是否有選中的品項
  const hasSelectedItem = useCallback(() => {
    return selectedMakingItem !== null || selectedHoldItem !== null;
  }, [selectedMakingItem, selectedHoldItem]);

  // 獲取當前選中的品項ID
  const getSelectedItemId = useCallback(() => {
    return selectedMakingItem || selectedHoldItem;
  }, [selectedMakingItem, selectedHoldItem]);

  // 獲取當前選中的品項類型
  const getSelectedItemType = useCallback(() => {
    if (selectedMakingItem) return 'making';
    if (selectedHoldItem) return 'hold';
    return null;
  }, [selectedMakingItem, selectedHoldItem]);

  return {
    // 狀態
    selectedMakingItem,
    clickedMakingItems,
    selectedHoldItem,
    clickedHoldItems,
    
    // 方法
    handleMakingItemSelect,
    handleHoldItemSelect,
    clearAllSelections,
    hasSelectedItem,
    getSelectedItemId,
    getSelectedItemType,
    
    // Setters
    setSelectedMakingItem,
    setSelectedHoldItem,
    setClickedMakingItems,
    setClickedHoldItems
  };
}


