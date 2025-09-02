/**
 * API 配置管理模組
 * 根據環境變數動態選擇 API 來源
 */

// 環境類型定義
export type ApiEnvironment = 'local' | 'dev' | 'prod';

// API 配置介面
export interface ApiConfig {
  baseUrl: string;
  environment: ApiEnvironment;
}

// 預設配置
const DEFAULT_CONFIG: Record<ApiEnvironment, ApiConfig> = {
  local: {
    baseUrl: 'http://localhost:5000',
    environment: 'local'
  },
  dev: {
    baseUrl: 'https://dev-api.example.com', // 待設定實際測試環境 URL
    environment: 'dev'
  },
  prod: {
    baseUrl: 'https://api.example.com', // 待設定實際正式環境 URL
    environment: 'prod'
  }
};

/**
 * 獲取當前環境的 API 配置
 */
export function getApiConfig(): ApiConfig {
  // 從環境變數獲取當前環境，預設為 'local'
  const env = (process.env.NEXT_PUBLIC_API_ENV as ApiEnvironment) || 'local';
  
  // 如果環境變數中有自定義的 baseUrl，則使用自定義值
  const customBaseUrl = process.env[`NEXT_PUBLIC_${env.toUpperCase()}_API_BASE_URL`];
  
  if (customBaseUrl) {
    return {
      baseUrl: customBaseUrl,
      environment: env
    };
  }
  
  // 否則使用預設配置
  return DEFAULT_CONFIG[env];
}

/**
 * 建構完整的 API URL
 */
export function buildApiUrl(endpoint: string): string {
  const config = getApiConfig();
  const baseUrl = config.baseUrl.replace(/\/$/, ''); // 移除結尾的斜線
  const cleanEndpoint = endpoint.replace(/^\//, ''); // 移除開頭的斜線
  
  return `${baseUrl}/${cleanEndpoint}`;
}

/**
 * 獲取工作站清單 API URL
 */
export function getWorkstationListUrl(storeId: number): string {
  return buildApiUrl(`/api/Kds/GetKdsWorkStationList?storeId=${storeId}`);
}

/**
 * 獲取訂單項目分類 API URL
 */
export function getOrderItemsCategoriesUrl(storeId: number): string {
  return buildApiUrl(`/api/OrderItems/GetCategories?storeId=${storeId}`);
}

/**
 * 獲取當前環境資訊
 */
export function getCurrentEnvironment(): ApiEnvironment {
  return getApiConfig().environment;
}

/**
 * 檢查是否為本地環境
 */
export function isLocalEnvironment(): boolean {
  return getCurrentEnvironment() === 'local';
}

/**
 * 檢查是否為測試環境
 */
export function isDevEnvironment(): boolean {
  return getCurrentEnvironment() === 'dev';
}

/**
 * 檢查是否為正式環境
 */
export function isProdEnvironment(): boolean {
  return getCurrentEnvironment() === 'prod';
}
