"use client";
import { Button } from '@mantine/core';
import { useState } from 'react';

import { useIsMobile } from '../../hooks/useIsMobile';
import { useGlobalContext } from '../../context/GlobalContext';
import { leftSidebarStyles } from '../../styles/leftSidebarStyles';
import CountdownButton from './CountdownButton';
import { NormalButton } from './NormalButton';
import { SettingButton } from './SettingButton';
import { CellTypeSettingModal } from './CellTypeSettingModal';
import { WorkstationSelectionModal } from './WorkstationSelectionModal';

// 工作站介面 - 更新為符合 KDS API 規格
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

interface LeftSidebarProps {
  onPartialCancel: () => void;
  onHistoryRecord: () => void;
  onBackupTotal: () => void;
  onWorkstationChange: (station: string) => void;
  onSettings: () => void;
  currentWorkstation: string;
  countdown: number;
  currentItem: number;
  totalItems: number;
  workstations: Workstation[];
  isLoadingWorkstations: boolean;
  workstationError: string | null;
  selectedMakingItem: any;
  selectedHoldItem: any;
  onHoldSelectedItem: () => void;
}

export function LeftSidebar({
  onPartialCancel,
  onHistoryRecord,
  onBackupTotal,
  onWorkstationChange,
  onSettings,
  currentWorkstation,
  countdown,
  currentItem,
  totalItems,
  workstations,
  isLoadingWorkstations,
  workstationError,
  selectedMakingItem,
  selectedHoldItem,
  onHoldSelectedItem
}: LeftSidebarProps) {
  const { isMobile, isTablet } = useIsMobile();
  const { displayState } = useGlobalContext();
  const [showWorkstationMenu, setShowWorkstationMenu] = useState(false);
  const [showCellTypeSettings, setShowCellTypeSettings] = useState(false);

  const handleCountdownReset = () => {
    // 重整當下頁面
    window.location.reload();
  };

  const handleWorkstationClick = () => {
    setShowWorkstationMenu(true);
  };

  const handleWorkstationSelect = (workstation: Workstation) => {
    onWorkstationChange(workstation.name);
    setShowWorkstationMenu(false);
  };

  const styles = leftSidebarStyles({ isMobile, isTablet });

  return (
    <div style={styles.container}>
      <div style={styles.buttonContainer}>
        {/* 欄位 1: 打卡機按鈕 */}
        <div style={styles.buttonField}>
          <CountdownButton
            onClick={handleCountdownReset}
            currentItem={currentItem}
            totalItems={totalItems}
            countdown={countdown}
            isPunchedIn={false}
            punchInTime=""
          />
        </div>

        {/* 欄位 2: HOLD 按鈕 */}
        <div style={styles.buttonField}>
          <NormalButton
            onClick={(selectedMakingItem || selectedHoldItem) ? onHoldSelectedItem : onPartialCancel}
            color="blue"
          >
            <div style={styles.buttonText}>HOLD</div>
          </NormalButton>
        </div>

        {/* 欄位 3: 歷史紀錄按鈕 */}
        <div style={styles.buttonField}>
          <NormalButton
            onClick={onHistoryRecord}
            color="blue"
          >
            <div style={styles.buttonText}>歷史</div>
            <div style={styles.buttonText}>紀錄</div>
          </NormalButton>
        </div>

        {/* 欄位 4: 空欄位 */}
        <div style={styles.buttonField}>
          {/* 空欄位 */}
        </div>

        {/* 欄位 5: 備餐總數按鈕 */}
        <div style={styles.buttonField}>
          <NormalButton
            onClick={onBackupTotal}
            color="orange"
          >
            <div style={styles.buttonText}>備餐</div>
            <div style={styles.buttonText}>總數</div>
          </NormalButton>
        </div>

        {/* 欄位 6: 工作站按鈕 */}
        <div style={styles.buttonField}>
          <SettingButton
            onClick={handleWorkstationClick}
            color="gray"
            variant="workstation"
            disabled={isLoadingWorkstations}
          >
            <div style={styles.workstationText}>
              {isLoadingWorkstations ? '載入中...' : currentWorkstation}
            </div>
          </SettingButton>
        </div>

        {/* 欄位 7: 設定按鈕 */}
        <div style={styles.settingButtonContainer}>
          <SettingButton
            onClick={() => setShowCellTypeSettings(true)}
            color="dark"
            variant="setting"
          >
            <div style={styles.settingText}>⋯</div>
          </SettingButton>
        </div>
      </div>

      {/* 工作站選擇模态框 */}
      <WorkstationSelectionModal
        isOpen={showWorkstationMenu}
        onClose={() => setShowWorkstationMenu(false)}
        workstations={workstations}
        currentWorkstation={currentWorkstation}
        onWorkstationSelect={handleWorkstationSelect}
        isLoading={isLoadingWorkstations}
      />

      {/* 列數設定 Modal */}
      <CellTypeSettingModal
        isOpen={showCellTypeSettings}
        onClose={() => setShowCellTypeSettings(false)}
      />
    </div>
  );
}
