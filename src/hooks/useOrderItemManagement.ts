import { useState, useEffect, useCallback } from 'react';
import { orderItemService } from '../lib/api-services/orderItemService';
import { OrderItemAdapter } from '../lib/adapters/orderItemAdapter';
import { 
  OrderItem, 
  CategoryItems, 
  CardData, 
  CardStatus 
} from '../lib/test-card-data';
import { 
  ApiOrderItem, 
  ApiCardData, 
  UpdateItemStatusRequest,
  MoveItemRequest,
  BatchOperationRequest
} from '../lib/api-types';

// 品項管理 Hook 的配置選項
export interface UseOrderItemManagementOptions {
  storeId: number;                    // 門市ID
  autoRefresh?: boolean;              // 是否自動刷新
  refreshInterval?: number;           // 刷新間隔 (毫秒)
  enableRealTime?: boolean;           // 是否啟用即時更新
  onError?: (error: string) => void;  // 錯誤處理回調
  onDataChange?: (data: CategoryItems) => void; // 資料變更回調
}

// 品項管理 Hook 的返回值
export interface UseOrderItemManagementReturn {
  // 資料狀態
  categoryItems: CategoryItems;
  cardData: CardData[];
  isLoading: boolean;
  error: string | null;
  
  // 操作函數
  refreshItems: () => Promise<void>;
  updateItemStatus: (itemId: string, newStatus: CardStatus, workstationId?: number) => Promise<boolean>;
  moveItem: (itemId: string, fromStatus: CardStatus, toStatus: CardStatus, workstationId?: number) => Promise<boolean>;
  completeItem: (itemId: string, workstationId?: number) => Promise<boolean>;
  holdItem: (itemId: string, workstationId?: number, notes?: string) => Promise<boolean>;
  resumeItem: (itemId: string, workstationId?: number) => Promise<boolean>;
  batchOperation: (operation: 'move' | 'update' | 'delete', itemIds: string[], targetStatus?: CardStatus) => Promise<boolean>;
  
  // 搜尋和篩選
  searchItems: (query: string, status?: CardStatus) => Promise<OrderItem[]>;
  filterByTable: (tableName: string) => OrderItem[];
  filterByStatus: (status: CardStatus) => OrderItem[];
  
  // 統計資訊
  getStatistics: () => {
    total: number;
    making: number;
    hold: number;
    waiting: number;
  };
  
  // 工具函數
  getItemById: (itemId: string) => OrderItem | undefined;
  getCardByNumber: (cardNumber: number) => CardData | undefined;
  getCardByTable: (tableName: string) => CardData | undefined;
  
  // 狀態管理
  setError: (error: string | null) => void;
  clearError: () => void;
}

