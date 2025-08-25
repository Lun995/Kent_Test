"use client";
import { useState, useEffect } from 'react';
import { 
  LeftSidebar, 
  StatusBar, 
  WorkBoard, 
  PartialCancelModal, 
  SelectItemModal, 
  BackupScreen 
} from '../../components/WorkstationBoard';
import { HoldItemModal } from '../../components/WorkstationBoard/HoldItemModal';
import { useIsMobile } from '../../hooks/useIsMobile';

import { mainPageStyles } from '../../styles/mainPageStyles';

// 型別定義
interface OrderItem {
  id: string;
  name: string;
  count: number;
  table: string;
  note?: string;
}

interface CategoryItems {
  making: OrderItem[];
  hold: OrderItem[];
  waiting: OrderItem[];
}



// 工作站介面 - 更新為符合 KDS API 規格
interface Workstation {
  uid: number;
  no: string;
  name: string;
  brandId: number;
  storeId: number;
  isOn: number;
  serialNo: number;
  memo: string;
  creatorId: number;
  createDate: string;
  modifyId: number;
  modifyDate: string;
  isDisabled: number;
  status: number;
  companyId: number;
  isDefault: number;
  isAutoTimeOn: number;
  isAutoOrderOn: number;
  isAutoProductTypeOn: number;
  isAutoProductOn: number;
  kdsDiningType: number;
  kdsStoreArea: number;
  kdsDisplayTypeId: number;
  isNoDisplay: number;
  isOvertimeNotify: number;
  isCookingNotify: number;
  isMealSound: number;
  isUrgingSound: number;
  overtimeNotifyMin: number;
  cookingNotifyMin: number;
  isAllProduct: number;
  progressiveTypeId: number;
  autoTimeOnMin: number;
  autoOrderOnQty: number;
  nextWorkstationId: number;
  isFirstStation: number;
  isGoOn: number;
  prevWorkstationId: number | null;
  dineOver: number;
  taskTime: number;
  displayType: number;
  cardType: number;
}

