// 牌卡測試資料集合
// 包含#1~#4牌卡的完整資料結構，用於測試和開發

export interface OrderItem {
  id: string;
  name: string;
  count: number;
  table: string;
  note?: string;
}

export interface CategoryItems {
  making: OrderItem[];
  hold: OrderItem[];
  waiting: OrderItem[];
}

// 牌卡狀態定義
export type CardStatus = 1 | 2 | 3; // 1: 已完成, 2: 製作中, 3: 暫停

// 牌卡資料結構
export interface CardData {
  cardNumber: number;      // 牌卡編號 (#1, #2, #3, #4)
  tableName: string;       // 桌號 (C1, C2, C3, C4)
  status: CardStatus;      // 牌卡狀態
  items: OrderItem[];      // 品項列表
  priority: number;        // 優先級 (1最高, 4最低)
}

// 測試資料集合
export const testCardData: CardData[] = [
  {
    cardNumber: 1,
    tableName: '內用C1',
    status: 2, // 製作中
    priority: 1,
    items: [
      {
        id: 'C1-001',
        name: '雪花牛',
        count: 3,
        table: '內用C1',
        note: '油花少一點'
      },
      {
        id: 'C1-002',
        name: '雪花牛',
        count: 1,
        table: '內用C1',
        note: '雪花多一點雪花多一點雪花多一點很重要所以獎三遍'
      },
      {
        id: 'C1-003',
        name: '上選豬肉',
        count: 10,
        table: '內用C1'
      }
    ]
  },
  {
    cardNumber: 2,
    tableName: '內用C2',
    status: 1, // 待製作（不是暫停，因為HOLD應該是動態的）
    priority: 2,
    items: [
      {
        id: 'C2-001',
        name: '豬魚雙饗',
        count: 2,
        table: 'C2',
        note: '上選豬+魚片'
      },
      {
        id: 'C2-002',
        name: '絕代雙牛',
        count: 1,
        table: 'C2',
        note: '雪花牛+嫩煎牛'
      },
      {
        id: 'C2-003',
        name: '雪花牛',
        count: 1,
        table: 'C2',
        note: '油花少一點'
      }
    ]
  },
  {
    cardNumber: 3,
    tableName: '內用C3',
    status: 1, // 待製作
    priority: 3,
    items: [
      {
        id: 'C3-001',
        name: '上選豬肉',
        count: 5,
        table: 'C3'
      }
    ]
  },
  {
    cardNumber: 4,
    tableName: '內用C4',
    status: 1, // 待製作
    priority: 4,
    items: [
      {
        id: 'C4-001',
        name: '絕代雙牛',
        count: 3,
        table: 'C4'
      },
      {
        id: 'C4-002',
        name: '雪花牛',
        count: 1,
        table: 'C4',
        note: '五分熟，血水少一點'
      }
    ]
  }
];

// 轉換為 CategoryItems 格式的函數
export function convertTestCardDataToCategoryItems(cardData: CardData[]): CategoryItems {
  const making: OrderItem[] = [];
  const hold: OrderItem[] = [];
  const waiting: OrderItem[] = [];

  cardData.forEach(card => {
    if (card.status === 2) {
      // 製作中
      making.push(...card.items);
    } else if (card.status === 3) {
      // 暫停
      hold.push(...card.items);
    } else {
      // 待製作 (status = 1)
      waiting.push(...card.items);
    }
  });

  return { making, hold, waiting };
}

// 根據牌卡編號獲取牌卡資料
export function getCardByNumber(cardNumber: number): CardData | undefined {
  return testCardData.find(card => card.cardNumber === cardNumber);
}

// 根據桌號獲取牌卡資料
export function getCardByTable(tableName: string): CardData | undefined {
  return testCardData.find(card => card.tableName === tableName);
}

// 更新牌卡狀態
export function updateCardStatus(cardNumber: number, newStatus: CardStatus): void {
  const card = getCardByNumber(cardNumber);
  if (card) {
    card.status = newStatus;
    console.log(`牌卡 #${cardNumber} 狀態已更新為: ${newStatus}`);
  }
}

// 獲取待製作牌卡
export function getWaitingCards(): CardData[] {
  return testCardData.filter(card => card.status === 1);
}

// 獲取製作中牌卡
export function getMakingCards(): CardData[] {
  return testCardData.filter(card => card.status === 2);
}

