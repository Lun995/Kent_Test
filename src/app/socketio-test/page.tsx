'use client'

import React, { useState, useEffect } from 'react'
import { Container, Title, Text, Button, Stack, Alert, Card, Group, Badge, TextInput, Select } from '@mantine/core'
import { IconWifi, IconWifiOff, IconTestPipe, IconSend, IconServer, IconInfoCircle } from '@tabler/icons-react'
import socketIOClient, { SocketIOEvent } from '../../lib/socketio-client'

export default function SocketIOTestPage() {
  const [connectionState, setConnectionState] = useState('Disconnected')
  const [connectionInfo, setConnectionInfo] = useState(socketIOClient.getConnectionInfo())
  const [events, setEvents] = useState<SocketIOEvent[]>([])
  const [lastEvent, setLastEvent] = useState<SocketIOEvent | null>(null)
  const [serverUrl, setServerUrl] = useState('http://localhost:7001')
  const [eventType, setEventType] = useState('order_update')
  const [eventData, setEventData] = useState('{"orderId": "test-001", "status": "pending"}')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  // 更新連線狀態
  const updateConnectionState = () => {
    setConnectionState(socketIOClient.getConnectionState())
    setConnectionInfo(socketIOClient.getConnectionInfo())
  }

  // 連線到 Socket.IO 服務器
  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await socketIOClient.connect()
      updateConnectionState()
      addEvent({
        type: 'status_change',
        data: { message: '連線成功' },
        timestamp: new Date()
      })
    } catch (error) {
      console.error('連線失敗:', error)
      addEvent({
        type: 'status_change',
        data: { message: `連線失敗: ${error}` },
        timestamp: new Date()
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // 斷線
  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await socketIOClient.disconnect()
      updateConnectionState()
      addEvent({
        type: 'status_change',
        data: { message: '斷線成功' },
        timestamp: new Date()
      })
    } catch (error) {
      console.error('斷線失敗:', error)
      addEvent({
        type: 'status_change',
        data: { message: `斷線失敗: ${error}` },
        timestamp: new Date()
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  // 發送事件
  const handleSendEvent = async () => {
    try {
      const data = JSON.parse(eventData)
      await socketIOClient.sendEvent(eventType, data)
      addEvent({
        type: eventType as SocketIOEvent['type'],
        data,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('發送事件失敗:', error)
      addEvent({
        type: 'status_change',
        data: { message: `發送事件失敗: ${error}` },
        timestamp: new Date()
      })
    }
  }

  // 添加事件到列表
  const addEvent = (event: SocketIOEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50)) // 保留最近50個事件
    setLastEvent(event)
  }

  // 訂閱 Socket.IO 事件
  useEffect(() => {
    const handleOrderUpdate = (event: SocketIOEvent) => {
      console.log('📡 收到訂單更新事件:', event)
      addEvent(event)
    }

    const handleStatusChange = (event: SocketIOEvent) => {
      console.log('📡 收到狀態變更事件:', event)
      addEvent(event)
    }

    const handleNewOrder = (event: SocketIOEvent) => {
      console.log('📡 收到新訂單事件:', event)
      addEvent(event)
    }

    const handleOrderComplete = (event: SocketIOEvent) => {
      console.log('📡 收到訂單完成事件:', event)
      addEvent(event)
    }

    // 訂閱各種事件
    socketIOClient.subscribe('order_update', handleOrderUpdate)
    socketIOClient.subscribe('status_change', handleStatusChange)
    socketIOClient.subscribe('new_order', handleNewOrder)
    socketIOClient.subscribe('order_complete', handleOrderComplete)

    // 定期更新連線狀態
    const interval = setInterval(updateConnectionState, 1000)

    return () => {
      socketIOClient.unsubscribe('order_update')
      socketIOClient.unsubscribe('status_change')
      socketIOClient.unsubscribe('new_order')
      socketIOClient.unsubscribe('order_complete')
      clearInterval(interval)
    }
  }, [])

  const getStateColor = (state: string) => {
    switch (state) {
      case 'Connected': return 'green'
      case 'Connecting': return 'yellow'
      case 'Reconnecting': return 'orange'
      case 'Disconnected': return 'red'
      default: return 'gray'
    }
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title>Socket.IO 即時通訊測試</Title>
        <Text>使用 Socket.IO 客戶端連線到服務器，實現真正的即時通訊</Text>

        {/* 連線配置 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>連線配置</Title>
            
            <TextInput
              label="Socket.IO 服務器 URL"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:7001"
              description="Socket.IO 服務器的完整 URL"
            />

            <Group>
              <Button
                leftSection={<IconWifi size={16} />}
                onClick={handleConnect}
                disabled={connectionState === 'Connected' || isConnecting}
                loading={isConnecting}
                color="green"
              >
                {isConnecting ? '連線中...' : '連線'}
              </Button>
              
              <Button
                leftSection={<IconWifiOff size={16} />}
                onClick={handleDisconnect}
                disabled={connectionState !== 'Connected' || isDisconnecting}
                loading={isDisconnecting}
                color="red"
              >
                {isDisconnecting ? '斷線中...' : '斷線'}
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* 連線狀態 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>連線狀態</Title>
            
            <Group>
              <Badge 
                color={getStateColor(connectionState)}
                leftSection={connectionState === 'Connected' ? <IconWifi size={12} /> : <IconWifiOff size={12} />}
                size="lg"
              >
                {connectionState}
              </Badge>
              
              {connectionInfo.connectionId && (
                <Badge color="blue">
                  ID: {connectionInfo.connectionId}
                </Badge>
              )}
              
              <Badge color="gray">
                重連次數: {connectionInfo.reconnectAttempts}
              </Badge>
            </Group>

            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              <Text size="sm">
                連線狀態: {JSON.stringify(connectionInfo, null, 2)}
              </Text>
            </Alert>
          </Stack>
        </Card>

        {/* 發送事件 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>發送事件</Title>
            
            <Group>
              <Select
                label="事件類型"
                value={eventType}
                onChange={(value) => setEventType(value || 'order_update')}
                data={[
                  { value: 'order_update', label: '訂單更新' },
                  { value: 'status_change', label: '狀態變更' },
                  { value: 'new_order', label: '新訂單' },
                  { value: 'order_complete', label: '訂單完成' }
                ]}
                style={{ flex: 1 }}
              />
              
              <Button
                leftSection={<IconSend size={16} />}
                onClick={handleSendEvent}
                disabled={connectionState !== 'Connected'}
                color="blue"
              >
                發送事件
              </Button>
            </Group>

            <TextInput
              label="事件數據 (JSON)"
              value={eventData}
              onChange={(e) => setEventData(e.target.value)}
              placeholder='{"orderId": "test-001", "status": "pending"}'
            />
          </Stack>
        </Card>

        {/* 最後收到的事件 */}
        {lastEvent && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={3}>最後收到的事件</Title>
              
              <Alert color="green">
                <Text size="sm" fw={500}>事件類型: {lastEvent.type}</Text>
                <Text size="xs" c="dimmed" mt="xs" style={{ fontFamily: 'monospace' }}>
                  {JSON.stringify(lastEvent, null, 2)}
                </Text>
              </Alert>
            </Stack>
          </Card>
        )}

        {/* 事件記錄 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>事件記錄 ({events.length})</Title>
            
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto', 
              backgroundColor: '#f5f5f5', 
              padding: '10px',
              borderRadius: '8px'
            }}>
              {events.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center">尚無事件記錄</Text>
              ) : (
                events.map((event, index) => (
                  <div key={index} style={{ 
                    marginBottom: '10px', 
                    padding: '8px', 
                    backgroundColor: 'white', 
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Badge color="blue" size="sm">
                        {event.type}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {event.timestamp.toLocaleTimeString()}
                      </Text>
                    </div>
                    <Text size="xs" style={{ fontFamily: 'monospace', marginTop: '4px' }}>
                      {JSON.stringify(event.data, null, 2)}
                    </Text>
                  </div>
                ))
              )}
            </div>
          </Stack>
        </Card>

        {/* 說明 */}
        <Alert color="blue" title="使用說明">
          <Text size="sm">
            這個頁面使用 Socket.IO 客戶端連線到服務器：
          </Text>
          <Text size="xs" mt="xs">
            • 需要運行 Socket.IO 服務器 (http://localhost:7001)<br/>
            • 支持自動重連和事件訂閱<br/>
            • 可以發送和接收即時事件<br/>
            • 顯示詳細的連線狀態和事件記錄<br/>
            • 完全免費，無需任何費用
          </Text>
        </Alert>

        {/* 費用說明 */}
        <Alert color="green" title="費用說明">
          <Text size="sm">
            Socket.IO 是完全免費的開源技術：
          </Text>
          <Text size="xs" mt="xs">
            ✅ 無需任何費用<br/>
            ✅ 可以自架服務器<br/>
            ✅ 支持本地開發和測試<br/>
            ✅ 可以部署到任何雲端平台<br/>
            ✅ 社區活躍，文檔豐富
          </Text>
        </Alert>
      </Stack>
    </Container>
  )
} 