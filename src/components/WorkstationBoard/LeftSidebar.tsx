"use client";
import { Button } from '@mantine/core';
import { useState } from 'react';

import { useIsMobile } from '../../hooks/useIsMobile';
import { leftSidebarStyles } from '../../styles/leftSidebarStyles';
import { CountdownButton } from './CountdownButton';
import { NormalButton } from './NormalButton';
import { SettingButton } from './SettingButton';

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
  const [showWorkstationMenu, setShowWorkstationMenu] = useState(false);
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [isPunchedIn, setIsPunchedIn] = useState(false);

  const handleCountdownReset = () => {
    // 打卡機功能：記錄打卡時間或重置
    if (!isPunchedIn) {
      // 打卡
      const now = new Date();
      const timeString = now.toLocaleTimeString('zh-TW', { hour12: false });
      setPunchInTime(timeString);
      setIsPunchedIn(true);
      console.log('打卡時間:', timeString);
    } else {
      // 重置打卡
      setPunchInTime(null);
      setIsPunchedIn(false);
      console.log('打卡已重置');
    }
  };

  const handleWorkstationClick = () => {
    setShowWorkstationMenu(!showWorkstationMenu);
  };

  const handleWorkstationSelect = (station: string) => {
    onWorkstationChange(station);
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
            isPunchedIn={isPunchedIn}
            punchInTime={punchInTime}
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
            onClick={onSettings}
            color="dark"
            variant="setting"
          >
            <div style={styles.settingText}>⋯</div>
          </SettingButton>
        </div>
      </div>

      {/* 工作站選單彈跳視窗 */}
      {showWorkstationMenu && (
        <div style={styles.workstationMenu}>
          <div style={styles.workstationMenuHeader}>
            選擇工作站
          </div>
          
          <div style={styles.workstationMenuContent}>
            {workstationError ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                {workstationError}
              </div>
            ) : isLoadingWorkstations ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                載入中...
              </div>
            ) : workstations.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                無可用工作站
              </div>
            ) : (
              workstations.map((station) => (
                <div key={station.uid} style={styles.workstationMenuItem}>
                  <Button
                    variant="subtle"
                    color="dark"
                    size={isMobile ? 'lg' : 'xl'}
                    style={{
                      ...styles.workstationMenuButton,
                      background: currentWorkstation === station.name ? '#e0e0e0' : '#fff',
                    }}
                    onClick={() => handleWorkstationSelect(station.name)}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      if (currentWorkstation !== station.name) {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      if (currentWorkstation !== station.name) {
                        e.currentTarget.style.backgroundColor = '#fff';
                      }
                    }}
                  >
                    {station.name}
                  </Button>
                </div>
              ))
            )}
          </div>
          
          <div style={styles.workstationMenuFooter}>
            <Button
              variant="filled"
              color="gray"
              size={isMobile ? 'lg' : 'xl'}
              style={styles.cancelButton}
              onClick={() => setShowWorkstationMenu(false)}
            >
              取消
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
