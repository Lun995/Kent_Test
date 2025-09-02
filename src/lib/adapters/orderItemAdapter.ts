import { 
  ApiOrderItem, 
  ApiCardData, 
  CategoryItems as ApiCategoryItems 
} from '../api-types';
import { 
  OrderItem, 
  CategoryItems, 
  CardData, 
  CardStatus 
} from '../test-card-data';

// 品項資料轉換器
export class OrderItemAdapter {
  
  // 將 API 品項轉換為前端品項格式
  static apiToFrontend(apiItem: ApiOrderItem): OrderItem {
    return {
      id: apiItem.id,
      name: apiItem.name,
      count: apiItem.count,
      table: apiItem.table,
      note: apiItem.note,
    };
  }

  // 將前端品項轉換為 API 品項格式
  static frontendToApi(frontendItem: OrderItem): Partial<ApiOrderItem> {
    return {
      id: frontendItem.id,
      name: frontendItem.name,
      count: frontendItem.count,
      table: frontendItem.table,
      note: frontendItem.note,
    };
  }

  // 將 API 狀態轉換為前端狀態
  static apiStatusToFrontend(apiStatus: string): CardStatus {
    switch (apiStatus) {
      case 'waiting':
        return 1; // 待製作
      case 'making':
        return 2; // 製作中
      case 'hold':
        return 3; // 暫停
      case 'completed':
        return 1; // 已完成 (前端不顯示，所以歸類為待製作)
      default:
        return 1; // 預設為待製作
    }
  }

  // 將前端狀態轉換為 API 狀態
  static frontendStatusToApi(frontendStatus: CardStatus): 'waiting' | 'making' | 'hold' | 'completed' {
    switch (frontendStatus) {
      case 1:
        return 'waiting';
      case 2:
        return 'making';
      case 3:
        return 'hold';
      default:
        return 'waiting';
    }
  }

  // 將 API 牌卡轉換為前端牌卡格式
  static apiCardToFrontend(apiCard: ApiCardData): CardData {
    return {
      cardNumber: apiCard.cardNumber,
      tableName: apiCard.tableName,
      status: this.apiStatusToFrontend(apiCard.status),
      priority: apiCard.priority,
      items: apiCard.items.map(item => this.apiToFrontend(item)),
    };
  }

  // 將前端牌卡轉換為 API 牌卡格式
  static frontendCardToApi(frontendCard: CardData): Partial<ApiCardData> {
    return {
      cardNumber: frontendCard.cardNumber,
      tableName: frontendCard.tableName,
      status: this.frontendStatusToApi(frontendCard.status),
      priority: frontendCard.priority,
      items: frontendCard.items.map(item => this.frontendToApi(item) as ApiOrderItem),
    };
  }

  // 將 API 分類品項轉換為前端分類品項格式
  static apiCategoryToFrontend(apiCategory: ApiCategoryItems): CategoryItems {
    return {
      making: apiCategory.making.map(item => this.apiToFrontend(item)),
      hold: apiCategory.hold.map(item => this.apiToFrontend(item)),
      waiting: apiCategory.waiting.map(item => this.apiToFrontend(item)),
    };
  }

  // 將前端分類品項轉換為 API 分類品項格式
  static frontendCategoryToApi(frontendCategory: CategoryItems): ApiCategoryItems {
    return {
      making: frontendCategory.making.map(item => this.frontendToApi(item) as ApiOrderItem),
      hold: frontendCategory.hold.map(item => this.frontendToApi(item) as ApiOrderItem),
      waiting: frontendCategory.waiting.map(item => this.frontendToApi(item) as ApiOrderItem),
    };
  }

  // 批量轉換 API 品項列表
  static batchApiToFrontend(apiItems: ApiOrderItem[]): OrderItem[] {
    return apiItems.map(item => this.apiToFrontend(item));
  }

  // 批量轉換前端品項列表
  static batchFrontendToApi(frontendItems: OrderItem[]): Partial<ApiOrderItem>[] {
    return frontendItems.map(item => this.frontendToApi(item));
  }

  // 批量轉換 API 牌卡列表
  static batchApiCardToFrontend(apiCards: ApiCardData[]): CardData[] {
    return apiCards.map(card => this.apiCardToFrontend(card));
  }

  // 批量轉換前端牌卡列表
  static batchFrontendCardToApi(frontendCards: CardData[]): Partial<ApiCardData>[] {
    return frontendCards.map(card => this.frontendCardToApi(card));
  }

  // 合併 API 和前端資料 (用於增量更新)
  static mergeApiWithFrontend(
    frontendItems: OrderItem[], 
    apiItems: ApiOrderItem[]
  ): OrderItem[] {
    const frontendMap = new Map(frontendItems.map(item => [item.id, item]));
    
    apiItems.forEach(apiItem => {
      const frontendItem = this.apiToFrontend(apiItem);
      frontendMap.set(apiItem.id, frontendItem);
    });

    return Array.from(frontendMap.values());
  }

  // 過濾已完成的品項
  static filterCompletedItems(items: OrderItem[]): OrderItem[] {
    return items.filter(item => {
      // 這裡可以根據業務邏輯判斷品項是否完成
      // 目前簡單地保留所有品項
      return true;
    });
  }

  // 根據優先級排序品項
  static sortByPriority(items: OrderItem[], priorities: Map<string, number>): OrderItem[] {
    return [...items].sort((a, b) => {
      const priorityA = priorities.get(a.id) || 999;
      const priorityB = priorities.get(b.id) || 999;
      return priorityA - priorityB;
    });
  }

  // 驗證品項資料完整性
  static validateItem(item: OrderItem): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.id) errors.push('品項ID不能為空');
    if (!item.name) errors.push('品項名稱不能為空');
    if (item.count <= 0) errors.push('品項數量必須大於0');
    if (!item.table) errors.push('桌號不能為空');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 驗證牌卡資料完整性
  static validateCard(card: CardData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (card.cardNumber <= 0) errors.push('牌卡編號必須大於0');
    if (!card.tableName) errors.push('桌號不能為空');
    if (card.priority <= 0) errors.push('優先級必須大於0');
    if (!card.items || card.items.length === 0) errors.push('牌卡必須包含品項');

    // 驗證品項
    card.items.forEach((item, index) => {
      const itemValidation = this.validateItem(item);
      if (!itemValidation.isValid) {
        itemValidation.errors.forEach(error => {
          errors.push(`品項 ${index + 1}: ${error}`);
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 創建預設實例
export const orderItemAdapter = new OrderItemAdapter();

// 導出類型
export type { OrderItem, CategoryItems, CardData, CardStatus };
