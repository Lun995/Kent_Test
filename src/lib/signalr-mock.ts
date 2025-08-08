import { create } from 'zustand'

// SignalR 模擬事件類型
export interface SignalREvent {
  type: 'order_update' | 'status_change' | 'new_order' | 'order_complete' | 'undo_action' | 'redo_action'
  data: any
  timestamp: Date
  userId?: string
  sessionId?: string
}

// SignalR 連線狀態
export interface SignalRConnection {
  isConnected: boolean
  connectionId?: string
  lastConnected?: Date
  lastDisconnected?: Date
  reconnectAttempts: number
  maxReconnectAttempts: number
}

// SignalR 模擬 Store
interface SignalRMockStore {
  // 狀態
  connection: SignalRConnection
  events: SignalREvent[]
  subscribers: Map<string, (event: SignalREvent) => void>
  isSimulating: boolean
  simulationInterval: number

  // 方法
  connect: () => Promise<void>
  disconnect: () => void
  subscribe: (eventType: string, callback: (event: SignalREvent) => void) => void
  unsubscribe: (eventType: string) => void
  sendEvent: (event: Omit<SignalREvent, 'timestamp'>) => void
  startSimulation: () => void
  stopSimulation: () => void
  clearEvents: () => void
  getConnectionStatus: () => string
}

export const useSignalRMock = create<SignalRMockStore>((set, get) => ({
  // 初始狀態
  connection: {
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  },
  events: [],
  subscribers: new Map(),
  isSimulating: false,
  simulationInterval: 5000, // 5秒間隔

  // 連線
  connect: async () => {
    console.log('🔌 模擬 SignalR 連線中...')
    
    // 模擬連線延遲
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const connectionId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    set(state => ({
      connection: {
        ...state.connection,
        isConnected: true,
        connectionId,
        lastConnected: new Date(),
        reconnectAttempts: 0
      }
    }))
    
    console.log('✅ SignalR 模擬連線成功！ConnectionId:', connectionId)
  },

  // 斷線
  disconnect: () => {
    console.log('🔌 模擬 SignalR 斷線...')
    
    set(state => ({
      connection: {
        ...state.connection,
        isConnected: false,
        lastDisconnected: new Date()
      }
    }))
    
    console.log('❌ SignalR 模擬斷線')
  },

  // 訂閱事件
  subscribe: (eventType, callback) => {
    const { subscribers } = get()
    subscribers.set(eventType, callback)
    console.log(`📡 訂閱 SignalR 事件: ${eventType}`)
  },

  // 取消訂閱
  unsubscribe: (eventType) => {
    const { subscribers } = get()
    subscribers.delete(eventType)
    console.log(`📡 取消訂閱 SignalR 事件: ${eventType}`)
  },

  // 發送事件
  sendEvent: (event) => {
    const { connection, subscribers } = get()
    
    if (!connection.isConnected) {
      console.warn('⚠️ SignalR 未連線，無法發送事件')
      return
    }

    const fullEvent: SignalREvent = {
      ...event,
      timestamp: new Date()
    }

    // 記錄事件
    set(state => ({
      events: [...state.events, fullEvent].slice(-100) // 保留最近100個事件
    }))

    // 通知訂閱者
    const callback = subscribers.get(event.type)
    if (callback) {
      console.log(`📤 發送 SignalR 事件: ${event.type}`, fullEvent)
      callback(fullEvent)
    }
  },

  // 開始模擬
  startSimulation: () => {
    const { isSimulating } = get()
    if (isSimulating) return

    console.log('🎬 開始 SignalR 模擬...')
    set({ isSimulating: true })

    const simulateEvents = () => {
      const { isSimulating, connection } = get()
      if (!isSimulating || !connection.isConnected) return

      // 模擬隨機事件
      const eventTypes: SignalREvent['type'][] = [
        'order_update',
        'status_change',
        'new_order',
        'order_complete'
      ]

      const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      
      const mockEvent = {
        type: randomEventType,
        data: generateMockEventData(randomEventType),
        userId: 'mock-user',
        sessionId: 'mock-session'
      }

      get().sendEvent(mockEvent)

      // 繼續模擬
      setTimeout(simulateEvents, get().simulationInterval)
    }

    simulateEvents()
  },

  // 停止模擬
  stopSimulation: () => {
    console.log('⏹️ 停止 SignalR 模擬')
    set({ isSimulating: false })
  },

  // 清除事件
  clearEvents: () => {
    set({ events: [] })
    console.log('🧹 清除 SignalR 事件記錄')
  },

  // 取得連線狀態
  getConnectionStatus: () => {
    const { connection, isSimulating } = get()
    if (!connection.isConnected) return 'disconnected'
    if (isSimulating) return 'simulating'
    return 'connected'
  }
}))