export function useOrderItemManagement(options: UseOrderItemManagementOptions): UseOrderItemManagementReturn {
  const { 
    storeId, 
    autoRefresh = true, 
    refreshInterval = 30000, // 30秒
    enableRealTime = false,
    onError,
    onDataChange
  } = options;

  // 狀態管理
  const [categoryItems, setCategoryItems] = useState<CategoryItems>({
    making: [],
    hold: [],
    waiting: []
  });
  
  const [cardData, setCardData] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // 錯誤處理
  const handleError = useCallback((errorMessage: string) => {
    console.error('品項管理錯誤:', errorMessage);
    setError(errorMessage);
    onError?.(errorMessage);
  }, [onError]);

  // 清除錯誤
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 獲取品項資料
  const fetchCategoryItems = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      
      console.log(`正在獲取門市 ${storeId} 的品項資料...`);
      const response = await orderItemService.getCategoryItems(storeId);
      
      if (response.code === '0000' && response.data) {
        // 使用轉換器將 API 資料轉換為前端格式
        const frontendData = OrderItemAdapter.apiCategoryToFrontend(response.data);
        setCategoryItems(frontendData);
        setLastRefreshTime(new Date());
        
        console.log(`門市 ${storeId} 品項資料載入成功:`, {
          making: frontendData.making.length,
          hold: frontendData.hold.length,
          waiting: frontendData.waiting.length
        });
        
        // 觸發資料變更回調
        onDataChange?.(frontendData);
      } else {
        throw new Error(response.message || '獲取品項資料失敗');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      handleError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, clearError, handleError, onDataChange]);

  // 獲取牌卡資料
  const fetchCardData = useCallback(async () => {
    try {
      const response = await orderItemService.getCardData(storeId);
      
      if (response.code === '0000' && response.data) {
        const frontendCards = OrderItemAdapter.batchApiCardToFrontend(response.data);
        setCardData(frontendCards);
        console.log(`門市 ${storeId} 牌卡資料載入成功:`, frontendCards.length);
      }
    } catch (err) {
      console.warn('獲取牌卡資料失敗:', err);
      // 牌卡資料載入失敗不影響主要功能
    }
  }, [storeId]);

  // 刷新品項資料
  const refreshItems = useCallback(async () => {
    await Promise.all([
      fetchCategoryItems(),
      fetchCardData()
    ]);
  }, [fetchCategoryItems, fetchCardData]);

  // 更新品項狀態
  const updateItemStatus = useCallback(async (
    itemId: string, 
    newStatus: CardStatus, 
    workstationId?: number
  ): Promise<boolean> => {
    try {
      const apiStatus = OrderItemAdapter.frontendStatusToApi(newStatus);
      const request: UpdateItemStatusRequest = {
        itemId,
        newStatus: apiStatus,
        workstationId,
        userId: 'current-user', // 這裡應該從認證系統獲取
        notes: `狀態更新為: ${apiStatus}`
      };

      const response = await orderItemService.updateItemStatus(request);
      
      if (response.code === '0000') {
        // 更新本地狀態
        setCategoryItems(prev => {
          const newItems = { ...prev };
          
          // 從所有分類中移除該品項
          Object.keys(newItems).forEach(key => {
            newItems[key as keyof CategoryItems] = newItems[key as keyof CategoryItems].filter(
              item => item.id !== itemId
            );
          });
          
          // 根據新狀態添加到對應分類
          const item = prev.making.find(i => i.id === itemId) ||
                      prev.hold.find(i => i.id === itemId) ||
                      prev.waiting.find(i => i.id === itemId);
          
          if (item) {
            const updatedItem = { ...item };
            switch (newStatus) {
              case 2: // 製作中
                newItems.making.push(updatedItem);
                break;
              case 3: // 暫停
                newItems.hold.push(updatedItem);
                break;
              case 1: // 待製作
                newItems.waiting.push(updatedItem);
                break;
            }
          }
          
          return newItems;
        });
        
        console.log(`品項 ${itemId} 狀態已更新為: ${apiStatus}`);
        return true;
      } else {
        throw new Error(response.message || '更新品項狀態失敗');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      handleError(errorMessage);
      return false;
    }
  }, [handleError]);

  // 移動品項
  const moveItem = useCallback(async (
    itemId: string, 
    fromStatus: CardStatus, 
    toStatus: CardStatus, 
    workstationId?: number
  ): Promise<boolean> => {
    try {
      const fromApiStatus = OrderItemAdapter.frontendStatusToApi(fromStatus);
      const toApiStatus = OrderItemAdapter.frontendStatusToApi(toStatus);
      
      const request: MoveItemRequest = {
        itemId,
        fromStatus: fromApiStatus,
        toStatus: toApiStatus,
        workstationId,
        userId: 'current-user',
        notes: `品項從 ${fromApiStatus} 移動到 ${toApiStatus}`
      };

      const response = await orderItemService.moveItem(request);
      
      if (response.code === '0000') {
        // 更新本地狀態
        setCategoryItems(prev => {
          const newItems = { ...prev };
          
          // 從原分類中移除
          const sourceKey = fromStatus === 2 ? 'making' : fromStatus === 3 ? 'hold' : 'waiting';
          newItems[sourceKey] = newItems[sourceKey].filter(item => item.id !== itemId);
          
          // 添加到目標分類
          const targetKey = toStatus === 2 ? 'making' : toStatus === 3 ? 'hold' : 'waiting';
          const item = prev[sourceKey].find(i => i.id === itemId);
          if (item) {
            newItems[targetKey].push(item);
          }
          
          return newItems;
        });
        
        console.log(`品項 ${itemId} 已從 ${fromApiStatus} 移動到 ${toApiStatus}`);
        return true;
      } else {
        throw new Error(response.message || '移動品項失敗');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      handleError(errorMessage);
      return false;
    }
  }, [handleError]);

  // 完成品項
  const completeItem = useCallback(async (itemId: string, workstationId?: number): Promise<boolean> => {
    return updateItemStatus(itemId, 1, workstationId); // 1 = 待製作 (前端不顯示)
  }, [updateItemStatus]);

  // 暫停品項
  const holdItem = useCallback(async (itemId: string, workstationId?: number, notes?: string): Promise<boolean> => {
    try {
      const request: UpdateItemStatusRequest = {
        itemId,
        newStatus: 'hold',
        workstationId,
        userId: 'current-user',
        notes: notes || '品項暫停'
      };

      const response = await orderItemService.holdItem(itemId, workstationId, 'current-user', notes);
      
      if (response.code === '0000') {
        return updateItemStatus(itemId, 3, workstationId); // 3 = 暫停
      } else {
        throw new Error(response.message || '暫停品項失敗');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      handleError(errorMessage);
      return false;
    }
  }, [updateItemStatus, handleError]);

  // 恢復品項
  const resumeItem = useCallback(async (itemId: string, workstationId?: number): Promise<boolean> => {
    return updateItemStatus(itemId, 2, workstationId); // 2 = 製作中
  }, [updateItemStatus]);

  // 批量操作
  const batchOperation = useCallback(async (
    operation: 'move' | 'update' | 'delete',
    itemIds: string[],
    targetStatus?: CardStatus
  ): Promise<boolean> => {
    try {
      const request: BatchOperationRequest = {
        operation,
        itemIds,
        targetStatus: targetStatus ? OrderItemAdapter.frontendStatusToApi(targetStatus) : undefined,
        userId: 'current-user'
      };

      const response = await orderItemService.batchOperation(request);
      
      if (response.code === '0000') {
        // 根據操作類型更新本地狀態
        if (operation === 'move' && targetStatus) {
          for (const itemId of itemIds) {
            await moveItem(itemId, 1, targetStatus); // 假設從待製作開始
          }
        }
        
        console.log(`批量操作 ${operation} 成功，影響 ${itemIds.length} 個品項`);
        return true;
      } else {
        throw new Error(response.message || '批量操作失敗');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      handleError(errorMessage);
      return false;
    }
  }, [moveItem, handleError]);

  // 搜尋品項
  const searchItems = useCallback(async (query: string, status?: CardStatus): Promise<OrderItem[]> => {
    try {
      const apiStatus = status ? OrderItemAdapter.frontendStatusToApi(status) : undefined;
      const searchRequest = {
        query,
        status: apiStatus,
        page: 1,
        pageSize: 100
      };

      const response = await orderItemService.searchItems(searchRequest);
      
      if (response.code === '0000' && response.data) {
        return OrderItemAdapter.batchApiToFrontend(response.data);
      } else {
        throw new Error(response.message || '搜尋品項失敗');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      handleError(errorMessage);
      return [];
    }
  }, [handleError]);

  // 根據桌號篩選
  const filterByTable = useCallback((tableName: string): OrderItem[] => {
    return [
      ...categoryItems.making.filter(item => item.table.includes(tableName)),
      ...categoryItems.hold.filter(item => item.table.includes(tableName)),
      ...categoryItems.waiting.filter(item => item.table.includes(tableName))
    ];
  }, [categoryItems]);

  // 根據狀態篩選
  const filterByStatus = useCallback((status: CardStatus): OrderItem[] => {
    switch (status) {
      case 2: return categoryItems.making;
      case 3: return categoryItems.hold;
      case 1: return categoryItems.waiting;
      default: return [];
    }
  }, [categoryItems]);

  // 獲取統計資訊
  const getStatistics = useCallback(() => ({
    total: categoryItems.making.length + categoryItems.hold.length + categoryItems.waiting.length,
    making: categoryItems.making.length,
    hold: categoryItems.hold.length,
    waiting: categoryItems.waiting.length
  }), [categoryItems]);

  // 根據ID獲取品項
  const getItemById = useCallback((itemId: string): OrderItem | undefined => {
    return [
      ...categoryItems.making,
      ...categoryItems.hold,
      ...categoryItems.waiting
    ].find(item => item.id === itemId);
  }, [categoryItems]);

  // 根據編號獲取牌卡
  const getCardByNumber = useCallback((cardNumber: number): CardData | undefined => {
    return cardData.find(card => card.cardNumber === cardNumber);
  }, [cardData]);

  // 根據桌號獲取牌卡
  const getCardByTable = useCallback((tableName: string): CardData | undefined => {
    return cardData.find(card => card.tableName === tableName);
  }, [cardData]);

  // 初始化資料載入
  useEffect(() => {
    refreshItems();
  }, [storeId]);

  // 自動刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('自動刷新品項資料...');
      refreshItems();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshItems]);

  // 即時更新 (WebSocket 或其他即時通訊)
  useEffect(() => {
    if (!enableRealTime) return;

    // 這裡可以設置 WebSocket 連接或其他即時通訊
    // 目前先使用輪詢方式
    const realTimeInterval = setInterval(() => {
      refreshItems();
    }, 5000); // 5秒檢查一次

    return () => clearInterval(realTimeInterval);
  }, [enableRealTime, refreshItems]);

  return {
    // 資料狀態
    categoryItems,
    cardData,
    isLoading,
    error,
    
    // 操作函數
    refreshItems,
    updateItemStatus,
    moveItem,
    completeItem,
    holdItem,
    resumeItem,
    batchOperation,
    
    // 搜尋和篩選
    searchItems,
    filterByTable,
    filterByStatus,
    
    // 統計資訊
    getStatistics,
    
    // 工具函數
    getItemById,
    getCardByNumber,
    getCardByTable,
    
    // 狀態管理
    setError,
    clearError
  };
}
