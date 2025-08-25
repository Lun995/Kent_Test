"use client";

import { useState, useEffect } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { StatusBar } from './StatusBar';
import { WorkBoard } from './WorkBoard';
import { PartialCancelModal } from './PartialCancelModal';
import { SelectItemModal } from './SelectItemModal';
import { BackupScreen } from './BackupScreen';
import { Clock } from './Clock';
import { useIsMobile } from '../../hooks/useIsMobile';

// 工作站介面
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

// 品項介面
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

export function WorkstationBoard() {
  const { isMobile, isTablet } = useIsMobile();
  
  // 狀態管理
  const [currentWorkstation, setCurrentWorkstation] = useState('工作站1');
  const [countdown, setCountdown] = useState(300); // 5分鐘倒數
  const [currentItem, setCurrentItem] = useState(1);
  const [totalItems, setTotalItems] = useState(10);
  const [selectedMakingItem, setSelectedMakingItem] = useState<string | null>(null);
  const [selectedHoldItem, setSelectedHoldItem] = useState<string | null>(null);
  const [clickedMakingItems, setClickedMakingItems] = useState<Set<string>>(new Set());
  const [clickedHoldItems, setClickedHoldItems] = useState<Set<string>>(new Set());
  const [hiddenMakingCards, setHiddenMakingCards] = useState<Set<string>>(new Set());
  const [hiddenHoldCards, setHiddenHoldCards] = useState<Set<string>>(new Set());
  
  // Modal 狀態
  const [showPartialCancelModal, setShowPartialCancelModal] = useState(false);
  const [showSelectItemModal, setShowSelectItemModal] = useState(false);
  const [showBackupScreen, setShowBackupScreen] = useState(false);
  
  // 測試數據
  const [workstations] = useState<Workstation[]>([
    {
      uid: 1,
      no: 'WS001',
      name: '工作站1',
      brandId: 1,
      storeId: 1,
      isOn: 1,
      serialNo: 1,
      memo: '主要工作站',
      creatorId: 1,
      createDate: '2024-01-01',
      modifyId: 1,
      modifyDate: '2024-01-01',
      isDisabled: 0,
      status: 1,
      companyId: 1,
      isDefault: 1,
      isAutoTimeOn: 1,
      isAutoOrderOn: 1,
      isAutoProductTypeOn: 1,
      isAutoProductOn: 1,
      kdsDiningType: 1,
      kdsStoreArea: 1,
      kdsDisplayTypeId: 1,
      isNoDisplay: 0,
      isOvertimeNotify: 1,
      isCookingNotify: 1,
      isMealSound: 1,
      isUrgingSound: 1,
      overtimeNotifyMin: 15,
      cookingNotifyMin: 10,
      isAllProduct: 1,
      progressiveTypeId: 1,
      autoTimeOnMin: 5,
      autoOrderOnQty: 3,
      nextWorkstationId: 2,
      isFirstStation: 1,
      isGoOn: 1,
      prevWorkstationId: null,
      dineOver: 0,
      taskTime: 300,
      displayType: 1,
      cardType: 1
    }
  ]);

  const [categoryItems, setCategoryItems] = useState<CategoryItems>({
    making: [
      { id: '1', name: '漢堡', count: 2, table: 'A1', note: '不要洋蔥' },
      { id: '2', name: '薯條', count: 1, table: 'A2' },
      { id: '3', name: '可樂', count: 3, table: 'B1' }
    ],
    hold: [
      { id: '4', name: '雞塊', count: 1, table: 'C1', note: '等待確認' }
    ],
    waiting: [
      { id: '5', name: '沙拉', count: 2, table: 'D1' },
      { id: '6', name: '冰淇淋', count: 1, table: 'E1' }
    ]
  });

  // 倒數計時器
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          return 300; // 重置為5分鐘
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 事件處理函數
  const handlePartialCancel = () => {
    if (!selectedMakingItem && !selectedHoldItem) {
      setShowSelectItemModal(true);
      return;
    }
    setShowPartialCancelModal(true);
  };

  const handleHistoryRecord = () => {
    console.log('查看歷史紀錄');
  };

  const handleBackupTotal = () => {
    setShowBackupScreen(true);
  };

  const handleWorkstationChange = (station: string) => {
    setCurrentWorkstation(station);
    console.log('切換工作站:', station);
  };

  const handleSettings = () => {
    console.log('開啟設定');
  };

  const handleMakingItemSelect = (itemIdentifier: string) => {
    setSelectedMakingItem(itemIdentifier);
    setSelectedHoldItem(null);
    setClickedMakingItems(prev => new Set([...prev, itemIdentifier]));
  };

  const handleHoldItemSelect = (itemIdentifier: string) => {
    setSelectedHoldItem(itemIdentifier);
    setSelectedMakingItem(null);
    setClickedHoldItems(prev => new Set([...prev, itemIdentifier]));
  };

  const handleCardHeaderDoubleClick = (cardType: 'making' | 'hold', cardKey: string) => {
    if (cardType === 'making') {
      setHiddenMakingCards(prev => new Set([...prev, cardKey]));
    } else {
      setHiddenHoldCards(prev => new Set([...prev, cardKey]));
    }
  };

  const handleHoldSelectedItem = () => {
    if (selectedMakingItem) {
      // 將選中的製作中品項移動到 Hold 區域
      const item = categoryItems.making.find(item => item.id === selectedMakingItem);
      if (item) {
        setCategoryItems(prev => ({
          ...prev,
          making: prev.making.filter(i => i.id !== selectedMakingItem),
          hold: [...prev.hold, item]
        }));
        setSelectedMakingItem(null);
      }
    }
  };

  // 計算待製作和逾時批次
  const waitingBatches = categoryItems.waiting.length;
  const overtimeBatches = categoryItems.making.filter(item => 
    parseInt(item.id) % 3 === 0 // 模擬逾時邏輯
  ).length;

  if (showBackupScreen) {
    return (
      <BackupScreen
        onClose={() => setShowBackupScreen(false)}
        totalItems={totalItems}
      />
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* 左側邊欄 */}
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
        isLoadingWorkstations={false}
        workstationError={null}
        selectedMakingItem={selectedMakingItem}
        selectedHoldItem={selectedHoldItem}
        onHoldSelectedItem={handleHoldSelectedItem}
      />

      {/* 主要內容區域 */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* 頂部狀態欄 */}
        <StatusBar
          waitingBatches={waitingBatches}
          overtimeBatches={overtimeBatches}
        />

        {/* 時鐘 */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          zIndex: 10 
        }}>
          <Clock />
        </div>

        {/* 工作看板 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <WorkBoard
            categoryItems={categoryItems}
            timeColor={countdown < 60 ? '#ff4444' : '#333'}
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
      </div>

      {/* Modal 組件 */}
      {showPartialCancelModal && (
        <PartialCancelModal
          onClose={() => setShowPartialCancelModal(false)}
          selectedItem={selectedMakingItem || selectedHoldItem}
          onConfirm={(quantity) => {
            console.log('部分銷單確認:', quantity);
            setShowPartialCancelModal(false);
          }}
        />
      )}

      {showSelectItemModal && (
        <SelectItemModal
          onClose={() => setShowSelectItemModal(false)}
          message="請先選擇要操作的品項"
        />
      )}
    </div>
  );
}

