"use client";
import { Badge, Table } from '@mantine/core';
import { useIsMobile } from '../../hooks/useIsMobile';
import { workBoardStyles } from '../../styles/workBoardStyles';

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

interface WorkBoardProps {
  categoryItems: CategoryItems;
  selectedItem: { category: keyof CategoryItems; name: string } | null;
  onItemSelect: (item: { category: keyof CategoryItems; name: string }) => void;
  onItemDoubleClick: (category: keyof CategoryItems, name: string) => void;
  timeColor: string;
}

export function WorkBoard({
  categoryItems,
  selectedItem,
  onItemSelect,
  onItemDoubleClick,
  timeColor
}: WorkBoardProps) {
  const { isMobile, isTablet } = useIsMobile();
  const styles = workBoardStyles({ isMobile, isTablet });

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

  // 按品項名稱分組，但保持備註分開
  function groupItemsByCategory(items: OrderItem[]) {
    return items.reduce((acc, item) => {
      const key = item.name;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);
  }

  return (
    <div style={styles.container}>
      <Table
        highlightOnHover={false}
        style={styles.table}
      >
        <tbody style={styles.tbody}>
          <tr style={styles.tableRow}>
            {/* 製作中 */}
            <td style={styles.tableCell}>
              <div style={styles.columnHeader}>製作中</div>
              {Object.entries(groupItemsByCategory(categoryItems.making)).map(([itemName, items]) => (
                <div
                  key={itemName}
                  style={{
                    ...styles.orderCard,
                    border: selectedItem && selectedItem.category === 'making' && selectedItem.name === itemName 
                      ? '4px solid #d7263d' 
                      : timeColor === '#d7263d' 
                        ? '2px solid #d7263d' 
                        : '2px solid #222',
                    boxShadow: timeColor === '#d7263d' 
                      ? '0 4px 12px rgba(215, 38, 61, 0.3)' 
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    animation: timeColor === '#d7263d' ? 'pulse 2s infinite' : 'none',
                  }}
                  onClick={() => onItemSelect({ category: 'making', name: itemName })}
                  onDoubleClick={() => onItemDoubleClick('making', itemName)}
                >
                  <div style={{
                    ...styles.cardHeader,
                    background: timeColor,
                  }}>
                    #1-製作中
                  </div>
                  <div style={styles.cardContent}>
                    {items.map((makingItem, idx) => (
                      <div key={`${makingItem.table}-${makingItem.note || 'no-note'}`} style={styles.itemRow}>
                        <span style={styles.itemName}>{makingItem.name}</span>
                        <Badge 
                          color="gray" 
                          size="md" 
                          style={styles.itemBadge}
                        >
                          {makingItem.count}
                        </Badge>
                      </div>
                    ))}
                    {items.some(item => item.note) && (
                      <div style={styles.itemNote}>
                        -雪花多一點
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </td>

            {/* Hold */}
            <td style={styles.tableCell}>
              <div style={styles.columnHeader}>Hold</div>
              {Object.entries(groupItemsByCategory(categoryItems.hold)).map(([itemName, items]) => (
                <div
                  key={itemName}
                  style={{
                    ...styles.orderCard,
                    border: selectedItem && selectedItem.category === 'hold' && selectedItem.name === itemName 
                      ? '4px solid #d7263d' 
                      : '2px solid #222',
                  }}
                  onClick={() => onItemSelect({ category: 'hold', name: itemName })}
                  onDoubleClick={() => onItemDoubleClick('hold', itemName)}
                >
                  <div style={{
                    ...styles.cardHeader,
                    background: '#009944',
                  }}>
                    #2-Hold
                  </div>
                  <div style={styles.cardContent}>
                    {items.map((item, idx) => (
                      <div key={`${item.table}-${item.note || 'no-note'}`} style={styles.itemRow}>
                        <span style={styles.itemName}>{item.name}</span>
                        <Badge 
                          color="gray" 
                          size="md" 
                          style={styles.itemBadge}
                        >
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                    {items.some(item => item.note) && (
                      <div style={styles.itemNote}>
                        -雪花多一點
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </td>

            {/* 待製作 */}
            <td style={styles.tableCell}>
              <div style={styles.columnHeader}>待製作</div>
              {summarizeItems(categoryItems.waiting).map((item, idx) => (
                <div
                  key={item.name}
                  style={{
                    ...styles.orderCard,
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  }}
                >
                  <div style={{
                    ...styles.cardHeader,
                    background: '#009944',
                  }}>
                    #3-待製作
                  </div>
                  <div style={styles.cardContent}>
                    <div style={styles.itemRow}>
                      <span style={styles.itemName}>{item.name}</span>
                      <Badge 
                        color="gray" 
                        size="md" 
                        style={styles.itemBadge}
                      >
                        {item.count}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}
