import { io, Socket } from 'socket.io-client'

// Socket.IO 事件類型
export interface SocketIOEvent {
  type: 'order_update' | 'status_change' | 'new_order' | 'order_complete' | 'undo_action' | 'redo_action'
  data: any
  timestamp: Date
  userId?: string
  sessionId?: string
}

// Socket.IO 連線狀態
export interface SocketIOConnection {
  isConnected: boolean
  connectionId?: string
  lastConnected?: Date
  lastDisconnected?: Date
  reconnectAttempts: number
  maxReconnectAttempts: number
}

// Socket.IO 客戶端類
export class SocketIOClient {
  private socket: Socket | null = null
  private subscribers: Map<string, (event: SocketIOEvent) => void> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private isReconnecting = false

  constructor(private serverUrl: string = 'http://localhost:7001') {
    this.initializeConnection()
  }

  private initializeConnection() {
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    })

    // 設置事件處理器
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    if (!this.socket) return

    // 連線事件
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO 連線成功！ConnectionId:', this.socket?.id)
      this.isReconnecting = false
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO 連線斷開:', reason)
      this.isReconnecting = false
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.IO 重新連線成功！嘗試次數:', attemptNumber)
      this.isReconnecting = false
      this.reconnectAttempts = 0
    })

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Socket.IO 重新連線嘗試:', attemptNumber)
      this.isReconnecting = true
      this.reconnectAttempts = attemptNumber
    })

    this.socket.on('reconnect_error', (error) => {
      console.log('❌ Socket.IO 重新連線失敗:', error)
      this.isReconnecting = false
    })

    // 訂單事件
    this.socket.on('OrderUpdate', (data: any) => {
      console.log('📡 收到訂單更新事件:', data)
      this.notifySubscribers('order_update', data)
    })

    this.socket.on('StatusChange', (data: any) => {
      console.log('📡 收到狀態變更事件:', data)
      this.notifySubscribers('status_change', data)
    })

    this.socket.on('NewOrder', (data: any) => {
      console.log('📡 收到新訂單事件:', data)
      this.notifySubscribers('new_order', data)
    })

    this.socket.on('OrderComplete', (data: any) => {
      console.log('📡 收到訂單完成事件:', data)
      this.notifySubscribers('order_complete', data)
    })

    this.socket.on('UndoAction', (data: any) => {
      console.log('📡 收到撤銷操作事件:', data)
      this.notifySubscribers('undo_action', data)
    })

    this.socket.on('RedoAction', (data: any) => {
      console.log('📡 收到重做操作事件:', data)
      this.notifySubscribers('redo_action', data)
    })
  }

  private notifySubscribers(eventType: string, data: any) {
    const callback = this.subscribers.get(eventType)
    if (callback) {
      const event: SocketIOEvent = {
        type: eventType as SocketIOEvent['type'],
        data,
        timestamp: new Date()
      }
      callback(event)
    }
  }

  // 連線到 Socket.IO 服務器
  async connect(): Promise<void> {
    if (!this.socket) {
      this.initializeConnection()
    }

    try {
      console.log('🔌 連線到 Socket.IO 服務器...')
      await this.socket!.connect()
      console.log('✅ Socket.IO 連線成功！')
      this.reconnectAttempts = 0
    } catch (error) {
      console.error('❌ Socket.IO 連線失敗:', error)
      this.reconnectAttempts++
      throw error
    }
  }

  // 斷線
  async disconnect(): Promise<void> {
    if (this.socket) {
      try {
        console.log('🔌 斷開 Socket.IO 連線...')
        this.socket.disconnect()
        console.log('✅ Socket.IO 斷線成功')
      } catch (error) {
        console.error('❌ Socket.IO 斷線失敗:', error)
        throw error
      }
    }
  }

  // 發送事件到服務器
  async sendEvent(eventType: string, data: any): Promise<void> {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Socket.IO 未連線')
    }

    try {
      console.log(`📤 發送事件到服務器: ${eventType}`, data)
      this.socket.emit('SendEvent', eventType, data)
    } catch (error) {
      console.error('❌ 發送事件失敗:', error)
      throw error
    }
  }

  // 訂閱事件
  subscribe(eventType: string, callback: (event: SocketIOEvent) => void): void {
    this.subscribers.set(eventType, callback)
    console.log(`📡 訂閱 Socket.IO 事件: ${eventType}`)
  }

  // 取消訂閱
  unsubscribe(eventType: string): void {
    this.subscribers.delete(eventType)
    console.log(`📡 取消訂閱 Socket.IO 事件: ${eventType}`)
  }

  // 獲取連線狀態
  getConnectionState(): string {
    if (!this.socket) return 'Disconnected'
    return this.socket.connected ? 'Connected' : 'Disconnected'
  }

  // 獲取連線信息
  getConnectionInfo(): SocketIOConnection {
    return {
      isConnected: this.socket?.connected || false,
      connectionId: this.socket?.id,
      lastConnected: this.socket?.connected ? new Date() : undefined,
      lastDisconnected: !this.socket?.connected ? new Date() : undefined,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    }
  }

  // 檢查是否正在重連
  isReconnectingState(): boolean {
    return this.isReconnecting
  }
}

// 創建全局 Socket.IO 客戶端實例
export const socketIOClient = new SocketIOClient()

// 導出客戶端實例
export default socketIOClient 