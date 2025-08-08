"use client";
import { Paper, Group, Stack, Button, Badge, Text, Box, Divider, Table, Modal, Group as MantineGroup, Button as MantineButton, TextInput } from '@mantine/core';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AudioTest } from '../components/AudioTest';
// 新增：響應式判斷
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      // 手機：寬度 < 768px 或 (寬度 >= 768px 且寬高比 > 2.5)
      // 這樣可以涵蓋 iPhone 12 Pro (844x390, 寬高比2.16) 等手機設備
      setIsMobile(width < 768 || (width >= 768 && aspectRatio > 2.5));
      
      // 平板：寬度 >= 768px 且 寬高比 <= 2.5 且 寬度 <= 1400px
      // 這樣可以涵蓋 iPad Air (1180x820, 寬高比1.44)、iPad Pro 等各種平板設備
      setIsTablet(width >= 768 && aspectRatio <= 2.5 && width <= 1400);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return { isMobile, isTablet };
}

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

// 新增：音效播放 Hook
function useAudioPlayer() {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // 創建音效元素
    const audioElement = new Audio('/notification.mp3'); // 預設音效檔案
    audioElement.preload = 'auto';
    
    audioElement.addEventListener('play', () => setIsPlaying(true));
    audioElement.addEventListener('pause', () => setIsPlaying(false));
    audioElement.addEventListener('ended', () => setIsPlaying(false));
    audioElement.addEventListener('error', (e) => {
      console.error('音效播放錯誤:', e);
      setIsPlaying(false);
    });

    setAudio(audioElement);

    return () => {
      audioElement.pause();
      audioElement.remove();
    };
  }, []);

  const playSound = (audioUrl?: string) => {
    if (audio) {
      if (audioUrl) {
        audio.src = audioUrl;
      }
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('播放音效失敗:', error);
      });
    }
  };

  const stopSound = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  return { playSound, stopSound, isPlaying };
}

