"use client";
import { useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useGlobalContext } from '../../context/GlobalContext';
import { truncateNoteText } from '../../lib/textUtils';
import { workBoardStyles } from '../../styles/workBoardStyles';
import { cardItemStyles } from '../../styles/cardItemStyles';

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

interface WorkBoardProps {
  categoryItems: CategoryItems;
  timeColor: string;
  selectedMakingItem: string | null;
  clickedMakingItems: Set<string>;
  onMakingItemSelect: (itemIdentifier: string) => void;
  selectedHoldItem: string | null;
  clickedHoldItems: Set<string>;
  onHoldItemSelect: (itemIdentifier: string) => void;
  hiddenMakingCards: Set<string>;
  hiddenHoldCards: Set<string>;
  onCardHeaderDoubleClick: (cardType: 'making' | 'hold', cardKey: string) => void;
}

export function WorkBoard({
  categoryItems,
  timeColor,
  selectedMakingItem,
  clickedMakingItems,
  onMakingItemSelect,
  selectedHoldItem,
  clickedHoldItems,
  onHoldItemSelect,
  hiddenMakingCards,
  hiddenHoldCards,
  onCardHeaderDoubleClick
}: WorkBoardProps) {
  const { isMobile, isTablet } = useIsMobile();
  const { displayState } = useGlobalContext();
  const styles = workBoardStyles({ isMobile, isTablet });
  const shared = cardItemStyles({ isMobile, isTablet, celltype: displayState.celltype });

  // 根據 celltype 決定顯示的列數
  const shouldShowThirdRow = displayState.celltype === '4';
  
  // 計算可用的欄位數量（包含動態的 HOLD 欄位）
  const getAvailableColumns = () => {
    const hasHoldColumn = categoryItems.hold.length > 0 && !hiddenHoldCards.has('hold-main');
    const maxColumns = displayState.celltype === '3' ? 3 : 4;
    
    // 計算待製作欄位可以使用的數量
    let availableWaitingColumns = maxColumns - 1; // 減去製作中欄位
    
    if (hasHoldColumn) {
      availableWaitingColumns -= 1; // 如果有 HOLD 欄位，再減去 1
    }
    
    return {
      maxColumns,
      hasHoldColumn,
      availableWaitingColumns: Math.max(0, availableWaitingColumns)
    };
  };
  
  const { maxColumns, hasHoldColumn, availableWaitingColumns } = getAvailableColumns();
  
  // 檢查製作中狀態，用於遞補邏輯
  const hasC1InMaking = categoryItems.making.some(item => item.table === 'C1');
  const hasC2InMaking = categoryItems.making.some(item => item.table === 'C2');
  const hasC3InMaking = categoryItems.making.some(item => item.table === 'C3');
  
  // 計算遞補後的牌卡分配
  const getCardDistribution = () => {
    const distribution = {
      firstRow: [] as string[], // 第一列顯示的桌號
      secondRow: [] as string[], // 第二列顯示的桌號
      thirdRow: [] as string[]  // 第三列顯示的桌號
    };
    
    // 獲取所有待製作的桌號
    const waitingTables = Object.keys(groupItemsByTable(categoryItems.waiting));
    
    // 實現"一個待製作列表只能顯示一筆牌卡"的規則
    // 優先級：C1 > C2 > C3 > C4 > 其他桌號
    
    if (waitingTables.length > 0) {
      // 第一列：優先顯示C1，如果沒有C1則顯示C2，以此類推
      if (waitingTables.includes('C1')) {
        distribution.firstRow.push('C1');
      } else if (waitingTables.includes('C2')) {
        distribution.firstRow.push('C2');
      } else if (waitingTables.includes('C3')) {
        distribution.firstRow.push('C3');
      } else if (waitingTables.includes('C4')) {
        distribution.firstRow.push('C4');
      } else {
        // 如果沒有C1-C4，顯示第一個其他桌號
        const firstOtherTable = waitingTables.find(table => !['C1', 'C2', 'C3', 'C4'].includes(table));
        if (firstOtherTable) {
          distribution.firstRow.push(firstOtherTable);
        }
      }
      
      // 第二列：顯示第二優先級的牌卡
      if (waitingTables.includes('C2') && !distribution.firstRow.includes('C2')) {
        distribution.secondRow.push('C2');
      } else if (waitingTables.includes('C3') && !distribution.firstRow.includes('C3')) {
        distribution.secondRow.push('C3');
      } else if (waitingTables.includes('C4') && !distribution.firstRow.includes('C4')) {
        distribution.secondRow.push('C4');
      } else {
        // 如果沒有C2-C4，顯示第二個其他桌號
        const secondOtherTable = waitingTables.find(table => 
          !['C1', 'C2', 'C3', 'C4'].includes(table) && 
          !distribution.firstRow.includes(table)
        );
        if (secondOtherTable) {
          distribution.secondRow.push(secondOtherTable);
        }
      }
      
      // 第三列：顯示第三優先級的牌卡
      if (waitingTables.includes('C3') && !distribution.firstRow.includes('C3') && !distribution.secondRow.includes('C3')) {
        distribution.thirdRow.push('C3');
      } else if (waitingTables.includes('C4') && !distribution.firstRow.includes('C4') && !distribution.secondRow.includes('C4')) {
        distribution.thirdRow.push('C4');
      } else {
        // 如果沒有C3-C4，顯示第三個其他桌號
        const thirdOtherTable = waitingTables.find(table => 
          !['C1', 'C2', 'C3', 'C4'].includes(table) && 
          !distribution.firstRow.includes(table) &&
          !distribution.secondRow.includes(table)
        );
        if (thirdOtherTable) {
          distribution.thirdRow.push(thirdOtherTable);
        }
      }
    }
    
    return distribution;
  };
  
  const cardDistribution = getCardDistribution();

  // 監聽製作中牌卡狀態，當沒有可見牌卡時觸發遞補
  useEffect(() => {
    // 檢查製作中是否有可見的牌卡
    const visibleMakingCards = Object.keys(groupItemsByTable(categoryItems.making)).filter(tableName => {
      const cardKey = `making-${tableName}`;
      return !hiddenMakingCards.has(cardKey);
    });
    
    // 檢查是否有#2牌卡（C2桌）的品項在製作中
    const hasC2InMaking = categoryItems.making.some(item => item.table === 'C2');
    
    // 如果沒有可見的製作中牌卡，且有待製作品項，則觸發遞補
    if (visibleMakingCards.length === 0 && categoryItems.waiting.length > 0) {
      console.log('檢測到製作中沒有可見牌卡，觸發遞補邏輯');
      // 這裡可以觸發遞補邏輯，或者通知父組件
    }
    
    // 當#2牌卡（C2桌）進入製作中狀態時，觸發#3牌卡遞補邏輯
    if (hasC2InMaking) {
      console.log('檢測到#2牌卡進入製作中狀態，觸發#3牌卡遞補邏輯');
      // 這裡可以觸發#3牌卡遞補到前一列的邏輯
    }
  }, [categoryItems.making, categoryItems.waiting, hiddenMakingCards]);

  // 自動遞補邏輯：當製作中沒有牌卡時，自動將待製作的第一張牌卡遞補到製作中
  useEffect(() => {
    // 檢查製作中是否有可見的牌卡
    const visibleMakingCards = Object.keys(groupItemsByTable(categoryItems.making)).filter(tableName => {
      const cardKey = `making-${tableName}`;
      return !hiddenMakingCards.has(cardKey);
    });
    
    // 如果製作中沒有可見牌卡，且有待製作品項，則自動遞補
    if (visibleMakingCards.length === 0 && categoryItems.waiting.length > 0) {
      console.log('檢測到製作中沒有可見牌卡，自動遞補待製作的第一張牌卡');
      
      // 獲取待製作牌卡的優先順序
      const waitingTables = Object.keys(groupItemsByTable(categoryItems.waiting));
      
      // 優先遞補順序：C1 > C2 > C3 > 其他桌號
      let nextTableToMove = null;
      
      if (waitingTables.includes('C1')) {
        nextTableToMove = 'C1';
      } else if (waitingTables.includes('C2')) {
        nextTableToMove = 'C2';
      } else if (waitingTables.includes('C3')) {
        nextTableToMove = 'C3';
      } else if (waitingTables.length > 0) {
        // 如果沒有 C1, C2, C3，則選擇第一個桌號
        nextTableToMove = waitingTables[0];
      }
      
      if (nextTableToMove) {
        console.log(`自動遞補 ${nextTableToMove} 到製作中`);
        // 這裡可以觸發遞補邏輯，或者通知父組件
        // 由於我們無法直接修改 categoryItems，這裡只是記錄日誌
        // 實際的遞補邏輯需要在父組件中實現
      }
    }
  }, [categoryItems.making, categoryItems.waiting, hiddenMakingCards]);

  // 按品項名稱分組，保持原本的製作中顯示方式
  function groupItemsByName(items: OrderItem[]) {
    return items.reduce((acc, item) => {
      const key = item.name;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);
  }

  // 按桌號分組，讓同一桌號的品項合併為一張牌卡
  function groupItemsByTable(items: OrderItem[]) {
    return items.reduce((acc, item) => {
      const key = item.table;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);
  }

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <tbody style={styles.tbody}>
          <tr style={styles.tableRow}>
            {/* 製作中欄位 */}
            <td style={{
              ...styles.tableCell,
              borderRight: '2px solid #000'
            }}>
              <div style={styles.columnHeader}>製作中</div>
              {Object.entries(groupItemsByTable(categoryItems.making)).map(([tableName, items], idx) => {
                const cardKey = `making-${tableName}`;
                if (hiddenMakingCards.has(cardKey)) return null;
                
                // 根據桌號分配固定的牌卡號碼，保持與待製作時的號碼一致
                let cardNumber;
                if (tableName === 'C1') {
                  cardNumber = 1;
                } else if (tableName === 'C2') {
                  cardNumber = 2;
                } else if (tableName === 'C3') {
                  cardNumber = 3;
                } else if (tableName === 'C4') {
                  cardNumber = 4;
                } else if (tableName === '內用A1') {
                  cardNumber = 1;
                } else if (tableName === '內用A2') {
                  cardNumber = 2;
                } else {
                  cardNumber = idx + 1; // 其他桌號使用索引+1
                }
                
                return (
                  <div
                    key={tableName}
                    className={timeColor === '#d7263d' ? 'overdue-card' : ''}
                    style={{
                      ...styles.orderCard,
                      border: '2px solid #222',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                                         <div 
                       style={{
                         ...styles.cardHeader,
                         background: timeColor,
                         position: 'relative',
                         overflow: 'hidden',
                         cursor: 'pointer',
                       }}
                       onDoubleClick={() => onCardHeaderDoubleClick('making', cardKey)}
                       title="雙擊隱藏此牌卡"
                     >
                       {/* 逾時時顯示火焰圖示 */}
                       {timeColor === '#d7263d' && (
                         <div className="flame-icon"></div>
                       )}
                       #{cardNumber}
                     </div>
                  <div style={styles.cardContent}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      {items.map((makingItem, itemIdx) => (
                        <div
                          key={makingItem.id}
                          className="making-item-row"
                          onClick={() => onMakingItemSelect(makingItem.id)}
                          onMouseEnter={(e) => {
                            if (!clickedMakingItems.has(makingItem.id)) {
                              e.currentTarget.style.backgroundColor = '#f0f0f0';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!clickedMakingItems.has(makingItem.id)) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                                                     style={{
                             width: '100%',
                             boxSizing: 'border-box',
                             padding: '12px',
                             borderRadius: '4px',
                             marginBottom: '8px',
                             cursor: 'pointer',
                             backgroundColor: clickedMakingItems.has(makingItem.id) ? '#d3d3d3' : '#fff',
                             border: selectedMakingItem === makingItem.id ? '2px solid #ff0000' : '2px solid #ccc',
                             borderBottom: itemIdx < items.length - 1 ? '1px solid #ccc' : '2px solid #ccc',
                             transition: 'all 0.2s ease',
                             height: '100px', // 統一高度
                           }}
                        >
                                                     <div style={{ 
                             display: 'flex', 
                             width: '100%', 
                             flexDirection: 'column',
                             gap: '4px',
                             justifyContent: makingItem.note ? 'flex-start' : 'center', // 有備註時靠上，無備註時置中
                             height: '100%'
                           }}>
                             {/* 品項名稱與備註行 */}
                             <div style={{ 
                               display: 'flex', 
                               width: '100%', 
                               alignItems: 'flex-start',
                               gap: '8px'
                             }}>
                                                               <div style={{ 
                                  flex: '0 0 65%', 
                                  textAlign: 'left',
                                  minWidth: 0,
                                  overflow: 'visible',
                                  paddingLeft: displayState.celltype === '4' ? (isTablet ? '5px' : '15px') : '15px' // 4列模式且iPad版面時進一步減少向左縮排，3列模式也減少縮排
                                }}>
                                 <span className="item-name" style={styles.itemName}>
                                   {makingItem.name}
                                 </span>
                                 {/* 品項備註行 - 應用文字規則 */}
                                 {makingItem.note && (
                                   <div style={{ 
                                     marginTop: '2px'
                                   }}>
                                     <span className="item-note" style={{ 
                                       ...styles.itemNote, 
                                       fontSize: '1.1em', 
                                       color: '#666',
                                       textAlign: 'left',
                                       lineHeight: '1.2',
                                       maxWidth: '100%',
                                       wordWrap: 'break-word',
                                       overflowWrap: 'break-word'
                                     }}>
                                       {truncateNoteText(makingItem.note, displayState.celltype, isTablet, isMobile)}
                                     </span>
                                   </div>
                                 )}
                               </div>
                                                               {/* 數量標籤 - 跨欄垂直置中 */}
                                <div style={{ 
                                  flex: '0 0 35%', 
                                  textAlign: 'center',
                                  minWidth: 0,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  paddingRight: displayState.celltype === '4' ? '155px' : '130px', // 4列模式增加向右縮排25px
                                  alignSelf: 'center' // 確保數量標籤在整個品項區域中垂直置中
                                }}>
                                                                 <span 
                                   className={(makingItem.name === '雪花牛油花多一點' ? 'snowflake-beef-badge ' : '') + 'qty-badge'}
                                   style={{
                                     ...styles.itemBadge,
                                     display: 'inline-block',
                                     padding: '6px 10px',
                                     backgroundColor: '#6c757d',
                                     color: 'white',
                                     borderRadius: '4px',
                                     fontSize: '1.4rem',
                                     fontWeight: '600',
                                     width: '25px',
                                     textAlign: 'center'
                                   }}
                                 >
                                  {makingItem.count}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                                              ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </td>

                        {/* Hold 欄位 - 放在製作中與待製作中間 */}
            {categoryItems.hold.length > 0 && !hiddenHoldCards.has('hold-main') && (
              <td style={{
                ...styles.tableCell,
                borderRight: '2px solid #000'
              }}>
                <div style={{
                  ...styles.columnHeader,
                  // 僅 HOLD 欄在平板時增加 2px 高度，避免中英文高度落差
                  padding: isTablet ? '5px 2px' : '4px 2px'
                }}>HOLD</div>
                {/* 合併所有Hold品項到同一張牌卡 */}
                <div
                  style={{
                    ...styles.orderCard,
                    border: '2px solid #222',
                  }}
                >
                  <div 
                    style={{
                      ...styles.cardHeader,
                      background: '#ffc107', // 黃色背景
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      // 僅 HOLD 欄位：平板增加 2px 高度
                      height: isTablet ? '33px' : '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onDoubleClick={() => onCardHeaderDoubleClick('hold', 'hold-main')}
                    title="雙擊隱藏此牌卡"
                  >
                    
                  </div>
                  <div style={styles.cardContent}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      {/* 渲染Hold品項 */}
                                              {categoryItems.hold.map((item, itemIdx) => (
                        <div
                          key={`temp-${item.id}`}
                                                     style={{
                             width: '100%',
                             boxSizing: 'border-box',
                             padding: '12px',
                             borderRadius: '4px',
                             marginBottom: '8px',
                             backgroundColor: clickedHoldItems.has(item.id) ? '#d3d3d3' : '#fff',
                             border: selectedHoldItem === item.id ? '2px solid #ff0000' : '2px solid #ccc',
                             borderBottom: itemIdx < categoryItems.hold.length - 1 ? '1px solid #ccc' : '2px solid #ccc',
                             cursor: 'pointer',
                             height: '100px', // 統一高度
                           }}
                          onClick={() => onHoldItemSelect(item.id)}
                          onMouseEnter={(e) => {
                            if (!clickedHoldItems.has(item.id)) {
                              e.currentTarget.style.backgroundColor = '#f0f0f0';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!clickedHoldItems.has(item.id)) {
                              e.currentTarget.style.backgroundColor = '#f0f0f0';
                            }
                          }}
                        >
                                                     <div style={{ 
                             display: 'flex', 
                             width: '100%', 
                             flexDirection: 'column',
                             gap: '4px',
                             justifyContent: item.note ? 'flex-start' : 'center', // 有備註時靠上，無備註時置中
                             height: '100%'
                           }}>
                             {/* 品項名稱與備註行 */}
                             <div style={{ 
                               display: 'flex', 
                               width: '100%', 
                               alignItems: 'flex-start',
                               gap: '8px'
                             }}>
                                                                                                <div style={{ 
                                   flex: '0 0 65%', 
                                   textAlign: 'left',
                                   minWidth: 0,
                                   overflow: 'visible',
                                   paddingLeft: displayState.celltype === '4' ? (isTablet ? '5px' : '15px') : '15px' // 4列模式且iPad版面時進一步減少向左縮排，3列模式也減少縮排
                                 }}>
                                 <span style={styles.itemName}>
                                   {item.name}
                                 </span>
                                 {/* 品項備註行 - 應用文字規則 */}
                                 {item.note && (
                                   <div style={{ 
                                     marginTop: '2px'
                                   }}>
                                     <span style={{ 
                                       ...styles.itemNote, 
                                       fontSize: '1.1em', 
                                       color: '#666',
                                       textAlign: 'left',
                                       lineHeight: '1.2',
                                       maxWidth: '100%',
                                       wordWrap: 'break-word',
                                       overflowWrap: 'break-word'
                                     }}>
                                       {truncateNoteText(item.note, displayState.celltype, isTablet, isMobile)}
                                     </span>
                                   </div>
                                 )}
                               </div>
                               {/* 數量標籤 - 跨欄垂直置中 */}
                               <div style={{ 
                                 flex: '0 0 35%', 
                                 textAlign: 'center',
                                 minWidth: 0,
                                 display: 'flex',
                                 justifyContent: 'center',
                                 alignItems: 'center',
                                 paddingRight: '10px', // HOLD 靠右邊線 10px
                                 alignSelf: 'center' // 確保數量標籤在整個品項區域中垂直置中
                               }}>
                                <span style={{
                                  ...styles.itemBadge,
                                  display: 'inline-block',
                                  padding: '6px 10px',
                                  backgroundColor: '#6c757d',
                                  color: 'white',
                                  borderRadius: '4px',
                                  fontSize: '1.4rem',
                                  fontWeight: '600',
                                  width: '25px',
                                  textAlign: 'center'
                                }}>
                                  {item.count}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                </div>
              </td>
            )}

                                    {/* 待製作欄位 - 第一列 (根據可用欄位數量動態調整) */}
            {availableWaitingColumns > 0 && (
              <td style={{
                ...styles.tableCell,
                borderRight: availableWaitingColumns >= 2 ? '2px solid #000' : 'none'
              }}>
                <div style={styles.columnHeader}>待製作</div>
                 {Object.entries(groupItemsByTable(categoryItems.waiting))
                   .filter(([tableName, items], idx) => {
                     // 只顯示分配給第一列的桌號
                     return cardDistribution.firstRow.includes(tableName);
                   })
                  .map(([tableName, items], idx) => {
                    // 待製作牌卡使用固定的編號
                    let cardNumber;
                    if (tableName === 'C1') {
                      cardNumber = 1;
                    } else if (tableName === 'C2') {
                      cardNumber = 2;
                    } else if (tableName === 'C3') {
                      cardNumber = 3; // #3牌卡遞補後仍然維持#3編號
                    } else if (tableName === 'C4') {
                      cardNumber = 4; // #4牌卡始終顯示為#4
                    } else {
                      cardNumber = idx + 1;
                    }
                    
                    return (
                      <div
                        key={tableName}
                        style={{
                          ...styles.orderCard,
                          border: '2px solid #222',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          opacity: 0.5,
                          cursor: 'not-allowed',
                        }}
                      >
                        <div style={{
                          ...styles.cardHeader,
                          background: '#009944',
                        }}>
                          #{cardNumber}
                        </div>
                        <div style={styles.cardContent}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            {items.map((item, itemIdx) => (
                              <div
                                key={`${item.table}-${item.note || 'no-note'}`}
                                style={{
                                  border: '2px solid #ccc',
                                  borderBottom: itemIdx < items.length - 1 ? '1px solid #ccc' : '2px solid #ccc',
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  padding: '12px',
                                  borderRadius: '4px',
                                  marginBottom: '8px',
                                  backgroundColor: '#fff',
                                  height: '100px', // 統一高度
                                }}
                              >
                                <div style={{ 
                                  display: 'flex', 
                                  width: '100%', 
                                  flexDirection: 'column',
                                  gap: '4px',
                                  justifyContent: item.note ? 'flex-start' : 'center', // 有備註時置中
                                  height: '100%'
                                }}>
                                  {/* 品項名稱與備註行 */}
                                  <div style={{ 
                                    display: 'flex', 
                                    width: '100%', 
                                    alignItems: 'flex-start',
                                    gap: '8px'
                                  }}>
                                   <div style={{ 
                                     flex: '0 0 65%', 
                                     textAlign: 'left',
                                     minWidth: 0,
                                     overflow: 'visible',
                                     paddingLeft: displayState.celltype === '4' ? (isTablet ? '5px' : '15px') : '15px' // 4列模式且iPad版面時進一步減少向左縮排，3列模式也減少縮排
                                   }}>
                                     <span style={styles.itemName}>
                                       {item.name}
                                     </span>
                                     {/* 品項備註行 - 應用文字規則 */}
                                     {item.note && (
                                       <div style={{ 
                                         marginTop: '2px'
                                       }}>
                                         <span style={{ 
                                           ...styles.itemNote, 
                                           fontSize: '1.1em', 
                                           color: '#666',
                                           textAlign: 'left',
                                           lineHeight: '1.2',
                                           maxWidth: '100%',
                                           wordWrap: 'break-word',
                                           overflowWrap: 'break-word'
                                         }}>
                                           {truncateNoteText(item.note, displayState.celltype, isTablet, isMobile)}
                                         </span>
                                       </div>
                                     )}
                                   </div>
                                   {/* 數量標籤 - 跨欄垂直置中 */}
                                   <div style={{ 
                                     flex: '0 0 35%', 
                                     textAlign: 'center',
                                     minWidth: 0,
                                     display: 'flex',
                                     justifyContent: 'center',
                                     alignItems: 'center',
                                     paddingRight: '10px', // HOLD 靠右邊線 10px
                                     alignSelf: 'center' // 確保數量標籤在整個品項區域中垂直置中
                                   }}>
                                      <span style={{
                                        ...styles.itemBadge,
                                        display: 'inline-block',
                                        padding: '6px 10px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        borderRadius: '4px',
                                        fontSize: '1.4rem',
                                        fontWeight: '600',
                                        width: '25px',
                                        textAlign: 'center'
                                      }}>
                                        {item.count}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </td>
            )}



                                      {/* 待製作欄位 - 第二列 (根據可用欄位數量動態調整) */}
            {availableWaitingColumns >= 2 && (
              <td style={{
                ...styles.tableCell,
                borderRight: availableWaitingColumns >= 3 ? '2px solid #000' : 'none'
              }}>
                <div style={styles.columnHeader}>待製作</div>
                                 {Object.entries(groupItemsByTable(categoryItems.waiting))
                   .filter(([tableName, items], idx) => {
                     // 只顯示分配給第二列的桌號
                     return cardDistribution.secondRow.includes(tableName);
                   })
                  .map(([tableName, items], idx) => {
                    // 計算實際的牌卡編號
                    let cardNumber;
                    if (tableName === 'C1') {
                      cardNumber = 1;
                    } else if (tableName === 'C2') {
                      cardNumber = 2;
                    } else if (tableName === 'C3') {
                      cardNumber = 3;
                    } else if (tableName === 'C4') {
                      cardNumber = 4;
                    } else {
                      cardNumber = idx + 4;
                    }
                    
                    return (
                      <div
                        key={tableName}
                        style={{
                          ...styles.orderCard,
                          border: '2px solid #222',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          opacity: 0.5,
                          cursor: 'not-allowed',
                        }}
                      >
                        <div style={{
                          ...styles.cardHeader,
                          background: '#009944',
                        }}>
                          #{cardNumber}
                        </div>
                        <div style={styles.cardContent}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            {items.map((item, itemIdx) => (
                              <div
                                key={`${item.table}-${item.note || 'no-note'}`}
                                style={{
                                  border: '2px solid #ccc',
                                  borderBottom: itemIdx < items.length - 1 ? '1px solid #ccc' : '2px solid #ccc',
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  padding: '12px',
                                  borderRadius: '4px',
                                  marginBottom: '8px',
                                  backgroundColor: '#fff',
                                  height: '100px', // 統一高度
                                }}
                              >
                                <div style={{ 
                                  display: 'flex', 
                                  width: '100%', 
                                  flexDirection: 'column',
                                  gap: '4px',
                                  justifyContent: item.note ? 'flex-start' : 'center', // 有備註時靠上，無備註時置中
                                  height: '100%'
                                }}>
                                  {/* 品項名稱與備註行 */}
                                  <div style={{ 
                                    display: 'flex', 
                                    width: '100%', 
                                    alignItems: 'flex-start',
                                    gap: '8px'
                                  }}>
                                                                                                                                                         <div style={{ 
                                            flex: '0 0 65%', 
                                            textAlign: 'left',
                                            minWidth: 0,
                                            overflow: 'visible',
                                            paddingLeft: displayState.celltype === '4' ? (isTablet ? '5px' : '15px') : '15px' // 4列模式且iPad版面時進一步減少向左縮排，3列模式也減少縮排
                                          }}>
                                        <span style={styles.itemName}>
                                          {item.name}
                                        </span>
                                        {/* 品項備註行 - 應用文字規則 */}
                                        {item.note && (
                                          <div style={{ 
                                            marginTop: '2px'
                                          }}>
                                                                                       <span style={{ 
                                             ...styles.itemNote, 
                                             fontSize: '1.2em', 
                                             color: '#666',
                                             textAlign: 'left',
                                             lineHeight: '1.2',
                                             maxWidth: '100%',
                                             wordWrap: 'break-word',
                                             overflowWrap: 'break-word'
                                           }}>
                                             {truncateNoteText(item.note, displayState.celltype, isTablet, isMobile)}
                                           </span>
                                          </div>
                                        )}
                                      </div>
                                      {/* 數量標籤 - 跨欄垂直置中 */}
                                      <div style={{ 
                                        flex: '0 0 35%', 
                                        textAlign: 'center',
                                        minWidth: 0,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        paddingRight: displayState.celltype === '4' ? '155px' : '130px',
                                        alignSelf: 'center'
                                      }}>
                                      <span style={{
                                        ...styles.itemBadge,
                                        display: 'inline-block',
                                        padding: '6px 10px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        borderRadius: '4px',
                                        fontSize: '1.4rem',
                                        fontWeight: '600',
                                        width: '25px',
                                        textAlign: 'center'
                                      }}>
                                        {item.count}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </td>
            )}

            {/* 第三列待製作欄位 - 根據可用欄位數量動態調整，放在最右邊 */}
            {availableWaitingColumns >= 3 && (
              <td style={styles.tableCell}>
                <div style={styles.columnHeader}>待製作</div>
                                 {Object.entries(groupItemsByTable(categoryItems.waiting))
                   .filter(([tableName, items], idx) => {
                     // 只顯示分配給第三列的桌號
                     return cardDistribution.thirdRow.includes(tableName);
                   })
                  .map(([tableName, items], idx) => {
                    // 計算實際的牌卡編號
                    let cardNumber;
                    if (tableName === 'C1') {
                      cardNumber = 1;
                    } else if (tableName === 'C2') {
                      cardNumber = 2;
                    } else if (tableName === 'C3') {
                      cardNumber = 3;
                    } else if (tableName === 'C4') {
                      cardNumber = 4;
                    } else {
                      cardNumber = idx + 4;
                    }
                    
                    return (
                      <div
                        key={`third-${tableName}`}
                        style={{
                          ...styles.orderCard,
                          border: '2px solid #222',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          opacity: 0.5,
                          cursor: 'not-allowed',
                        }}
                      >
                        <div style={{
                          ...styles.cardHeader,
                          background: '#009944',
                        }}>
                          #{cardNumber}
                        </div>
                        <div style={styles.cardContent}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            {items.map((item, itemIdx) => (
                              <div
                                key={`third-${item.table}-${item.note || 'no-note'}`}
                                style={{
                                  border: '2px solid #ccc',
                                  borderBottom: itemIdx < items.length - 1 ? '1px solid #ccc' : '2px solid #ccc',
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  padding: '12px',
                                  borderRadius: '4px',
                                  marginBottom: '8px',
                                  backgroundColor: '#fff',
                                  height: '100px', // 統一高度
                                }}
                              >
                                <div style={{ 
                                  display: 'flex', 
                                  width: '100%', 
                                  flexDirection: 'column',
                                  gap: '4px',
                                  justifyContent: item.note ? 'flex-start' : 'center',
                                  height: '100%'
                                }}>
                                  {/* 品項名稱與備註行 */}
                                  <div style={{ 
                                    display: 'flex', 
                                    width: '100%', 
                                    alignItems: 'flex-start',
                                    gap: '8px'
                                  }}>
                                                                                                                 <div style={{ 
                                          flex: '0 0 65%', 
                                          textAlign: 'left',
                                          minWidth: 0,
                                          overflow: 'visible',
                                          paddingLeft: displayState.celltype === '4' ? (isTablet ? '5px' : '15px') : '15px' // 4列模式且iPad版面時進一步減少向左縮排，3列模式也減少縮排
                                        }}>
                                          <span style={styles.itemName}>
                                            {item.name}
                                          </span>
                                          {/* 品項備註行 - 應用文字規則 */}
                                          {item.note && (
                                            <div style={{ 
                                              marginTop: '2px'
                                            }}>
                                                                                           <span style={{ 
                                               ...styles.itemNote, 
                                               fontSize: '1.1em', 
                                               color: '#666',
                                               textAlign: 'left',
                                               lineHeight: '1.2',
                                               maxWidth: '100%',
                                               wordWrap: 'break-word',
                                               overflowWrap: 'break-word'
                                             }}>
                                               {truncateNoteText(item.note, displayState.celltype, isTablet, isMobile)}
                                             </span>
                                            </div>
                                          )}
                                        </div>
                                        {/* 數量標籤 - 跨欄垂直置中 */}
                                        <div style={{ 
                                          flex: '0 0 35%', 
                                          textAlign: 'center',
                                          minWidth: 0,
                                          display: 'flex',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          paddingRight: displayState.celltype === '4' ? '155px' : '130px', // 4列模式增加向右縮排25px
                                          alignSelf: 'center' // 確保數量標籤在整個品項區域中垂直置中
                                        }}>
                                      <span style={{
                                        ...styles.itemBadge,
                                        display: 'inline-block',
                                        padding: '6px 10px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        borderRadius: '4px',
                                        fontSize: '1.4rem',
                                        fontWeight: '600',
                                        width: '25px',
                                        textAlign: 'center'
                                      }}>
                                        {item.count}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </td>
            )}
          </tr>


        </tbody>
      </table>
    </div>
  );
}
