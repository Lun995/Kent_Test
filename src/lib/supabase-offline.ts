import { createClient } from '@supabase/supabase-js'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Supabase 客戶端設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 類型定義
export interface Order {
  id: string
  order_number: string
  customer_name: string | null
  table_number: number | null
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
  total_amount: number
  created_at: string
  updated_at: string
  completed_at: string | null
  notes: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED'
  created_at: string
  updated_at: string
  notes: string | null
}

export interface ActionHistory {
  id: string
  action_type: string
  action_description: string
  order_id: string | null
  item_id: string | null
  frontend_changes: any
  backend_changes: any
  user_id: string | null
  session_id: string | null
  created_at: string
  synced_at: string | null
  is_undo: boolean
  undo_of_action_id: string | null
}

// 離線狀態管理
interface OfflineState {
  // 網路狀態
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: Date | null
  syncErrors: string[]
  
  // 本地資料
  orders: Order[]
  orderItems: OrderItem[]
  selectedOrderIds: string[]
  
  // 操作歷史
  localHistory: ActionHistory[]
  currentIndex: number
  
  // 待同步操作
  pendingActions: ActionHistory[]
  syncedActions: string[]
  
  // 方法
  setOnlineStatus: (isOnline: boolean) => void
  addOrder: (order: Order) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  deleteOrder: (orderId: string) => void
  selectOrders: (orderIds: string[]) => void
  
  // 操作記錄
  recordAction: (action: Omit<ActionHistory, 'id' | 'created_at'>) => Promise<void>
  undo: () => Promise<void>
  redo: () => Promise<void>
  canUndo: () => boolean
  canRedo: () => boolean
  
  // 同步管理
  syncPendingActions: () => Promise<void>
  retryFailedSync: () => Promise<void>
  
  // 本地儲存
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
  clearLocalStorage: () => void
  
  // 衝突解決
  resolveConflicts: (localState: any, serverState: any) => any
  detectConflicts: () => Promise<boolean>
}