// 生成模擬事件資料
function generateMockEventData(eventType: SignalREvent['type']) {
  switch (eventType) {
    case 'order_update':
      return {
        orderId: `order-${Date.now()}`,
        orderNumber: `ORD-${Math.floor(Math.random() * 1000)}`,
        status: ['PENDING', 'PREPARING', 'READY', 'COMPLETED'][Math.floor(Math.random() * 4)],
        updatedAt: new Date().toISOString()
      }

    case 'status_change':
      return {
        orderId: `order-${Date.now()}`,
        previousStatus: 'PENDING',
        newStatus: 'PREPARING',
        changedAt: new Date().toISOString()
      }

    case 'new_order':
      return {
        orderId: `order-${Date.now()}`,
        orderNumber: `ORD-${Math.floor(Math.random() * 1000)}`,
        customerName: `客戶${Math.floor(Math.random() * 100)}`,
        totalAmount: Math.floor(Math.random() * 500) + 100,
        items: [
          { name: '宮保雞丁', quantity: 1, price: 120 },
          { name: '白飯', quantity: 1, price: 30 }
        ],
        createdAt: new Date().toISOString()
      }

    case 'order_complete':
      return {
        orderId: `order-${Date.now()}`,
        orderNumber: `ORD-${Math.floor(Math.random() * 1000)}`,
        completedAt: new Date().toISOString(),
        totalAmount: Math.floor(Math.random() * 500) + 100
      }

    default:
      return {}
  }
}

// 模擬網路狀態變化
export function simulateNetworkChanges() {
  const signalR = useSignalRMock.getState()
  
  // 模擬網路中斷
  setTimeout(() => {
    console.log('🌐 模擬網路中斷...')
    signalR.disconnect()
  }, 10000) // 10秒後中斷

  // 模擬網路恢復
  setTimeout(() => {
    console.log('🌐 模擬網路恢復...')
    signalR.connect()
  }, 15000) // 15秒後恢復
}

// 模擬特定事件序列
export function simulateEventSequence() {
  const signalR = useSignalRMock.getState()
  
  const events = [
    {
      type: 'new_order' as const,
      data: {
        orderId: 'order-001',
        orderNumber: 'ORD-001',
        customerName: '張先生',
        totalAmount: 250,
        items: [
          { name: '宮保雞丁', quantity: 1, price: 120 },
          { name: '白飯', quantity: 1, price: 30 },
          { name: '可樂', quantity: 1, price: 100 }
        ]
      }
    },
    {
      type: 'status_change' as const,
      data: {
        orderId: 'order-001',
        previousStatus: 'PENDING',
        newStatus: 'PREPARING'
      }
    },
    {
      type: 'status_change' as const,
      data: {
        orderId: 'order-001',
        previousStatus: 'PREPARING',
        newStatus: 'READY'
      }
    },
    {
      type: 'order_complete' as const,
      data: {
        orderId: 'order-001',
        orderNumber: 'ORD-001',
        completedAt: new Date().toISOString()
      }
    }
  ]

  let index = 0
  const sendNextEvent = () => {
    if (index < events.length) {
      signalR.sendEvent(events[index])
      index++
      setTimeout(sendNextEvent, 2000) // 每2秒發送一個事件
    }
  }

  sendNextEvent()
} 