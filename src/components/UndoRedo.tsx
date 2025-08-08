import React from 'react';
import { Button, Group, Text, Badge } from '@mantine/core';
import { useUndoStore } from '../store/undoStore';

interface UndoRedoProps {
  isMobile: boolean;
}

export const UndoRedo: React.FC<UndoRedoProps> = ({ isMobile }) => {
  const { 
    canUndo, 
    canRedo, 
    undo, 
    redo, 
    history, 
    currentIndex,
    selectedItemId,
    updateSelectedItem
  } = useUndoStore();

  const handleUndo = () => {
    const currentState = useUndoStore.getState();
    const currentHistory = currentState.history;
    const currentIdx = currentState.currentIndex;
    
    if (currentIdx > 0) {
      const previousAction = currentHistory[currentIdx - 1];
      
      // 執行復原操作
      undo();
      
      // 恢復品項選擇狀態
      if (previousAction.selectedItemId !== undefined) {
        updateSelectedItem(previousAction.selectedItemId);
      }
      
      // 同步到後端
      syncWithBackend();
    }
  };

  const handleRedo = () => {
    const currentState = useUndoStore.getState();
    const currentHistory = currentState.history;
    const currentIdx = currentState.currentIndex;
    
    if (currentIdx < currentHistory.length - 1) {
      const nextAction = currentHistory[currentIdx + 1];
      
      // 執行重做操作
      redo();
      
      // 恢復品項選擇狀態
      if (nextAction.selectedItemId !== undefined) {
        updateSelectedItem(nextAction.selectedItemId);
      }
      
      // 同步到後端
      syncWithBackend();
    }
  };

  const syncWithBackend = async () => {
    try {
      // 呼叫後端 API 來同步資料
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'undo_redo',
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        console.error('同步後端資料失敗');
      }
    } catch (error) {
      console.error('同步後端資料時發生錯誤:', error);
    }
  };

  return (
    <Group gap="xs" style={{ width: '100%' }}>
      <Button
        variant="outline"
        color="dark"
        size={isMobile ? 'xs' : 'sm'}
        disabled={!canUndo()}
        onClick={handleUndo}
        style={{
          flex: 1,
          fontSize: isMobile ? '0.7rem' : '0.9rem',
          fontWeight: 600,
        }}
      >
        ↩️ 復原
      </Button>
      
      <Button
        variant="outline"
        color="dark"
        size={isMobile ? 'xs' : 'sm'}
        disabled={!canRedo()}
        onClick={handleRedo}
        style={{
          flex: 1,
          fontSize: isMobile ? '0.7rem' : '0.9rem',
          fontWeight: 600,
        }}
      >
        ↪️ 重做
      </Button>
      
      {/* 顯示歷史記錄資訊 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        fontSize: isMobile ? '0.6rem' : '0.8rem',
        color: '#666'
      }}>
        <Text size="xs">歷史:</Text>
        <Badge size="xs" variant="light">
          {currentIndex + 1}/{history.length}
        </Badge>
      </div>
    </Group>
  );
}; 