"use client";
import { useState, useEffect } from 'react';
import { 
  LeftSidebar, 
  StatusBar, 
  WorkBoard, 
  SimplePartialCancelModal, 
  SelectItemModal, 
  BackupScreen 
} from '../../components/WorkstationBoard';
import { EnvironmentSwitcher } from '../../components/EnvironmentSwitcher';
import { HoldItemModal } from '../../components/WorkstationBoard/HoldItemModal';
import { 
  useIsMobile,
  useWorkstationManagement,
  useItemSelection,
  useAutoReplenishment,
  useOrderItemManagement,
  type Workstation,
  type OrderItem,
  type CategoryItems
} from '../../hooks';
import { 
  CardData, 
  CardStatus 
} from '../../lib/adapters/orderItemAdapter';

import { mainPageStyles } from '../../styles/mainPageStyles';

// 引入 API 配置測試 (僅開發環境)
if (process.env.NODE_ENV === 'development') {
  import('../../lib/test-api-config');
}

// 型別定義 - 使用從 test-card-data 導入的類型



// 工作站介面已移至 useWorkstationManagement Hook

export default function WorkstationBoard() {
  const { isMobile, isTablet } = useIsMobile();

  const styles = mainPageStyles({ isMobile, isTablet });
  
  // 狀態管理
  const [showModal, setShowModal] = useState<boolean>(false);

  // 使用自定義 Hooks
  const {
    workstations,
    isLoadingWorkstations,
    workstationError,
    currentWorkstation,
    changeWorkstation
  } = useWorkstationManagement(504); // 預設 storeId = 504

  const {
    selectedMakingItem,
    clickedMakingItems,
    selectedHoldItem,
    clickedHoldItems,
    handleMakingItemSelect,
    handleHoldItemSelect,
    clearAllSelections,
    setSelectedMakingItem,
    setSelectedHoldItem,
    setClickedMakingItems,
    setClickedHoldItems
  } = useItemSelection();

  // 使用品項管理 Hook 取得真實 API 資料
  const {
    categoryItems,
    isLoading: isLoadingItems,
    error: itemsError,
    refreshItems,
    holdItem,
    updateItemStatus
  } = useOrderItemManagement({
    storeId: 504, // 預設 storeId = 504
    autoRefresh: true,
    refreshInterval: 30000, // 30秒自動刷新
    enableRealTime: true
  });

  // 品項點擊處理函數已移至 useItemSelection Hook

  // 牌卡管理狀態
  const [hiddenMakingCards, setHiddenMakingCards] = useState<Set<string>>(new Set());
  const [hiddenHoldCards, setHiddenHoldCards] = useState<Set<string>>(new Set());

  // 使用自動遞補 Hook
  const {
    forceAutoReplenish,
    handleCardHeaderDoubleClick,
    recalculateTimeoutEffect: recalculateTimeoutEffectFromHook
  } = useAutoReplenishment(
    categoryItems,
    refreshItems, // 使用 refreshItems 替代 setCategoryItems
    hiddenMakingCards,
    setHiddenMakingCards,
    hiddenHoldCards,
    setHiddenHoldCards,
    () => {
      // 逾時特效重新計算的回調函數
      setTimeColor('#009944');
      setStartTime(Date.now());
    }
  );

  // 逾時特效和自動遞補邏輯已移至 useAutoReplenishment Hook

  // 雙擊牌卡表頭處理函數已移至 useAutoReplenishment Hook

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
         // 初始化數量編輯狀態為1（不得為0）
         setHoldItemEditCount(1);
         // 設置為確認狀態（顯示確認按鈕）
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
     const [currentItem, setCurrentItem] = useState(1); // 當前項目
   const [totalItems, setTotalItems] = useState(0); // 總項目數，將根據實際資料動態計算
  const [timeColor, setTimeColor] = useState('#009944'); // 製作中排卡顏色狀態
  const [startTime, setStartTime] = useState(() => Date.now()); // 頁面載入時間
  
  // 新增：備餐總數畫面狀態
  const [showBackupScreen, setShowBackupScreen] = useState(false);

  // 當前選擇的工作站已移至 useWorkstationManagement Hook
  
  // 新增：選取品項提示 modal 狀態
  const [showSelectItemModal, setShowSelectItemModal] = useState(false);
  
  // 新增：Hold品項視窗狀態
  const [showHoldItemModal, setShowHoldItemModal] = useState<boolean>(false);
  const [selectedHoldItemData, setSelectedHoldItemData] = useState<OrderItem | null>(null);
  
  // 新增：HOLD視窗數量編輯狀態
  const [holdItemEditCount, setHoldItemEditCount] = useState<number>(0);

  // 工作站管理已移至 useWorkstationManagement Hook

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

   // 動態計算總項目數
   useEffect(() => {
     const total = categoryItems.making.length + categoryItems.hold.length + categoryItems.waiting.length;
     setTotalItems(total);
   }, [categoryItems.making.length, categoryItems.hold.length, categoryItems.waiting.length]);

  // 添加動畫樣式和品項選中樣式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
      
      /* @keyframes flame 動畫已移除 */
      
      /* 逾時牌卡發紅光特效 - 已移除 */
      /* @keyframes redGlow 動畫已移除 */
      
      /* 逾時牌卡樣式 - 紅色粗框線 */
      .overdue-card {
        /* 逾時時顯示紅色粗框線 */
        border: 4px solid #d7263d !important;
        box-shadow: 0 0 15px rgba(215, 38, 61, 0.3) !important;
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
      
      /* 雪花牛品項數量網底glow特效 */
      .snowflake-beef-badge {
        background: #6c757d !important;
        border: 2px solid #fff !important;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.8) !important;
        color: white !important;
        font-weight: 700 !important;
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.8) !important;
        animation: glow 2s ease-in-out infinite alternate !important;
      }
      
      @keyframes glow {
        from {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.8) !important;
        }
        to {
          box-shadow: 0 0 30px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.6) !important;
        }
      }
      
                                                                                   /* 火焰燃燒動態圖示 - 使用 GIF 圖片 */
          .flame-icon {
            position: absolute !important;
            left: 8px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            width: 2.8rem !important;
            height: 2.8rem !important;
            background: url('/fire.gif') no-repeat center center !important;
            background-size: contain !important;
            z-index: 10 !important;
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
    if (!selectedMakingItem && !selectedHoldItem) {
      setShowSelectItemModal(true);
      return;
    }
    setShowModal(true);
  };

  const handleHistoryRecord = () => {
    // TODO: 實作歷史紀錄功能
    console.log('歷史紀錄功能待實作');
  };

  const handleBackupTotal = () => {
    setShowBackupScreen(true);
  };

  const handleWorkstationChange = (station: string) => {
    changeWorkstation(station);
  };

  const handleSettings = () => {
    // TODO: 實作設定功能
    console.log('設定功能待實作');
  };



  // 這個函數已經不再需要，因為我們簡化了部分銷單邏輯

     // HOLD視窗數量編輯處理函數
   const handleHoldItemCountChange = (newCount: number) => {
     // 限制數量範圍：下限為1，上限為目前數量（不得為0）
     const clampedCount = Math.max(1, Math.min(newCount, selectedHoldItemData?.count || 1));
     setHoldItemEditCount(clampedCount);
   };

  // HOLD視窗確認處理函數
  const handleHoldItemConfirm = async () => {
    if (selectedHoldItemData) {
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
      
      // 使用 API 將品項移至 HOLD 狀態
      try {
        await holdItem(selectedHoldItemData.id, undefined, `數量: ${holdCount}`);
        console.log('品項已移至 HOLD 狀態:', selectedHoldItemData.id);
        
        // 如果是製作中品項且還有剩餘數量，更新剩餘數量
        if (selectedMakingItem && remainingCount > 0) {
          // 這裡可以根據需要調用更新品項數量的 API
          console.log('剩餘數量:', remainingCount);
        }
        
        // 刷新資料以反映最新狀態
        await refreshItems();
      } catch (error) {
        console.error('移至 HOLD 狀態失敗:', error);
      }
      
      // 關閉視窗並重置狀態
      setShowHoldItemModal(false);
      // 重置狀態
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

  // 部分銷單 Hold 處理函數已經簡化，不再需要複雜的邏輯

  // 計算待製作牌卡數量（以牌卡計算非品項）
  const getUniqueWaitingTables = () => {
    const uniqueTables = new Set();
    categoryItems.waiting.forEach(item => {
      uniqueTables.add(item.table);
    });
    return Array.from(uniqueTables);
  };

  // 計算逾時批次數量
  const getOverdueBatches = () => {
    // 檢查製作中是否有逾時的品項（超過10秒）
    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    
    if (elapsedSeconds >= 10) {
      // 只計算可見的製作中牌卡（未隱藏的）
      const overdueTables = new Set();
      categoryItems.making.forEach(item => {
        const cardKey = `making-${item.table}`;
        // 只計算未隱藏的牌卡
        if (!hiddenMakingCards.has(cardKey)) {
          overdueTables.add(item.table);
        }
      });
      return overdueTables.size;
    }
    
    return 0;
  };

  return (
    <div style={styles.mainContainer}>
      {/* 環境切換器 (僅開發環境顯示) */}
      <EnvironmentSwitcher />
      
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
           pendingBatches={getUniqueWaitingTables().length}
           overdueBatches={getOverdueBatches()}
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
      <SimplePartialCancelModal
        opened={showModal}
        onClose={() => setShowModal(false)}
        selectedItem={selectedMakingItem || selectedHoldItem}
        onConfirm={(quantity) => {
          console.log('部分銷單確認:', quantity);
          setShowModal(false);
        }}
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
        showConfirmButton={selectedHoldItemData?.id && categoryItems.making.find(item => item.id === selectedHoldItemData.id) ? true : false}
        editCount={holdItemEditCount}
        onCountChange={handleHoldItemCountChange}
        onConfirm={handleHoldItemConfirm}
      />

             <BackupScreen
         isVisible={showBackupScreen}
         onClose={() => setShowBackupScreen(false)}
         totalCount={categoryItems.making.length + categoryItems.hold.length + categoryItems.waiting.length}
       />
      

    </div>
  );
}