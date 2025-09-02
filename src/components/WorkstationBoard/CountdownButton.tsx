"use client";
import { useState, useEffect } from 'react';
import { Button } from '@mantine/core';
import { useIsMobile } from '../../hooks/useIsMobile';
import { countdownButtonStyles } from '../../styles/countdownButtonStyles';
import { useGlobalContext } from '../../context/GlobalContext';

interface CountdownButtonProps {
  currentItem: number;
  totalItems: number;
  countdown: number;
  isPunchedIn: boolean;
  punchInTime: string;
  disabled?: boolean;
  onClick: () => void;
}

export default function CountdownButton({
  currentItem,
  totalItems,
  countdown,
  isPunchedIn,
  punchInTime,
  disabled = false,
  onClick
}: CountdownButtonProps) {
  const { isMobile, isTablet } = useIsMobile();
  const styles = countdownButtonStyles({ isMobile, isTablet });
  const { displayDispatch } = useGlobalContext();
  
  // 雙擊檢測狀態
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDoubleClickActive, setIsDoubleClickActive] = useState(false);
  
  // 清理定時器
  useEffect(() => {
    return () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  }, [clickTimer]);
  
  // 重置雙擊狀態的函數
  const resetDoubleClickState = () => {
    setIsDoubleClickActive(false);
  };
  
  // 可選：在組件卸載時重置狀態
  useEffect(() => {
    return () => {
      resetDoubleClickState();
    };
  }, []);

  const handleDoubleClick = () => {
    console.log('雙擊事件觸發！'); // 調試日誌
    
    // 設定全域變數 changeMeal = 1
    try {
      displayDispatch({ type: 'SET_CHANGE_MEAL', payload: 1 });
      console.log('已將 changeMeal 設為 1');
    } catch (e) {
      console.warn('設定 changeMeal 失敗', e);
    }
    
    if (!disabled) {
      console.log('按鈕未禁用，開始執行特效邏輯'); // 調試日誌
      
      // 設置雙擊狀態為活躍，並強制恢復白色狀態
      setIsDoubleClickActive(true);
      
      // 強制更新按鈕樣式，確保立即顯示白色
      setTimeout(() => {
        const buttonElement = document.querySelector('[data-countdown-button]') as HTMLElement;
        if (buttonElement) {
          buttonElement.style.backgroundColor = '#ffffff';
          buttonElement.style.color = '#495057';
          buttonElement.style.borderColor = '#000000';
        }
      }, 0);
      
      // 雙擊觸發雪花牛特效：油花少一點的數量網底華麗特效
      const style = document.createElement('style');
      style.textContent = `
        @keyframes outlineBreath {
          0% { border-color: #0080FF !important; background-color: #0080FF !important; }
          50% { border-color: #004499 !important; background-color: #004499 !important; }
          100% { border-color: #0080FF !important; background-color: #0080FF !important; }
        }
        
        @keyframes glowPulse {
          0% { box-shadow: 0 0 4px rgba(0,128,255,0.6), 0 0 8px rgba(0,128,255,0.4); }
          50% { box-shadow: 0 0 8px rgba(0,102,204,0.7), 0 0 14px rgba(0,102,204,0.5); }
          100% { box-shadow: 0 0 4px rgba(0,128,255,0.6), 0 0 8px rgba(0,128,255,0.4); }
        }
        
        @keyframes scalePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        
        .quantity-outline-effect {
          border-width: 3px !important;
          border-style: solid !important;
          border-color: #0080FF !important; /* 與特效一主色同色 */
          background-color: #0080FF !important; /* 與特效一主色同色 */
          border-radius: 6px !important;
          padding: 6px 10px !important;
          width: 25px !important;
          text-align: center !important;
          color: white !important;
          animation: outlineBreath 1s ease-in-out infinite, glowPulse 1.1s ease-in-out infinite, scalePulse 1.5s ease-in-out infinite !important;
          will-change: border-color, background-color, transform, box-shadow !important;
          position: relative !important;
          z-index: 1000 !important;
          text-shadow: 0 0 6px rgba(255, 255, 255, 0.6) !important;
          font-weight: bold !important;
        }
        
        /* 強制覆蓋任何可能的樣式衝突 */
        .quantity-outline-effect[style*="border"] {
          border-color: #0080FF !important;
          background-color: #0080FF !important;
          animation: outlineBreath 1s ease-in-out infinite, glowPulse 1.1s ease-in-out infinite, scalePulse 1.5s ease-in-out infinite !important;
        }
        
        /* 確保動畫在子元素上也能生效 */
        .quantity-outline-effect * {
          animation: none !important;
        }
        
        /* 額外的強制規則，確保動畫生效 */
        span.quantity-outline-effect {
          animation: outlineBreath 1s ease-in-out infinite, glowPulse 1.1s ease-in-out infinite, scalePulse 1.5s ease-in-out infinite !important;
          border-color: #0080FF !important;
          background-color: #0080FF !important;
        }
        
        /* 最強制規則：覆蓋所有可能的樣式 */
        .quantity-outline-effect,
        .quantity-outline-effect[style*="padding"],
        .quantity-outline-effect[style*="color"] {
          animation: outlineBreath 1s ease-in-out infinite, glowPulse 1.1s ease-in-out infinite, scalePulse 1.5s ease-in-out infinite !important;
          border: 3px solid #0080FF !important;
          background-color: #0080FF !important;
          color: white !important;
          box-shadow: 0 0 6px rgba(0,128,255,0.6), 0 0 12px rgba(0,128,255,0.4) !important;
        }
        
        /* 華麗特效：添加閃爍星星效果 */
        .quantity-outline-effect::before {
          content: '✨';
          position: absolute !important;
          top: -15px !important;
          left: -10px !important;
          font-size: 12px !important;
          animation: scalePulse 1s ease-in-out infinite !important;
          z-index: 1001 !important;
        }
        
        .quantity-outline-effect::after {
          content: '⭐';
          position: absolute !important;
          bottom: -15px !important;
          right: -10px !important;
          font-size: 12px !important;
          animation: scalePulse 1.5s ease-in-out infinite reverse !important;
          z-index: 1001 !important;
        }
      `;
      document.head.appendChild(style);
      console.log('CSS 樣式已添加到 document.head，特效一顏色改為 #0080FF'); // 調試日誌

      // 找到所有雪花牛品項並添加對應特效
      const items = document.querySelectorAll('.making-item-row');
      console.log('找到製作中品項數量:', items.length); // 調試日誌
      
      items.forEach((item, index) => {
        const itemName = item.querySelector('.item-name')?.textContent;
        const itemNote = item.querySelector('.item-note')?.textContent;
        
        console.log(`品項 ${index + 1}:`, { itemName, itemNote }); // 調試日誌
        
        // 處理油花少一點的品項 - 數量網底華麗特效
        if (itemName === '雪花牛' && itemNote === '油花少一點') {
          console.log('找到油花少一點品項，為數量網底添加華麗特效'); // 調試日誌
          let quantityBadge: Element | null = null;
          // 策略A：優先用穩定 class 選擇
          quantityBadge = item.querySelector('.qty-badge');
          // 策略B：通過樣式屬性查找（依據現有 inline style）
          if (!quantityBadge) quantityBadge = item.querySelector('span[style*="padding: 6px 10px"]');
          // 策略C：fallback 以數字內容尋找
          if (!quantityBadge) {
            const spans = item.querySelectorAll('span');
            quantityBadge = Array.from(spans).find((span) => /^\d+$/.test((span.textContent || '').trim())) || null;
          }
          // 策略D：使用最後一個 span 作為備援
          if (!quantityBadge) {
            const spans = item.querySelectorAll('span');
            if (spans.length > 0) quantityBadge = spans[spans.length - 1];
          }
          if (quantityBadge) {
            (quantityBadge as HTMLElement).classList.add('quantity-outline-effect');
            console.log('已為數量網底加上華麗特效');
          } else {
            console.log('找不到數量網底元素，無法加上華麗特效');
          }
        }
      });

      // 特效永久持續，不清理樣式，直到畫面刷新
      console.log('特效已設置為永久持續，樣式不會被自動清理'); // 調試日誌
    } else {
      console.log('按鈕已禁用，無法執行特效'); // 調試日誌
    }
  };

  // 處理點擊事件
  const handleClick = () => {
    if (disabled) return;
    
    setClickCount(prev => prev + 1);
    
    if (clickCount === 0) {
      // 第一次點擊，設置定時器
      const timer = setTimeout(() => {
        // 單擊：執行原本的 onClick
        onClick();
        setClickCount(0);
        setClickTimer(null);
      }, 300); // 300ms 內如果沒有第二次點擊，則視為單擊
      
      setClickTimer(timer);
    } else if (clickCount === 1) {
      // 第二次點擊：雙擊事件
      if (clickTimer) {
        clearTimeout(clickTimer);
        setClickTimer(null);
      }
      setClickCount(0);
      handleDoubleClick();
    }
  };

  return (
    <Button
      variant="filled"
      color={isPunchedIn ? "green" : "dark"}
      size={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
      style={{
        ...styles.button,
        // 雙擊後恢復成白色狀態，不反灰
        opacity: 1,
        filter: 'none',
        backgroundColor: isDoubleClickActive ? '#ffffff' : undefined,
        color: isDoubleClickActive ? '#495057' : undefined,
        // 確保雙擊後按鈕保持活躍狀態
        cursor: 'pointer',
        pointerEvents: 'auto',
        // 雙擊後使用白色背景，深色文字，黑色邊框
        border: isDoubleClickActive ? '2px solid #000000' : undefined,
      }}
      onClick={handleClick}
      disabled={disabled}
      data-countdown-button="true"
              onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
          // 雙擊後保持白色背景，不反灰
          if (isDoubleClickActive) {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.borderColor = '#000000';
          } else {
            // 正常狀態下的滑動效果
            e.currentTarget.style.backgroundColor = '#e9ecef';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
          // 雙擊後保持白色背景，不反灰
          if (isDoubleClickActive) {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#000000';
          } else {
            // 正常狀態下恢復原樣
            e.currentTarget.style.backgroundColor = '';
          }
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(0.95)';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.4)';
          // 雙擊後保持白色背景，不反灰
          if (isDoubleClickActive) {
            e.currentTarget.style.backgroundColor = '#e9ecef';
            e.currentTarget.style.borderColor = '#000000';
          } else {
            // 正常狀態下的點擊壓下效果
            e.currentTarget.style.backgroundColor = '#d1ecf1';
          }
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
          // 雙擊後保持白色背景，不反灰
          if (isDoubleClickActive) {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.borderColor = '#000000';
          } else {
            // 正常狀態下的釋放效果
            e.currentTarget.style.backgroundColor = '#e9ecef';
          }
        }
      }}
    >
      {/* 倒數計時按鈕 */}
      <>
        <div style={styles.countdownText}>
          {currentItem}/{totalItems}
        </div>
        <div style={styles.countdownText}>
          {countdown}秒
        </div>
        <div style={styles.countdownText}>
          {isPunchedIn ? "已打卡" : "自動"}
        </div>
      </>
    </Button>
  );
}
