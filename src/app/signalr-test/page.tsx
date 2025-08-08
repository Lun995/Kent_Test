'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Stack, 
  Alert, 
  Card, 
  Group, 
  Badge, 
  TextInput, 
  Select,
  Accordion,
  Code,
  Divider,
  Paper,
  List,
  ThemeIcon
} from '@mantine/core'
import { 
  IconWifi, 
  IconWifiOff, 
  IconTestPipe, 
  IconSend, 
  IconServer, 
  IconInfoCircle,
  IconCheck,
  IconX,
  IconClock,
  IconMessage,
  IconSettings,
  IconPlayerPlay,
  IconPlayerPause,
  IconRefresh
} from '@tabler/icons-react'
import signalRClient, { SignalREvent } from '../../lib/signalr-client'

export default function SignalRTestPage() {
  const [connectionState, setConnectionState] = useState('Disconnected')
  const [connectionInfo, setConnectionInfo] = useState(signalRClient.getConnectionInfo())
  const [events, setEvents] = useState<SignalREvent[]>([])
  const [lastEvent, setLastEvent] = useState<SignalREvent | null>(null)
  const [hubUrl, setHubUrl] = useState('http://localhost:7107/signalrhub')
  const [eventType, setEventType] = useState('order_update')
  const [eventData, setEventData] = useState('{"orderId": "test-001", "status": "pending"}')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [testMode, setTestMode] = useState<'manual' | 'auto'>('manual')
  const [autoTestInterval, setAutoTestInterval] = useState<NodeJS.Timeout | null>(null)
  const [connectionLog, setConnectionLog] = useState<string[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  // 添加連線日誌
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    setConnectionLog(prev => [...prev, logEntry].slice(-20)) // 保留最近20條日誌
  }

  // 更新連線狀態
  const updateConnectionState = () => {
    const newState = signalRClient.getConnectionState()
    const newInfo = signalRClient.getConnectionInfo()
    
    if (newState !== connectionState) {
      addLog(`連線狀態變更: ${connectionState} → ${newState}`)
    }
    
    setConnectionState(newState)
    setConnectionInfo(newInfo)
  }

  // 連線到 SignalR Hub
  const handleConnect = async () => {
    setIsConnecting(true)
    addLog('開始連線到 SignalR Hub...')
    
    try {
      await signalRClient.connect()
      updateConnectionState()
      addLog('✅ 連線成功！')
      addEvent({
        type: 'status_change',
        data: { message: '連線成功', connectionId: connectionInfo.connectionId },
        timestamp: new Date()
      })
    } catch (error) {
      console.error('連線失敗:', error)
      addLog(`❌ 連線失敗: ${error}`)
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
    addLog('開始斷線...')
    
    try {
      await signalRClient.disconnect()
      updateConnectionState()
      addLog('✅ 斷線成功')
      addEvent({
        type: 'status_change',
        data: { message: '斷線成功' },
        timestamp: new Date()
      })
    } catch (error) {
      console.error('斷線失敗:', error)
      addLog(`❌ 斷線失敗: ${error}`)
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
      addLog(`📤 發送事件: ${eventType}`)
      await signalRClient.sendEvent(eventType, data)
      addEvent({
        type: eventType as SignalREvent['type'],
        data,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('發送事件失敗:', error)
      addLog(`❌ 發送事件失敗: ${error}`)
      addEvent({
        type: 'status_change',
        data: { message: `發送事件失敗: ${error}` },
        timestamp: new Date()
      })
    }
  }

  // 自動測試模式
  const startAutoTest = () => {
    if (autoTestInterval) return
    
    addLog('🔄 開始自動測試模式')
    const interval = setInterval(() => {
      if (connectionState === 'Connected') {
        const testEvents = [
          { type: 'order_update', data: { orderId: `auto-${Date.now()}`, status: 'preparing' } },
          { type: 'status_change', data: { message: '自動測試狀態更新' } },
          { type: 'new_order', data: { orderId: `new-${Date.now()}`, items: ['測試商品'] } }
        ]
        const randomEvent = testEvents[Math.floor(Math.random() * testEvents.length)]
        
        signalRClient.sendEvent(randomEvent.type, randomEvent.data)
          .then(() => addLog(`✅ 自動發送事件: ${randomEvent.type}`))
          .catch(err => addLog(`❌ 自動發送失敗: ${err}`))
      }
    }, 5000) // 每5秒發送一個事件
    
    setAutoTestInterval(interval)
  }

  const stopAutoTest = () => {
    if (autoTestInterval) {
      clearInterval(autoTestInterval)
      setAutoTestInterval(null)
      addLog('⏹️ 停止自動測試模式')
    }
  }

  // 添加事件到列表
  const addEvent = (event: SignalREvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50)) // 保留最近50個事件
    setLastEvent(event)
    addLog(`📡 收到事件: ${event.type}`)
  }

  // 清除事件記錄
  const clearEvents = () => {
    setEvents([])
    setLastEvent(null)
    addLog('🗑️ 清除事件記錄')
  }

  // 訂閱 SignalR 事件
  useEffect(() => {
    const handleOrderUpdate = (event: SignalREvent) => {
      console.log('📡 收到訂單更新事件:', event)
      addEvent(event)
    }

    const handleStatusChange = (event: SignalREvent) => {
      console.log('📡 收到狀態變更事件:', event)
      addEvent(event)
    }

    const handleNewOrder = (event: SignalREvent) => {
      console.log('📡 收到新訂單事件:', event)
      addEvent(event)
    }

    const handleOrderComplete = (event: SignalREvent) => {
      console.log('📡 收到訂單完成事件:', event)
      addEvent(event)
    }

    // 訂閱各種事件
    signalRClient.subscribe('order_update', handleOrderUpdate)
    signalRClient.subscribe('status_change', handleStatusChange)
    signalRClient.subscribe('new_order', handleNewOrder)
    signalRClient.subscribe('order_complete', handleOrderComplete)

    // 定期更新連線狀態
    const interval = setInterval(updateConnectionState, 1000)

    return () => {
      signalRClient.unsubscribe('order_update')
      signalRClient.unsubscribe('status_change')
      signalRClient.unsubscribe('new_order')
      signalRClient.unsubscribe('order_complete')
      clearInterval(interval)
      if (autoTestInterval) {
        clearInterval(autoTestInterval)
      }
    }
  }, [autoTestInterval])

  // 自動滾動日誌
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [connectionLog])

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
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Title>SignalR 前台連線測試</Title>
        <Text c="dimmed">完整的 SignalR 客戶端連線測試和監控工具</Text>

        {/* 流程說明 */}
        <Accordion variant="contained">
          <Accordion.Item value="flow">
            <Accordion.Control>
              <Group>
                <IconInfoCircle size={20} />
                <Text fw={500}>SignalR 連線流程說明</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Text size="sm" fw={500}>1. 初始化階段</Text>
                <List size="sm" spacing="xs">
                  <List.Item>建立 HubConnection 實例</List.Item>
                  <List.Item>配置自動重連策略</List.Item>
                  <List.Item>設置事件處理器</List.Item>
                  <List.Item>配置日誌級別</List.Item>
                </List>

                <Text size="sm" fw={500}>2. 連線階段</Text>
                <List size="sm" spacing="xs">
                  <List.Item>調用 connection.start() 方法</List.Item>
                  <List.Item>等待服務器回應</List.Item>
                  <List.Item>建立 WebSocket 連線</List.Item>
                  <List.Item>獲取 ConnectionId</List.Item>
                </List>

                <Text size="sm" fw={500}>3. 事件處理階段</Text>
                <List size="sm" spacing="xs">
                  <List.Item>訂閱服務器事件 (connection.on)</List.Item>
                  <List.Item>發送事件到服務器 (connection.invoke)</List.Item>
                  <List.Item>處理重連和斷線事件</List.Item>
                </List>

                <Text size="sm" fw={500}>4. 斷線階段</Text>
                <List size="sm" spacing="xs">
                  <List.Item>調用 connection.stop() 方法</List.Item>
                  <List.Item>清理事件監聽器</List.Item>
                  <List.Item>關閉 WebSocket 連線</List.Item>
                </List>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
          
          <Accordion.Item value="target">
            <Accordion.Control>
              <Group>
                <IconServer size={20} />
                <Text fw={500}>目標站台資訊</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Alert color="blue" title="當前測試目標">
                  <Text size="sm">
                    目標站台: <strong>http://localhost:7107</strong>
                  </Text>
                  <Text size="sm" mt="xs">
                    Hub 路徑: <strong>/signalrhub</strong>
                  </Text>
                </Alert>
                
                <Text size="sm" fw={500}>測試步驟:</Text>
                <List size="sm" spacing="xs">
                  <List.Item>1. 確認您的 SignalR 服務器正在運行</List.Item>
                  <List.Item>2. 點擊「連線」按鈕建立連線</List.Item>
                  <List.Item>3. 觀察連線狀態和日誌</List.Item>
                  <List.Item>4. 測試事件發送和接收</List.Item>
                </List>
                
                <Text size="sm" fw={500}>如果連線失敗:</Text>
                <List size="sm" spacing="xs">
                  <List.Item>檢查服務器是否運行在正確的端口</List.Item>
                  <List.Item>確認 Hub 路徑是否正確</List.Item>
                  <List.Item>檢查 CORS 設定</List.Item>
                  <List.Item>查看瀏覽器控制台錯誤</List.Item>
                </List>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        {/* 連線配置 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group>
              <IconSettings size={20} />
              <Title order={3}>連線配置</Title>
            </Group>
            
            <TextInput
              label="SignalR Hub URL"
              value={hubUrl}
              onChange={(e) => setHubUrl(e.target.value)}
              placeholder="https://localhost:7001/signalrhub"
              description="SignalR Hub 的完整 URL"
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

              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={updateConnectionState}
                variant="outline"
              >
                刷新狀態
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* 連線狀態 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group>
              <IconServer size={20} />
              <Title order={3}>連線狀態</Title>
            </Group>
            
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

            <Paper p="md" withBorder>
              <Text size="sm" fw={500} mb="xs">連線詳細信息:</Text>
              <Code block>
                {JSON.stringify(connectionInfo, null, 2)}
              </Code>
            </Paper>
          </Stack>
        </Card>

        {/* 事件測試 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group>
              <IconTestPipe size={20} />
              <Title order={3}>事件測試</Title>
            </Group>
            
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

            {/* 自動測試模式 */}
            <Divider />
            <Group>
              <Text size="sm" fw={500}>自動測試模式:</Text>
              <Button
                leftSection={<IconPlayerPlay size={16} />}
                onClick={startAutoTest}
                disabled={!!autoTestInterval || connectionState !== 'Connected'}
                color="green"
                size="sm"
              >
                開始自動測試
              </Button>
              <Button
                leftSection={<IconPlayerPause size={16} />}
                onClick={stopAutoTest}
                disabled={!autoTestInterval}
                color="orange"
                size="sm"
              >
                停止自動測試
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* 連線日誌 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group>
              <IconMessage size={20} />
              <Title order={3}>連線日誌 ({connectionLog.length})</Title>
            </Group>
            
            <Paper 
              p="md" 
              withBorder 
              style={{ 
                maxHeight: '200px', 
                overflowY: 'auto',
                backgroundColor: '#f8f9fa'
              }}
              ref={logRef}
            >
              {connectionLog.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center">尚無日誌記錄</Text>
              ) : (
                connectionLog.map((log, index) => (
                  <Text key={index} size="xs" style={{ fontFamily: 'monospace' }}>
                    {log}
                  </Text>
                ))
              )}
            </Paper>
          </Stack>
        </Card>

        {/* 最後收到的事件 */}
        {lastEvent && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group>
                <IconClock size={20} />
                <Title order={3}>最後收到的事件</Title>
              </Group>
              
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
            <Group>
              <IconMessage size={20} />
              <Title order={3}>事件記錄 ({events.length})</Title>
              <Button
                onClick={clearEvents}
                size="xs"
                color="red"
                variant="outline"
              >
                清除記錄
              </Button>
            </Group>
            
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

        {/* 使用說明 */}
        <Alert color="blue" title="使用說明" icon={<IconInfoCircle size={16} />}>
          <Text size="sm">
            這個測試頁面提供完整的 SignalR 連線測試功能：
          </Text>
          <List size="xs" mt="xs">
            <List.Item>需要運行 SignalR Hub 服務器 (https://localhost:7001)</List.Item>
            <List.Item>支持自動重連和事件訂閱</List.Item>
            <List.Item>可以發送和接收即時事件</List.Item>
            <List.Item>顯示詳細的連線狀態和事件記錄</List.Item>
            <List.Item>提供自動測試模式</List.Item>
            <List.Item>完整的連線日誌記錄</List.Item>
          </List>
        </Alert>
      </Stack>
    </Container>
  )
} 