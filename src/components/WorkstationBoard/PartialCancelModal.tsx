"use client";
import { Button as MantineButton } from '@mantine/core';
import { createPortal } from 'react-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { partialCancelModalStyles } from '../../styles/partialCancelModalStyles';

interface OrderItem {
  name: string;
  count: number;
  table: string;
  note?: string;
}

interface PartialCancelModalProps {
  isOpen: boolean;
  modalRows: OrderItem[];
  holdEditCounts: number[];
  onHoldEditCountChange: (index: number, value: number) => void;
  onHold: () => void;
  onClose: () => void;
  isHoldItem?: boolean; // 新增：是否為Hold品項
}

export function PartialCancelModal({
  isOpen,
  modalRows,
  holdEditCounts,
  onHoldEditCountChange,
  onHold,
  onClose,
  isHoldItem = false
}: PartialCancelModalProps) {
  const { isMobile, isTablet } = useIsMobile();
  const styles = partialCancelModalStyles({ isMobile, isTablet });

  if (!isOpen) return null;

  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          {modalRows.length === 1 ? 'HOLD' : '部分銷單(HOLD)品項'}
        </div>
        
        <div style={styles.content}>
          {modalRows.map((row, idx) => (
            <div
              key={`${row.table}-${row.note || 'default'}`}
              style={styles.row}
            >
              <div style={styles.tableCell}>
                {row.table.includes('內用') ? (
                  <>
                    <span style={styles.tableText}>內用</span>
                    <span style={styles.tableText}>{row.table.replace('內用', '')}</span>
                  </>
                ) : (
                  <span>{row.table}</span>
                )}
              </div>
              
              <div style={styles.nameCell}>
                <span style={styles.nameText}>{row.name}</span>
                {row.note && (
                  <span style={styles.noteText}>
                    -{row.note}
                  </span>
                )}
              </div>
              
              <span style={styles.countCell}>{row.count}</span>
              
              {/* 只有非Hold品項才顯示數量調整按鈕 */}
              {!isHoldItem && (
                <div style={styles.actionCell}>
                  <MantineButton
                    size="md"
                    color="gray"
                    variant="outline"
                    style={styles.actionButton}
                    onClick={() => onHoldEditCountChange(idx, Math.max(0, holdEditCounts[idx] - 1))}
                    disabled={holdEditCounts[idx] <= 0}
                  >
                    -
                  </MantineButton>
                  
                  <span style={{
                    ...styles.editCount,
                    color: holdEditCounts[idx] > 0 ? 'red' : '#888',
                  }}>
                    {holdEditCounts[idx]}
                  </span>
                  
                  <MantineButton
                    size="md"
                    color="gray"
                    variant="outline"
                    style={styles.actionButton}
                    onClick={() => onHoldEditCountChange(idx, Math.min(row.count, holdEditCounts[idx] + 1))}
                    disabled={holdEditCounts[idx] >= row.count}
                  >
                    +
                  </MantineButton>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div style={styles.footer}>
          {/* 只有非Hold品項才顯示確認按鈕 */}
          {!isHoldItem && (
            <MantineButton
              variant="filled"
              color="dark"
              size={isMobile ? 'lg' : 'xl'}
              style={styles.holdButton}
              onClick={onHold}
            >
              確認
            </MantineButton>
          )}
          
          <MantineButton
            variant="outline"
            color="dark"
            size={isMobile ? 'lg' : 'xl'}
            style={styles.closeButton}
            onClick={onClose}
          >
            關閉
          </MantineButton>
        </div>
      </div>
    </div>,
    document.body
  );
}
