import React, { useState } from 'react';
import { Button, Group, Text, Badge, Tooltip, Modal, Stack, Alert } from '@mantine/core';
import { IconRotateLeft, IconRotateRight, IconHistory, IconTrash } from '@tabler/icons-react';
import { useEnhancedUndo } from '../hooks/useEnhancedUndo';

interface EnhancedUndoRedoProps {
  isMobile: boolean;
  showHistory?: boolean;
  showClearButton?: boolean;
  showStats?: boolean;
}

export const EnhancedUndoRedo: React.FC<EnhancedUndoRedoProps> = ({ 
  isMobile, 
  showHistory = true,
  showClearButton = true,
  showStats = true,
}) => {
  const {
    history,
    currentIndex,
    isProcessing,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handleClearHistory,
    getCurrentActionDescription,
    getHistoryStats,
  } = useEnhancedUndo({
    maxHistorySize: 50,
    enableAutoSave: true,
    autoSaveInterval: 30000,
    enableKeyboardShortcuts: true,
  });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const stats = getHistoryStats();

  const handleUndoClick = async () => {
    if (isProcessing) return;
    await handleUndo();
  };

  const handleRedoClick = async () => {
    if (isProcessing) return;
    await handleRedo();
  };

  const handleClearClick = () => {
    setShowClearConfirm(true);
  };

  const confirmClearHistory = () => {
    handleClearHistory();
    setShowClearConfirm(false);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <>
      <Group gap="xs" style={{ width: '100%' }}>
        {/* 撤銷按鈕 */}
        <Tooltip label="撤銷 (Ctrl+Z)" disabled={!canUndo()}>
          <Button
            variant="outline"
            color="dark"
            size={isMobile ? 'xs' : 'sm'}
            disabled={!canUndo() || isProcessing}
            onClick={handleUndoClick}
            leftSection={<IconRotateLeft size={isMobile ? 14 : 16} />}
            style={{
              flex: 1,
              fontSize: isMobile ? '0.7rem' : '0.9rem',
              fontWeight: 600,
            }}
            loading={isProcessing}
          >
            {isMobile ? '撤銷' : '撤銷'}
          </Button>
        </Tooltip>

        {/* 重做按鈕 */}
        <Tooltip label="重做 (Ctrl+Y)" disabled={!canRedo()}>
          <Button
            variant="outline"
            color="dark"
            size={isMobile ? 'xs' : 'sm'}
            disabled={!canRedo() || isProcessing}
            onClick={handleRedoClick}
            leftSection={<IconRotateRight size={isMobile ? 14 : 16} />}
            style={{
              flex: 1,
              fontSize: isMobile ? '0.7rem' : '0.9rem',
              fontWeight: 600,
            }}
            loading={isProcessing}
          >
            {isMobile ? '重做' : '重做'}
          </Button>
        </Tooltip>

        {/* 歷史記錄按鈕 */}
        {showHistory && (
          <Tooltip label="查看歷史記錄">
            <Button
              variant="subtle"
              color="gray"
              size={isMobile ? 'xs' : 'sm'}
              onClick={() => setShowHistoryModal(true)}
              leftSection={<IconHistory size={isMobile ? 14 : 16} />}
              style={{
                fontSize: isMobile ? '0.6rem' : '0.8rem',
              }}
            >
              {isMobile ? '歷史' : '歷史'}
            </Button>
          </Tooltip>
        )}

        {/* 清除歷史按鈕 */}
        {showClearButton && history.length > 0 && (
          <Tooltip label="清除歷史記錄">
            <Button
              variant="subtle"
              color="red"
              size={isMobile ? 'xs' : 'sm'}
              onClick={handleClearClick}
              leftSection={<IconTrash size={isMobile ? 14 : 16} />}
              style={{
                fontSize: isMobile ? '0.6rem' : '0.8rem',
              }}
            >
              {isMobile ? '清除' : '清除'}
            </Button>
          </Tooltip>
        )}

        {/* 統計資訊 */}
        {showStats && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            fontSize: isMobile ? '0.6rem' : '0.8rem',
            color: '#666'
          }}>
            <Text size="xs">操作:</Text>
            <Badge size="xs" variant="light">
              {currentIndex + 1}/{history.length}
            </Badge>
            {isProcessing && (
              <Badge size="xs" color="blue" variant="light">
                處理中
              </Badge>
            )}
          </div>
        )}
      </Group>

      {/* 歷史記錄模態框 */}
      <Modal
        opened={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="操作歷史記錄"
        size="lg"
      >
        <Stack gap="md">
          {history.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              尚無操作歷史記錄
            </Text>
          ) : (
            history.map((action, index) => (
              <div
                key={action.id}
                style={{
                  padding: '12px',
                  border: index === currentIndex ? '2px solid #228be6' : '1px solid #e9ecef',
                  borderRadius: '8px',
                  backgroundColor: index === currentIndex ? '#f8f9fa' : 'white',
                }}
              >
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {action.description}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatTimestamp(action.timestamp)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      類型: {action.type}
                    </Text>
                  </div>
                  {index === currentIndex && (
                    <Badge size="xs" color="blue">
                      當前
                    </Badge>
                  )}
                </Group>
              </div>
            ))
          )}
        </Stack>
      </Modal>

      {/* 清除確認模態框 */}
      <Modal
        opened={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="確認清除歷史記錄"
        size="sm"
      >
        <Stack gap="md">
          <Alert color="yellow" title="警告">
            清除歷史記錄後將無法撤銷或重做之前的操作。此操作不可逆轉。
          </Alert>
          <Text size="sm">
            當前共有 {history.length} 個操作記錄，確定要清除嗎？
          </Text>
          <Group justify="flex-end">
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
            >
              取消
            </Button>
            <Button
              color="red"
              onClick={confirmClearHistory}
            >
              確認清除
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}; 