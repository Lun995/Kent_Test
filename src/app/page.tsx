"use client";
import { useState, useEffect } from 'react';
import { 
  LeftSidebar, 
  StatusBar, 
  WorkBoard, 
  PartialCancelModal, 
  SelectItemModal, 
  BackupScreen 
} from '../components/WorkstationBoard';
import { useIsMobile } from '../hooks/useIsMobile';

import { mainPageStyles } from '../styles/mainPageStyles';

// 型別定義
interface OrderItem {
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

interface SelectedItem {
  category: keyof CategoryItems;
  name: string;
  table?: string;
}

export default function WorkstationBoard() {
  const { isMobile, isTablet } = useIsMobile();

  const styles = mainPageStyles({ isMobile, isTablet });
  
  // 狀態管理
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [categoryItems, setCategoryItems] = useState<CategoryItems>({
    making: [
      { name: '雪花牛', count: 3, table: '內用A1' },
      { name: '雪花牛', count: 1, table: '內用A2', note: '雪花多一點' },
    ],
    hold: [],
    waiting: [
      { name: '雪花牛', count: 1, table: 'C1' },
    ],
  });
  const [modalRows, setModalRows] = useState<OrderItem[]>([]);
  // 部分銷單異動數量 state
  const [holdEditCounts, setHoldEditCounts] = useState<number[]>([]);

  // 倒數計時 state
  const [countdown, setCountdown] = useState(300); // 300秒倒數
  const [currentItem, setCurrentItem] = useState(2); // 當前項目
  const [totalItems, setTotalItems] = useState(20); // 總項目數
  const [timeColor, setTimeColor] = useState('#009944'); // 製作中排卡顏色狀態
  const [startTime, setStartTime] = useState(() => Date.now()); // 頁面載入時間
  
  // 新增：備餐總數畫面狀態
  const [showBackupScreen, setShowBackupScreen] = useState(false);

  // 新增：當前選擇的工作站
  const [currentWorkstation, setCurrentWorkstation] = useState('刨肉區');
  
  // 新增：選取品項提示 modal 狀態
  const [showSelectItemModal, setShowSelectItemModal] = useState(false);

  // 添加動畫樣式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
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
    if (!selectedItem) {
      setShowSelectItemModal(true);
      return;
    }
    // 依據選取品項自動生成 modalRows（桌號、名稱、數量）
    const items = categoryItems[selectedItem.category].filter(item => item.name === selectedItem.name);
    // 產生桌號（如內用A1、外帶01...）
    const rows = items.map((item, i) => ({
      name: item.name,
      table: item.table || `外帶${String(i + 1).padStart(2, '0')}`,
      count: item.count,
      note: item.note,
    }));
    setModalRows(rows);
    setHoldEditCounts(Array(rows.length).fill(0));
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
    setCurrentWorkstation(station);
  };

  const handleSettings = () => {
    // TODO: 實作設定功能
    console.log('設定功能待實作');
  };

  const handleItemSelect = (item: SelectedItem) => {
    setSelectedItem(item);
  };

  const handleItemDoubleClick = (category: keyof CategoryItems, name: string) => {
    setCategoryItems(prev => ({ 
      ...prev, 
      [category]: prev[category].filter(item => item.name !== name) 
    }));
  };

  const handleHoldEditCountChange = (index: number, value: number) => {
    setHoldEditCounts(prev => prev.map((v, i) => i === index ? value : v));
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
          newHold.push({ name: row.name, table: row.table, count: minus, note: row.note });
        }
      }
    });
    
    // 過濾 making 為 0 的品項
    const filteredMaking = newMaking.filter(m => m.count > 0);
    
    setCategoryItems(prev => ({ ...prev, making: filteredMaking, hold: newHold }));
    setShowModal(false);
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
          selectedItem={selectedItem}
          onItemSelect={handleItemSelect}
          onItemDoubleClick={handleItemDoubleClick}
          timeColor={timeColor}
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
      />

      <SelectItemModal
        isOpen={showSelectItemModal}
        onClose={() => setShowSelectItemModal(false)}
      />

      <BackupScreen
        isVisible={showBackupScreen}
        onClose={() => setShowBackupScreen(false)}
        totalCount={25}
      />
    </div>
  );
}