// 離線狀態 Store
export const useOfflineStore = create<OfflineState>()(
  subscribeWithSelector((set, get) => ({
    // 初始狀態
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: null,
    syncErrors: [],
    
    orders: [],
    orderItems: [],
    selectedOrderIds: [],
    
    localHistory: [],
    currentIndex: -1,
    
    pendingActions: [],
    syncedActions: [],
    
    // 網路狀態管理
    setOnlineStatus: (isOnline) => {
      set({ isOnline })
      if (isOnline && get().pendingActions.length > 0) {
        console.log('網路恢復，開始同步待處理操作...')
        get().syncPendingActions()
      }
    },
    
    // 訂單操作
    addOrder: (order) => {
      set(state => ({ orders: [...state.orders, order] }))
      get().saveToLocalStorage()
    },
    
    updateOrder: (orderId, updates) => {
      set(state => ({
        orders: state.orders.map(order =>
          order.id === orderId ? { ...order, ...updates } : order
        )
      }))
      get().saveToLocalStorage()
    },
    
    deleteOrder: (orderId) => {
      set(state => ({
        orders: state.orders.filter(order => order.id !== orderId),
        selectedOrderIds: state.selectedOrderIds.filter(id => id !== orderId)
      }))
      get().saveToLocalStorage()
    },
    
    selectOrders: (orderIds) => {
      set({ selectedOrderIds: orderIds })
      get().saveToLocalStorage()
    },
    
    // 操作記錄
    recordAction: async (action) => {
      const { isOnline, localHistory, currentIndex } = get()
      const newAction: ActionHistory = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      }
      
      // 更新本地歷史
      const newHistory = localHistory.slice(0, currentIndex + 1)
      newHistory.push(newAction)
      if (newHistory.length > 50) newHistory.shift() // 限制歷史大小
      
      set({
        localHistory: newHistory,
        currentIndex: newHistory.length - 1
      })
      
      get().saveToLocalStorage()
      
      // 同步到後端
      if (isOnline) {
        try {
          await syncActionToBackend(newAction)
          set(state => ({
            syncedActions: [...state.syncedActions, newAction.id],
            lastSyncTime: new Date()
          }))
        } catch (error) {
          console.error('同步失敗，加入待同步列表:', error)
          set(state => ({
            pendingActions: [...state.pendingActions, newAction],
            syncErrors: [...state.syncErrors, error.message]
          }))
        }
      } else {
        // 離線模式：加入待同步列表
        set(state => ({ pendingActions: [...state.pendingActions, newAction] }))
        console.log('離線模式：操作已加入待同步列表')
      }
    },
    
    undo: async () => {
      const { localHistory, currentIndex, isOnline } = get()
      if (currentIndex < 0) return
      
      const action = localHistory[currentIndex]
      if (!action) return
      
      try {
        // 執行撤銷
        await executeUndo(action)
        set({ currentIndex: currentIndex - 1 })
        get().saveToLocalStorage()
        
        // 記錄撤銷操作
        const undoAction: ActionHistory = {
          ...action,
          id: `undo_${action.id}`,
          action_type: 'UNDO',
          action_description: `撤銷: ${action.action_description}`,
          is_undo: true,
          undo_of_action_id: action.id,
          created_at: new Date().toISOString()
        }
        
        if (isOnline) {
          await syncActionToBackend(undoAction)
        } else {
          set(state => ({ pendingActions: [...state.pendingActions, undoAction] }))
        }
      } catch (error) {
        console.error('撤銷操作失敗:', error)
      }
    },
    
    redo: async () => {
      const { localHistory, currentIndex, isOnline } = get()
      if (currentIndex >= localHistory.length - 1) return
      
      const action = localHistory[currentIndex + 1]
      if (!action) return
      
      try {
        // 執行重做
        await executeRedo(action)
        set({ currentIndex: currentIndex + 1 })
        get().saveToLocalStorage()
        
        // 記錄重做操作
        const redoAction: ActionHistory = {
          ...action,
          id: `redo_${action.id}`,
          action_type: 'REDO',
          action_description: `重做: ${action.action_description}`,
          is_undo: false,
          undo_of_action_id: action.id,
          created_at: new Date().toISOString()
        }
        
        if (isOnline) {
          await syncActionToBackend(redoAction)
        } else {
          set(state => ({ pendingActions: [...state.pendingActions, redoAction] }))
        }
      } catch (error) {
        console.error('重做操作失敗:', error)
      }
    },
    
    canUndo: () => get().currentIndex >= 0,
    canRedo: () => get().currentIndex < get().localHistory.length - 1,
    
    // 同步管理
    syncPendingActions: async () => {
      const { pendingActions, isOnline } = get()
      if (!isOnline || pendingActions.length === 0) return
      
      set({ isSyncing: true })
      
      try {
        const batchSize = 5 // 每次同步 5 個操作
        for (let i = 0; i < pendingActions.length; i += batchSize) {
          const batch = pendingActions.slice(i, i + batchSize)
          
          for (const action of batch) {
            try {
              await syncActionToBackend(action)
              
              // 從待同步列表中移除
              set(state => ({
                pendingActions: state.pendingActions.filter(a => a.id !== action.id),
                syncedActions: [...state.syncedActions, action.id]
              }))
            } catch (error) {
              console.error(`同步操作失敗: ${action.id}`, error)
              // 保留失敗的操作，稍後重試
            }
          }
        }
        
        set({ lastSyncTime: new Date(), isSyncing: false })
      } catch (error) {
        set({
          isSyncing: false,
          syncErrors: [...get().syncErrors, error.message]
        })
      }
    },
    
    retryFailedSync: async () => {
      set({ syncErrors: [] })
      await get().syncPendingActions()
    },
    
    // 本地儲存
    saveToLocalStorage: () => {
      const state = get()
      const dataToSave = {
        orders: state.orders,
        orderItems: state.orderItems,
        selectedOrderIds: state.selectedOrderIds,
        localHistory: state.localHistory,
        currentIndex: state.currentIndex,
        pendingActions: state.pendingActions,
        lastSyncTime: state.lastSyncTime
      }
      
      try {
        localStorage.setItem('kds_offline_state', JSON.stringify(dataToSave))
      } catch (error) {
        console.error('保存到本地存儲失敗:', error)
      }
    },
    
    loadFromLocalStorage: () => {
      try {
        const savedData = localStorage.getItem('kds_offline_state')
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          set({
            orders: parsedData.orders || [],
            orderItems: parsedData.orderItems || [],
            selectedOrderIds: parsedData.selectedOrderIds || [],
            localHistory: parsedData.localHistory || [],
            currentIndex: parsedData.currentIndex || -1,
            pendingActions: parsedData.pendingActions || [],
            lastSyncTime: parsedData.lastSyncTime ? new Date(parsedData.lastSyncTime) : null
          })
          console.log('已從本地存儲載入狀態')
        }
      } catch (error) {
        console.error('載入本地存儲失敗:', error)
      }
    },
    
    clearLocalStorage: () => {
      try {
        localStorage.removeItem('kds_offline_state')
        console.log('本地存儲已清理')
      } catch (error) {
        console.error('清理本地存儲失敗:', error)
      }
    },
    
    // 衝突解決
    resolveConflicts: (localState, serverState) => {
      // 基於時間戳的衝突解決
      const localTimestamp = localState.updated_at || 0
      const serverTimestamp = serverState.updated_at || 0
      
      if (localTimestamp > serverTimestamp) {
        console.log('本地狀態較新，保留本地狀態')
        return localState
      } else {
        console.log('伺服器狀態較新，使用伺服器狀態')
        return serverState
      }
    },
    
    detectConflicts: async () => {
      try {
        // 從伺服器獲取最新狀態
        const { data: serverOrders } = await supabase
          .from('orders')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
        
        if (serverOrders && serverOrders.length > 0) {
          const localState = get()
          const serverState = serverOrders[0]
          
          // 檢查是否有衝突
          const hasConflict = localState.orders.some(localOrder => {
            const serverOrder = serverOrders.find(s => s.id === localOrder.id)
            return serverOrder && serverOrder.updated_at !== localOrder.updated_at
          })
          
          if (hasConflict) {
            console.log('檢測到資料衝突')
            return true
          }
        }
        
        return false
      } catch (error) {
        console.error('衝突檢測失敗:', error)
        return false
      }
    }
  }))
)

