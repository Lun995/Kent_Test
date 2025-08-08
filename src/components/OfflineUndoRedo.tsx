import React, { useState } from 'react';
import { Button, Group, Text, Badge, Tooltip, Modal, Stack, Alert, Progress } from '@mantine/core';
import { 
  IconRotateLeft, 
  IconRotateRight, 
  IconHistory, 
  IconTrash,
  IconWifi,
  IconWifiOff,
  IconRefresh,
  IconAlertTriangle,
  IconCheck
} from '@tabler/icons-react';
import { useOfflineUndo } from '../hooks/useOfflineUndo';

interface OfflineUndoRedoProps {
  isMobile: boolean;
  showNetworkStatus?: boolean;
  showSyncControls?: boolean;
  showPendingActions?: boolean;
}

export const OfflineUndoRedo: React.FC<OfflineUndoRedoProps> = ({ 
  isMobile, 
  showNetworkStatus = true,
  showSyncControls = true,
  showPendingActions = true,
}) => {
  const {
    isOnline,
    pendingActions,
    syncedActions,
    localHistory,
    currentIndex,
    isSyncing,
    lastSyncTime,
    syncErrors,
    recordAction,
    undo,
    redo,
    canUndo,
    canRedo,
    manualSync,
    forceSync,
    getSyncStatus,
    clearLocalStorage,
  } = useOfflineUndo({
    enableNetworkMonitoring: true,
    autoSyncOnReconnect: true,
    syncInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000,
  });

  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const syncStatus = getSyncStatus();

  const handleUndoClick = async () => {
    if (isSyncing) return;
    await undo();
  };

  const handleRedoClick = async () => {
    if (isSyncing) return;
    await redo();
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      alert('離線狀態，無法同步');
      return;
    }
    await manualSync();
  };

  const handleForceSync = async () => {
    if (!isOnline) {
      alert('離線狀態，無法同步');
      return;
    }
    await forceSync();
  };

  const formatTimestamp = (timestamp: Date | null) => {
    if (!timestamp) return '從未同步';
    return new Date(timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getNetworkStatusColor = () => {
    if (!isOnline) return 'red';
    if (isSyncing) return 'blue';
    if (pendingActions.length > 0) return 'yellow';
    return 'green';
  };

  const getNetworkStatusText = () => {
    if (!isOnline) return '離線';
    if (isSyncing) return '同步中';
    if (pendingActions.length > 0) return '待同步';
    return '已同步';
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
            disabled={!canUndo() || isSyncing}
            onClick={handleUndoClick}
            leftSection={<IconRotateLeft size={isMobile ? 14 : 16} />}
            style={{
              flex: 1,
              fontSize: isMobile ? '0.7rem' : '0.9rem',
              fontWeight: 600,
            }}
            loading={isSyncing}
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
            disabled={!canRedo() || isSyncing}
            onClick={handleRedoClick}
            leftSection={<IconRotateRight size={isMobile ? 14 : 16} />}
            style={{
              flex: 1,
              fontSize: isMobile ? '0.7rem' : '0.9rem',
              fontWeight: 600,
            }}
            loading={isSyncing}
          >
            {isMobile ? '重做' : '重做'}
          </Button>
        </Tooltip>

        {/* 網路狀態指示 */}
        {showNetworkStatus && (
          <Tooltip label={`網路狀態: ${getNetworkStatusText()}`}>
            <Badge
              color={getNetworkStatusColor()}
              size={isMobile ? 'xs' : 'sm'}
              leftSection={
                isOnline ? 
                  <IconWifi size={isMobile ? 12 : 14} /> : 
                  <IconWifiOff size={isMobile ? 12 : 14} />
              }
            >
              {isMobile ? 
                (isOnline ? '線上' : '離線') : 
                getNetworkStatusText()
              }
            </Badge>
          </Tooltip>
        )}

        {/* 同步控制按鈕 */}
        {showSyncControls && (
          <>
            <Tooltip label="手動同步">
              <Button
                variant="subtle"
                color="blue"
                size={isMobile ? 'xs' : 'sm'}
                disabled={!isOnline || isSyncing}
                onClick={handleManualSync}
                leftSection={<IconRefresh size={isMobile ? 14 : 16} />}
                style={{
                  fontSize: isMobile ? '0.6rem' : '0.8rem',
                }}
                loading={isSyncing}
              >
                {isMobile ? '同步' : '同步'}
              </Button>
            </Tooltip>

            {pendingActions.length > 0 && (
              <Tooltip label="強制同步">
                <Button
                  variant="subtle"
                  color="orange"
                  size={isMobile ? 'xs' : 'sm'}
                  disabled={!isOnline || isSyncing}
                  onClick={handleForceSync}
                  leftSection={<IconCheck size={isMobile ? 14 : 16} />}
                  style={{
                    fontSize: isMobile ? '0.6rem' : '0.8rem',
                  }}
                >
                  {isMobile ? '強制' : '強制同步'}
                </Button>
              </Tooltip>
            )}
          </>
        )}

        {/* 待處理操作按鈕 */}
        {showPendingActions && pendingActions.length > 0 && (
          <Tooltip label="查看待處理操作">
            <Button
              variant="subtle"
              color="yellow"
              size={isMobile ? 'xs' : 'sm'}
              onClick={() => setShowPendingModal(true)}
              leftSection={<IconAlertTriangle size={isMobile ? 14 : 16} />}
              style={{
                fontSize: isMobile ? '0.6rem' : '0.8rem',
              }}
            >
              {isMobile ? `${pendingActions.length}` : `${pendingActions.length} 待處理`}
            </Button>
          </Tooltip>
        )}

        {/* 同步狀態按鈕 */}
        {showSyncControls && (
          <Tooltip label="同步狀態">
            <Button
              variant="subtle"
              color="gray"
              size={isMobile ? 'xs' : 'sm'}
              onClick={() => setShowSyncModal(true)}
              leftSection={<IconHistory size={isMobile ? 14 : 16} />}
              style={{
                fontSize: isMobile ? '0.6rem' : '0.8rem',
              }}
            >
              {isMobile ? '狀態' : '同步狀態'}
            </Button>
          </Tooltip>
        )}

        {/* 統計資訊 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          fontSize: isMobile ? '0.6rem' : '0.8rem',
          color: '#666'
        }}>
          <Text size="xs">操作:</Text>
          <Badge size="xs" variant="light">
            {currentIndex + 1}/{localHistory.length}
          </Badge>
          {isSyncing && (
            <Badge size="xs" color="blue" variant="light">
              同步中
            </Badge>
          )}
        </div>
      </Group>

      {/* 待處理操作模態框 */}
      <Modal
        opened={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        title="待處理操作"
        size="lg"
      >
        <Stack gap="md">
          {pendingActions.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              沒有待處理的操作
            </Text>
          ) : (
            <>
              <Alert color="yellow" title="待同步操作">
                共有 {pendingActions.length} 個操作等待同步到伺服器
              </Alert>
              
              {pendingActions.map((action, index) => (
                <div
                  key={action.id}
                  style={{
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    backgroundColor: 'white',
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
                    <Badge size="xs" color="yellow">
                      待同步
                    </Badge>
                  </Group>
                </div>
              ))}
              
              <Group justify="flex-end">
                <Button
                  variant="outline"
                  onClick={() => setShowPendingModal(false)}
                >
                  關閉
                </Button>
                <Button
                  color="blue"
                  onClick={handleManualSync}
                  disabled={!isOnline || isSyncing}
                  loading={isSyncing}
                >
                  立即同步
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>

      {/* 同步狀態模態框 */}
      <Modal
        opened={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        title="同步狀態"
        size="md"
      >
        <Stack gap="md">
          {/* 網路狀態 */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              網路狀態
            </Text>
            <Group>
              <Badge
                color={getNetworkStatusColor()}
                leftSection={
                  isOnline ? 
                    <IconWifi size={14} /> : 
                    <IconWifiOff size={14} />
                }
              >
                {getNetworkStatusText()}
              </Badge>
              {isSyncing && (
                <Badge color="blue">
                  同步中...
                </Badge>
              )}
            </Group>
          </div>

          {/* 同步統計 */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              同步統計
            </Text>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs">待同步操作:</Text>
                <Badge size="xs" color="yellow">
                  {pendingActions.length}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="xs">已同步操作:</Text>
                <Badge size="xs" color="green">
                  {syncedActions.length}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="xs">最後同步:</Text>
                <Text size="xs" c="dimmed">
                  {formatTimestamp(lastSyncTime)}
                </Text>
              </Group>
            </Stack>
          </div>

          {/* 同步進度 */}
          {isSyncing && (
            <div>
              <Text size="sm" fw={500} mb="xs">
                同步進度
              </Text>
              <Progress 
                value={pendingActions.length > 0 ? 
                  ((syncedActions.length / (syncedActions.length + pendingActions.length)) * 100) : 
                  100
                } 
                color="blue" 
                size="sm"
              />
            </div>
          )}

          {/* 錯誤資訊 */}
          {syncErrors.length > 0 && (
            <div>
              <Text size="sm" fw={500} mb="xs" c="red">
                同步錯誤
              </Text>
              <Alert color="red" title="錯誤">
                {syncErrors.map((error, index) => (
                  <Text key={index} size="xs" c="red">
                    {error}
                  </Text>
                ))}
              </Alert>
            </div>
          )}

          {/* 操作按鈕 */}
          <Group justify="flex-end">
            <Button
              variant="outline"
              onClick={() => setShowSyncModal(false)}
            >
              關閉
            </Button>
            {pendingActions.length > 0 && (
              <Button
                color="blue"
                onClick={handleManualSync}
                disabled={!isOnline || isSyncing}
                loading={isSyncing}
              >
                立即同步
              </Button>
            )}
          </Group>
        </Stack>
      </Modal>
    </>
  );
}; 