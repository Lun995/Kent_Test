import { useState, useCallback, useEffect } from 'react';

// 品項介面
export interface OrderItem {
  id: string;
  name: string;
  count: number;
  table: string;
  note?: string;
}

// 分類品項介面
export interface CategoryItems {
  making: OrderItem[];
  hold: OrderItem[];
  waiting: OrderItem[];
}

export function useAutoReplenishment(
  categoryItems: CategoryItems,
  setCategoryItems: React.Dispatch<React.SetStateAction<CategoryItems>>,
  hiddenMakingCards: Set<string>,
  setHiddenMakingCards: React.Dispatch<React.SetStateAction<Set<string>>>,
  hiddenHoldCards: Set<string>,
  setHiddenHoldCards: React.Dispatch<React.SetStateAction<Set<string>>>,
  onTimeoutEffectRecalculate?: () => void
) {
  // 重新計算逾時特效函數
  const recalculateTimeoutEffect = useCallback(() => {
    if (onTimeoutEffectRecalculate) {
      onTimeoutEffectRecalculate();
    }
    console.log('逾時特效重新計算：重置為綠色狀態');
  }, [onTimeoutEffectRecalculate]);

  // 強制遞補函數：當製作中沒有可見牌卡時自動遞補
  const forceAutoReplenish = useCallback(() => {
    setCategoryItems(prev => {
      // 檢查製作中是否有可見的牌卡
      const visibleMakingCards = Object.keys(prev.making.reduce((acc, item) => {
        const key = item.table;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {} as Record<string, OrderItem[]>)).filter(tableName => {
        const cardKey = `making-${tableName}`;
        return !hiddenMakingCards.has(cardKey);
      });
      
      console.log('強制遞補檢查：', {
        visibleMakingCards,
        hiddenMakingCards: Array.from(hiddenMakingCards),
        waitingLength: prev.waiting.length
      });
      
      // 如果沒有可見的製作中牌卡，且有待製作品項，則自動遞補
      if (visibleMakingCards.length === 0 && prev.waiting.length > 0) {
        const newMaking = [...prev.making];
        const newWaiting = [...prev.waiting];
        
        // 按優先級順序遞補：C1 > C2 > C3 > C4 > 其他
        const priorityOrder = ['C1', 'C2', 'C3', 'C4'];
        let nextTableToMove = null;
        
        // 找到優先級最高的待製作牌卡
        for (const priorityTable of priorityOrder) {
          const hasPriorityTable = newWaiting.some(item => item.table === priorityTable);
          if (hasPriorityTable) {
            nextTableToMove = priorityTable;
            break;
          }
        }
        
        // 如果沒有找到優先級牌卡，使用第一個待製作牌卡
        if (!nextTableToMove && newWaiting.length > 0) {
          nextTableToMove = newWaiting[0]?.table;
        }
        
        if (nextTableToMove) {
          const itemsToMove = newWaiting.filter(item => item.table === nextTableToMove);
          
          console.log('準備移動品項：', { nextTableToMove, itemsToMove });
          
          // 移動品項到製作中
          const moveTimestamp = Date.now();
          itemsToMove.forEach((item, index) => {
            const movedItem = {
              ...item,
              id: `force-moved-${moveTimestamp}-${index}`
            };
            newMaking.push(movedItem);
          });
          
          // 從待製作中移除
          const remainingWaiting = newWaiting.filter(item => item.table !== nextTableToMove);
          newWaiting.length = 0;
          newWaiting.push(...remainingWaiting);
          
          console.log('強制遞補完成：待製作品項已移動到製作中');
          
          // 遞補完成後，清除隱藏的牌卡狀態，讓新遞補的牌卡可以正常顯示
          setTimeout(() => {
            setHiddenMakingCards(new Set());
            console.log('遞補完成：隱藏牌卡狀態已清除');
            
            // 為遞補的品項重新計算逾時特效
            // 延遲200ms確保狀態更新完成後再觸發
            setTimeout(() => {
              recalculateTimeoutEffect();
            }, 200);
          }, 50);
        }
        
        return {
          ...prev,
          making: newMaking,
          waiting: newWaiting
        };
      }
      return prev;
    });
  }, [categoryItems.making.length, categoryItems.waiting.length, hiddenMakingCards, setCategoryItems, setHiddenMakingCards, recalculateTimeoutEffect]);

  // 雙擊牌卡表頭處理函數
  const handleCardHeaderDoubleClick = useCallback((cardType: 'making' | 'hold', cardKey: string) => {
    if (cardType === 'making') {
      setHiddenMakingCards(prev => new Set([...prev, cardKey]));
      
      // 當製作中牌卡消失後，將待製作的品項替補到製作中
      setCategoryItems(prev => {
        const newMaking = [...prev.making];
        const newWaiting = [...prev.waiting];
        
        // 找到被隱藏的製作中牌卡對應的品項
        const hiddenTableName = cardKey.replace('making-', '');
        const hiddenItems = newMaking.filter(item => item.table === hiddenTableName);
        
        if (hiddenItems.length > 0 && newWaiting.length > 0) {
          // 按優先級順序遞補：C1 > C2 > C3 > C4 > 其他
          const priorityOrder = ['C1', 'C2', 'C3', 'C4'];
          let nextTableToMove = null;
          
          // 找到優先級最高的待製作牌卡
          for (const priorityTable of priorityOrder) {
            const hasPriorityTable = newWaiting.some(item => item.table === priorityTable);
            if (hasPriorityTable) {
              nextTableToMove = priorityTable;
              break;
            }
          }
          
          // 如果沒有找到優先級牌卡，使用第一個待製作牌卡
          if (!nextTableToMove && newWaiting.length > 0) {
            nextTableToMove = newWaiting[0]?.table;
          }
          
          if (nextTableToMove) {
            // 找到同一桌號的所有品項
            const itemsToMove = newWaiting.filter(item => item.table === nextTableToMove);
            
            // 將這些品項一起移動到製作中，並確保它們保持在同一張牌卡中
            // 為所有移動的品項使用相同的時間戳，確保它們被分組到同一張牌卡
            const moveTimestamp = Date.now();
            itemsToMove.forEach((item, index) => {
              const movedItem = {
                ...item,
                // 使用相同的時間戳，讓它們在製作中保持在同一張牌卡
                id: `moved-${moveTimestamp}-${index}`
              };
              newMaking.push(movedItem);
            });
            
            // 從待製作中移除這些品項
            const remainingWaiting = newWaiting.filter(item => item.table !== nextTableToMove);
            newWaiting.length = 0; // 清空原陣列
            newWaiting.push(...remainingWaiting); // 重新填充
          }
        }
        
        return {
          ...prev,
          making: newMaking,
          waiting: newWaiting
        };
      });
      
      // 檢查製作中是否還有品項，如果沒有則自動遞補
      setTimeout(() => {
        setCategoryItems(prev => {
          // 如果製作中沒有品項，自動從待製作中遞補
          if (prev.making.length === 0 && prev.waiting.length > 0) {
            const newMaking = [...prev.making];
            const newWaiting = [...prev.waiting];
            
            // 按優先級順序遞補：C1 > C2 > C3 > C4 > 其他
            const priorityOrder = ['C1', 'C2', 'C3', 'C4'];
            let nextTableToMove = null;
            
            // 找到優先級最高的待製作牌卡
            for (const priorityTable of priorityOrder) {
              const hasPriorityTable = newWaiting.some(item => item.table === priorityTable);
              if (hasPriorityTable) {
                nextTableToMove = priorityTable;
                break;
              }
            }
            
            // 如果沒有找到優先級牌卡，使用第一個待製作牌卡
            if (!nextTableToMove && newWaiting.length > 0) {
              nextTableToMove = newWaiting[0]?.table;
            }
            
            if (nextTableToMove) {
              const itemsToMove = newWaiting.filter(item => item.table === nextTableToMove);
              
              // 移動品項到製作中
              const moveTimestamp = Date.now();
              itemsToMove.forEach((item, index) => {
                const movedItem = {
                  ...item,
                  id: `auto-moved-${moveTimestamp}-${index}`
                };
                newMaking.push(movedItem);
              });
              
              // 從待製作中移除
              const remainingWaiting = newWaiting.filter(item => item.table !== nextTableToMove);
              newWaiting.length = 0;
              newWaiting.push(...remainingWaiting);
              
              console.log('自動遞補：待製品項已移動到製作中');
            }
            
            return {
              ...prev,
              making: newMaking,
              waiting: newWaiting
            };
          }
          return prev;
        });
        
        // 強制檢查並遞補
        forceAutoReplenish();
        
        // 遞補完成後重新計算逾時特效
        setTimeout(() => {
          recalculateTimeoutEffect();
        }, 300); // 延遲300ms確保遞補完成
      }, 100); // 延遲100ms確保狀態更新完成
      
    } else if (cardType === 'hold') {
      // 隱藏Hold牌卡
      setHiddenHoldCards(prev => new Set([...prev, 'hold-main']));
      console.log('Hold牌卡已被隱藏');
      
      // 可以選擇是否要將Hold品項移動回待製作或製作中
      // 這裡暫時只是隱藏，品項仍然保留在Hold狀態
    }
  }, [setCategoryItems, setHiddenMakingCards, setHiddenHoldCards, forceAutoReplenish, recalculateTimeoutEffect]);

  // 監聽製作中品項變化，當沒有品項時自動觸發遞補
  useEffect(() => {
    // 如果製作中沒有品項，且有待製作品項，則自動觸發遞補
    if (categoryItems.making.length === 0 && categoryItems.waiting.length > 0) {
      console.log('檢測到製作中沒有品項，自動觸發遞補');
      // 延遲執行，確保狀態更新完成
      setTimeout(() => {
        forceAutoReplenish();
      }, 100);
    }
  }, [categoryItems.making.length, categoryItems.waiting.length, forceAutoReplenish]);

  return {
    // 方法
    forceAutoReplenish,
    handleCardHeaderDoubleClick,
    recalculateTimeoutEffect
  };
}


