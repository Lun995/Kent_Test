import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

// SignalR 事件類型
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

// SignalR 客戶端類
export class SignalRClient {
  private connection: HubConnection | null = null
  private subscribers: Map<string, (event: SignalREvent) => void> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private isReconnecting = false

  constructor(private hubUrl: string = 'http://localhost:7107/signalrhub') {
    this.initializeConnection()
  }

  private initializeConnection() {
    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // 重連策略
      .configureLogging(LogLevel.Information)
      .build()

    // 設置事件處理器
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    if (!this.connection) return

    // 連線事件
    this.connection.onreconnecting((error) => {
      console.log('🔄 SignalR 重新連線中...', error)
      this.isReconnecting = true
    })

    this.connection.onreconnected((connectionId) => {
      console.log('✅ SignalR 重新連線成功！ConnectionId:', connectionId)
      this.isReconnecting = false
      this.reconnectAttempts = 0
    })

    this.connection.onclose((error) => {
      console.log('❌ SignalR 連線關閉', error)
      this.isReconnecting = false
    })

    // 訂單事件
    this.connection.on('OrderUpdate', (data: any) => {
      console.log('📡 收到訂單更新事件:', data)
      this.notifySubscribers('order_update', data)
    })

    this.connection.on('StatusChange', (data: any) => {
      console.log('📡 收到狀態變更事件:', data)
      this.notifySubscribers('status_change', data)
    })

    this.connection.on('NewOrder', (data: any) => {
      console.log('📡 收到新訂單事件:', data)
      this.notifySubscribers('new_order', data)
    })

    this.connection.on('OrderComplete', (data: any) => {
      console.log('📡 收到訂單完成事件:', data)
      this.notifySubscribers('order_complete', data)
    })

    this.connection.on('UndoAction', (data: any) => {
      console.log('📡 收到撤銷操作事件:', data)
      this.notifySubscribers('undo_action', data)
    })

    this.connection.on('RedoAction', (data: any) => {
      console.log('📡 收到重做操作事件:', data)
      this.notifySubscribers('redo_action', data)
    })
  }

  private notifySubscribers(eventType: string, data: any) {
    const callback = this.subscribers.get(eventType)
    if (callback) {
      const event: SignalREvent = {
        type: eventType as SignalREvent['type'],
        data,
        timestamp: new Date()
      }
      callback(event)
    }
  }

  // 連線到 SignalR Hub
  async connect(): Promise<void> {
    if (!this.connection) {
      this.initializeConnection()
    }

    try {
      console.log('🔌 連線到 SignalR Hub...')
      await this.connection!.start()
      console.log('✅ SignalR 連線成功！')
      this.reconnectAttempts = 0
    } catch (error) {
      console.error('❌ SignalR 連線失敗:', error)
      this.reconnectAttempts++
      throw error
    }
  }

  // 斷線
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        console.log('🔌 斷開 SignalR 連線...')
        await this.connection.stop()
        console.log('✅ SignalR 斷線成功')
      } catch (error) {
        console.error('❌ SignalR 斷線失敗:', error)
        throw error
      }
    }
  }

  // 發送事件到服務器
  async sendEvent(eventType: string, data: any): Promise<void> {
    if (!this.connection || this.connection.state !== 'Connected') {
      throw new Error('SignalR 未連線')
    }

    try {
      console.log(`📤 發送事件到服務器: ${eventType}`, data)
      await this.connection.invoke('SendEvent', eventType, data)
    } catch (error) {
      console.error('❌ 發送事件失敗:', error)
      throw error
    }
  }

  // 訂閱事件
  subscribe(eventType: string, callback: (event: SignalREvent) => void): void {
    this.subscribers.set(eventType, callback)
    console.log(`📡 訂閱 SignalR 事件: ${eventType}`)
  }

  // 取消訂閱
  unsubscribe(eventType: string): void {
    this.subscribers.delete(eventType)
    console.log(`📡 取消訂閱 SignalR 事件: ${eventType}`)
  }

  // 獲取連線狀態
  getConnectionState(): string {
    if (!this.connection) return 'Disconnected'
    return this.connection.state
  }

  // 獲取連線信息
  getConnectionInfo(): SignalRConnection {
    return {
      isConnected: this.connection?.state === 'Connected',
      connectionId: this.connection?.connectionId,
      lastConnected: this.connection?.state === 'Connected' ? new Date() : undefined,
      lastDisconnected: this.connection?.state === 'Disconnected' ? new Date() : undefined,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    }
  }

  // 檢查是否正在重連
  isReconnectingState(): boolean {
    return this.isReconnecting
  }
}

// 創建全局 SignalR 客戶端實例
export const signalRClient = new SignalRClient()

// 導出客戶端實例
export default signalRClient 