// 獲取暫停牌卡
export function getHoldCards(): CardData[] {
  return testCardData.filter(card => card.status === 3);
}

// 根據優先級排序牌卡
export function sortCardsByPriority(cards: CardData[]): CardData[] {
  return [...cards].sort((a, b) => a.priority - b.priority);
}

// 獲取下一個應該製作中的牌卡
export function getNextCardToMake(): CardData | undefined {
  const waitingCards = getWaitingCards();
  if (waitingCards.length === 0) return undefined;
  
  // 按優先級排序，返回優先級最高的
  return sortCardsByPriority(waitingCards)[0];
}

// 移動牌卡到製作中
export function moveCardToMaking(cardNumber: number): boolean {
  const card = getCardByNumber(cardNumber);
  if (card && card.status === 1) {
    card.status = 2;
    console.log(`牌卡 #${cardNumber} 已移動到製作中`);
    return true;
  }
  return false;
}

// 移動牌卡到暫停
export function moveCardToHold(cardNumber: number): boolean {
  const card = getCardByNumber(cardNumber);
  if (card && card.status === 2) {
    card.status = 3;
    console.log(`牌卡 #${cardNumber} 已移動到暫停`);
    return true;
  }
  return false;
}

// 從暫停移動到製作中
export function moveCardFromHoldToMaking(cardNumber: number): boolean {
  const card = getCardByNumber(cardNumber);
  if (card && card.status === 3) {
    card.status = 2;
    console.log(`牌卡 #${cardNumber} 已從暫停移動到製作中`);
    return true;
  }
  return false;
}

// 移動牌卡到已完成
export function moveCardToCompleted(cardNumber: number): boolean {
  const card = getCardByNumber(cardNumber);
  if (card && (card.status === 2 || card.status === 3)) {
    card.status = 1; // 1 代表已完成，不會顯示在工作看板上
    console.log(`牌卡 #${cardNumber} 已完成`);
    return true;
  }
  return false;
}

// 重置所有牌卡狀態為初始狀態
export function resetAllCardStatuses(): void {
  testCardData.forEach(card => {
    if (card.cardNumber === 1) {
      card.status = 2; // #1 製作中
    } else if (card.cardNumber === 2) {
      card.status = 3; // #2 暫停
    } else {
      card.status = 1; // #3, #4 待製作
    }
  });
  console.log('所有牌卡狀態已重置');
}

// 獲取牌卡統計資訊
export function getCardStatistics() {
  const totalCards = testCardData.length;
  const makingCards = getMakingCards().length;
  const holdCards = getHoldCards().length;
  const waitingCards = getWaitingCards().length;
  const completedCards = totalCards - makingCards - holdCards - waitingCards;

  return {
    total: totalCards,
    making: makingCards,
    hold: holdCards,
    waiting: waitingCards,
    completed: completedCards
  };
}

// 測試函數：顯示所有牌卡狀態
export function displayAllCardStatuses(): void {
  console.log('=== 牌卡狀態總覽 ===');
  testCardData.forEach(card => {
    const statusText = card.status === 1 ? '待製作' : 
                      card.status === 2 ? '製作中' : '暫停';
    console.log(`#${card.cardNumber} (${card.tableName}): ${statusText}`);
  });
  console.log('==================');
}

// 測試函數：模擬牌卡流程
export function simulateCardWorkflow(): void {
  console.log('=== 開始模擬牌卡流程 ===');
  
  // 1. 顯示初始狀態
  displayAllCardStatuses();
  
  // 2. 完成 #1 牌卡
  console.log('\n步驟 1: 完成 #1 牌卡');
  moveCardToCompleted(1);
  displayAllCardStatuses();
  
  // 3. 將 #2 牌卡從暫停移動到製作中
  console.log('\n步驟 2: 將 #2 牌卡移動到製作中');
  moveCardFromHoldToMaking(2);
  displayAllCardStatuses();
  
  // 4. 完成 #2 牌卡
  console.log('\n步驟 3: 完成 #2 牌卡');
  moveCardToCompleted(2);
  displayAllCardStatuses();
  
  // 5. 將 #3 牌卡移動到製作中
  console.log('\n步驟 4: 將 #3 牌卡移動到製作中');
  moveCardToMaking(3);
  displayAllCardStatuses();
  
  console.log('\n=== 牌卡流程模擬完成 ===');
}

// 預設匯出
export default testCardData;