export default function WorkstationBoard() {
  const { playSound } = useAudioPlayer();
  const { isMobile, isTablet } = useIsMobile();
  
  // 調試信息
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    console.log('設備狀態:', { isMobile, isTablet });
    console.log('視窗大小:', { width, height });
    console.log('寬高比:', aspectRatio);
    console.log('平板判斷條件:', {
      widthGte768: width >= 768,
      aspectRatioLte25: aspectRatio <= 2.5,
      widthLte1400: width <= 1400,
      shouldBeTablet: width >= 768 && aspectRatio <= 2.5 && width <= 1400
    });
    console.log('設定按鈕信息:', {
      leftButtonsLength: leftButtons.length,
      settingButton: leftButtons[4],
      settingButtonLabel: leftButtons[4]?.label,
      settingButtonExists: leftButtons[4] !== undefined,
      allButtons: leftButtons.map((btn, idx) => ({ index: idx, label: btn.label }))
    });
    console.log('左側欄位渲染狀態:', {
      isTablet,
      leftSidebarVisible: true,
      settingButtonContainerVisible: true
    });
    
    // 檢查設定按鈕元素是否存在
    setTimeout(() => {
      const settingButtonContainer = document.querySelector('[data-testid="setting-button-container"]');
      const settingButton = document.querySelector('[data-testid="setting-button"]');
      console.log('DOM 元素檢查:', {
        settingButtonContainer: settingButtonContainer,
        settingButton: settingButton,
        containerStyle: settingButtonContainer?.getBoundingClientRect(),
        buttonStyle: settingButton?.getBoundingClientRect(),
      });
    }, 100);
  }, [isMobile, isTablet]);
  
  // 時鐘元件
  function Clock() {
    const [time, setTime] = useState(() => {
      const now = new Date();
      return now.toLocaleTimeString('zh-TW', { hour12: false });
    });
    useEffect(() => {
      const timer = setInterval(() => {
        const now = new Date();
        setTime(now.toLocaleTimeString('zh-TW', { hour12: false }));
      }, 1000);
      return () => clearInterval(timer);
    }, []);
    return (
      <div style={{
        width: '100%',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
        padding: '8px 0',
        userSelect: 'none',
        pointerEvents: 'none',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>{time}</div>
    );
  }
  // 狀態管理
  const [counts, setCounts] = useState({
    allOrders: 10,
    dineIn: 3,
    takeaway: 5,
    delivery: 2,
  });
  const [selectedType, setSelectedType] = useState<string>('allOrders');
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
  const [modalSelectedRow, setModalSelectedRow] = useState<number>(0);
  const [editCount, setEditCount] = useState<number>(0);
  const [editCounts, setEditCounts] = useState<number[]>([]);
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
  // 新增：工作站選單狀態
  const [showWorkstationMenu, setShowWorkstationMenu] = useState(false);
  // 新增：當前選擇的工作站
  const [currentWorkstation, setCurrentWorkstation] = useState('刨肉區');
  

  
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

  // 彙總同名品項的數量
  function summarizeItems(items: OrderItem[]): { name: string; count: number }[] {
    const summary: Record<string, number> = {};
    items.forEach(item => {
      if (!summary[item.name]) {
        summary[item.name] = 0;
      }
      summary[item.name] += item.count;
    });
    return Object.entries(summary).map(([name, count]) => ({ name, count }));
  }



  // 左側按鈕資料
  const leftButtons = [
    {
      label: '部分銷單',
      onClick: () => {
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
      },
    },
    { label: '歷史紀錄', onClick: () => {} },
    { 
      label: '備餐總數', 
      onClick: () => {
        setShowBackupScreen(true);
      } 
    },
    { 
      label: currentWorkstation, 
      onClick: () => {
        setShowWorkstationMenu(!showWorkstationMenu);
      } 
    },
    { label: '⋯', onClick: () => {} },
  ];

  // Modal直接渲染在主return最外層

  // 若 handleModalHold 尚未定義，補上一個空函式避免 linter error
  const handleModalHold = () => {};

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

  const [showTestPortal, setShowTestPortal] = useState(false);
  // 新增：選取品項提示 modal 狀態
  const [showSelectItemModal, setShowSelectItemModal] = useState(false);

  // 共用 style
  const summaryBoxStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 700,
    fontSize: isMobile ? '1.0rem' : isTablet ? '1.4rem' : '1.6rem',
    border: '2px solid #222',
    borderRadius: isMobile ? '8px' : '12px',
    background: '#fff',
    padding: isMobile ? '3px 6px' : '6px 10px',
    flex: 1,
    justifyContent: 'center',
    marginRight: 0,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box' as const,
  };

  return (
    <>
      <div
        style={{
          border: '3px solid #222',
          borderRadius: 0,
          height: '100vh',
          width: '100vw',
          minHeight: 0,
          minWidth: 0,
          maxWidth: '100vw',
          maxHeight: '100vh',
          background: '#fff',
          position: 'fixed',
          top: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          margin: 0,
          overflow: 'visible',
          boxSizing: 'border-box',
        }}
      >
                {/* 左側功能列 */}
        <div
          data-left-sidebar="true"
          style={{
            width: isMobile ? '20vw' : isTablet ? '15vw' : '8vw',
            minWidth: isMobile ? 60 : isTablet ? 100 : 40,
            maxWidth: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#f5f5f5',
            borderRight: '2px solid #222',
            borderBottom: '2px solid #222',
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            padding: 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
            flexShrink: 0,
            justifyContent: 'flex-start',
            alignSelf: 'stretch',
            position: 'relative',
            // 針對平板設備的特殊處理
            ...(isTablet && {
              minHeight: '100vh',
              maxHeight: '100vh',
              overflow: 'hidden',
              height: '100vh',
              width: '15vw',
              zIndex: 2000,
              position: 'relative',
            }),
          }}
        >
          {/* 八個等高的欄位容器 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: '0',
            boxSizing: 'border-box',
            overflow: 'hidden',
            maxHeight: '100%',
            minHeight: '100%',
            justifyContent: 'space-between',
            // 確保在平板設備上有足夠的空間顯示所有按鈕
            ...(isTablet && {
              minHeight: '100%',
              maxHeight: '100%',
            }),
          }}>
            {/* 欄位 1: 倒數計時按鈕 */}
            <div style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              maxHeight: 'auto',
              // 確保在平板設備上有適當的最小高度
              ...(isTablet && {
                minHeight: '10vh',
                maxHeight: '12vh',
              }),
            }}>
              <Button
                variant="filled"
                color="dark"
                size={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
                style={{
                  width: 'calc(100% - 8px)',
                  height: 'calc(100% - 8px)',
                  fontSize: isMobile ? '0.8rem' : isTablet ? '1.0rem' : '1.2rem',
                  fontWeight: 700,
                  margin: '0',
                  padding: '4px',
                  boxSizing: 'border-box',
                  overflow: 'visible',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  borderRadius: 8,
                  background: '#f8f9fa',
                  color: '#495057',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  border: '2px solid #222',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  minHeight: '12vh',
                }}
                onClick={() => {
                  setCountdown(300);
                  playSound('/notification.mp3');
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                }}
              >
                <div style={{ fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem', fontWeight: 700, color: '#495057' }}>
                  {currentItem}/{totalItems}項
                </div>
                <div style={{ fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem', fontWeight: 700, color: '#495057' }}>
                  {countdown}秒
                </div>
                <div style={{ fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem', fontWeight: 700, color: '#495057' }}>
                  自動
                </div>
              </Button>
            </div>

            {/* 欄位 2: 部分銷單按鈕 */}
            <div style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              maxHeight: 'auto',
              // 確保在平板設備上有適當的最小高度
              ...(isTablet && {
                minHeight: '10vh',
                maxHeight: '12vh',
              }),
            }}>
              <Button
                variant="filled"
                color="blue"
                size={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
                style={{
                  width: 'calc(100% - 8px)',
                  height: 'calc(100% - 8px)',
                  fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem',
                  fontWeight: 700,
                  margin: '0',
                  padding: '4px',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  background: '#f8f9fa',
                  color: '#495057',
                  border: '2px solid #222',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
                onClick={leftButtons[0].onClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                }}
              >
                <div style={{ fontSize: isMobile ? '1.0rem' : isTablet ? '1.2rem' : '1.4rem', fontWeight: 700, color: '#495057' }}>
                  部分
                </div>
                <div style={{ fontSize: isMobile ? '1.0rem' : isTablet ? '1.2rem' : '1.4rem', fontWeight: 700, color: '#495057' }}>
                  銷單
                </div>
              </Button>
            </div>

            {/* 欄位 3: 歷史紀錄按鈕 */}
            <div style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              maxHeight: 'auto',
              // 確保在平板設備上有適當的最小高度
              ...(isTablet && {
                minHeight: '10vh',
                maxHeight: '12vh',
              }),
            }}>
              <Button
                variant="filled"
                color="blue"
                size={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
                style={{
                  width: 'calc(100% - 8px)',
                  height: 'calc(100% - 8px)',
                  fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem',
                  fontWeight: 700,
                  margin: '0',
                  padding: '4px',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  background: '#f8f9fa',
                  color: '#495057',
                  border: '2px solid #222',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
                onClick={leftButtons[1].onClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                }}
              >
                <div style={{ fontSize: isMobile ? '1.0rem' : isTablet ? '1.2rem' : '1.4rem', fontWeight: 700, color: '#495057' }}>
                  歷史
                </div>
                <div style={{ fontSize: isMobile ? '1.0rem' : isTablet ? '1.2rem' : '1.4rem', fontWeight: 700, color: '#495057' }}>
                  紀錄
                </div>
              </Button>
            </div>

            {/* 欄位 4: 空欄位 */}
            <div style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              maxHeight: 'auto',
              // 確保在平板設備上有適當的最小高度
              ...(isTablet && {
                minHeight: '10vh',
                maxHeight: '12vh',
              }),
            }}>
              {/* 空欄位 */}
            </div>

            {/* 欄位 5: 聲音測試按鈕 */}
            <div style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              maxHeight: 'auto',
              // 確保在平板設備上有適當的最小高度
              ...(isTablet && {
                minHeight: '10vh',
                maxHeight: '12vh',
              }),
            }}>
              <AudioTest isMobile={isMobile} isTablet={isTablet} />
            </div>



            {/* 欄位 7: 備餐總數按鈕 */}
            <div style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              maxHeight: 'auto',
              // 確保在平板設備上有適當的最小高度
              ...(isTablet && {
                minHeight: '10vh',
                maxHeight: '12vh',
              }),
            }}>
              <Button
                variant="filled"
                color="orange"
                size={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
                style={{
                  width: 'calc(100% - 8px)',
                  height: 'calc(100% - 8px)',
                  fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem',
                  fontWeight: 700,
                  margin: '0',
                  padding: '4px',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  background: '#f8f9fa',
                  color: '#495057',
                  border: '2px solid #222',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
                onClick={leftButtons[2].onClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                }}
              >
                <div style={{ fontSize: isMobile ? '1.0rem' : isTablet ? '1.2rem' : '1.4rem', fontWeight: 700, color: '#495057' }}>
                  備餐
                </div>
                <div style={{ fontSize: isMobile ? '1.0rem' : isTablet ? '1.2rem' : '1.4rem', fontWeight: 700, color: '#495057' }}>
                  總數
                </div>
              </Button>
            </div>

            {/* 欄位 8: 工作站按鈕 */}
            <div style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              boxSizing: 'border-box',
              overflow: 'hidden',
              maxHeight: 'auto',
              // 確保在平板設備上有適當的最小高度
              ...(isTablet && {
                minHeight: '10vh',
                maxHeight: '12vh',
              }),
            }}>
              <Button
                variant="filled"
                color="gray"
                size={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
                style={{
                  width: '100%',
                  height: '100%',
                  fontSize: isMobile ? '0.8rem' : isTablet ? '1.0rem' : '1.2rem',
                  fontWeight: 700,
                  margin: '0',
                  padding: '4px',
                  boxSizing: 'border-box',
                  overflow: 'visible',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: 0,
                  border: 'none',
                  borderTop: '2px solid #222',
                  borderBottom: '2px solid #222',
                  position: 'relative',
                  background: '#f8f9fa',
                  color: '#495057',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  opacity: 1,
                  minHeight: '12vh',
                }}
                onClick={leftButtons[3].onClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={{ color: '#495057', fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem', fontWeight: 700 }}>
                  {leftButtons[3].label || '刨肉區'}
                </div>
              </Button>
            </div>

            {/* 欄位 9: 設定按鈕 */}
            <div 
              data-testid="setting-button-container"
              style={{
                flex: 0,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                boxSizing: 'border-box',
                overflow: 'hidden',
                maxHeight: 'auto',
                zIndex: 9999,
                position: 'relative',
                minHeight: '80px', // 確保最小高度
                // 確保在平板設備上有適當的最小高度
                ...(isTablet && {
                  minHeight: '12vh',
                  maxHeight: 'auto',
                }),
              }}
            >
              <Button
                variant="filled"
                color="dark"
                size={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
                style={{
                  width: '100%',
                  height: '100%',
                  fontSize: isMobile ? '1.2rem' : isTablet ? '1.4rem' : '1.6rem',
                  fontWeight: 700,
                  margin: '0',
                  padding: '4px',
                  boxSizing: 'border-box',
                  overflow: 'visible',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: 0,
                  border: 'none',
                  borderBottom: '2px solid #222',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0,
                  background: '#f8f9fa',
                  color: '#495057',
                  boxShadow: 'none',
                  opacity: 1,
                  minHeight: isTablet ? '12vh' : '80px',
                  zIndex: 10000,
                  position: 'relative',
                }}
                data-testid="setting-button"
                onClick={leftButtons[4].onClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                }}
              >
                <div style={{ color: '#495057', fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem', fontWeight: 700 }}>
                  {leftButtons[4].label || '⋯'} {/* 設定按鈕 */}
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* 右側主內容 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            width: '100%',
            maxWidth: '100%',
            height: '100vh',
            minHeight: '100vh',
            maxHeight: '100vh',
            overflow: 'visible',
            boxSizing: 'border-box',
            flexShrink: 1,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              background: '#f8f9fa',
              borderBottom: '3px solid #dee2e6',
              borderRadius: 0,
              alignItems: 'center',
              padding: isMobile ? '16px 20px' : '20px 24px',
              justifyContent: 'space-between',
              display: 'flex',
              marginBottom: 0,
              minWidth: 0,
              maxWidth: '100%',
              boxSizing: 'border-box',
              overflow: 'visible',
              flexShrink: 0,
              gap: isMobile ? '24px' : '36px',
              zIndex: 1,
              position: 'relative',
            }}
          >
            {/* 待製作批次 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#fff',
              borderRadius: 0,
              padding: isMobile ? '12px 16px' : '16px 20px',
              border: '3px solid #28a745',
              boxShadow: '0 3px 8px rgba(40, 167, 69, 0.25)',
              flex: 1,
              justifyContent: 'center',
              gap: isMobile ? 12 : 16,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minWidth: isMobile ? 32 : 40,
                height: isMobile ? 28 : 36,
                border: '2px solid #28a745',
                borderRadius: 0,
                background: '#28a745',
                color: '#fff',
                fontWeight: 900,
                fontSize: isMobile ? '1.2rem' : '1.6rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}>15</div>
              <span style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                fontWeight: 700,
                fontSize: isMobile ? '1.3rem' : isTablet ? '1.6rem' : '1.8rem',
                color: '#28a745'
              }}>待製作批次</span>
            </div>
            {/* 逾時批次 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#fff',
              borderRadius: 0,
              padding: isMobile ? '12px 16px' : '16px 20px',
              border: '3px solid #dc3545',
              boxShadow: '0 3px 8px rgba(220, 53, 69, 0.25)',
              flex: 1,
              justifyContent: 'center',
              gap: isMobile ? 12 : 16,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <span style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                fontWeight: 700,
                fontSize: isMobile ? '1.3rem' : isTablet ? '1.6rem' : '1.8rem',
                color: '#dc3545'
              }}>逾時批次</span>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minWidth: isMobile ? 32 : 40,
                height: isMobile ? 28 : 36,
                border: '2px solid #dc3545',
                borderRadius: 0,
                background: '#dc3545',
                color: '#fff',
                fontWeight: 900,
                fontSize: isMobile ? '1.2rem' : '1.6rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}>3</div>
            </div>
          </div>
          <div style={{ flex: 1, padding: 0, margin: 0, overflow: 'hidden', maxHeight: '100%' }}>
            {/* 三欄看板（Table） */}
            <Table
              highlightOnHover={false}
              style={{
                tableLayout: 'fixed',
                width: '100%',
                height: '100%',
                minWidth: 0,
                maxWidth: '100%',
                maxHeight: '100%',
                marginTop: 0,
                boxSizing: 'border-box',
                overflow: 'hidden',
                padding: 0,
                borderCollapse: 'collapse',
              }}>
                
              <tbody style={{ overflow: 'hidden', maxHeight: '100%' }}>
                <tr style={{ overflow: 'hidden', maxHeight: '100%' }}>
                  {/* 製作中 */}
                  <td style={{ verticalAlign: 'top', minWidth: 0, maxWidth: '100%', width: '33.33%', boxSizing: 'border-box', padding: 0, overflow: 'hidden', maxHeight: '100%', borderBottom: '2px solid #222', borderRight: '2px solid #222' }}>
                    {/* 製作中表頭 */}
                    <div style={{
                      textAlign: 'center',
                      background: '#FFA042',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: isMobile ? '1.5rem' : isTablet ? '1.7rem' : '1.9rem',
                      padding: isMobile ? '2px 1px' : '3px 2px',
                      border: 'none',
                      borderBottom: '2px solid #222',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      製作中
                    </div>
                    {(() => {
                      // 按品項名稱分組，但保持備註分開
                      const groupedItems = categoryItems.making.reduce((acc, item) => {
                        const key = item.name;
                        if (!acc[key]) {
                          acc[key] = [];
                        }
                        acc[key].push(item);
                        return acc;
                      }, {} as Record<string, typeof categoryItems.making>);

                      return Object.entries(groupedItems).map(([itemName, items]) => (
                        <div
                          key={itemName}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            justifyContent: 'flex-start',
                            background: '#f5f5f5',
                            color: '#222',
                            fontWeight: 500,
                            borderRadius: 12,
                            padding: 0,
                            margin: isMobile ? '4px 2px' : '6px 4px',
                            cursor: 'pointer',
                            border: selectedItem && selectedItem.category === 'making' && selectedItem.name === itemName ? '4px solid #d7263d' : timeColor === '#d7263d' ? '2px solid #d7263d' : '2px solid #222',
                            boxShadow: timeColor === '#d7263d' ? '0 4px 12px rgba(215, 38, 61, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            minHeight: isMobile ? 80 : 100,
                            maxWidth: '100%',
                            animation: timeColor === '#d7263d' ? 'pulse 2s infinite' : 'none',
                          }}
                          onClick={() => setSelectedItem({ category: 'making', name: itemName })}
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCategoryItems(prev => ({ ...prev, making: prev.making.filter(m => m.name !== itemName) }));
                          }}
                          onTouchStart={(e) => {
                            // 防止手機上的縮放
                            e.preventDefault();
                          }}
                        >
                          {/* 表頭區域 */}
                          <div style={{
                            background: timeColor,
                            color: '#fff',
                            padding: isMobile ? '4px 8px' : '6px 12px',
                            fontSize: isMobile ? '1.2rem' : isTablet ? '1.5rem' : '1.7rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            borderBottom: '1px solid #222',
                          }}>
                            #1-製作中
                          </div>
                          {/* 內容區域 */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: isMobile ? '8px 4px' : '12px 8px',
                            flex: 1,
                            gap: 4,
                          }}>
                            {items.map((makingItem, idx) => (
                              <div key={`${makingItem.table}-${makingItem.note || 'no-note'}`} style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 12,
                              }}>
                                <span style={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap', 
                                  fontSize: isMobile ? '1.1rem' : isTablet ? '1.4rem' : '1.6rem',
                                  fontWeight: 700
                                }}>{makingItem.name}</span>
                                <Badge 
                                  color="gray" 
                                  size="md" 
                                  style={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap', 
                                    fontSize: isMobile ? '1.0rem' : isTablet ? '1.3rem' : '1.5rem',
                                    fontWeight: 700
                                  }}
                                >{makingItem.count}</Badge>
                              </div>
                            ))}
                            {items.some(item => item.note) && (
                              <div style={{
                                fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem',
                                color: '#d7263d',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                -雪花多一點
                              </div>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </td>
                  {/* Hold */}
                  <td style={{ verticalAlign: 'top', minWidth: 0, maxWidth: '100%', width: '33.33%', boxSizing: 'border-box', padding: 0, overflow: 'hidden', maxHeight: '100%', borderBottom: '2px solid #222', borderRight: '2px solid #222' }}>
                    {/* Hold表頭 */}
                    <div style={{
                      textAlign: 'center',
                      background: '#FFA042',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: isMobile ? '1.5rem' : isTablet ? '1.7rem' : '1.9rem',
                      padding: isMobile ? '2px 1px' : '3px 2px',
                      border: 'none',
                      borderBottom: '2px solid #222',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      letterSpacing: '0.2em',
                      fontFamily: 'Arial, sans-serif',
                    }}>
                      Hold
                    </div>
                    {(() => {
                      // 按品項名稱分組，但保持備註分開
                      const groupedItems = categoryItems.hold.reduce((acc, item) => {
                        const key = item.name;
                        if (!acc[key]) {
                          acc[key] = [];
                        }
                        acc[key].push(item);
                        return acc;
                      }, {} as Record<string, typeof categoryItems.hold>);

                      return Object.entries(groupedItems).map(([itemName, items]) => (
                        <div
                          key={itemName}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            justifyContent: 'flex-start',
                            background: '#f5f5f5',
                            color: '#222',
                            fontWeight: 500,
                            borderRadius: 12,
                            padding: 0,
                            margin: isMobile ? '4px 2px' : '6px 4px',
                            cursor: 'pointer',
                            border: selectedItem && selectedItem.category === 'hold' && selectedItem.name === itemName ? '4px solid #d7263d' : '2px solid #222',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            minHeight: isMobile ? 80 : 100,
                            maxWidth: '100%',
                          }}
                          onClick={() => setSelectedItem({ category: 'hold', name: itemName })}
                          onDoubleClick={() => setCategoryItems(prev => ({ ...prev, hold: prev.hold.filter(h => h.name !== itemName) }))}
                        >
                          {/* 表頭區域 */}
                          <div style={{
                            background: '#009944',
                            color: '#fff',
                            padding: isMobile ? '4px 8px' : '6px 12px',
                            fontSize: isMobile ? '1.2rem' : isTablet ? '1.5rem' : '1.7rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            borderBottom: '1px solid #222',
                          }}>
                            #2-Hold
                          </div>
                          {/* 內容區域 */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: isMobile ? '8px 4px' : '12px 8px',
                            flex: 1,
                            gap: 4,
                          }}>
                            {items.map((item, idx) => (
                              <div key={`${item.table}-${item.note || 'no-note'}`} style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 12,
                              }}>
                                <span style={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap', 
                                  fontSize: isMobile ? '1.1rem' : isTablet ? '1.4rem' : '1.6rem',
                                  fontWeight: 700
                                }}>{item.name}</span>
                                <Badge 
                                  color="gray" 
                                  size="md" 
                                  style={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap', 
                                    fontSize: isMobile ? '1.0rem' : isTablet ? '1.3rem' : '1.5rem',
                                    fontWeight: 700
                                  }}
                                >{item.count}</Badge>
                              </div>
                            ))}
                            {items.some(item => item.note) && (
                              <div style={{
                                fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem',
                                color: '#d7263d',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                -雪花多一點
                              </div>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </td>
                  {/* 待製作 */}
                  <td style={{ verticalAlign: 'top', minWidth: 0, maxWidth: '100%', width: '33.33%', boxSizing: 'border-box', padding: 0, overflow: 'hidden', maxHeight: '100%', borderBottom: '2px solid #222' }}>
                    {/* 待製作表頭 */}
                    <div style={{
                      textAlign: 'center',
                      background: '#FFA042',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: isMobile ? '1.5rem' : isTablet ? '1.7rem' : '1.9rem',
                      padding: isMobile ? '2px 1px' : '3px 2px',
                      border: 'none',
                      borderBottom: '2px solid #222',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      待製作
                    </div>
                    {summarizeItems(categoryItems.waiting).map((item, idx, arr) => (
                      <div
                        key={item.name}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          justifyContent: 'flex-start',
                          background: '#f5f5f5',
                          color: '#222',
                          fontWeight: 500,
                          borderRadius: 12,
                          padding: 0,
                          margin: isMobile ? '4px 2px' : '6px 4px',
                          opacity: 0.5,
                          cursor: 'not-allowed',
                          border: '2px solid #222',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minHeight: isMobile ? 80 : 100,
                          maxWidth: '100%',
                        }}
                      >
                        {/* 表頭區域 */}
                        <div style={{
                          background: '#009944',
                          color: '#fff',
                          padding: isMobile ? '4px 8px' : '6px 12px',
                          fontSize: isMobile ? '1.2rem' : isTablet ? '1.5rem' : '1.7rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          borderTopLeftRadius: 10,
                          borderTopRightRadius: 10,
                          borderBottom: '1px solid #222',
                        }}>
                          #3-待製作
                        </div>
                        {/* 內容區域 */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: isMobile ? '8px 4px' : '12px 8px',
                          flex: 1,
                          gap: 12,
                        }}>
                          <span style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap', 
                            fontSize: isMobile ? '1.1rem' : isTablet ? '1.4rem' : '1.6rem',
                            fontWeight: 700
                          }}>{item.name}</span>
                          <Badge 
                            color="gray" 
                            size="md" 
                            style={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap', 
                              fontSize: isMobile ? '1.0rem' : isTablet ? '1.3rem' : '1.5rem',
                              fontWeight: 700
                            }}
                          >{item.count}</Badge>
                        </div>
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
        {/* 部分銷單 React Portal 浮層 */}
        {showModal && typeof window !== 'undefined' && createPortal(
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            zIndex: 99999,
            width: isMobile ? '95vw' : 480,
            maxWidth: '98vw',
            minWidth: isMobile ? '70vw' : 360,
            minHeight: isMobile ? '25vh' : 250,
            maxHeight: '85vh',
            border: '3px solid #222',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            overflow: 'hidden',
          }}>
            <div style={{ 
              background: '#ffc107', 
              color: '#222', 
              fontWeight: 900, 
              fontSize: isMobile ? '1.5rem' : isTablet ? '1.7rem' : '1.9rem', 
              textAlign: 'center', 
              borderRadius: '13px 13px 0 0',
              padding: isMobile ? '16px 0' : '20px 0', 
              width: '100%', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              borderBottom: '2px solid #222',
              fontFamily: 'Microsoft JhengHei, 微軟正黑體, sans-serif'
            }}>
              部分銷單(HOLD)品項
            </div>
            <div style={{ 
              width: '100%', 
              flex: 1, 
              overflow: 'hidden', 
              padding: isMobile ? '20px' : '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12
            }}>
              {modalRows.map((row, idx) => (
                <div
                  key={`${row.table}-${row.note || 'default'}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 2.5fr 0.8fr auto',
                    alignItems: 'center',
                    background: '#fff',
                    color: '#222',
                    borderRadius: 0,
                    padding: isMobile ? '12px 16px' : '16px 20px',
                    marginBottom: isMobile ? 12 : 16,
                    fontWeight: 700,
                    fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem',
                    border: 'none',
                    overflow: 'hidden',
                    width: isMobile ? '85%' : '80%',
                    gap: isMobile ? 8 : 12,
                    margin: '0 auto',
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center',
                    overflow: 'hidden',
                    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
                    justifySelf: 'start',
                    paddingLeft: isMobile ? 1 : 2,
                    gap: 1,
                  }}>
                    {row.table.includes('內用') ? (
                      <>
                        <span style={{ fontSize: isMobile ? '1.2rem' : isTablet ? '1.4rem' : '1.6rem' }}>內用</span>
                        <span style={{ fontSize: isMobile ? '1.2rem' : isTablet ? '1.4rem' : '1.6rem' }}>{row.table.replace('內用', '')}</span>
                      </>
                    ) : (
                      <span>{row.table}</span>
                    )}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center',
                    overflow: 'hidden',
                    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
                  }}>
                    <span style={{ fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem' }}>{row.name}</span>
                    {row.note && (
                      <span style={{ 
                        fontSize: isMobile ? '1.1rem' : isTablet ? '1.3rem' : '1.5rem', 
                        color: '#d7263d', 
                        fontStyle: 'italic',
                        marginTop: 2,
                      }}>
                        -{row.note}
                      </span>
                    )}
                  </div>
                  <span style={{ textAlign: 'center', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{row.count}</span>
                  {/* 加減按鈕與異動數量 */}
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <MantineButton
                      size="md"
                      color="gray"
                      variant="outline"
                      style={{ minWidth: isMobile ? 32 : 40, padding: '8px 12px', marginRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 700 }}
                      onClick={() => setHoldEditCounts(arr => arr.map((v, i) => i === idx ? Math.max(0, v - 1) : v))}
                      disabled={holdEditCounts[idx] <= 0}
                    >
                      -
                    </MantineButton>
                    <span style={{ minWidth: isMobile ? 24 : 32, textAlign: 'center', fontWeight: 700, color: holdEditCounts[idx] > 0 ? 'red' : '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem' }}>{holdEditCounts[idx]}</span>
                    <MantineButton
                      size="md"
                      color="gray"
                      variant="outline"
                      style={{ minWidth: isMobile ? 32 : 40, padding: '8px 12px', marginLeft: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 700 }}
                      onClick={() => setHoldEditCounts(arr => arr.map((v, i) => i === idx ? Math.min(row.count, v + 1) : v))}
                      disabled={holdEditCounts[idx] >= row.count}
                    >
                      +
                    </MantineButton>
                  </span>
                </div>
              ))}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: isMobile ? 12 : 16, 
              width: '100%', 
              padding: isMobile ? '20px 0' : '24px 0', 
              borderTop: '1px solid #ddd',
              overflow: 'hidden',
            }}>
              <MantineButton
                variant="filled"
                color="dark"
                size={isMobile ? 'lg' : 'xl'}
                style={{ 
                  fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem', 
                  fontWeight: 700, 
                  padding: isMobile ? '12px 20px' : '16px 28px',
                  borderRadius: 8,
                  minWidth: isMobile ? '80px' : '100px',
                  maxWidth: isMobile ? '120px' : '140px',
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  flex: '0 0 auto',
                  margin: '0 auto',
                }}
                onClick={handleHold}
              >
                Hold
              </MantineButton>
              <MantineButton
                variant="outline"
                color="dark"
                size={isMobile ? 'lg' : 'xl'}
                style={{ 
                  fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem', 
                  fontWeight: 700, 
                  padding: isMobile ? '12px 20px' : '16px 28px',
                  borderRadius: 8,
                  minWidth: isMobile ? '80px' : '100px',
                  maxWidth: isMobile ? '120px' : '140px',
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  flex: '0 0 auto',
                  margin: '0 auto',
                }}
                onClick={() => setShowModal(false)}
              >
                關閉
              </MantineButton>
            </div>
          </div>,
          document.body
        )}
      </div>
      
      {/* 選取品項提示 Modal */}
      {showSelectItemModal && typeof window !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          zIndex: 100000,
          width: isMobile ? '80vw' : 340,
          maxWidth: '95vw',
          minWidth: isMobile ? '50vw' : 240,
          minHeight: isMobile ? '12vh' : 120,
          maxHeight: '90vh',
          border: '3px solid #222',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: isMobile ? '4vw' : 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
                      <div style={{ fontWeight: 900, fontSize: isMobile ? '1.25rem' : isTablet ? '1.4rem' : '1.6rem', color: '#d7263d', marginBottom: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              請先選取一個品項
            </div>
            <MantineButton
              variant="filled"
              color="dark"
              size={isMobile ? 'sm' : 'md'}
              style={{ width: isMobile ? '40vw' : 100, minWidth: 60, maxWidth: 120, fontWeight: 700, fontSize: isMobile ? '1.15rem' : isTablet ? '1.3rem' : '1.5rem', borderRadius: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              onClick={() => setShowSelectItemModal(false)}
            >
              確認
            </MantineButton>
        </div>,
        document.body
      )}

      {/* 工作站選單彈跳視窗 */}
      {showWorkstationMenu && typeof window !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          zIndex: 999999,
          width: isMobile ? '320px' : '380px',
          maxWidth: '90vw',
          minWidth: isMobile ? '240px' : '280px',
          minHeight: isMobile ? '200px' : '240px',
          maxHeight: '80vh',
          border: '3px solid #222',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}>
          <div style={{ 
            background: '#ffc107', 
            color: '#222', 
            fontWeight: 900, 
            fontSize: isMobile ? '1.6rem' : isTablet ? '1.8rem' : '2.0rem', 
            textAlign: 'center', 
            borderRadius: '13px 13px 0 0',
            padding: isMobile ? '16px 0' : '20px 0', 
            width: '100%', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            borderBottom: '2px solid #222',
            fontFamily: 'Microsoft JhengHei, 微軟正黑體, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            選擇工作站
          </div>
          
          <div style={{ 
            width: '100%', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20, 
            padding: isMobile ? '20px' : '24px',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            {['刨肉區', '菜盤', '大盤'].map((station, index) => (
              <div key={station} style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0 16px'
              }}>
                <Button
                  key={station}
                  variant="subtle"
                  color="dark"
                  size={isMobile ? 'lg' : 'xl'}
                  style={{
                    width: '100%',
                    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
                    fontWeight: 700,
                    padding: isMobile ? '16px 20px' : '20px 24px',
                    borderRadius: 0,
                    border: 'none',
                    background: currentWorkstation === station ? '#e0e0e0' : '#fff',
                    color: '#222',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: isMobile ? '60px' : '70px',
                  }}
                  onClick={() => {
                    console.log(`選擇工作站: ${station}`);
                    setCurrentWorkstation(station);
                    setShowWorkstationMenu(false);
                  }}
                  onMouseEnter={(e) => {
                    if (currentWorkstation !== station) {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentWorkstation !== station) {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }
                  }}
                >
                  {station}
                </Button>
              </div>
            ))}
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%', 
            padding: isMobile ? '16px' : '20px', 
            borderTop: '1px solid #ddd' 
          }}>
            <Button
              variant="filled"
              color="gray"
              size={isMobile ? 'lg' : 'xl'}
              style={{
                fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem',
                fontWeight: 700,
                padding: isMobile ? '12px 20px' : '16px 28px',
                borderRadius: 8,
                minWidth: isMobile ? '80px' : '100px',
              }}
              onClick={() => setShowWorkstationMenu(false)}
            >
              取消
            </Button>
          </div>
        </div>,
        document.body
      )}

      {/* 備餐總數右半邊畫面 */}
      {showBackupScreen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: isMobile ? '20vw' : isTablet ? '15vw' : '8vw',
          width: isMobile ? '80vw' : isTablet ? '85vw' : '92vw',
          height: '100vh',
          backgroundColor: '#000',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}>
          <div style={{
            fontSize: isMobile ? '2.2rem' : isTablet ? '2.8rem' : '3.2rem',
            fontWeight: 700,
            marginBottom: isMobile ? '2rem' : '3rem',
            textAlign: 'center',
          }}>
            備餐總數
          </div>
          <div style={{
            fontSize: isMobile ? '1.7rem' : isTablet ? '2.2rem' : '2.4rem',
            fontWeight: 600,
            marginBottom: isMobile ? '3rem' : '4rem',
            textAlign: 'center',
          }}>
            總計: 25 份
          </div>
          <Button
            variant="filled"
            color="gray"
            size={isMobile ? 'lg' : 'xl'}
            style={{
              fontSize: isMobile ? '1.4rem' : isTablet ? '1.7rem' : '1.9rem',
              fontWeight: 700,
              padding: isMobile ? '12px 24px' : '16px 32px',
              borderRadius: 12,
            }}
            onClick={() => setShowBackupScreen(false)}
          >
            返回
          </Button>
        </div>
      )}
    </>
  );
}