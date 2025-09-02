"use client";
import { Button as MantineButton } from '@mantine/core';
import { createPortal } from 'react-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { partialCancelModalStyles } from '../../styles/partialCancelModalStyles';
import { useGlobalContext } from '../../context/GlobalContext';

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
  const { displayState } = useGlobalContext();

  if (!isOpen || !selectedItem) return null;

  // 退餐邏輯
  const isTargetSnowflake = selectedItem.name === '雪花牛' && selectedItem.note === '油花少一點';
  const isChangeMeal = displayState.changeMeal === 1;
  const returnCount = isChangeMeal && isTargetSnowflake ? -1 : 0;
  const maxEditable = Math.max(1, selectedItem.count + returnCount); // 異動數量最大值 = 原始數量 + 退餐數量（不得小於1）

  // 表頭統一為"HOLD"
  const modalTitle = 'HOLD';
  const shouldAppendExtraRow = isChangeMeal && isTargetSnowflake;

  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          {modalTitle}
        </div>
        
        <div style={styles.content}>
          <div style={{
            ...styles.row,
            gridTemplateColumns: showConfirmButton ? '1.2fr 3.2fr 0.8fr auto' : '1.2fr 3.2fr 1fr'
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ ...styles.editCount, color: '#888' }}>
                  {selectedItem.count}
                </span>
                {/* 退餐數量顯示 - 只在status不等於2時顯示 */}
                {shouldAppendExtraRow && displayState.status !== 2 && (
                  <span style={{ 
                    ...styles.editCount, 
                    color: '#dc3545', 
                    fontSize: isMobile ? '1.2rem' : isTablet ? '1.4rem' : '1.6rem',
                    fontWeight: 700,
                    marginTop: '2px'
                  }}>
                    {returnCount < 0 ? returnCount : '-1'}
                  </span>
                )}
              </div>
            </div>
            
            {/* 只有製作中品項且status不等於2時才顯示數量編輯區域 */}
            {showConfirmButton && displayState.status !== 2 && (
              <div style={styles.actionCell}>
                <button
                  onClick={() => onCountChange && onCountChange(Math.max(1, Math.min(maxEditable, editCount - 1)))}
                  disabled={editCount <= 1}
                  style={{
                    ...styles.actionButton,
                    opacity: editCount <= 1 ? 0.5 : 1,
                    cursor: editCount <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  -
                </button>
                <span style={{ ...styles.editCount, color: '#d7263d' }}>{editCount}</span>
                <button
                  onClick={() => onCountChange && onCountChange(Math.min(maxEditable, editCount + 1))}
                  disabled={editCount >= maxEditable}
                  style={{
                    ...styles.actionButton,
                    opacity: editCount >= maxEditable ? 0.5 : 1,
                    cursor: editCount >= maxEditable ? 'not-allowed' : 'pointer'
                  }}
                >
                  +
                </button>
                <button
                  onClick={() => onCountChange && onCountChange(maxEditable)}
                  style={{
                    ...styles.maxButton,
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: '2px solid #28a745',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#218838';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#28a745';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                  }}
                >
                  M
                </button>
              </div>
            )}
          </div>


        </div>
        
        <div style={styles.footer}>
          {showConfirmButton && displayState.status !== 2 && (
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
