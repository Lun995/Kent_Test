"use client";
import { useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { workBoardStyles } from '../../styles/workBoardStyles';

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
  const styles = workBoardStyles({ isMobile, isTablet });

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
            <td style={styles.tableCell}>
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
                      border: timeColor === '#d7263d' ? '3px solid #d7263d' : '2px solid #222',
                      boxShadow: timeColor === '#d7263d' ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
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
                      #{cardNumber}
                    {timeColor === '#d7263d' && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '20px',
                        height: '20px',
                        background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23ff6b35\'%3E%3Cpath d=\'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8M12 14C13.1 14 14 14.9 14 16C14 17.1 13.1 18 12 18C10.9 18 10 17.1 10 16C10 14.9 10.9 14 12 14Z\'/%3E%3C/svg%3E") no-repeat center center',
                        backgroundSize: 'contain',
                        animation: 'flame 1.5s infinite',
                        opacity: 0.8,
                        zIndex: 1,
                      }} />
                    )}
                  </div>
                  <div style={styles.cardContent}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      {items.map((makingItem, itemIdx) => (
                        <div
                          key={makingItem.id}
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
                            border: selectedMakingItem === makingItem.id ? '2px solid #ff0000' : '2px solid #ddd',
                            borderBottom: itemIdx < items.length - 1 ? '1px solid #ccc' : '2px solid #ddd',
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
                                flex: '0 0 70%', 
                                textAlign: 'left',
                                minWidth: 0,
                                overflow: 'visible',
                                paddingLeft: '25px'
                              }}>
                                <span style={styles.itemName}>
                                  {makingItem.name}
                                </span>
                                {/* 品項備註行 */}
                                {makingItem.note && (
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
                                      {makingItem.note}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {/* 數量標籤 - 跨欄垂直置中 */}
                              <div style={{ 
                                flex: '0 0 30%', 
                                textAlign: 'center',
                                minWidth: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingRight: '50px',
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
              <td style={styles.tableCell}>
                <div style={{
                  ...styles.columnHeader,
                  padding: '4px 2px' // 增加10px高度 (原本3px + 10px = 13px)
                }}>Hold</div>
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
                      height: '31px', // 設定固定高度
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onDoubleClick={() => onCardHeaderDoubleClick('hold', 'hold-main')}
                    title="雙擊隱藏此牌卡"
                  >
                    {/* 表頭只顯示黃色背景，不顯示文字 */}
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
                            border: selectedHoldItem === item.id ? '2px solid #ff0000' : '2px solid #ddd',
                            borderBottom: itemIdx < categoryItems.hold.length - 1 ? '1px solid #ccc' : '2px solid #ddd',
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
                                flex: '0 0 70%', 
                                textAlign: 'left',
                                minWidth: 0,
                                overflow: 'visible',
                                paddingLeft: '25px'
                              }}>
                                <span style={styles.itemName}>
                                  {item.name}
                                </span>
                                {/* 品項備註行 */}
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
                                      {item.note}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {/* 數量標籤 - 跨欄垂直置中 */}
                              <div style={{ 
                                flex: '0 0 30%', 
                                textAlign: 'center',
                                minWidth: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingRight: '50px',
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

                        {/* 待製作欄位 - 第一列 (#1, #2) */}
            <td style={styles.tableCell}>
              <div style={styles.columnHeader}>待製作</div>
              {Object.entries(groupItemsByTable(categoryItems.waiting))
                .filter(([tableName, items]) => {
                  // 檢查是否有#2牌卡（C2桌）的品項在製作中
                  const hasC2InMaking = categoryItems.making.some(item => item.table === 'C2');
                  
                  // 如果#2牌卡在製作中，則#3牌卡遞補到第一列
                  if (hasC2InMaking && tableName === 'C3') {
                    return true; // #3牌卡遞補到第一列
                  }
                  
                  // 只顯示 #1 和 #2 的牌卡
                  let cardNumber;
                  if (tableName === 'C1') {
                    cardNumber = 1;
                  } else if (tableName === 'C2') {
                    cardNumber = 2;
                  } else {
                    cardNumber = 0; // 其他桌號不顯示在第一列
                  }
                  return cardNumber === 1 || cardNumber === 2;
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
                                border: '2px solid #ddd',
                                borderBottom: itemIdx < items.length - 1 ? '1px solid #ccc' : '2px solid #ddd',
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
                                    flex: '0 0 70%', 
                                    textAlign: 'left',
                                    minWidth: 0,
                                    overflow: 'visible',
                                    paddingLeft: '25px'
                                  }}>
                                    <span style={styles.itemName}>
                                      {item.name}
                                    </span>
                                    {/* 品項備註行 */}
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
                                          {item.note}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {/* 數量標籤 - 跨欄垂直置中 */}
                                  <div style={{ 
                                    flex: '0 0 30%', 
                                    textAlign: 'center',
                                    minWidth: 0,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingRight: '50px',
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

            {/* 待製作欄位 - 第二列 (當沒有Hold時顯示更多待製作) */}
            {categoryItems.hold.length === 0 || hiddenHoldCards.has('hold-main') ? (
              // 沒有Hold欄位時，顯示更多待製作牌卡
              <td style={styles.tableCell}>
                <div style={styles.columnHeader}>待製作</div>
                {Object.entries(groupItemsByTable(categoryItems.waiting))
                  .filter(([tableName, items], idx) => {
                    // 檢查是否有#2牌卡（C2桌）的品項在製作中
                    const hasC2InMaking = categoryItems.making.some(item => item.table === 'C2');
                    
                    // 如果#2牌卡在製作中，則#3牌卡不顯示在第二列（因為已經遞補到第一列）
                    if (hasC2InMaking && tableName === 'C3') {
                      return false; // #3牌卡不顯示在第二列
                    }
                    
                    // 顯示 #3 和其他待製作牌卡
                    let cardNumber;
                    if (tableName === 'C1') {
                      cardNumber = 1;
                    } else if (tableName === 'C2') {
                      cardNumber = 2;
                    } else if (tableName === 'C3') {
                      cardNumber = 3;
                    } else {
                      cardNumber = idx + 4; // 其他桌號從#4開始編號
                    }
                    return cardNumber >= 3; // 只顯示#3及以上的牌卡
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
                                  border: '2px solid #ddd',
                                  borderBottom: itemIdx < items.length - 1 ? '1px solid #ccc' : '2px solid #ddd',
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
                                      flex: '0 0 70%', 
                                      textAlign: 'left',
                                      minWidth: 0,
                                      overflow: 'visible',
                                      paddingLeft: '25px'
                                    }}>
                                      <span style={styles.itemName}>
                                        {item.name}
                                      </span>
                                      {/* 品項備註行 */}
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
                                            {item.note}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    {/* 數量標籤 - 跨欄垂直置中 */}
                                    <div style={{ 
                                      flex: '0 0 30%', 
                                      textAlign: 'center',
                                      minWidth: 0,
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      paddingRight: '50px',
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
            ) : null}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
