"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalContext } from '../../context/GlobalContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cellTypeSettingModalStyles } from '../../styles/cellTypeSettingModalStyles';

interface CellTypeSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CellTypeSettingModal({ isOpen, onClose }: CellTypeSettingModalProps) {
  const router = useRouter();
  const { displayState, displayDispatch } = useGlobalContext();
  const { isMobile, isTablet } = useIsMobile();
  const [selectedCellType, setSelectedCellType] = useState<'3' | '4'>(displayState.celltype);
  const [expandedDisplay, setExpandedDisplay] = useState(false);
  const [expandedSetting1, setExpandedSetting1] = useState(false);
  const [expandedSetting2, setExpandedSetting2] = useState(false);

  const handleCellTypeChange = (cellType: '3' | '4') => {
    setSelectedCellType(cellType);
  };

  const handleConfirm = () => {
    displayDispatch({ type: 'SET_CELLTYPE', payload: selectedCellType });
    onClose();
  };

  const handleCancel = () => {
    setSelectedCellType(displayState.celltype); // 重置為當前值
    setExpandedDisplay(false);
    setExpandedSetting1(false);
    setExpandedSetting2(false);
    onClose();
  };

  const handleLogout = () => {
    // 清除用戶狀態（如果需要）
    // 導轉到登入首頁
    router.push('/');
  };

  const toggleDisplay = () => {
    setExpandedDisplay(!expandedDisplay);
    setExpandedSetting1(false);
    setExpandedSetting2(false);
  };

  const toggleSetting1 = () => {
    setExpandedSetting1(!expandedSetting1);
    setExpandedDisplay(false);
    setExpandedSetting2(false);
  };

  const toggleSetting2 = () => {
    setExpandedSetting2(!expandedSetting2);
    setExpandedDisplay(false);
    setExpandedSetting1(false);
  };

  if (!isOpen) return null;

  const styles = cellTypeSettingModalStyles({ isMobile, isTablet });

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.titleContainer}>
            <div style={styles.titleIcon}>⚙️</div>
            <h3 style={styles.title}>設定中心</h3>
          </div>
          <button 
            onClick={onClose}
            style={styles.closeButton}
          >
            ✕
          </button>
        </div>
        
        <div style={styles.content}>
          <div style={styles.mainMenuContainer}>
            {/* 顯示設定 */}
            <div style={styles.settingSection}>
              <button 
                style={styles.mainMenuButton}
                onClick={toggleDisplay}
              >
                                 <div style={styles.buttonContent}>
                   <div style={styles.buttonIcon}>🖥️</div>
                   <span style={styles.buttonText}>顯示設定</span>
                   <div style={styles.expandIcon}>
                     {expandedDisplay ? '▼' : '▶'}
                   </div>
                 </div>
              </button>
              
              {expandedDisplay && (
                <div style={styles.expandedContent}>
                  <div style={styles.optionsContainer}>
                    <label style={styles.option}>
                      <input
                        type="radio"
                        name="cellType"
                        value="3"
                        checked={selectedCellType === '3'}
                        onChange={() => handleCellTypeChange('3')}
                        style={styles.radio}
                      />
                      <span style={styles.optionText}>3列</span>
                    </label>
                    
                    <label style={styles.option}>
                      <input
                        type="radio"
                        name="cellType"
                        value="4"
                        checked={selectedCellType === '4'}
                        onChange={() => handleCellTypeChange('4')}
                        style={styles.radio}
                      />
                      <span style={styles.optionText}>4列</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 設定1 */}
            <div style={styles.settingSection}>
              <button 
                style={styles.mainMenuButton}
                onClick={toggleSetting1}
              >
                <div style={styles.buttonContent}>
                  <div style={styles.buttonIcon}>🔧</div>
                  <span style={styles.buttonText}>設定1</span>
                  <div style={styles.expandIcon}>
                    {expandedSetting1 ? '▼' : '▶'}
                  </div>
                </div>
              </button>
              
              {expandedSetting1 && (
                <div style={styles.expandedContent}>
                  <div style={styles.placeholderContainer}>
                    <div style={styles.placeholderIcon}>🚧</div>
                    <p style={styles.placeholderText}>設定1 功能開發中...</p>
                  </div>
                </div>
              )}
            </div>

            {/* 設定2 */}
            <div style={styles.settingSection}>
              <button 
                style={styles.mainMenuButton}
                onClick={toggleSetting2}
              >
                <div style={styles.buttonContent}>
                  <div style={styles.buttonIcon}>⚡</div>
                  <span style={styles.buttonText}>設定2</span>
                  <div style={styles.expandIcon}>
                    {expandedSetting2 ? '▼' : '▶'}
                  </div>
                </div>
              </button>
              
              {expandedSetting2 && (
                <div style={styles.expandedContent}>
                  <div style={styles.placeholderContainer}>
                    <div style={styles.placeholderIcon}>🚧</div>
                    <p style={styles.placeholderText}>設定2 功能開發中...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div style={styles.footer}>
          <button 
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            登出
          </button>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={handleCancel}
              style={styles.cancelButton}
            >
              取消
            </button>
            {expandedDisplay && (
              <button 
                onClick={handleConfirm}
                style={styles.confirmButton}
              >
                確認
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
