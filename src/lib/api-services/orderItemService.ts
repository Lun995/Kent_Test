import { 
  ApiResponse, 
  ApiOrderItem, 
  ApiCardData, 
  CategoryItems,
  UpdateItemStatusRequest,
  MoveItemRequest,
  BatchOperationRequest,
  SearchItemsRequest,
  StatisticsResponse
} from '../api-types';

// 品項管理 API 服務
export class OrderItemService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = '/api', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // 獲取請求標頭
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  // 處理 API 回應
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // 1. 獲取品項列表
  async getOrderItems(storeId: number, status?: string): Promise<ApiResponse<ApiOrderItem[]>> {
    const url = new URL(`${this.baseUrl}/order-items`);
    url.searchParams.append('storeId', storeId.toString());
    if (status) {
      url.searchParams.append('status', status);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiOrderItem[]>(response);
  }

  // 2. 獲取分類品項 (製作中、暫停、待製作)
  async getCategoryItems(storeId: number): Promise<ApiResponse<CategoryItems>> {
    const url = new URL(`${this.baseUrl}/order-items/categories`);
    url.searchParams.append('storeId', storeId.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<CategoryItems>(response);
  }

  // 3. 獲取牌卡資料
  async getCardData(storeId: number): Promise<ApiResponse<ApiCardData[]>> {
    const url = new URL(`${this.baseUrl}/cards`);
    url.searchParams.append('storeId', storeId.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiCardData[]>(response);
  }

  // 4. 更新品項狀態
  async updateItemStatus(request: UpdateItemStatusRequest): Promise<ApiResponse<ApiOrderItem>> {
    const response = await fetch(`${this.baseUrl}/order-items/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ApiOrderItem>(response);
  }

  // 5. 移動品項
  async moveItem(request: MoveItemRequest): Promise<ApiResponse<ApiOrderItem>> {
    const response = await fetch(`${this.baseUrl}/order-items/move`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ApiOrderItem>(response);
  }

  // 6. 批量操作
  async batchOperation(request: BatchOperationRequest): Promise<ApiResponse<ApiOrderItem[]>> {
    const response = await fetch(`${this.baseUrl}/order-items/batch`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ApiOrderItem[]>(response);
  }

  // 7. 搜尋品項
  async searchItems(request: SearchItemsRequest): Promise<ApiResponse<ApiOrderItem[]>> {
    const response = await fetch(`${this.baseUrl}/order-items/search`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ApiOrderItem[]>(response);
  }

  // 8. 獲取統計資訊
  async getStatistics(storeId: number, dateRange?: { start: string; end: string }): Promise<ApiResponse<StatisticsResponse>> {
    const url = new URL(`${this.baseUrl}/order-items/statistics`);
    url.searchParams.append('storeId', storeId.toString());
    
    if (dateRange) {
      url.searchParams.append('startDate', dateRange.start);
      url.searchParams.append('endDate', dateRange.end);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<StatisticsResponse>(response);
  }

  // 9. 完成品項
  async completeItem(itemId: string, workstationId?: number, userId?: string): Promise<ApiResponse<ApiOrderItem>> {
    const request: UpdateItemStatusRequest = {
      itemId,
      newStatus: 'completed',
      workstationId,
      userId,
      notes: '品項已完成'
    };

    return this.updateItemStatus(request);
  }

  // 10. 暫停品項
  async holdItem(itemId: string, workstationId?: number, userId?: string, notes?: string): Promise<ApiResponse<ApiOrderItem>> {
    const request: UpdateItemStatusRequest = {
      itemId,
      newStatus: 'hold',
      workstationId,
      userId,
      notes: notes || '品項暫停'
    };

    return this.updateItemStatus(request);
  }

  // 11. 恢復品項
  async resumeItem(itemId: string, workstationId?: number, userId?: string): Promise<ApiResponse<ApiOrderItem>> {
    const request: UpdateItemStatusRequest = {
      itemId,
      newStatus: 'making',
      workstationId,
      userId,
      notes: '品項恢復製作'
    };

    return this.updateItemStatus(request);
  }

  // 12. 獲取工作站當前品項
  async getWorkstationItems(workstationId: number): Promise<ApiResponse<ApiOrderItem[]>> {
    const url = new URL(`${this.baseUrl}/workstations/${workstationId}/items`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiOrderItem[]>(response);
  }

  // 13. 獲取桌號品項
  async getTableItems(tableName: string, storeId: number): Promise<ApiResponse<ApiOrderItem[]>> {
    const url = new URL(`${this.baseUrl}/order-items/table`);
    url.searchParams.append('tableName', tableName);
    url.searchParams.append('storeId', storeId.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiOrderItem[]>(response);
  }

  // 14. 更新品項備註
  async updateItemNote(itemId: string, note: string, userId?: string): Promise<ApiResponse<ApiOrderItem>> {
    const response = await fetch(`${this.baseUrl}/order-items/${itemId}/note`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ note, userId }),
    });

    return this.handleResponse<ApiOrderItem>(response);
  }

  // 15. 獲取品項歷史記錄
  async getItemHistory(itemId: string): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${this.baseUrl}/order-items/${itemId}/history`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<any[]>(response);
  }
}

// 創建預設實例
export const orderItemService = new OrderItemService();

// 導出類型
export type { ApiOrderItem, ApiCardData, CategoryItems };

