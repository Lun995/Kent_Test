import React, { useEffect, useState } from 'react'
import { Card, Title, Text, Group, Button, Badge, Stack, Alert, Divider, ScrollArea } from '@mantine/core'
import { IconWifi, IconWifiOff, IconPlayerPlay, IconPlayerStop, IconRefresh, IconTrash, IconTestPipe, IconNetwork } from '@tabler/icons-react'
import { useSignalRMock, simulateNetworkChanges, simulateEventSequence, SignalREvent } from '../lib/signalr-mock'

export const SignalRTestPanel: React.FC = () => {
  const {
    connection,
    events,
    isSimulating,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendEvent,
    startSimulation,
    stopSimulation,
    clearEvents,
    getConnectionStatus
  } = useSignalRMock()

  const [lastEvent, setLastEvent] = useState<any>(null)

  // 訂閱事件處理
  useEffect(() => {
    const handleOrderUpdate = (event: any) => {
      console.log('📡 收到訂單更新事件:', event)
      setLastEvent(event)
    }

    const handleStatusChange = (event: any) => {
      console.log('📡 收到狀態變更事件:', event)
      setLastEvent(event)
    }

    const handleNewOrder = (event: any) => {
      console.log('📡 收到新訂單事件:', event)
      setLastEvent(event)
    }

    // 訂閱各種事件
    subscribe('order_update', handleOrderUpdate)
    subscribe('status_change', handleStatusChange)
    subscribe('new_order', handleNewOrder)

    // 清理訂閱
    return () => {
      unsubscribe('order_update')
      unsubscribe('status_change')
      unsubscribe('new_order')
    }
  }, [subscribe, unsubscribe])

  // 手動發送測試事件
  const sendTestEvent = (eventType: SignalREvent['type']) => {
    const testEvent: Omit<SignalREvent, 'timestamp'> = {
      type: eventType,
      data: {
        orderId: `test-order-${Date.now()}`,
        orderNumber: `TEST-${Math.floor(Math.random() * 1000)}`,
        status: 'PENDING',
        customerName: '測試客戶',
        totalAmount: Math.floor(Math.random() * 500) + 100
      },
      userId: 'test-user',
      sessionId: 'test-session'
    }

    sendEvent(testEvent)
  }

  // 模擬網路變化
  const handleNetworkSimulation = () => {
    simulateNetworkChanges()
  }

  // 模擬事件序列
  const handleEventSequence = () => {
    simulateEventSequence()
  }

  const connectionStatus = getConnectionStatus()
  const statusColor = {
    connected: 'green',
    disconnected: 'red',
    simulating: 'blue'
  }[connectionStatus] || 'gray'

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        {/* 標題 */}
        <Group justify="space-between">
          <Title order={3}>SignalR 模擬測試面板</Title>
          <Badge color={statusColor} variant="light">
            {connectionStatus === 'connected' && <IconWifi size={12} />}
            {connectionStatus === 'disconnected' && <IconWifiOff size={12} />}
            {connectionStatus === 'simulating' && <IconTestPipe size={12} />}
            {' '}{connectionStatus.toUpperCase()}
          </Badge>
        </Group>

        {/* 連線狀態 */}
        <Alert variant="light" color={statusColor === 'green' ? 'green' : 'red'}>
          <Group>
            <IconNetwork size={16} />
            <div>
              <Text size="sm" fw={500}>
                連線狀態: {connection.isConnected ? '已連線' : '未連線'}
              </Text>
              {connection.connectionId && (
                <Text size="xs" c="dimmed">
                  ConnectionId: {connection.connectionId}
                </Text>
              )}
            </div>
          </Group>
        </Alert>

        {/* 控制按鈕 */}
        <Group>
          <Button
            leftSection={<IconWifi size={16} />}
            onClick={connect}
            disabled={connection.isConnected}
            variant="light"
            color="green"
          >
            連線
          </Button>
          <Button
            leftSection={<IconWifiOff size={16} />}
            onClick={disconnect}
            disabled={!connection.isConnected}
            variant="light"
            color="red"
          >
            斷線
          </Button>
          <Button
                            leftSection={<IconPlayerPlay size={16} />}
            onClick={startSimulation}
            disabled={!connection.isConnected || isSimulating}
            variant="light"
            color="blue"
          >
            開始模擬
          </Button>
          <Button
                            leftSection={<IconPlayerStop size={16} />}
            onClick={stopSimulation}
            disabled={!isSimulating}
            variant="light"
            color="orange"
          >
            停止模擬
          </Button>
        </Group>

        {/* 手動發送事件 */}
        <Divider label="手動發送事件" labelPosition="center" />
        <Group>
          <Button
            size="sm"
            onClick={() => sendTestEvent('order_update')}
            disabled={!connection.isConnected}
          >
            發送訂單更新
          </Button>
          <Button
            size="sm"
            onClick={() => sendTestEvent('status_change')}
            disabled={!connection.isConnected}
          >
            發送狀態變更
          </Button>
          <Button
            size="sm"
            onClick={() => sendTestEvent('new_order')}
            disabled={!connection.isConnected}
          >
            發送新訂單
          </Button>
          <Button
            size="sm"
            onClick={() => sendTestEvent('order_complete')}
            disabled={!connection.isConnected}
          >
            發送訂單完成
          </Button>
        </Group>

        {/* 進階測試 */}
        <Divider label="進階測試" labelPosition="center" />
        <Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={handleNetworkSimulation}
            variant="outline"
            color="yellow"
          >
            模擬網路變化
          </Button>
          <Button
            leftSection={<IconTestPipe size={16} />}
            onClick={handleEventSequence}
            variant="outline"
            color="purple"
          >
            模擬事件序列
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            onClick={clearEvents}
            variant="outline"
            color="gray"
          >
            清除事件記錄
          </Button>
        </Group>

        {/* 最後收到的事件 */}
        {lastEvent && (
          <Alert variant="light" color="blue">
            <Text size="sm" fw={500}>最後收到的事件:</Text>
            <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
              {JSON.stringify(lastEvent, null, 2)}
            </Text>
          </Alert>
        )}

        {/* 事件記錄 */}
        <Divider label="事件記錄" labelPosition="center" />
        <ScrollArea h={200}>
          <Stack gap="xs">
            {events.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center">尚無事件記錄</Text>
            ) : (
              events.slice().reverse().map((event, index) => (
                <Card key={index} padding="xs" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={500}>
                        {event.type}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {event.timestamp.toLocaleTimeString()}
                      </Text>
                    </div>
                    <Badge size="xs" variant="light">
                      {event.data.orderId || 'N/A'}
                    </Badge>
                  </Group>
                </Card>
              ))
            )}
          </Stack>
        </ScrollArea>

        {/* 統計資訊 */}
        <Divider label="統計資訊" labelPosition="center" />
        <Group justify="space-between">
          <Text size="sm">總事件數: {events.length}</Text>
          <Text size="sm">模擬狀態: {isSimulating ? '運行中' : '已停止'}</Text>
          <Text size="sm">重連次數: {connection.reconnectAttempts}</Text>
        </Group>
      </Stack>
    </Card>
  )
} 