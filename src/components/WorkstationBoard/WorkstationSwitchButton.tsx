"use client";
import { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { WorkstationSelectionModal } from './WorkstationSelectionModal';
import { workstationSwitchButtonStyles } from '../../styles/workstationSwitchButtonStyles';

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

interface WorkstationSwitchButtonProps {
  currentWorkstation: string;
  workstations: Workstation[];
  onWorkstationChange: (workstation: Workstation) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function WorkstationSwitchButton({
  currentWorkstation,
  workstations,
  onWorkstationChange,
  isLoading = false,
  disabled = false
}: WorkstationSwitchButtonProps) {
  const { isMobile, isTablet } = useIsMobile();
  const styles = workstationSwitchButtonStyles({ isMobile, isTablet });
  
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (!disabled && !isLoading) {
      setShowModal(true);
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
      case 1: return '在线';
      case 2: return '忙碌';
      case 3: return '离线';
      default: return '未知';
    }
  };

  // 获取当前工作站的详细信息
  const currentWorkstationInfo = workstations.find(ws => ws.name === currentWorkstation);

  return (
    <>
      <div
        style={{
          ...styles.container,
          ...(isHovered && styles.hoveredContainer),
          ...(isPressed && styles.pressedContainer),
          ...(disabled && styles.disabledContainer),
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
      >
        {/* 工作站图标 */}
        <div style={styles.iconContainer}>
          <div style={styles.icon}>🏭</div>
          {currentWorkstationInfo && (
            <div 
              style={{
                ...styles.statusIndicator,
                backgroundColor: getStatusColor(currentWorkstationInfo.status)
              }}
            />
          )}
        </div>

        {/* 工作站信息 */}
        <div style={styles.infoContainer}>
          <div style={styles.workstationName}>{currentWorkstation}</div>
          {currentWorkstationInfo && (
            <div style={styles.workstationDetails}>
              <span style={styles.workstationNo}>{currentWorkstationInfo.no}</span>
              <span style={styles.workstationStatus}>
                {getStatusText(currentWorkstationInfo.status)}
              </span>
            </div>
          )}
        </div>

        {/* 切换指示器 */}
        <div style={styles.switchIndicator}>
          <div style={styles.switchIcon}>🔄</div>
          <div style={styles.switchText}>切换</div>
        </div>

        {/* 加载指示器 */}
        {isLoading && (
          <div style={styles.loadingOverlay}>
            <div style={styles.loadingSpinner}></div>
          </div>
        )}
      </div>

      {/* 工作站选择模态框 */}
      <WorkstationSelectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        workstations={workstations}
        currentWorkstation={currentWorkstation}
        onWorkstationSelect={onWorkstationChange}
        isLoading={isLoading}
      />
    </>
  );
}





