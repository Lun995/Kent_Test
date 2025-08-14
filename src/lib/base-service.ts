/**
 * 基礎服務類別
 * 提供通用的 CRUD 操作和業務邏輯處理
 * 所有具體的業務服務都繼承自此類別
 */

import { ApiClient, RequestConfig } from './api-client';
import { ApiResponse, PaginationParams, QueryParams } from '@/types/api';

/**
 * 基礎服務配置
 */
export interface BaseServiceConfig {
  endpoint: string;                // API 端點
  enableCache?: boolean;           // 是否啟用快取
  cacheTTL?: number;              // 快取過期時間
  defaultLimit?: number;           // 預設分頁數量
}

/**
 * 基礎服務類別
 * 提供通用的 CRUD 操作
 */
export abstract class BaseService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  protected apiClient: ApiClient;
  protected endpoint: string;
  protected config: BaseServiceConfig;

  constructor(apiClient: ApiClient, config: BaseServiceConfig) {
    this.apiClient = apiClient;
    this.config = {
      enableCache: true,
      cacheTTL: 5 * 60 * 1000, // 5分鐘
      defaultLimit: 20,
      ...config,
    };
    this.endpoint = config.endpoint;
  }

  /**
   * 獲取所有資料
   */
  async getAll(params?: PaginationParams): Promise<ApiResponse<T[]>> {
    const queryParams = this.buildQueryParams(params);
    return this.apiClient.get<ApiResponse<T[]>>(`${this.endpoint}?${queryParams}`);
  }

  /**
   * 根據 ID 獲取單一資料
   */
  async getById(id: string | number): Promise<ApiResponse<T>> {
    return this.apiClient.get<ApiResponse<T>>(`${this.endpoint}/${id}`);
  }

  /**
   * 創建新資料
   */
  async create(data: CreateDto): Promise<ApiResponse<T>> {
    return this.apiClient.post<ApiResponse<T>>(this.endpoint, data);
  }

  /**
   * 更新資料
   */
  async update(id: string | number, data: UpdateDto): Promise<ApiResponse<T>> {
    return this.apiClient.put<ApiResponse<T>>(`${this.endpoint}/${id}`, data);
  }

  /**
   * 部分更新資料
   */
  async patch(id: string | number, data: Partial<UpdateDto>): Promise<ApiResponse<T>> {
    return this.apiClient.patch<ApiResponse<T>>(`${this.endpoint}/${id}`, data);
  }

  /**
   * 刪除資料
   */
  async delete(id: string | number): Promise<ApiResponse<void>> {
    return this.apiClient.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }

  /**
   * 批量操作
   */
  async batchOperation(operation: string, ids: (string | number)[], data?: any): Promise<ApiResponse<any>> {
    return this.apiClient.post<ApiResponse<any>>(`${this.endpoint}/batch`, {
      operation,
      ids,
      data,
    });
  }

  /**
   * 搜尋資料
   */
  async search(query: string, params?: PaginationParams): Promise<ApiResponse<T[]>> {
    const searchParams = {
      ...params,
      q: query,
    };
    const queryString = this.buildQueryParams(searchParams);
    return this.apiClient.get<ApiResponse<T[]>>(`${this.endpoint}/search?${queryString}`);
  }

  /**
   * 根據條件查詢資料
   */
  async findByCondition(condition: QueryParams, params?: PaginationParams): Promise<ApiResponse<T[]>> {
    const queryParams = {
      ...params,
      ...condition,
    };
    const queryString = this.buildQueryParams(queryParams);
    return this.apiClient.get<ApiResponse<T[]>>(`${this.endpoint}/filter?${queryString}`);
  }

  /**
   * 檢查資料是否存在
   */
  async exists(id: string | number): Promise<boolean> {
    try {
      const response = await this.getById(id);
      return response.code === '0000' && response.data !== null;
    } catch {
      return false;
    }
  }

  /**
   * 獲取資料數量
   */
  async count(condition?: QueryParams): Promise<number> {
    try {
      const queryString = condition ? this.buildQueryParams(condition) : '';
      const response = await this.apiClient.get<ApiResponse<{ count: number }>>(
        `${this.endpoint}/count${queryString ? `?${queryString}` : ''}`
      );
      return response.code === '0000' ? response.data?.count || 0 : 0;
    } catch {
      return 0;
    }
  }

  /**
   * 清除相關快取
   */
  clearCache(): void {
    this.apiClient.clearCache();
  }

  /**
   * 清除特定快取項目
   */
  clearCacheItem(key: string): void {
    this.apiClient.clearCacheItem(key);
  }

  /**
   * 構建查詢參數字串
   */
  protected buildQueryParams(params?: QueryParams): string {
    if (!params) return '';
    
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    
    return searchParams.toString();
  }

  /**
   * 處理 API 回應
   */
  protected handleResponse<T>(response: ApiResponse<T>): T {
    if (response.code !== '0000') {
      throw new Error(response.message || 'API 請求失敗');
    }
    return response.data as T;
  }

  /**
   * 處理錯誤
   */
  protected handleError(error: any): never {
    console.error(`Service error in ${this.constructor.name}:`, error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('未知錯誤');
  }

  /**
   * 驗證資料
   */
  protected validateData(data: any, schema?: any): boolean {
    // 這裡可以整合 Joi、Yup 等驗證庫
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // 基本驗證邏輯
    return true;
  }

  /**
   * 轉換資料格式
   */
  protected transformData(data: any): T {
    // 子類別可以覆寫此方法來實現資料轉換
    return data as T;
  }

  /**
   * 準備請求配置
   */
  protected prepareRequestConfig(config?: Partial<RequestConfig>): RequestConfig {
    return {
      cache: this.config.enableCache,
      cacheTTL: this.config.cacheTTL,
      ...config,
    };
  }
}

