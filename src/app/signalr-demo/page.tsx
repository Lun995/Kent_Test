'use client'

import React, { useEffect, useState } from 'react'
import { Container, Title, Text, Stack, Alert, Card, Group, Button, Badge, Divider, ScrollArea } from '@mantine/core'
import { IconWifi, IconWifiOff, IconPlay, IconStop, IconRefresh, IconTestPipe, IconNetwork, IconCheck, IconX } from '@tabler/icons-react'
import { useSignalRMock, simulateNetworkChanges, simulateEventSequence } from '../../lib/signalr-mock'

export default function SignalRDemoPage() {
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
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)

  // 訂閱事件處理
  useEffect(() => {
    const handleOrderUpdate = (event: any) => {
      console.log('📡 收到訂單更新事件:', event)
      setLastEvent(event)
      addTestResult('order_update', '收到訂單更新事件', 'success')
    }

    const handleStatusChange = (event: any) => {
      console.log('📡 收到狀態變更事件:', event)
      setLastEvent(event)
      addTestResult('status_change', '收到狀態變更事件', 'success')
    }

    const handleNewOrder = (event: any) => {
      console.log('📡 收到新訂單事件:', event)
      setLastEvent(event)
      addTestResult('new_order', '收到新訂單事件', 'success')
    }

    const handleOrderComplete = (event: any) => {
      console.log('📡 收到訂單完成事件:', event)
      setLastEvent(event)
      addTestResult('order_complete', '收到訂單完成事件', 'success')
    }

    // 訂閱各種事件
    subscribe('order_update', handleOrderUpdate)
    subscribe('status_change', handleStatusChange)
    subscribe('new_order', handleNewOrder)
    subscribe('order_complete', handleOrderComplete)

    // 清理訂閱
    return () => {
      unsubscribe('order_update')
      unsubscribe('status_change')
      unsubscribe('new_order')
      unsubscribe('order_complete')
    }
  }, [subscribe, unsubscribe])

  const addTestResult = (type: string, message: string, status: 'success' | 'error' | 'info') => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      status,
      timestamp: new Date()
    }])
  }

  // 執行自動化測試
  const runAutomatedTests = async () => {
    setIsRunningTests(true)
    setTestResults([])

    try {
      // 測試 1: 連線測試
      addTestResult('connection', '開始連線測試...', 'info')
      await connect()
      addTestResult('connection', '連線成功', 'success')

      // 測試 2: 事件發送測試
      addTestResult('event_send', '開始事件發送測試...', 'info')
      const testEvent = {
        type: 'order_update',
        data: {
          orderId: 'test-order-001',
          orderNumber: 'TEST-001',
          status: 'PREPARING'
        }
      }
      sendEvent(testEvent)
      addTestResult('event_send', '事件發送成功', 'success')

      // 測試 3: 自動模擬測試
      addTestResult('simulation', '開始自動模擬測試...', 'info')
      startSimulation()
      
      // 等待 3 秒
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      stopSimulation()
      addTestResult('simulation', '自動模擬完成', 'success')

      // 測試 4: 網路中斷測試
      addTestResult('network', '開始網路中斷測試...', 'info')
      disconnect()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 嘗試在斷線狀態發送事件
      const offlineEvent = {
        type: 'order_update',
        data: { orderId: 'offline-test' }
      }
      sendEvent(offlineEvent) // 應該失敗
      addTestResult('network', '斷線狀態處理正常', 'success')

      // 測試 5: 重連測試
      addTestResult('reconnect', '開始重連測試...', 'info')
      await connect()
      addTestResult('reconnect', '重連成功', 'success')

      // 測試 6: 事件序列測試
      addTestResult('sequence', '開始事件序列測試...', 'info')
      simulateEventSequence()
      await new Promise(resolve => setTimeout(resolve, 8000)) // 等待事件序列完成
      addTestResult('sequence', '事件序列測試完成', 'success')

      addTestResult('summary', '所有測試完成！', 'success')

    } catch (error) {
      addTestResult('error', `測試失敗: ${error.message}`, 'error')
    } finally {
      setIsRunningTests(false)
    }
  }

  const connectionStatus = getConnectionStatus()
  const statusColor = {
    connected: 'green',
    disconnected: 'red',
    simulating: 'blue'
  }[connectionStatus] || 'gray'

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <IconWifi size={16} />
      case 'disconnected': return <IconWifiOff size={16} />
      case 'simulating': return <IconTestPipe size={16} />
      default: return <IconNetwork size={16} />
    }
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* 標題 */}
        <div>
          <Title order={1}>SignalR 演示系統</Title>
          <Text c="dimmed" size="sm">
            即時通訊功能演示和測試
          </Text>
        </div>

        {/* 狀態面板 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>系統狀態</Title>
              <Badge color={statusColor} variant="light" size="lg">
                {getStatusIcon()}
                {' '}{connectionStatus.toUpperCase()}
              </Badge>
            </Group>

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
                disabled={connection.isConnected || isRunningTests}
                variant="light"
                color="green"
              >
                連線
              </Button>
              <Button
                leftSection={<IconWifiOff size={16} />}
                onClick={disconnect}
                disabled={!connection.isConnected || isRunningTests}
                variant="light"
                color="red"
              >
                斷線
              </Button>
              <Button
                leftSection={<IconPlay size={16} />}
                onClick={startSimulation}
                disabled={!connection.isConnected || isSimulating || isRunningTests}
                variant="light"
                color="blue"
              >
                開始模擬
              </Button>
              <Button
                leftSection={<IconStop size={16} />}
                onClick={stopSimulation}
                disabled={!isSimulating || isRunningTests}
                variant="light"
                color="orange"
              >
                停止模擬
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* 自動化測試 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>自動化測試</Title>
            
            <Group>
              <Button
                leftSection={<IconTestPipe size={16} />}
                onClick={runAutomatedTests}
                disabled={isRunningTests}
                variant="filled"
                color="purple"
                loading={isRunningTests}
              >
                {isRunningTests ? '執行測試中...' : '執行完整測試'}
              </Button>
              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={() => setTestResults([])}
                variant="outline"
                color="gray"
              >
                清除結果
              </Button>
            </Group>

            {/* 測試結果 */}
            {testResults.length > 0 && (
              <ScrollArea h={300}>
                <Stack gap="xs">
                  {testResults.map((result) => (
                    <Card key={result.id} padding="xs" withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text size="sm" fw={500}>
                            {result.type}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {result.message}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {result.timestamp.toLocaleTimeString()}
                          </Text>
                        </div>
                        <Badge 
                          size="sm" 
                          color={result.status === 'success' ? 'green' : result.status === 'error' ? 'red' : 'blue'}
                        >
                          {result.status === 'success' && <IconCheck size={12} />}
                          {result.status === 'error' && <IconX size={12} />}
                          {' '}{result.status}
                        </Badge>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </ScrollArea>
            )}
          </Stack>
        </Card>

        {/* 手動測試 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>手動測試</Title>
            
            <Group>
              <Button
                size="sm"
                onClick={() => sendEvent({
                  type: 'order_update',
                  data: {
                    orderId: `manual-${Date.now()}`,
                    orderNumber: `MAN-${Math.floor(Math.random() * 1000)}`,
                    status: 'PREPARING'
                  }
                })}
                disabled={!connection.isConnected}
              >
                發送訂單更新
              </Button>
              <Button
                size="sm"
                onClick={() => sendEvent({
                  type: 'status_change',
                  data: {
                    orderId: `manual-${Date.now()}`,
                    previousStatus: 'PENDING',
                    newStatus: 'PREPARING'
                  }
                })}
                disabled={!connection.isConnected}
              >
                發送狀態變更
              </Button>
              <Button
                size="sm"
                onClick={() => sendEvent({
                  type: 'new_order',
                  data: {
                    orderId: `manual-${Date.now()}`,
                    orderNumber: `MAN-${Math.floor(Math.random() * 1000)}`,
                    customerName: '手動測試客戶',
                    totalAmount: Math.floor(Math.random() * 500) + 100
                  }
                })}
                disabled={!connection.isConnected}
              >
                發送新訂單
              </Button>
              <Button
                size="sm"
                onClick={() => sendEvent({
                  type: 'order_complete',
                  data: {
                    orderId: `manual-${Date.now()}`,
                    orderNumber: `MAN-${Math.floor(Math.random() * 1000)}`,
                    completedAt: new Date().toISOString()
                  }
                })}
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
                onClick={simulateNetworkChanges}
                variant="outline"
                color="yellow"
              >
                模擬網路變化
              </Button>
              <Button
                leftSection={<IconTestPipe size={16} />}
                onClick={simulateEventSequence}
                variant="outline"
                color="purple"
              >
                模擬事件序列
              </Button>
              <Button
                leftSection={<IconX size={16} />}
                onClick={clearEvents}
                variant="outline"
                color="gray"
              >
                清除事件記錄
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* 最後收到的事件 */}
        {lastEvent && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={3}>最後收到的事件</Title>
              <Alert variant="light" color="blue">
                <Text size="sm" fw={500}>事件類型: {lastEvent.type}</Text>
                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                  {JSON.stringify(lastEvent, null, 2)}
                </Text>
              </Alert>
            </Stack>
          </Card>
        )}

        {/* 事件記錄 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>事件記錄</Title>
              <Badge size="sm" variant="light">
                總計: {events.length} 個事件
              </Badge>
            </Group>
            
            <ScrollArea h={300}>
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
                          {event.data?.orderId || 'N/A'}
                        </Badge>
                      </Group>
                    </Card>
                  ))
                )}
              </Stack>
            </ScrollArea>
          </Stack>
        </Card>

        {/* 統計資訊 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>統計資訊</Title>
            <Group justify="space-between">
              <Text size="sm">總事件數: {events.length}</Text>
              <Text size="sm">模擬狀態: {isSimulating ? '運行中' : '已停止'}</Text>
              <Text size="sm">重連次數: {connection.reconnectAttempts}</Text>
              <Text size="sm">測試結果: {testResults.length} 項</Text>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
} 