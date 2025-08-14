/**
 * 通用 API Hook
 * 提供資料獲取、載入狀態、錯誤處理等功能
 * 支援自動重新獲取、快取、樂觀更新等進階功能
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse, ApiErrorCode } from '@/types/api';

// ==================== Hook 配置介面 ====================

/**
 * API Hook 配置選項
 */
export interface UseApiOptions<T> {
  immediate?: boolean;              // 是否立即執行
  autoRefresh?: boolean;            // 是否自動刷新
  refreshInterval?: number;         // 自動刷新間隔（毫秒）
  retryCount?: number;             // 重試次數
  retryDelay?: number;             // 重試延遲（毫秒）
  onSuccess?: (data: T) => void;   // 成功回調
  onError?: (error: Error) => void; // 錯誤回調
  onFinally?: () => void;          // 完成回調
  cacheKey?: string;                // 快取鍵值
  cacheTTL?: number;                // 快取過期時間
  optimisticUpdate?: boolean;       // 是否啟用樂觀更新
}

/**
 * API Hook 狀態
 */
export interface UseApiState<T> {
  data: T | null;                  // 資料
  loading: boolean;                 // 載入狀態
  error: Error | null;              // 錯誤資訊
  isRefetching: boolean;            // 是否正在重新獲取
  isInitialized: boolean;           // 是否已初始化
}

/**
 * API Hook 返回值
 */
export interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;     // 重新獲取資料
  mutate: (data: T) => void;       // 直接更新資料
  reset: () => void;                // 重置狀態
  setData: (data: T) => void;      // 設定資料
  setError: (error: Error | null) => void; // 設定錯誤
}

// ==================== 基礎 API Hook ====================

/**
 * 基礎 API Hook
 * 用於簡單的資料獲取
 */
export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const {
    immediate = true,
    autoRefresh = false,
    refreshInterval = 30000, // 30秒
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    onFinally,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5分鐘
    optimisticUpdate = false,
  } = options;

  // 狀態管理
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    isRefetching: false,
    isInitialized: false,
  });

  // 引用管理
  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  // 快取管理
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  // 清理函數
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // 自動刷新設定
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        if (isMountedRef.current && !state.loading) {
          refetch();
        }
      }, refreshInterval);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, state.loading]);

  // 立即執行
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  // 執行資料獲取
  const execute = useCallback(async (isRefetch = false) => {
    if (!isMountedRef.current) return;

    // 檢查快取
    if (cacheKey && !isRefetch) {
      const cached = cacheRef.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        setState(prev => ({
          ...prev,
          data: cached.data,
          isInitialized: true,
        }));
        onSuccess?.(cached.data);
        return;
      }
    }

    // 設定載入狀態
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      isRefetching: isRefetch,
    }));

    // 創建中止控制器
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetcher();
      
      if (!isMountedRef.current) return;

      // 檢查回應狀態
      if (response.code === ApiErrorCode.SUCCESS) {
        const data = response.data as T;
        
        // 更新狀態
        setState(prev => ({
          ...prev,
          data,
          loading: false,
          error: null,
          isRefetching: false,
          isInitialized: true,
        }));

        // 儲存快取
        if (cacheKey) {
          cacheRef.current.set(cacheKey, {
            data,
            timestamp: Date.now(),
          });
        }

        // 執行成功回調
        onSuccess?.(data);
      } else {
        throw new Error(response.message || 'API 請求失敗');
      }

    } catch (error) {
      if (!isMountedRef.current) return;

      // 處理中止錯誤
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      // 重試邏輯
      if (retryCountRef.current < retryCount && !isRefetch) {
        retryCountRef.current++;
        setTimeout(() => {
          if (isMountedRef.current) {
            execute();
          }
        }, retryDelay);
        return;
      }

      // 更新錯誤狀態
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('未知錯誤'),
        isRefetching: false,
        isInitialized: true,
      }));

      // 執行錯誤回調
      onError?.(error instanceof Error ? error : new Error('未知錯誤'));
    } finally {
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          isRefetching: false,
        }));
        onFinally?.();
      }
    }
  }, [fetcher, cacheKey, cacheTTL, retryCount, retryDelay, onSuccess, onError, onFinally]);

  // 重新獲取資料
  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await execute(true);
  }, [execute]);

  // 直接更新資料
  const mutate = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      error: null,
    }));

    // 更新快取
    if (cacheKey) {
      cacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
    }
  }, [cacheKey]);

  // 重置狀態
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isRefetching: false,
      isInitialized: false,
    });
    retryCountRef.current = 0;
    
    // 清除快取
    if (cacheKey) {
      cacheRef.current.delete(cacheKey);
    }
  }, [cacheKey]);

  // 設定資料
  const setData = useCallback((data: T) => {
    mutate(data);
  }, [mutate]);

  // 設定錯誤
  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      error,
    }));
  }, []);

  return {
    ...state,
    refetch,
    mutate,
    reset,
    setData,
    setError,
  };
}