/**
 * 分頁服務類別
 * 擴展基礎服務，提供分頁相關功能
 */
export abstract class PaginatedService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> 
  extends BaseService<T, CreateDto, UpdateDto> {
  
  /**
   * 獲取分頁資料
   */
  async getPaginated(
    page: number = 1,
    limit: number = this.config.defaultLimit!,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<ApiResponse<T[]>> {
    const params: PaginationParams = {
      page,
      limit,
      sortBy,
      sortOrder,
    };
    
    return this.getAll(params);
  }

  /**
   * 獲取所有資料（不分頁）
   */
  async getAllWithoutPagination(): Promise<ApiResponse<T[]>> {
    return this.apiClient.get<ApiResponse<T[]>>(`${this.endpoint}/all`);
  }

  /**
   * 獲取資料統計
   */
  async getStats(): Promise<ApiResponse<any>> {
    return this.apiClient.get<ApiResponse<any>>(`${this.endpoint}/stats`);
  }
}

/**
 * 快取服務類別
 * 擴展基礎服務，提供進階快取功能
 */
export abstract class CachedService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> 
  extends BaseService<T, CreateDto, UpdateDto> {
  
  private localCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  /**
   * 從快取獲取資料
   */
  protected getFromLocalCache<T>(key: string): T | null {
    const cached = this.localCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.localCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * 儲存資料到本地快取
   */
  protected setLocalCache(key: string, data: any, ttl: number = this.config.cacheTTL!): void {
    this.localCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * 清除本地快取
   */
  clearLocalCache(): void {
    this.localCache.clear();
  }

  /**
   * 清除過期的快取項目
   */
  protected cleanupExpiredCache(): void {
    const now = Date.now();
    
    for (const [key, cached] of this.localCache.entries()) {
      if (now > cached.timestamp + cached.ttl) {
        this.localCache.delete(key);
      }
    }
  }

  /**
   * 獲取快取統計
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.localCache.size,
      keys: Array.from(this.localCache.keys()),
    };
  }
}
