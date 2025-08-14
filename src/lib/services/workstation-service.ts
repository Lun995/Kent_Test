/**
 * 工作站服務類別
 * 負責處理工作站相關的業務邏輯和資料操作
 * 繼承基礎服務類別，提供工作站特定的功能
 */

import { BaseService } from '../base-service';
import { apiClient } from '../api-client';
import { 
  KdsWorkstation, 
  WorkstationQueryParams, 
  ApiResponse,
  ApiErrorCode 
} from '@/types/api';

/**
 * 工作站服務配置
 */
export interface WorkstationServiceConfig {
  endpoint: string;
  enableCache?: boolean;
  cacheTTL?: number;
  defaultLimit?: number;
}

/**
 * 工作站狀態更新請求
 */
export interface WorkstationStatusUpdate {
  uid: number;
  isOn: number;
  isDisabled: number;
  status: number;
}

/**
 * 工作站批量操作請求
 */
export interface WorkstationBatchOperation {
  operation: 'enable' | 'disable' | 'delete' | 'update';
  workstations: number[];
  data?: Partial<KdsWorkstation>;
}

/**
 * 工作站統計資訊
 */
export interface WorkstationStats {
  total: number;
  active: number;
  inactive: number;
  disabled: number;
  byBrand: Record<number, number>;
  byStatus: Record<number, number>;
}

/**
 * 工作站服務類別
 */
export class WorkstationService extends BaseService<KdsWorkstation, Partial<KdsWorkstation>, Partial<KdsWorkstation>> {
  
  constructor(config?: Partial<WorkstationServiceConfig>) {
    super(apiClient, {
      endpoint: '/api/kds/workstations',
      enableCache: true,
      cacheTTL: 2 * 60 * 1000, // 2分鐘快取（工作站資料變化較頻繁）
      defaultLimit: 50,
      ...config,
    });
  }

