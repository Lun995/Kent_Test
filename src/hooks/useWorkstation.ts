/**
 * 工作站專用 Hook
 * 整合工作站服務和 API Hook，提供工作站相關的資料操作
 */

import { useCallback } from 'react';
import { useApi, UseApiOptions } from './useApi';
import { workstationService } from '@/lib/services/workstation-service';
import { 
  KdsWorkstation, 
  WorkstationQueryParams, 
  WorkstationStatusUpdate,
  ApiResponse 
} from '@/types/api';

// ==================== 工作站查詢 Hook ====================

/**
 * 使用工作站清單 Hook
 * 獲取指定門店的工作站清單
 */
export function useWorkstations(
  storeId: number,
  params?: Partial<WorkstationQueryParams>,
  options?: UseApiOptions<KdsWorkstation[]>
) {
  const fetcher = useCallback(async () => {
    return workstationService.getWorkstationsByStore(storeId, params);
  }, [storeId, params]);

  return useApi(fetcher, {
    cacheKey: `workstations:${storeId}:${JSON.stringify(params)}`,
    cacheTTL: 2 * 60 * 1000, // 2分鐘快取
    autoRefresh: true,
    refreshInterval: 30 * 1000, // 30秒自動刷新
    ...options,
  });
}

/**
 * 使用啟用工作站清單 Hook
 * 獲取指定門店啟用的工作站清單
 */
export function useActiveWorkstations(
  storeId: number,
  options?: UseApiOptions<KdsWorkstation[]>
) {
  const fetcher = useCallback(async () => {
    return workstationService.getActiveWorkstations(storeId);
  }, [storeId]);

  return useApi(fetcher, {
    cacheKey: `active-workstations:${storeId}`,
    cacheTTL: 2 * 60 * 1000,
    autoRefresh: true,
    refreshInterval: 30 * 1000,
    ...options,
  });
}

/**
 * 使用預設工作站 Hook
 * 獲取指定門店的預設工作站
 */
export function useDefaultWorkstation(
  storeId: number,
  options?: UseApiOptions<KdsWorkstation | null>
) {
  const fetcher = useCallback(async () => {
    return workstationService.getDefaultWorkstation(storeId);
  }, [storeId]);

  return useApi(fetcher, {
    cacheKey: `default-workstation:${storeId}`,
    cacheTTL: 5 * 60 * 1000, // 5分鐘快取（預設工作站變化較少）
    ...options,
  });
}

/**
 * 使用排序工作站清單 Hook
 * 獲取按序號排序的工作站清單
 */
export function useSortedWorkstations(
  storeId: number,
  options?: UseApiOptions<KdsWorkstation[]>
) {
  const fetcher = useCallback(async () => {
    return workstationService.getWorkstationsSortedBySerial(storeId);
  }, [storeId]);

  return useApi(fetcher, {
    cacheKey: `sorted-workstations:${storeId}`,
    cacheTTL: 2 * 60 * 1000,
    autoRefresh: true,
    refreshInterval: 30 * 1000,
    ...options,
  });
}

// ==================== 工作站統計 Hook ====================

/**
 * 使用工作站統計 Hook
 * 獲取工作站統計資訊
 */
export function useWorkstationStats(
  storeId: number,
  options?: UseApiOptions<any>
) {
  const fetcher = useCallback(async () => {
    return workstationService.getWorkstationStats(storeId);
  }, [storeId]);

  return useApi(fetcher, {
    cacheKey: `workstation-stats:${storeId}`,
    cacheTTL: 5 * 60 * 1000, // 5分鐘快取
    autoRefresh: true,
    refreshInterval: 60 * 1000, // 1分鐘自動刷新
    ...options,
  });
}

// ==================== 工作站搜尋 Hook ====================

/**
 * 使用工作站搜尋 Hook
 * 搜尋工作站
 */
export function useWorkstationSearch(
  storeId: number,
  query: string,
  options?: UseApiOptions<KdsWorkstation[]>
) {
  const fetcher = useCallback(async () => {
    if (!query.trim()) {
      return { code: '0000', message: '', data: [] };
    }
    return workstationService.searchWorkstations(storeId, query);
  }, [storeId, query]);

  return useApi(fetcher, {
    cacheKey: `workstation-search:${storeId}:${query}`,
    cacheTTL: 1 * 60 * 1000, // 1分鐘快取
    immediate: !!query.trim(),
    ...options,
  });
}

// ==================== 工作站操作 Hook ====================

/**
 * 使用工作站狀態更新 Hook
 * 更新工作站狀態
 */
export function useWorkstationStatusUpdate() {
  const updateStatus = useCallback(async (
    uid: number, 
    status: Partial<WorkstationStatusUpdate>
  ): Promise<ApiResponse<KdsWorkstation>> => {
    try {
      const response = await workstationService.updateWorkstationStatus(uid, status);
      
      // 清除相關快取
      workstationService.clearWorkstationCache();
      
      return response;
    } catch (error) {
      console.error('更新工作站狀態失敗:', error);
      throw error;
    }
  }, []);

  return { updateStatus };
}

/**
 * 使用工作站批量操作 Hook
 * 批量更新工作站狀態
 */
export function useWorkstationBatchOperation() {
  const batchUpdateStatus = useCallback(async (
    updates: WorkstationStatusUpdate[]
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await workstationService.batchUpdateWorkstationStatus(updates);
      
      // 清除所有工作站快取
      workstationService.clearWorkstationCache();
      
      return response;
    } catch (error) {
      console.error('批量更新工作站狀態失敗:', error);
      throw error;
    }
  }, []);

  return { batchUpdateStatus };
}

