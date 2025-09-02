"use client";

import { Button } from '@mantine/core';
import { useGlobalContext } from '../../context/GlobalContext';

interface DisplaySettingsModalProps {
  onClose: () => void;
}

export function DisplaySettingsModal({ onClose }: DisplaySettingsModalProps) {
  const { displayState, displayDispatch } = useGlobalContext();

  const handleCellTypeChange = (celltype: '3' | '4') => {
    displayDispatch({ type: 'SET_CELLTYPE', payload: celltype });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        minWidth: '300px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      }}>
        {/* 標題 */}
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center',
          color: '#333',
        }}>
          顯示設定
        </div>

        {/* 選項按鈕 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <Button
            variant={displayState.celltype === '3' ? 'filled' : 'outline'}
            color="blue"
            size="lg"
            onClick={() => handleCellTypeChange('3')}
            style={{
              height: '50px',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            3列
          </Button>
          
          <Button
            variant={displayState.celltype === '4' ? 'filled' : 'outline'}
            color="blue"
            size="lg"
            onClick={() => handleCellTypeChange('4')}
            style={{
              height: '50px',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            4列
          </Button>
        </div>

        {/* 取消按鈕 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Button
            variant="subtle"
            color="gray"
            size="md"
            onClick={onClose}
            style={{
              fontSize: '14px',
            }}
          >
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

