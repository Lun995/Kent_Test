/**
 * API 配置測試腳本
 * 用於驗證環境配置功能是否正常運作
 */

import { 
  getApiConfig, 
  buildApiUrl, 
  getWorkstationListUrl, 
  getCurrentEnvironment,
  isLocalEnvironment,
  isDevEnvironment,
  isProdEnvironment
} from './api-config';

export function testApiConfig() {
  console.log('=== API 配置測試 ===');
  
  // 測試環境資訊
  console.log('當前環境:', getCurrentEnvironment());
  console.log('是否為本地環境:', isLocalEnvironment());
  console.log('是否為測試環境:', isDevEnvironment());
  console.log('是否為正式環境:', isProdEnvironment());
  
  // 測試 API 配置
  const config = getApiConfig();
  console.log('API 配置:', config);
  
  // 測試 URL 建構
  const workstationUrl = getWorkstationListUrl(504);
  console.log('工作站清單 URL:', workstationUrl);
  
  // 測試其他端點 URL 建構
  const customUrl = buildApiUrl('/api/test/endpoint');
  console.log('自定義端點 URL:', customUrl);
  
  console.log('=== 測試完成 ===');
}

// 如果在瀏覽器環境中，可以直接呼叫
if (typeof window !== 'undefined') {
  // 延遲執行，確保頁面載入完成
  setTimeout(() => {
    testApiConfig();
  }, 1000);
}
