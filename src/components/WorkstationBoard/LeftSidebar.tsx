"use client";
import { Button } from '@mantine/core';
import { useState } from 'react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useIsMobile } from '../../hooks/useIsMobile';
import { leftSidebarStyles } from '../../styles/leftSidebarStyles';
import { CountdownButton } from './CountdownButton';
import { NormalButton } from './NormalButton';
import { SettingButton } from './SettingButton';

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
  totalItems
}: LeftSidebarProps) {
  const { isMobile, isTablet } = useIsMobile();
  const { playSound } = useAudioPlayer();
  const [showWorkstationMenu, setShowWorkstationMenu] = useState(false);

  const handleCountdownReset = () => {
    playSound('/notification.mp3');
    // 這裡應該觸發倒數計時重置邏輯
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
        {/* 欄位 1: 倒數計時按鈕 */}
        <div style={styles.buttonField}>
          <CountdownButton
            onClick={handleCountdownReset}
            currentItem={currentItem}
            totalItems={totalItems}
            countdown={countdown}
          />
        </div>

        {/* 欄位 2: 部分銷單按鈕 */}
        <div style={styles.buttonField}>
          <NormalButton
            onClick={onPartialCancel}
            color="blue"
          >
            <div style={styles.buttonText}>部分</div>
            <div style={styles.buttonText}>銷單</div>
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
          >
            <div style={styles.workstationText}>
              {currentWorkstation}
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
            {['刨肉區', '菜盤', '大盤'].map((station) => (
              <div key={station} style={styles.workstationMenuItem}>
                <Button
                  variant="subtle"
                  color="dark"
                  size={isMobile ? 'lg' : 'xl'}
                  style={{
                    ...styles.workstationMenuButton,
                    background: currentWorkstation === station ? '#e0e0e0' : '#fff',
                  }}
                  onClick={() => handleWorkstationSelect(station)}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (currentWorkstation !== station) {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (currentWorkstation !== station) {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }
                  }}
                >
                  {station}
                </Button>
              </div>
            ))}
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