// ==================== 進階 API Hook ====================

/**
 * 樂觀更新 Hook
 * 支援樂觀更新的 API 操作
 */
export function useOptimisticApi<T, U>(
  fetcher: (data: U) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> & {
    onOptimisticUpdate?: (data: U) => T;
  } = {}
): UseApiReturn<T> & {
  execute: (data: U) => Promise<void>;
} {
  const {
    onOptimisticUpdate,
    ...baseOptions
  } = options;

  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const baseHook = useApi<T>(() => Promise.resolve({ code: '0000', message: '', data: null }), baseOptions);

  const execute = useCallback(async (data: U) => {
    if (onOptimisticUpdate) {
      const optimistic = onOptimisticUpdate(data);
      setOptimisticData(optimistic);
      baseHook.setData(optimistic);
    }

    try {
      const response = await fetcher(data);
      
      if (response.code === ApiErrorCode.SUCCESS) {
        baseHook.setData(response.data as T);
        setOptimisticData(null);
      } else {
        // 回滾樂觀更新
        if (baseHook.data !== optimisticData) {
          baseHook.setData(baseHook.data);
        }
        setOptimisticData(null);
        throw new Error(response.message || '操作失敗');
      }
    } catch (error) {
      // 回滾樂觀更新
      if (baseHook.data !== optimisticData) {
        baseHook.setData(baseHook.data);
      }
      setOptimisticData(null);
      throw error;
    }
  }, [fetcher, onOptimisticUpdate, baseHook, optimisticData]);

  return {
    ...baseHook,
    execute,
    data: optimisticData || baseHook.data,
  };
}

/**
 * 無限滾動 Hook
 * 支援分頁載入的無限滾動
 */
export function useInfiniteApi<T>(
  fetcher: (page: number, limit: number) => Promise<ApiResponse<T[]>>,
  options: UseApiOptions<T[]> & {
    pageSize?: number;
  } = {}
): UseApiReturn<T[]> & {
  loadMore: () => Promise<void>;
  hasMore: boolean;
  page: number;
} {
  const { pageSize = 20, ...baseOptions } = options;
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allData, setAllData] = useState<T[]>([]);
  
  const baseHook = useApi<T[]>(
    () => fetcher(page, pageSize),
    { ...baseOptions, immediate: false }
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || baseHook.loading) return;

    try {
      const response = await fetcher(page, pageSize);
      
      if (response.code === ApiErrorCode.SUCCESS && response.data) {
        const newData = response.data;
        
        if (newData.length < pageSize) {
          setHasMore(false);
        }
        
        setAllData(prev => [...prev, ...newData]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('載入更多資料失敗:', error);
    }
  }, [fetcher, page, pageSize, hasMore, baseHook.loading]);

  // 初始化載入
  useEffect(() => {
    if (baseOptions.immediate !== false) {
      loadMore();
    }
  }, []);

  return {
    ...baseHook,
    data: allData,
    loadMore,
    hasMore,
    page,
  };
}

// ==================== 工具函數 ====================

/**
 * 創建 API 鍵值
 */
export function createApiKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

/**
 * 檢查快取是否有效
 */
export function isCacheValid(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp < ttl;
}

/**
 * 格式化錯誤訊息
 */
export function formatApiError(error: Error): string {
  if (error.message.includes('fetch')) {
    return '網路連接失敗，請檢查網路設定';
  }
  
  if (error.message.includes('timeout')) {
    return '請求超時，請稍後再試';
  }
  
  return error.message || '未知錯誤';
}