  /**
   * 根據門店ID獲取工作站清單
   * 這是主要的業務方法，符合 A01-GET-KDS工作站 API 規格
   */
  async getWorkstationsByStore(storeId: number, params?: Partial<WorkstationQueryParams>): Promise<ApiResponse<KdsWorkstation[]>> {
    try {
      // 構建查詢參數
      const queryParams: WorkstationQueryParams = {
        storeId,
        ...params,
      };

      // 呼叫外部 API
      const response = await this.apiClient.get<ApiResponse<KdsWorkstation[]>>(
        `${this.endpoint}?${this.buildQueryParams(queryParams)}`
      );

      // 驗證回應格式
      if (!this.validateWorkstationResponse(response)) {
        throw new Error('工作站 API 回應格式無效');
      }

      // 處理和過濾資料
      const processedData = this.processWorkstationData(response.data || []);
      
      return {
        ...response,
        data: processedData,
      };

    } catch (error) {
      console.error('獲取工作站清單失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取啟用的工作站清單
   */
  async getActiveWorkstations(storeId: number): Promise<ApiResponse<KdsWorkstation[]>> {
    return this.getWorkstationsByStore(storeId, {
      isOn: 1,
      isDisabled: 0,
    });
  }

  /**
   * 獲取預設工作站
   */
  async getDefaultWorkstation(storeId: number): Promise<ApiResponse<KdsWorkstation | null>> {
    try {
      const response = await this.getWorkstationsByStore(storeId, {
        isDefault: 1,
        isOn: 1,
        isDisabled: 0,
      });

      if (response.data && response.data.length > 0) {
        return {
          ...response,
          data: response.data[0],
        };
      }

      return {
        ...response,
        data: null,
      };

    } catch (error) {
      console.error('獲取預設工作站失敗:', error);
      throw error;
    }
  }

  /**
   * 根據序號排序獲取工作站
   */
  async getWorkstationsSortedBySerial(storeId: number): Promise<ApiResponse<KdsWorkstation[]>> {
    const response = await this.getWorkstationsByStore(storeId);
    
    if (response.data) {
      const sortedData = [...response.data].sort((a, b) => a.serialNo - b.serialNo);
      return {
        ...response,
        data: sortedData,
      };
    }

    return response;
  }

  /**
   * 更新工作站狀態
   */
  async updateWorkstationStatus(uid: number, status: Partial<WorkstationStatusUpdate>): Promise<ApiResponse<KdsWorkstation>> {
    try {
      // 驗證更新資料
      if (!this.validateStatusUpdate(status)) {
        throw new Error('工作站狀態更新資料無效');
      }

      const response = await this.apiClient.patch<ApiResponse<KdsWorkstation>>(
        `${this.endpoint}/${uid}/status`,
        status
      );

      // 清除相關快取
      this.clearWorkstationCache(uid);

      return response;

    } catch (error) {
      console.error('更新工作站狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 批量更新工作站狀態
   */
  async batchUpdateWorkstationStatus(updates: WorkstationStatusUpdate[]): Promise<ApiResponse<any>> {
    try {
      // 驗證批量更新資料
      if (!this.validateBatchStatusUpdate(updates)) {
        throw new Error('批量工作站狀態更新資料無效');
      }

      const response = await this.apiClient.post<ApiResponse<any>>(
        `${this.endpoint}/batch/status`,
        { updates }
      );

      // 清除所有工作站快取
      this.clearCache();

      return response;

    } catch (error) {
      console.error('批量更新工作站狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 啟用工作站
   */
  async enableWorkstation(uid: number): Promise<ApiResponse<KdsWorkstation>> {
    return this.updateWorkstationStatus(uid, {
      uid,
      isOn: 1,
      isDisabled: 0,
      status: 1,
    });
  }

  /**
   * 停用工作站
   */
  async disableWorkstation(uid: number): Promise<ApiResponse<KdsWorkstation>> {
    return this.updateWorkstationStatus(uid, {
      uid,
      isOn: 0,
      isDisabled: 0,
      status: 0,
    });
  }

  /**
   * 獲取工作站統計資訊
   */
  async getWorkstationStats(storeId: number): Promise<ApiResponse<WorkstationStats>> {
    try {
      const response = await this.apiClient.get<ApiResponse<WorkstationStats>>(
        `${this.endpoint}/stats?storeId=${storeId}`
      );

      return response;

    } catch (error) {
      console.error('獲取工作站統計失敗:', error);
      
      // 如果統計 API 不可用，則手動計算
      return this.calculateWorkstationStats(storeId);
    }
  }

  /**
   * 手動計算工作站統計資訊
   */
  private async calculateWorkstationStats(storeId: number): Promise<ApiResponse<WorkstationStats>> {
    try {
      const response = await this.getWorkstationsByStore(storeId);
      
      if (!response.data) {
        return {
          message: '無法獲取工作站資料',
          code: ApiErrorCode.INTERNAL_ERROR,
          data: null,
        };
      }

      const workstations = response.data;
      const stats: WorkstationStats = {
        total: workstations.length,
        active: workstations.filter(ws => ws.isOn === 1 && ws.isDisabled === 0).length,
        inactive: workstations.filter(ws => ws.isOn === 0 && ws.isDisabled === 0).length,
        disabled: workstations.filter(ws => ws.isDisabled === 1).length,
        byBrand: {},
        byStatus: {},
      };

      // 按品牌統計
      workstations.forEach(ws => {
        stats.byBrand[ws.brandId] = (stats.byBrand[ws.brandId] || 0) + 1;
      });

      // 按狀態統計
      workstations.forEach(ws => {
        stats.byStatus[ws.status] = (stats.byStatus[ws.status] || 0) + 1;
      });

      return {
        message: '統計計算成功',
        code: ApiErrorCode.SUCCESS,
        data: stats,
      };

    } catch (error) {
      console.error('計算工作站統計失敗:', error);
      throw error;
    }
  }

  /**
   * 搜尋工作站
   */
  async searchWorkstations(storeId: number, query: string): Promise<ApiResponse<KdsWorkstation[]>> {
    try {
      const response = await this.apiClient.get<ApiResponse<KdsWorkstation[]>>(
        `${this.endpoint}/search?storeId=${storeId}&q=${encodeURIComponent(query)}`
      );

      return response;

    } catch (error) {
      console.error('搜尋工作站失敗:', error);
      
      // 如果搜尋 API 不可用，則本地搜尋
      return this.localSearchWorkstations(storeId, query);
    }
  }

  /**
   * 本地搜尋工作站
   */
  private async localSearchWorkstations(storeId: number, query: string): Promise<ApiResponse<KdsWorkstation[]>> {
    try {
      const response = await this.getWorkstationsByStore(storeId);
      
      if (!response.data) {
        return {
          message: '無法獲取工作站資料',
          code: ApiErrorCode.INTERNAL_ERROR,
          data: null,
        };
      }

      const workstations = response.data;
      const searchQuery = query.toLowerCase();
      
      const filteredWorkstations = workstations.filter(ws => 
        ws.name.toLowerCase().includes(searchQuery) ||
        ws.no.toLowerCase().includes(searchQuery) ||
        ws.memo.toLowerCase().includes(searchQuery)
      );

      return {
        message: '本地搜尋成功',
        code: ApiErrorCode.SUCCESS,
        data: filteredWorkstations,
      };

    } catch (error) {
      console.error('本地搜尋工作站失敗:', error);
      throw error;
    }
  }

  /**
   * 驗證工作站回應格式
   */
  private validateWorkstationResponse(response: any): boolean {
    return response && 
           typeof response.message === 'string' && 
           typeof response.code === 'string' && 
           (response.data === null || Array.isArray(response.data));
  }

  /**
   * 驗證狀態更新資料
   */
  private validateStatusUpdate(status: Partial<WorkstationStatusUpdate>): boolean {
    if (!status.uid || typeof status.uid !== 'number') {
      return false;
    }

    // 檢查至少有一個狀態欄位被更新
    const hasStatusField = 'isOn' in status || 'isDisabled' in status || 'status' in status;
    if (!hasStatusField) {
      return false;
    }

    return true;
  }

  /**
   * 驗證批量狀態更新資料
   */
  private validateBatchStatusUpdate(updates: WorkstationStatusUpdate[]): boolean {
    if (!Array.isArray(updates) || updates.length === 0) {
      return false;
    }

    return updates.every(update => this.validateStatusUpdate(update));
  }

  /**
   * 處理工作站資料
   */
  private processWorkstationData(workstations: KdsWorkstation[]): KdsWorkstation[] {
    return workstations
      .filter(ws => ws.isOn === 1 && ws.isDisabled === 0) // 只保留啟用的工作站
      .sort((a, b) => a.serialNo - b.serialNo); // 按序號排序
  }

  /**
   * 清除特定工作站快取
   */
  private clearWorkstationCache(uid: number): void {
    this.clearCacheItem(`workstation:${uid}`);
  }

  /**
   * 清除工作站相關快取
   */
  clearWorkstationCache(): void {
    this.clearCache();
  }
}

/**
 * 建立工作站服務實例
 */
export const workstationService = new WorkstationService();
