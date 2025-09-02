"use client";
import { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { workstationSelectionModalStyles } from '../../styles/workstationSelectionModalStyles';

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

interface WorkstationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workstations: Workstation[];
  currentWorkstation: string;
  onWorkstationSelect: (workstation: Workstation) => void;
  isLoading?: boolean;
}

export function WorkstationSelectionModal({
  isOpen,
  onClose,
  workstations,
  currentWorkstation,
  onWorkstationSelect,
  isLoading = false
}: WorkstationSelectionModalProps) {
  const { isMobile, isTablet } = useIsMobile();
  const styles = workstationSelectionModalStyles({ isMobile, isTablet });
  
  const [selectedWorkstation, setSelectedWorkstation] = useState<Workstation | null>(null);

  // 重置选择
  useEffect(() => {
    if (!isOpen) {
      setSelectedWorkstation(null);
    }
  }, [isOpen]);

  // 檢查是否為當前工作站
  const isCurrentWorkstation = (workstation: Workstation) => {
    return workstation.name === currentWorkstation;
  };

  const handleWorkstationSelect = (workstation: Workstation) => {
    setSelectedWorkstation(workstation);
  };

  const handleConfirm = () => {
    if (selectedWorkstation) {
      onWorkstationSelect(selectedWorkstation);
      onClose();
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return '#28a745'; // 在线
      case 2: return '#ffc107'; // 忙碌
      case 3: return '#dc3545'; // 离线
      default: return '#6c757d'; // 未知
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return '在線';
      case 2: return '忙碌';
      case 3: return '離線';
      default: return '未知';
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 華麗頭部 */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>🍽️</div>
          <div style={styles.headerContent}>
            <h2 style={styles.title}>工作站選擇</h2>
            <p style={styles.subtitle}>請選擇要切換的工作站</p>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 工作站列表 */}
        <div style={styles.workstationList}>
                     {isLoading ? (
             <div style={styles.loadingContainer}>
               <div style={styles.loadingSpinner}></div>
               <p style={styles.loadingText}>載入中...</p>
             </div>
                      ) : workstations.length === 0 ? (
             <div style={styles.emptyState}>
               <div style={styles.emptyIcon}>📭</div>
               <p style={styles.emptyText}>沒有可用的工作站</p>
             </div>
           ) : (
             workstations.map((workstation) => (
              <div
                key={workstation.uid}
                style={{
                  ...styles.workstationItem,
                  ...(selectedWorkstation?.uid === workstation.uid && styles.selectedItem),
                  ...(isCurrentWorkstation(workstation) && styles.currentWorkstationItem),
                  ...(workstation.isDisabled === 1 && styles.disabledItem)
                }}
                onClick={() => !workstation.isDisabled && handleWorkstationSelect(workstation)}
              >
                {/* 目前工作站標記 */}
                {isCurrentWorkstation(workstation) && (
                  <div style={styles.currentWorkstationBadge}>目前</div>
                )}

                <div style={styles.workstationInfo}>
                  <div style={styles.workstationName}>{workstation.name}</div>
                </div>
                
                {/* 預設工作站標記 */}
                {workstation.isDefault === 1 && !isCurrentWorkstation(workstation) && (
                  <div style={styles.defaultBadge}>預設</div>
                )}
                
                {/* 選取指示器 */}
                {selectedWorkstation?.uid === workstation.uid && (
                  <div style={styles.selectionIndicator}>✓</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 操作按鈕 */}
        <div style={styles.footer}>
          <button style={styles.cancelButton} onClick={onClose}>
            取消
          </button>
          <button 
            style={{
              ...styles.confirmButton,
              ...(!selectedWorkstation && styles.disabledConfirmButton)
            }}
            onClick={handleConfirm}
            disabled={!selectedWorkstation}
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}