export default function WorkstationBoard() {
  const { isMobile, isTablet } = useIsMobile();

  const styles = mainPageStyles({ isMobile, isTablet });
  
  // 狀態管理
  const [showModal, setShowModal] = useState<boolean>(false);
  const [categoryItems, setCategoryItems] = useState<CategoryItems>({
    making: [
      { id: 'snow-beef-1', name: '雪花牛', count: 3, table: '內用A1', note: '油花少一點' },
      { id: 'snow-beef-2', name: '雪花牛', count: 1, table: '內用A1', note: '雪花多一點雪花多一點雪花多一點很重要所以獎三遍' },
      { id: 'premium-pork-making', name: '上選豬肉', count: 10, table: '內用A1' },
    ],
    hold: [],
    waiting: [
      { id: 'pork-fish-combo', name: '豬魚雙饗', count: 2, table: 'C2', note: '上選豬+魚片' },
      { id: 'beef-combo', name: '絕代雙牛', count: 1, table: 'C2', note: '雪花牛+嫩煎牛' },
      { id: 'snow-beef-c2', name: '雪花牛', count: 1, table: 'C2', note: '油花少一點' },
      { id: 'premium-pork', name: '上選豬肉', count: 5, table: 'C3' },
    ],
  });
  const [modalRows, setModalRows] = useState<OrderItem[]>([]);
  // 部分銷單異動數量 state
  const [holdEditCounts, setHoldEditCounts] = useState<number[]>([]);
  
  // 追蹤當前視窗是否為Hold品項
  const [isHoldItemModal, setIsHoldItemModal] = useState<boolean>(false);
  
  // 全域變數：控制HOLD視窗是否顯示確認按鈕
  // 0: 初始狀態，1: 製作中品項點擊狀態，2: 確認狀態
  const [holdModalMode, setHoldModalMode] = useState<number>(0);

  // 製作中品項點擊特效狀態管理
  const [selectedMakingItem, setSelectedMakingItem] = useState<string | null>(null);
  const [clickedMakingItems, setClickedMakingItems] = useState<Set<string>>(new Set());

  // Hold品項點擊特效狀態管理
  const [selectedHoldItem, setSelectedHoldItem] = useState<string | null>(null);
  const [clickedHoldItems, setClickedHoldItems] = useState<Set<string>>(new Set());

  // 製作中品項點擊處理函數
  const handleMakingItemSelect = (itemId: string) => {
    console.log('handleMakingItemSelect called with:', itemId);
    
    // 檢查品項是否已經被點擊過
    if (clickedMakingItems.has(itemId)) {
      // 如果已經被點擊過，則取消選中（反白）
      setClickedMakingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      setSelectedMakingItem(null);
      setHoldModalMode(0);
      console.log('製作中品項已取消選中:', itemId);
    } else {
      // 如果沒有被點擊過，則選中（反灰）
      setClickedMakingItems(prev => new Set([...prev, itemId]));
      setSelectedMakingItem(itemId);
      setHoldModalMode(1);
      console.log('製作中品項已選中:', itemId);
    }
    
    // 清除Hold品項的選中狀態
    setSelectedHoldItem(null);
  };

  // Hold品項點擊處理函數
  const handleHoldItemSelect = (itemId: string) => {
    console.log('handleHoldItemSelect called with:', itemId);
    console.log('Current categoryItems.hold:', categoryItems.hold);
    
    // 檢查品項是否已經被點擊過
    if (clickedHoldItems.has(itemId)) {
      // 如果已經被點擊過，則取消選中（反白）
      setClickedHoldItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      setSelectedHoldItem(null);
      console.log('Hold品項已取消選中:', itemId);
    } else {
      // 如果沒有被點擊過，則選中（反灰）
      setClickedHoldItems(prev => new Set([...prev, itemId]));
      setSelectedHoldItem(itemId);
      console.log('Hold品項已選中:', itemId);
    }
    
    // 清除製作中品項的選中狀態
    setSelectedMakingItem(null);
  };

  // 牌卡管理狀態
  const [hiddenMakingCards, setHiddenMakingCards] = useState<Set<string>>(new Set());
  const [hiddenHoldCards, setHiddenHoldCards] = useState<Set<string>>(new Set());

  // 重新計算逾時特效函數
  const recalculateTimeoutEffect = () => {
    // 重置逾時特效狀態，讓新遞補的品項從綠色開始
    setTimeColor('#009944');
    setStartTime(Date.now());
    console.log('逾時特效重新計算：重置為綠色狀態');
    
    // 10秒後變為紅色（逾時狀態）
    setTimeout(() => {
      setTimeColor('#d7263d');
      console.log('遞補品項已逾時：變為紅色狀態');
    }, 10000); // 10秒 = 10000毫秒
  };

  // 強制遞補函數：當製作中沒有可見牌卡時自動遞補
  const forceAutoReplenish = () => {
    setCategoryItems(prev => {
      // 檢查製作中是否有可見的牌卡
      const visibleMakingCards = Object.keys(prev.making.reduce((acc, item) => {
        const key = item.table;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {} as Record<string, OrderItem[]>)).filter(tableName => {
        const cardKey = `making-${tableName}`;
        return !hiddenMakingCards.has(cardKey);
      });
      
      console.log('強制遞補檢查：', {
        visibleMakingCards,
        hiddenMakingCards: Array.from(hiddenMakingCards),
        waitingLength: prev.waiting.length
      });
      
      // 如果沒有可見的製作中牌卡，且有待製作品項，則自動遞補
      if (visibleMakingCards.length === 0 && prev.waiting.length > 0) {
        const newMaking = [...prev.making];
        const newWaiting = [...prev.waiting];
        
        // 取出第一個待製作牌卡的所有品項
        const firstTable = newWaiting[0]?.table;
        if (firstTable) {
          const itemsToMove = newWaiting.filter(item => item.table === firstTable);
          
          console.log('準備移動品項：', { firstTable, itemsToMove });
          
          // 移動品項到製作中
          const moveTimestamp = Date.now();
          itemsToMove.forEach((item, index) => {
            const movedItem = {
              ...item,
              id: `force-moved-${moveTimestamp}-${index}`
            };
            newMaking.push(movedItem);
          });
          
          // 從待製作中移除
          const remainingWaiting = newWaiting.filter(item => item.table !== firstTable);
          newWaiting.length = 0;
          newWaiting.push(...remainingWaiting);
          
          console.log('強制遞補完成：待製作品項已移動到製作中');
          
          // 遞補完成後，清除隱藏的牌卡狀態，讓新遞補的牌卡可以正常顯示
          setTimeout(() => {
            setHiddenMakingCards(new Set());
            console.log('遞補完成：隱藏牌卡狀態已清除');
            
            // 為遞補的品項重新計算逾時特效
            // 延遲200ms確保狀態更新完成後再觸發
            setTimeout(() => {
              recalculateTimeoutEffect();
            }, 200);
          }, 50);
        }
        
        return {
          ...prev,
          making: newMaking,
          waiting: newWaiting
        };
      }
      return prev;
    });
  };

  // 雙擊牌卡表頭處理函數
  const handleCardHeaderDoubleClick = (cardType: 'making' | 'hold', cardKey: string) => {
    if (cardType === 'making') {
      setHiddenMakingCards(prev => new Set([...prev, cardKey]));
      
      // 當製作中牌卡消失後，將待製作的品項替補到製作中
      setCategoryItems(prev => {
        const newMaking = [...prev.making];
        const newWaiting = [...prev.waiting];
        
        // 找到被隱藏的製作中牌卡對應的品項
        const hiddenTableName = cardKey.replace('making-', '');
        const hiddenItems = newMaking.filter(item => item.table === hiddenTableName);
        
        if (hiddenItems.length > 0 && newWaiting.length > 0) {
          // 從待製作中取出第一個牌卡的所有品項，一起移動到製作中
          const firstTable = newWaiting[0]?.table;
          if (firstTable) {
            // 找到同一桌號的所有品項
            const itemsToMove = newWaiting.filter(item => item.table === firstTable);
            
            // 將這些品項一起移動到製作中，並確保它們保持在同一張牌卡中
            // 為所有移動的品項使用相同的時間戳，確保它們被分組到同一張牌卡
            const moveTimestamp = Date.now();
            itemsToMove.forEach((item, index) => {
              const movedItem = {
                ...item,
                // 使用相同的時間戳，讓它們在製作中保持在同一張牌卡
                id: `moved-${moveTimestamp}-${index}`
              };
              newMaking.push(movedItem);
            });
            
            // 從待製作中移除這些品項
            const remainingWaiting = newWaiting.filter(item => item.table !== firstTable);
            newWaiting.length = 0; // 清空原陣列
            newWaiting.push(...remainingWaiting); // 重新填充
          }
        }
        
        return {
          ...prev,
          making: newMaking,
          waiting: newWaiting
        };
      });
      
      // 檢查製作中是否還有品項，如果沒有則自動遞補
      setTimeout(() => {
        setCategoryItems(prev => {
          // 如果製作中沒有品項，自動從待製作中遞補
          if (prev.making.length === 0 && prev.waiting.length > 0) {
            const newMaking = [...prev.making];
            const newWaiting = [...prev.waiting];
            
            // 取出第一個待製作牌卡的所有品項
            const firstTable = newWaiting[0]?.table;
            if (firstTable) {
              const itemsToMove = newWaiting.filter(item => item.table === firstTable);
              
              // 移動品項到製作中
              const moveTimestamp = Date.now();
              itemsToMove.forEach((item, index) => {
                const movedItem = {
                  ...item,
                  id: `auto-moved-${moveTimestamp}-${index}`
                };
                newMaking.push(movedItem);
              });
              
              // 從待製作中移除
              const remainingWaiting = newWaiting.filter(item => item.table !== firstTable);
              newWaiting.length = 0;
              newWaiting.push(...remainingWaiting);
              
              console.log('自動遞補：待製品項已移動到製作中');
            }
            
            return {
              ...prev,
              making: newMaking,
              waiting: newWaiting
            };
          }
          return prev;
        });
        
        // 強制檢查並遞補
        forceAutoReplenish();
        
        // 遞補完成後重新計算逾時特效
        setTimeout(() => {
          recalculateTimeoutEffect();
        }, 300); // 延遲300ms確保遞補完成
      }, 100); // 延遲100ms確保狀態更新完成
      
    } else if (cardType === 'hold') {
      // 隱藏Hold牌卡
      setHiddenHoldCards(prev => new Set([...prev, 'hold-main']));
      console.log('Hold牌卡已被隱藏');
      
      // 可以選擇是否要將Hold品項移動回待製作或製作中
      // 這裡暫時只是隱藏，品項仍然保留在Hold狀態
    }
  };

  // 處理選中品項的Hold操作
  const handleHoldSelectedItem = () => {
    console.log('handleHoldSelectedItem called, selectedMakingItem:', selectedMakingItem, 'selectedHoldItem:', selectedHoldItem);
    
    if (selectedMakingItem) {
      console.log('Processing selectedMakingItem:', selectedMakingItem);
      
      // 查找對應的製作中品項
      const makingItem = categoryItems.making.find(item => item.id === selectedMakingItem);
      
      if (makingItem) {
        // 設置Hold品項視窗數據，顯示製作中品項的明細
        setSelectedHoldItemData(makingItem);
        setShowHoldItemModal(true);
        // 初始化數量編輯狀態為0（讓用戶自己調整）
        setHoldItemEditCount(0);
        // 如果全域變數為1，則設置為確認狀態（顯示確認按鈕）
        if (holdModalMode === 1) {
          setHoldModalMode(2);
        }
        console.log('Hold Item Modal opened with making item:', makingItem);
      } else {
        console.log('No matching makingItem found');
        setShowSelectItemModal(true);
      }
    } else if (selectedHoldItem) {
      console.log('Processing selectedHoldItem:', selectedHoldItem);
      
      // 查找對應的Hold品項
      const holdItem = categoryItems.hold.find(item => item.id === selectedHoldItem);
      
      if (holdItem) {
        // 設置Hold品項視窗數據，顯示Hold品項的明細
        setSelectedHoldItemData(holdItem);
        setShowHoldItemModal(true);
        // Hold品項不需要數量編輯，所以不設置holdModalMode
        setHoldItemEditCount(0);
        console.log('Hold Item Modal opened with hold item:', holdItem);
      } else {
        console.log('No matching holdItem found');
        setShowSelectItemModal(true);
      }
    } else {
      // 如果沒有選中品項，顯示提示
      console.log('No selectedMakingItem or selectedHoldItem');
      setShowSelectItemModal(true);
    }
  };



  // 倒數計時 state
  const [countdown, setCountdown] = useState(300); // 300秒倒數
  const [currentItem, setCurrentItem] = useState(2); // 當前項目
  const [totalItems, setTotalItems] = useState(20); // 總項目數
  const [timeColor, setTimeColor] = useState('#009944'); // 製作中排卡顏色狀態
  const [startTime, setStartTime] = useState(() => Date.now()); // 頁面載入時間
  
  // 新增：備餐總數畫面狀態
  const [showBackupScreen, setShowBackupScreen] = useState(false);

  // 新增：當前選擇的工作站
  const [currentWorkstation, setCurrentWorkstation] = useState('');
  
  // 新增：選取品項提示 modal 狀態
  const [showSelectItemModal, setShowSelectItemModal] = useState(false);
  
  // 新增：Hold品項視窗狀態
  const [showHoldItemModal, setShowHoldItemModal] = useState<boolean>(false);
  const [selectedHoldItemData, setSelectedHoldItemData] = useState<OrderItem | null>(null);
  
  // 新增：HOLD視窗數量編輯狀態
  const [holdItemEditCount, setHoldItemEditCount] = useState<number>(0);

  // 新增：工作站清單狀態
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [isLoadingWorkstations, setIsLoadingWorkstations] = useState(false);
  const [workstationError, setWorkstationError] = useState<string | null>(null);

  // 獲取工作站清單的函數
  const fetchWorkstations = async (storeId: number) => {
    try {
      setIsLoadingWorkstations(true);
      setWorkstationError(null);
      
      const response = await fetch(`/api/main?storeId=${storeId}`);
      const result = await response.json();
      
      if (result.code === '0000' && result.data) {
        setWorkstations(result.data);
        // 如果有工作站資料，設定第一個為預設選擇
        if (result.data.length > 0) {
          setCurrentWorkstation(result.data[0].name);
        }
      } else {
        setWorkstationError(result.message || '獲取工作站清單失敗');
      }
    } catch (error) {
      console.error('獲取工作站清單錯誤:', error);
      setWorkstationError('網路錯誤，無法獲取工作站清單');
    } finally {
      setIsLoadingWorkstations(false);
    }
  };

  // 頁面載入時獲取工作站清單
  useEffect(() => {
    // 這裡可以從環境變數、localStorage 或其他地方獲取 storeId
    // 暫時使用預設值 1
    const storeId = 1;
    fetchWorkstations(storeId);
  }, []);

  // 監聽製作中品項變化，當沒有品項時自動觸發遞補
  useEffect(() => {
    // 如果製作中沒有品項，且有待製作品項，則自動觸發遞補
    if (categoryItems.making.length === 0 && categoryItems.waiting.length > 0) {
      console.log('檢測到製作中沒有品項，自動觸發遞補');
      // 延遲執行，確保狀態更新完成
      setTimeout(() => {
        forceAutoReplenish();
      }, 100);
    }
  }, [categoryItems.making.length, categoryItems.waiting.length]);

  // 添加動畫樣式和品項選中樣式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
      
      @keyframes flame {
        0% { 
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
          opacity: 0.8;
        }
        25% { 
          transform: translate(-50%, -50%) scale(1.2) rotate(10deg);
          opacity: 1;
        }
        50% { 
          transform: translate(-50%, -50%) scale(0.8) rotate(-10deg);
          opacity: 0.9;
        }
        75% { 
          transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
          opacity: 1;
        }
        100% { 
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
          opacity: 0.8;
        }
      }
      
      /* 逾時牌卡發紅光特效 */
      @keyframes redGlow {
        0% { 
          box-shadow: 0 0 10px rgba(215, 38, 61, 0.5);
        }
        50% { 
          box-shadow: 0 0 25px rgba(215, 38, 61, 0.8), 0 0 35px rgba(215, 38, 61, 0.6);
        }
        100% { 
          box-shadow: 0 0 10px rgba(215, 38, 61, 0.5);
        }
      }
      
      /* 逾時牌卡樣式 */
      .overdue-card {
        animation: redGlow 2s ease-in-out infinite;
        border: 3px solid #d7263d !important;
      }
      
      /* 製作中品項選中樣式 */
      .making-item-row.item-selected {
        border: 2px solid #d7263d !important;
        border-radius: 6px !important;
        background-color: #d3d3d3 !important;
        box-shadow: 0 0 10px rgba(215, 38, 61, 0.5) !important;
      }
      
      /* 製作中品項懸停樣式 */
      .making-item-row.item-hover {
        background-color: #f5f5f5 !important;
      }
      
      /* 製作中品項默認樣式 */
      .making-item-row {
        background-color: transparent;
        transition: all 0.2s ease;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  
  // 倒數計時邏輯
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // 倒數結束，重置為300秒
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    function updateTime() {
      // 計算從頁面載入開始經過的秒數
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      
      // 檢查是否超過10秒，如果是則改變顏色
      if (elapsedSeconds >= 10) {
        setTimeColor('#d7263d'); // 紅色
      } else {
        setTimeColor('#009944'); // 綠色
      }
    }
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // 事件處理器
  const handlePartialCancel = () => {
    // 暫時顯示選擇品項提示
    setShowSelectItemModal(true);
  };

  const handleHistoryRecord = () => {
    // TODO: 實作歷史紀錄功能
    console.log('歷史紀錄功能待實作');
  };

  const handleBackupTotal = () => {
    setShowBackupScreen(true);
  };

  const handleWorkstationChange = (station: string) => {
    setCurrentWorkstation(station);
  };

  const handleSettings = () => {
    // TODO: 實作設定功能
    console.log('設定功能待實作');
  };



  const handleHoldEditCountChange = (index: number, value: number) => {
    setHoldEditCounts(prev => prev.map((v, i) => i === index ? value : v));
  };

  // HOLD視窗數量編輯處理函數
  const handleHoldItemCountChange = (newCount: number) => {
    // 限制數量範圍：下限為0，上限為目前數量
    const clampedCount = Math.max(0, Math.min(newCount, selectedHoldItemData?.count || 0));
    setHoldItemEditCount(clampedCount);
  };

  // HOLD視窗確認處理函數
  const handleHoldItemConfirm = () => {
    if (selectedHoldItemData && holdModalMode === 2) {
      console.log('HOLD confirmed for item:', selectedHoldItemData, 'with count:', holdItemEditCount);
      
      // 計算要扣除的數量（原始數量 - 異動後的數量）
      const holdCount = holdItemEditCount;
      const remainingCount = selectedHoldItemData.count - holdCount;
      
      if (remainingCount < 0) {
        console.error('Invalid hold count: cannot hold more than available');
        return;
      }
      
      // 將品項新增至HOLD欄位（數量為異動的數量）
      const newHoldItem = {
        ...selectedHoldItemData,
        count: holdCount
      };
      
      // 更新HOLD欄位，檢查是否有相同牌卡的同品項需要合併
      setCategoryItems(prev => {
        const newHold = [...prev.hold];
        
        // 查找是否已存在相同牌卡、相同名稱、相同備註的品項
        const existingItemIndex = newHold.findIndex(item => 
          item.table === selectedHoldItemData.table && 
          item.name === selectedHoldItemData.name && 
          item.note === selectedHoldItemData.note
        );
        
        if (existingItemIndex !== -1) {
          // 如果找到相同品項，合併數量
          newHold[existingItemIndex] = {
            ...newHold[existingItemIndex],
            count: newHold[existingItemIndex].count + holdCount
          };
          console.log('合併相同品項到HOLD:', newHold[existingItemIndex]);
        } else {
          // 如果沒有找到相同品項，新增
          newHold.push(newHoldItem);
          console.log('新增品項到HOLD:', newHoldItem);
        }
        
        return {
          ...prev,
          hold: newHold
        };
      });
      
      // 如果是製作中品項，需要扣除數量
      if (selectedMakingItem) {
        setCategoryItems(prev => ({
          ...prev,
          making: prev.making.map(item => 
            item.id === selectedHoldItemData.id 
              ? { ...item, count: remainingCount }
              : item
          ).filter(item => item.count > 0) // 過濾數量為0的品項
        }));
      }
      
      // 關閉視窗並重置狀態
      setShowHoldItemModal(false);
      setHoldModalMode(0);
      setHoldItemEditCount(0);
      
      // 清除選中狀態
      setSelectedMakingItem(null);
      setSelectedHoldItem(null);
      setClickedMakingItems(new Set());
      setClickedHoldItems(new Set());
      
      console.log('Item added to HOLD:', newHoldItem);
      console.log('Remaining count in making:', remainingCount);
    }
  };

  // 部分銷單 Hold 處理
  const handleHold = () => {
    // 1. 更新 making: 扣除異動數量
    const newMaking = [...categoryItems.making];
    const newHold = [...categoryItems.hold];
    
    modalRows.forEach((row, idx) => {
      const minus = holdEditCounts[idx] || 0;
      
      if (minus > 0) {
        // making 扣除 - 根據 name, table 和 note 來精確匹配
        const makingIdx = newMaking.findIndex(m => 
          m.name === row.name && 
          m.table === row.table && 
          m.note === row.note
        );
        
        if (makingIdx !== -1) {
          const originalCount = newMaking[makingIdx].count;
          newMaking[makingIdx] = { ...newMaking[makingIdx], count: Math.max(0, originalCount - minus) };
        }
        
        // Hold 累加或新增 - 同樣根據 name, table 和 note 來精確匹配
        const holdIdx = newHold.findIndex(h => 
          h.name === row.name && 
          h.table === row.table && 
          h.note === row.note
        );
        if (holdIdx !== -1) {
          newHold[holdIdx] = { ...newHold[holdIdx], count: newHold[holdIdx].count + minus };
        } else {
          newHold.push({ id: row.id, name: row.name, table: row.table, count: minus, note: row.note });
        }
      }
    });
    
    // 過濾 making 為 0 的品項
    const filteredMaking = newMaking.filter(m => m.count > 0);
    
    setCategoryItems(prev => ({ ...prev, making: filteredMaking, hold: newHold }));
    setShowModal(false);
    
    // 清理選中狀態，因為品項可能已經被移動或數量變更
    setSelectedMakingItem(null);
    setSelectedHoldItem(null);
    setClickedMakingItems(new Set());
    setClickedHoldItems(new Set());
    

  };

  return (
    <div style={styles.mainContainer}>
      {/* 左側功能列 */}
      <LeftSidebar
        onPartialCancel={handlePartialCancel}
        onHistoryRecord={handleHistoryRecord}
        onBackupTotal={handleBackupTotal}
        onWorkstationChange={handleWorkstationChange}
        onSettings={handleSettings}
        currentWorkstation={currentWorkstation}
        countdown={countdown}
        currentItem={currentItem}
        totalItems={totalItems}
        workstations={workstations}
        isLoadingWorkstations={isLoadingWorkstations}
        workstationError={workstationError}
        selectedMakingItem={selectedMakingItem}
        selectedHoldItem={selectedHoldItem}
        onHoldSelectedItem={handleHoldSelectedItem}
      />

      {/* 右側主內容 */}
      <div style={styles.rightContent}>
        {/* 頂部狀態欄 */}
        <StatusBar
          pendingBatches={15}
          overdueBatches={3}
        />
        
        {/* 工作看板 */}
        <WorkBoard 
          categoryItems={categoryItems}
          timeColor={timeColor}
          selectedMakingItem={selectedMakingItem}
          clickedMakingItems={clickedMakingItems}
          onMakingItemSelect={handleMakingItemSelect}
          selectedHoldItem={selectedHoldItem}
          clickedHoldItems={clickedHoldItems}
          onHoldItemSelect={handleHoldItemSelect}

          hiddenMakingCards={hiddenMakingCards}
          hiddenHoldCards={hiddenHoldCards}
          onCardHeaderDoubleClick={handleCardHeaderDoubleClick}
        />
      </div>

      {/* Modal 組件 */}
      <PartialCancelModal
        isOpen={showModal}
        modalRows={modalRows}
        holdEditCounts={holdEditCounts}
        onHoldEditCountChange={handleHoldEditCountChange}
        onHold={handleHold}
        onClose={() => setShowModal(false)}
        isHoldItem={isHoldItemModal}
      />

      <SelectItemModal
        isOpen={showSelectItemModal}
        onClose={() => setShowSelectItemModal(false)}
      />

      <HoldItemModal
        isOpen={showHoldItemModal}
        selectedItem={selectedHoldItemData}
        onClose={() => setShowHoldItemModal(false)}
        itemType={selectedHoldItemData?.id && categoryItems.making.find(item => item.id === selectedHoldItemData.id) ? 'making' : 'hold'}
        showConfirmButton={holdModalMode === 2}
        editCount={holdItemEditCount}
        onCountChange={handleHoldItemCountChange}
        onConfirm={handleHoldItemConfirm}
      />

      <BackupScreen
        isVisible={showBackupScreen}
        onClose={() => setShowBackupScreen(false)}
        totalCount={25}
      />
      

    </div>
  );
}