/**
 * 使用工作站啟用/停用 Hook
 * 啟用或停用工作站
 */
export function useWorkstationToggle() {
  const enableWorkstation = useCallback(async (uid: number) => {
    try {
      const response = await workstationService.enableWorkstation(uid);
      
      // 清除相關快取
      workstationService.clearWorkstationCache();
      
      return response;
    } catch (error) {
      console.error('啟用工作站失敗:', error);
      throw error;
    }
  }, []);

  const disableWorkstation = useCallback(async (uid: number) => {
    try {
      const response = await workstationService.disableWorkstation(uid);
      
      // 清除相關快取
      workstationService.clearWorkstationCache();
      
      return response;
    } catch (error) {
      console.error('停用工作站失敗:', error);
      throw error;
    }
  }, []);

  return { enableWorkstation, disableWorkstation };
}

// ==================== 工作站快取管理 Hook ====================

/**
 * 使用工作站快取管理 Hook
 * 管理工作站相關的快取
 */
export function useWorkstationCache() {
  const clearCache = useCallback(() => {
    workstationService.clearWorkstationCache();
  }, []);

  const clearCacheItem = useCallback((key: string) => {
    workstationService.clearCacheItem(key);
  }, []);

  const getCacheStats = useCallback(() => {
    return workstationService.getCacheStats();
  }, []);

  return { clearCache, clearCacheItem, getCacheStats };
}

// ==================== 工作站選擇 Hook ====================

/**
 * 使用工作站選擇 Hook
 * 管理工作站選擇狀態
 */
export function useWorkstationSelection() {
  const [selectedWorkstations, setSelectedWorkstations] = useState<Set<number>>(new Set());

  const selectWorkstation = useCallback((uid: number) => {
    setSelectedWorkstations(prev => new Set([...prev, uid]));
  }, []);

  const unselectWorkstation = useCallback((uid: number) => {
    setSelectedWorkstations(prev => {
      const newSet = new Set(prev);
      newSet.delete(uid);
      return newSet;
    });
  }, []);

  const toggleWorkstation = useCallback((uid: number) => {
    setSelectedWorkstations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uid)) {
        newSet.delete(uid);
      } else {
        newSet.add(uid);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((workstations: KdsWorkstation[]) => {
    const uids = workstations.map(ws => ws.uid);
    setSelectedWorkstations(new Set(uids));
  }, []);

  const unselectAll = useCallback(() => {
    setSelectedWorkstations(new Set());
  }, []);

  const isSelected = useCallback((uid: number) => {
    return selectedWorkstations.has(uid);
  }, [selectedWorkstations]);

  const selectedCount = selectedWorkstations.size;

  return {
    selectedWorkstations: Array.from(selectedWorkstations),
    selectedCount,
    selectWorkstation,
    unselectWorkstation,
    toggleWorkstation,
    selectAll,
    unselectAll,
    isSelected,
  };
}

// ==================== 工作站過濾 Hook ====================

/**
 * 使用工作站過濾 Hook
 * 過濾和排序工作站
 */
export function useWorkstationFilter(
  workstations: KdsWorkstation[],
  filters: {
    search?: string;
    brandId?: number;
    status?: number;
    sortBy?: 'name' | 'serialNo' | 'createDate';
    sortOrder?: 'asc' | 'desc';
  } = {}
) {
  const filteredWorkstations = useMemo(() => {
    let filtered = [...workstations];

    // 搜尋過濾
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(ws => 
        ws.name.toLowerCase().includes(searchLower) ||
        ws.no.toLowerCase().includes(searchLower) ||
        ws.memo.toLowerCase().includes(searchLower)
      );
    }

    // 品牌過濾
    if (filters.brandId) {
      filtered = filtered.filter(ws => ws.brandId === filters.brandId);
    }

    // 狀態過濾
    if (filters.status !== undefined) {
      filtered = filtered.filter(ws => ws.status === filters.status);
    }

    // 排序
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any = a[filters.sortBy!];
        let bValue: any = b[filters.sortBy!];

        if (filters.sortBy === 'name' || filters.sortBy === 'memo') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return filtered;
  }, [workstations, filters]);

  return filteredWorkstations;
}

// ==================== 工作站監控 Hook ====================

/**
 * 使用工作站監控 Hook
 * 監控工作站狀態變化
 */
export function useWorkstationMonitor(
  storeId: number,
  options?: {
    interval?: number;
    onStatusChange?: (workstations: KdsWorkstation[]) => void;
  }
) {
  const { interval = 10000, onStatusChange } = options || {};

  const { data: workstations, refetch } = useWorkstations(storeId, undefined, {
    autoRefresh: true,
    refreshInterval: interval,
    onSuccess: onStatusChange,
  });

  const statusSummary = useMemo(() => {
    if (!workstations) return null;

    return {
      total: workstations.length,
      active: workstations.filter(ws => ws.isOn === 1 && ws.isDisabled === 0).length,
      inactive: workstations.filter(ws => ws.isOn === 0 && ws.isDisabled === 0).length,
      disabled: workstations.filter(ws => ws.isDisabled === 1).length,
      byBrand: workstations.reduce((acc, ws) => {
        acc[ws.brandId] = (acc[ws.brandId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
    };
  }, [workstations]);

  return {
    workstations,
    statusSummary,
    refetch,
  };
}
