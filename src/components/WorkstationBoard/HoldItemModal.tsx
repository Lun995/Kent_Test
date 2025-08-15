"use client";
import { Button as MantineButton } from '@mantine/core';
import { createPortal } from 'react-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { partialCancelModalStyles } from '../../styles/partialCancelModalStyles';

interface OrderItem {
  id: string;
  name: string;
  count: number;
  table: string;
  note?: string;
}

interface HoldItemModalProps {
  isOpen: boolean;
  selectedItem: OrderItem | null;
  onClose: () => void;
  itemType?: 'making' | 'hold'; // 新增：品項類型
  showConfirmButton?: boolean; // 新增：是否顯示確認按鈕
  editCount?: number; // 新增：編輯數量
  onCountChange?: (newCount: number) => void; // 新增：數量變更處理函數
  onConfirm?: () => void; // 新增：確認處理函數
}

export function HoldItemModal({ 
  isOpen, 
  selectedItem, 
  onClose, 
  itemType = 'hold',
  showConfirmButton = false,
  editCount = 0,
  onCountChange,
  onConfirm
}: HoldItemModalProps) {
  const { isMobile, isTablet } = useIsMobile();
  const styles = partialCancelModalStyles({ isMobile, isTablet });

  if (!isOpen || !selectedItem) return null;

  // 表頭統一為"HOLD"
  const modalTitle = 'HOLD';

  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          {modalTitle}
        </div>
        
        <div style={styles.content}>
          <div style={{
            ...styles.row,
            gridTemplateColumns: showConfirmButton ? '1.5fr 2.5fr 0.8fr auto' : '1.5fr 2.5fr 1fr'
          }}>
            <div style={styles.tableCell}>
              {selectedItem.table.includes('內用') ? (
                <>
                  <span style={styles.tableText}>內用</span>
                  <span style={styles.tableText}>{selectedItem.table.replace('內用', '')}</span>
                </>
              ) : (
                <span>{selectedItem.table}</span>
              )}
            </div>
            
            <div style={styles.nameCell}>
              <span style={styles.nameText}>{selectedItem.name}</span>
              {selectedItem.note && (
                <span style={styles.noteText}>
                  -{selectedItem.note}
                </span>
              )}
            </div>
            
            <div style={styles.countCell}>
              <span style={styles.editCount}>{selectedItem.count}</span>
            </div>
            
                         {/* 只有製作中品項才顯示數量編輯區域 */}
             {showConfirmButton && (
               <div style={styles.actionCell}>
                 <button
                   onClick={() => onCountChange && onCountChange(Math.max(0, editCount - 1))}
                   disabled={editCount <= 0}
                   style={{
                     ...styles.actionButton,
                     opacity: editCount <= 0 ? 0.5 : 1,
                     cursor: editCount <= 0 ? 'not-allowed' : 'pointer'
                   }}
                 >
                   -
                 </button>
                 <span style={{ ...styles.editCount, color: '#d7263d' }}>{editCount}</span>
                 <button
                   onClick={() => onCountChange && onCountChange(Math.min(selectedItem.count, editCount + 1))}
                   disabled={editCount >= selectedItem.count}
                   style={{
                     ...styles.actionButton,
                     opacity: editCount >= selectedItem.count ? 0.5 : 1,
                     cursor: editCount >= selectedItem.count ? 'not-allowed' : 'pointer'
                   }}
                 >
                   +
                 </button>
               </div>
             )}
          </div>
        </div>
        
        <div style={styles.footer}>
          {showConfirmButton && (
            <MantineButton
              variant="filled"
              color="blue"
              size={isMobile ? 'lg' : 'xl'}
              style={{
                ...styles.closeButton,
                marginRight: '12px'
              }}
              onClick={onConfirm}
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
