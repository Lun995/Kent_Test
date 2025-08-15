/**
 * API 客戶端基礎類別
 * 提供統一的 HTTP 請求處理、認證、錯誤處理、快取等功能
 * 支援請求攔截器、回應攔截器、重試機制等進階功能
 */

// 請求攔截器介面
export interface RequestInterceptor {
  (config: RequestConfig): RequestConfig | Promise<RequestConfig>;
}

// 回應攔截器介面
export interface ResponseInterceptor {
  (response: Response, config: RequestConfig): Response | Promise<Response>;
}

// 請求配置介面
export interface RequestConfig extends Omit<RequestInit, 'cache'> {
  url: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

// API 配置介面
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  enableCache: boolean;
  defaultCacheTTL: number;
}

/**
 * API 客戶端主類別
 */
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private cache = new Map<string, { data: any; timestamp: number }>();
  
  // 預設配置
  private config: ApiConfig = {
    baseURL: process.env.BACKEND_API_URL || 'http://localhost:5000',
    timeout: parseInt(process.env.API_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3'),
    enableCache: process.env.API_CACHE_ENABLED === 'true',
    defaultCacheTTL: 5 * 60 * 1000, // 5分鐘
  };

  constructor(config?: Partial<ApiConfig>) {
    this.config = { ...this.config, ...config };
    this.baseURL = this.config.baseURL;
  }

  /**
   * 設定認證 Token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * 清除認證 Token
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * 添加請求攔截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 添加回應攔截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 執行請求攔截器
   */
  private async executeRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let finalConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }
    
    return finalConfig;
  }

  /**
   * 執行回應攔截器
   */
  private async executeResponseInterceptors(response: Response, config: RequestConfig): Promise<Response> {
    let finalResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse, config);
    }
    
    return finalResponse;
  }

  /**
   * 獲取認證標頭
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * 檢查快取是否有效
   */
  private isCacheValid(key: string, ttl: number): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    return Date.now() - cached.timestamp < ttl;
  }

  /**
   * 從快取獲取資料
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  /**
   * 儲存資料到快取
   */
  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  /**
   * 清除快取
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 清除特定快取項目
   */
  clearCacheItem(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 延遲函數
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 判斷錯誤是否可重試
   */
  private isRetryableError(error: any): boolean {
    // 網路錯誤、5xx 伺服器錯誤、429 請求過多等可以重試
    if (error.name === 'TypeError' && error.message.includes('fetch')) return true;
    if (error.status >= 500) return true;
    if (error.status === 429) return true;
    return false;
  }

  /**
   * 核心請求方法
   */
  async request<T>(config: RequestConfig): Promise<T> {
    try {
      // 1. 執行請求攔截器
      const finalConfig = await this.executeRequestInterceptors(config);
      
      // 2. 檢查快取
      if (finalConfig.cache && this.config.enableCache) {
        const cacheKey = `${finalConfig.method || 'GET'}:${finalConfig.url}`;
        const cachedData = this.getFromCache<T>(cacheKey);
        if (cachedData && this.isCacheValid(cacheKey, finalConfig.cacheTTL || this.config.defaultCacheTTL)) {
          return cachedData;
        }
      }

      // 3. 準備請求配置
      const requestConfig: RequestInit = {
        method: finalConfig.method || 'GET',
        headers: {
          ...this.getAuthHeaders(),
          ...finalConfig.headers,
        },
        body: finalConfig.body,
        signal: AbortSignal.timeout(finalConfig.timeout || this.config.timeout),
      };

      // 4. 發送請求
      const response = await fetch(`${this.baseURL}${finalConfig.url}`, requestConfig);
      
      // 5. 執行回應攔截器
      const finalResponse = await this.executeResponseInterceptors(response, finalConfig);
      
      // 6. 檢查回應狀態
      if (!finalResponse.ok) {
        throw new ApiError(
          `HTTP ${finalResponse.status}: ${finalResponse.statusText}`,
          finalResponse.status,
          finalResponse.statusText
        );
      }

      // 7. 解析回應資料
      const data = await finalResponse.json();
      
      // 8. 儲存到快取
      if (finalConfig.cache && this.config.enableCache) {
        const cacheKey = `${finalConfig.method || 'GET'}:${finalConfig.url}`;
        this.setCache(cacheKey, data, finalConfig.cacheTTL || this.config.defaultCacheTTL);
      }

      return data;
      
    } catch (error) {
      // 9. 錯誤處理
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('請求超時', 408, 'TIMEOUT');
      }
      
      throw new ApiError(
        (error instanceof Error ? error.message : '網路請求失敗') || '網路請求失敗',
        500,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * GET 請求
   */
  async get<T>(endpoint: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({
      url: endpoint,
      method: 'GET',
      cache: true,
      ...config,
    });
  }

  /**
   * POST 請求
   */
  async post<T>(endpoint: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({
      url: endpoint,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      cache: false,
      ...config,
    });
  }

  /**
   * PUT 請求
   */
  async put<T>(endpoint: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({
      url: endpoint,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      cache: false,
      ...config,
    });
  }

  /**
   * PATCH 請求
   */
  async patch<T>(endpoint: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({
      url: endpoint,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      cache: false,
      ...config,
    });
  }

  /**
   * DELETE 請求
   */
  async delete<T>(endpoint: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({
      url: endpoint,
      method: 'DELETE',
      cache: false,
      ...config,
    });
  }

  /**
   * 帶重試機制的請求
   */
  async requestWithRetry<T>(config: RequestConfig): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= (config.retries || this.config.retryAttempts); attempt++) {
      try {
        return await this.request<T>(config);
      } catch (error) {
        lastError = error;
        
        if (attempt === (config.retries || this.config.retryAttempts)) {
          break;
        }
        
        if (!this.isRetryableError(error)) {
          break;
        }
        
        // 指數退避延遲
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await this.delay(delayMs);
      }
    }
    
    throw lastError instanceof Error ? lastError : new Error('未知錯誤');
  }
}

/**
 * API 錯誤類別
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 建立預設的 API 客戶端實例
 */
export const apiClient = new ApiClient();

// 添加預設的請求攔截器
apiClient.addRequestInterceptor((config) => {
  // 添加請求 ID 用於追蹤
  const requestId = Math.random().toString(36).substring(7);
  config.headers = {
    ...config.headers,
    'X-Request-ID': requestId,
  };
  return config;
});

// 添加預設的回應攔截器
apiClient.addResponseInterceptor(async (response, config) => {
  // 記錄 API 呼叫統計
  console.log(`API Call: ${config.method || 'GET'} ${config.url} - ${response.status}`);
  return response;
});