// 同步到後端
async function syncActionToBackend(action: ActionHistory) {
  const { data, error } = await supabase
    .from('action_history')
    .insert(action)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 執行撤銷
async function executeUndo(action: ActionHistory) {
  const { frontendChanges, backendChanges } = action
  
  // 執行前端撤銷
  if (frontendChanges) {
    const store = useOfflineStore.getState()
    
    if (frontendChanges.itemsRemoved) {
      // 恢復被移除的項目
      store.orders = [...store.orders, ...frontendChanges.itemsRemoved]
    }
    
    if (frontendChanges.itemsAdded) {
      // 移除被添加的項目
      store.orders = store.orders.filter(order => 
        !frontendChanges.itemsAdded.some((item: any) => item.id === order.id)
      )
    }
    
    if (frontendChanges.selectedItemsCleared) {
      store.selectedOrderIds = []
    }
    
    if (frontendChanges.selectedItems) {
      store.selectedOrderIds = frontendChanges.selectedItems
    }
  }
  
  // 執行後端撤銷
  if (backendChanges && backendChanges.orderId) {
    await supabase
      .from('orders')
      .update({
        status: backendChanges.previousStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', backendChanges.orderId)
  }
}

// 執行重做
async function executeRedo(action: ActionHistory) {
  const { frontendChanges, backendChanges } = action
  
  // 執行前端重做
  if (frontendChanges) {
    const store = useOfflineStore.getState()
    
    if (frontendChanges.itemsRemoved) {
      // 移除項目
      store.orders = store.orders.filter(order => 
        !frontendChanges.itemsRemoved.some((item: any) => item.id === order.id)
      )
    }
    
    if (frontendChanges.itemsAdded) {
      // 添加項目
      store.orders = [...store.orders, ...frontendChanges.itemsAdded]
    }
    
    if (frontendChanges.selectedItemsCleared) {
      store.selectedOrderIds = []
    }
    
    if (frontendChanges.selectedItems) {
      store.selectedOrderIds = frontendChanges.selectedItems
    }
  }
  
  // 執行後端重做
  if (backendChanges && backendChanges.orderId) {
    await supabase
      .from('orders')
      .update({
        status: backendChanges.newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', backendChanges.orderId)
  }
}

// 網路狀態監聽
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setOnlineStatus(true)
  })
  
  window.addEventListener('offline', () => {
    useOfflineStore.getState().setOnlineStatus(false)
  })
}

// 自動同步定時器
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useOfflineStore.getState()
    if (store.isOnline && store.pendingActions.length > 0) {
      store.syncPendingActions()
    }
  }, 30000) // 每 30 秒檢查一次
}

// 定期保存到本地儲存
if (typeof window !== 'undefined') {
  setInterval(() => {
    useOfflineStore.getState().saveToLocalStorage()
  }, 10000) // 每 10 秒保存一次
} 