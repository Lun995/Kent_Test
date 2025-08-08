import React, { useState } from 'react'
import { 
  Button, 
  Group, 
  Text, 
  Badge, 
  Tooltip, 
  Modal, 
  Stack, 
  Alert, 
  Progress,
  Card,
  Title,
  Divider,
  ActionIcon,
  ScrollArea
} from '@mantine/core'
import { 
  IconRotateLeft, 
  IconRotateRight, 
  IconHistory, 
  IconWifi, 
  IconWifiOff, 
  IconRefresh, 
  IconAlertTriangle, 
  IconCheck,
  IconX,
  IconClock,
  IconDatabase,
  IconCloud,
  IconDeviceFloppy
} from '@tabler/icons-react'
import { useSupabaseOffline } from '../hooks/useSupabaseOffline'

interface SupabaseOfflineUIProps {
  isMobile?: boolean
  showNetworkStatus?: boolean
  showSyncControls?: boolean
  showPendingActions?: boolean
  showHistory?: boolean
}

export const SupabaseOfflineUI: React.FC<SupabaseOfflineUIProps> = ({
  isMobile = false,
  showNetworkStatus = true,
  showSyncControls = true,
  showPendingActions = true,
  showHistory = true
}) => {
  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncErrors,
    orders,
    selectedOrderIds,
    localHistory,
    currentIndex,
    pendingActions,
    syncedActions,
    undo,
    redo,
    canUndo,
    canRedo,
    manualSync,
    forceSync,
    retrySync,
    clearSyncErrors,
    getSyncStatus,
    completeOrder,
    startPreparingOrder,
    markOrderReady,
    cancelOrder,
    clearLocalStorage
  } = useSupabaseOffline({
    autoSync: true,
    syncInterval: 30000,
    maxRetries: 3,
    enableConflictDetection: true
  })

  const [showPendingModal, setShowPendingModal] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showOrdersModal, setShowOrdersModal] = useState(false)

  const syncStatus = getSyncStatus()

  const handleUndoClick = async () => {
    try {
      await undo()
    } catch (error) {
      console.error('撤銷失敗:', error)
    }
  }

  const handleRedoClick = async () => {
    try {
      await redo()
    } catch (error) {
      console.error('重做失敗:', error)
    }
  }

  const handleManualSync = async () => {
    try {
      await manualSync()
    } catch (error) {
      console.error('手動同步失敗:', error)
    }
  }

  const handleForceSync = async () => {
    try {
      await forceSync()
    } catch (error) {
      console.error('強制同步失敗:', error)
    }
  }

  const handleRetrySync = async () => {
    try {
      await retrySync()
    } catch (error) {
      console.error('重試同步失敗:', error)
    }
  }

  const getNetworkStatusColor = () => {
    if (!isOnline) return 'red'
    if (isSyncing) return 'yellow'
    if (pendingActions.length > 0) return 'orange'
    if (syncErrors.length > 0) return 'red'
    return 'green'
  }

  const getNetworkStatusText = () => {
    if (!isOnline) return '離線'
    if (isSyncing) return '同步中'
    if (pendingActions.length > 0) return `待同步 (${pendingActions.length})`
    if (syncErrors.length > 0) return `錯誤 (${syncErrors.length})`
    return '已同步'
  }

  const formatTimestamp = (timestamp: Date | null) => {
    if (!timestamp) return '從未同步'
    return new Date(timestamp).toLocaleString('zh-TW')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'blue'
      case 'PREPARING': return 'yellow'
      case 'READY': return 'green'
      case 'COMPLETED': return 'gray'
      case 'CANCELLED': return 'red'
      default: return 'gray'
    }
  }

  return (
    <>
      <Group gap="xs" style={{ width: '100%' }}>
        {/* 撤銷/重做按鈕 */}
        <Button
          size={isMobile ? 'xs' : 'sm'}
          variant="outline"
          leftSection={<IconRotateLeft size={16} />}
          onClick={handleUndoClick}
          disabled={!canUndo || isSyncing}
          loading={isSyncing}
        >
          撤銷
        </Button>

        <Button
          size={isMobile ? 'xs' : 'sm'}
          variant="outline"
          leftSection={<IconRotateRight size={16} />}
          onClick={handleRedoClick}
          disabled={!canRedo || isSyncing}
          loading={isSyncing}
        >
          重做
        </Button>

        {/* 網路狀態 */}
        {showNetworkStatus && (
          <Badge
            color={getNetworkStatusColor()}
            variant="light"
            leftSection={isOnline ? <IconWifi size={12} /> : <IconWifiOff size={12} />}
          >
            {getNetworkStatusText()}
          </Badge>
        )}

        {/* 同步控制 */}
        {showSyncControls && (
          <>
            <Tooltip label="手動同步">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={handleManualSync}
                disabled={isSyncing || !isOnline}
                loading={isSyncing}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="強制同步">
              <ActionIcon
                variant="light"
                color="green"
                onClick={handleForceSync}
                disabled={isSyncing || !isOnline}
                loading={isSyncing}
              >
                <IconCheck size={16} />
              </ActionIcon>
            </Tooltip>

            {syncErrors.length > 0 && (
              <Tooltip label="重試同步">
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={handleRetrySync}
                  disabled={isSyncing}
                  loading={isSyncing}
                >
                  <IconAlertTriangle size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </>
        )}

        {/* 待同步操作 */}
        {showPendingActions && pendingActions.length > 0 && (
          <Tooltip label={`${pendingActions.length} 個待同步操作`}>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => setShowPendingModal(true)}
            >
              <IconClock size={16} />
            </ActionIcon>
          </Tooltip>
        )}

        {/* 同步狀態 */}
        {showSyncControls && (
          <Tooltip label="同步狀態">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => setShowSyncModal(true)}
            >
              <IconDatabase size={16} />
            </ActionIcon>
          </Tooltip>
        )}

        {/* 操作歷史 */}
        {showHistory && (
          <Tooltip label="操作歷史">
            <ActionIcon
              variant="light"
              color="gray"
              onClick={() => setShowHistoryModal(true)}
            >
              <IconHistory size={16} />
            </ActionIcon>
          </Tooltip>
        )}

        {/* 訂單列表 */}
        <Tooltip label="訂單列表">
          <ActionIcon
            variant="light"
            color="blue"
            onClick={() => setShowOrdersModal(true)}
          >
            <IconCloud size={16} />
          </ActionIcon>
        </Tooltip>

        {/* 操作計數 */}
        <Text size="xs" c="dimmed">
          {currentIndex + 1}/{localHistory.length}
        </Text>
      </Group>

      {/* 待同步操作 Modal */}
      <Modal
        opened={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        title="待同步操作"
        size="lg"
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="待同步操作"
            color="orange"
          >
            有 {pendingActions.length} 個操作等待同步到伺服器
          </Alert>

          <ScrollArea h={300}>
            {pendingActions.map((action, index) => (
              <Card key={action.id} mb="xs" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      {action.action_description}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(action.created_at).toLocaleString('zh-TW')}
                    </Text>
                  </div>
                  <Badge size="xs" color="orange">
                    待同步
                  </Badge>
                </Group>
              </Card>
            ))}
          </ScrollArea>

          <Group justify="space-between">
            <Button
              variant="light"
              onClick={handleManualSync}
              disabled={isSyncing}
              loading={isSyncing}
            >
              立即同步
            </Button>
            <Button
              variant="light"
              color="red"
              onClick={clearSyncErrors}
            >
              清除錯誤
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 同步狀態 Modal */}
      <Modal
        opened={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        title="同步狀態"
        size="md"
      >
        <Stack gap="md">
          <Card withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>網路狀態</Text>
              <Badge color={isOnline ? 'green' : 'red'}>
                {isOnline ? '線上' : '離線'}
              </Badge>
            </Group>
            
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>同步狀態</Text>
              <Badge color={getNetworkStatusColor()}>
                {syncStatus.status}
              </Badge>
            </Group>
            
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>待同步</Text>
              <Text size="sm">{pendingActions.length} 個操作</Text>
            </Group>
            
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>已同步</Text>
              <Text size="sm">{syncedActions.length} 個操作</Text>
            </Group>
            
            <Group justify="space-between">
              <Text size="sm" fw={500}>最後同步</Text>
              <Text size="sm">{formatTimestamp(lastSyncTime)}</Text>
            </Group>
          </Card>

          {syncErrors.length > 0 && (
            <Alert
              icon={<IconX size={16} />}
              title="同步錯誤"
              color="red"
            >
              {syncErrors.map((error, index) => (
                <Text key={index} size="sm">
                  {error}
                </Text>
              ))}
            </Alert>
          )}

          {isSyncing && (
            <Progress
              value={100}
              animated
              label="正在同步..."
              size="sm"
            />
          )}

          <Group justify="space-between">
            <Button
              variant="light"
              onClick={handleManualSync}
              disabled={isSyncing}
              loading={isSyncing}
            >
              手動同步
            </Button>
            <Button
              variant="light"
              color="green"
              onClick={handleForceSync}
              disabled={isSyncing}
              loading={isSyncing}
            >
              強制同步
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 操作歷史 Modal */}
      <Modal
        opened={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="操作歷史"
        size="lg"
      >
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm">
              當前位置: {currentIndex + 1} / {localHistory.length}
            </Text>
            <Button
              size="xs"
              variant="light"
              onClick={clearLocalStorage}
            >
              清除歷史
            </Button>
          </Group>

          <ScrollArea h={400}>
            {localHistory.map((action, index) => (
              <Card 
                key={action.id} 
                mb="xs" 
                withBorder
                style={{
                  opacity: index > currentIndex ? 0.5 : 1,
                  borderColor: index === currentIndex ? 'var(--mantine-color-blue-6)' : undefined
                }}
              >
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      {action.action_description}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(action.created_at).toLocaleString('zh-TW')}
                    </Text>
                  </div>
                  <Group gap="xs">
                    {action.is_undo && (
                      <Badge size="xs" color="red">
                        撤銷
                      </Badge>
                    )}
                    <Badge size="xs" color={index <= currentIndex ? 'green' : 'gray'}>
                      {index <= currentIndex ? '已執行' : '未執行'}
                    </Badge>
                  </Group>
                </Group>
              </Card>
            ))}
          </ScrollArea>
        </Stack>
      </Modal>

      {/* 訂單列表 Modal */}
      <Modal
        opened={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        title="訂單列表"
        size="lg"
      >
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm">
              總計: {orders.length} 個訂單
            </Text>
            <Text size="sm">
              已選: {selectedOrderIds.length} 個
            </Text>
          </Group>

          <ScrollArea h={400}>
            {orders.map((order) => (
              <Card key={order.id} mb="xs" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      {order.order_number}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {order.customer_name} - 桌號 {order.table_number}
                    </Text>
                    <Text size="xs" c="dimmed">
                      總計: ${order.total_amount}
                    </Text>
                  </div>
                  
                  <Group gap="xs">
                    <Badge color={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => startPreparingOrder(order.id)}
                        disabled={order.status !== 'PENDING'}
                      >
                        開始準備
                      </Button>
                      
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => markOrderReady(order.id)}
                        disabled={order.status !== 'PREPARING'}
                      >
                        準備完成
                      </Button>
                      
                      <Button
                        size="xs"
                        variant="light"
                        color="green"
                        onClick={() => completeOrder(order.id)}
                        disabled={order.status !== 'READY'}
                      >
                        完成
                      </Button>
                      
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        onClick={() => cancelOrder(order.id)}
                        disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                      >
                        取消
                      </Button>
                    </Group>
                  </Group>
                </Group>
              </Card>
            ))}
          </ScrollArea>
        </Stack>
      </Modal>
    </>
  )
} 