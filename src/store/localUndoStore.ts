import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface LocalUndoAction {
  id: string
  action_type: string
  action_description?: string
  order_id?: string
  item_id?: string
  frontend_changes?: any
  backend_changes?: any
  user_id?: string
  session_id?: string
  created_at: Date
  is_undo: boolean
  undo_of_action_id?: string
}

interface LocalUndoStore {
  // 狀態
  isOnline: boolean
  pendingActions: LocalUndoAction[]
  syncedActions: string[]
  localHistory: LocalUndoAction[]
  currentIndex: number
  items: any[]
  selectedItemIds: string[]
  isSyncing: boolean
  lastSyncTime: Date | null
  syncErrors: string[]

  // 操作
  recordAction: (action: Omit<LocalUndoAction, 'id' | 'created_at'>) => Promise<void>
  undo: () => Promise<void>
  redo: () => Promise<void>
  canUndo: () => boolean
  canRedo: () => boolean
  setOnlineStatus: (isOnline: boolean) => void
  syncPendingActions: () => Promise<void>
  resolveConflicts: (localState: any, serverState: any) => any
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
  clearLocalStorage: () => void
  updateItems: (items: any[]) => void
  updateSelectedItems: (itemIds: string[]) => void
}

export const useLocalUndoStore = create<LocalUndoStore>()(
  subscribeWithSelector((set, get) => ({
    // 初始狀態
    isOnline: true,
    pendingActions: [],
    syncedActions: [],
    localHistory: [],
    currentIndex: -1,
    items: [],
    selectedItemIds: [],
    isSyncing: false,
    lastSyncTime: null,
    syncErrors: [],

    // 記錄操作
    recordAction: async (action) => {
      const { isOnline, localHistory, currentIndex } = get()
      
      const newAction: LocalUndoAction = {
        ...action,
        id: crypto.randomUUID(),
        created_at: new Date()
      }

      // 更新本地歷史
      const newHistory = [...localHistory.slice(0, currentIndex + 1), newAction]
      const newIndex = newHistory.length - 1

      set({
        localHistory: newHistory.slice(-50), // 限制歷史大小
        currentIndex: newIndex
      })

      // 如果離線，加入待同步佇列
      if (!isOnline) {
        set(state => ({
          pendingActions: [...state.pendingActions, newAction]
        }))
        get().saveToLocalStorage()
        return
      }

      // 線上直接同步
      try {
        set({ isSyncing: true })
        await syncToBackend(newAction)
        set({ 
          isSyncing: false,
          lastSyncTime: new Date()
        })
      } catch (error) {
        console.error('同步失敗:', error)
        set(state => ({
          pendingActions: [...state.pendingActions, newAction],
          syncErrors: [...state.syncErrors, error.message]
        }))
        get().saveToLocalStorage()
      }
    },

    // 回復操作
    undo: async () => {
      const { localHistory, currentIndex, isOnline } = get()
      
      if (currentIndex < 0) return

      const actionToUndo = localHistory[currentIndex]
      const newIndex = currentIndex - 1

      set({ currentIndex: newIndex })

      // 建立回復操作
      const undoAction: LocalUndoAction = {
        id: crypto.randomUUID(),
        action_type: 'undo',
        action_description: `回復: ${actionToUndo.action_description}`,
        order_id: actionToUndo.order_id,
        item_id: actionToUndo.item_id,
        frontend_changes: actionToUndo.frontend_changes,
        backend_changes: actionToUndo.backend_changes,
        user_id: actionToUndo.user_id,
        session_id: actionToUndo.session_id,
        created_at: new Date(),
        is_undo: true,
        undo_of_action_id: actionToUndo.id
      }

      // 執行回復
      await executeUndo(actionToUndo)

      // 如果離線，加入待同步佇列
      if (!isOnline) {
        set(state => ({
          pendingActions: [...state.pendingActions, undoAction]
        }))
        get().saveToLocalStorage()
        return
      }

      // 線上直接同步
      try {
        set({ isSyncing: true })
        await syncUndoToBackend(undoAction)
        set({ 
          isSyncing: false,
          lastSyncTime: new Date()
        })
      } catch (error) {
        console.error('回復同步失敗:', error)
        set(state => ({
          pendingActions: [...state.pendingActions, undoAction],
          syncErrors: [...state.syncErrors, error.message]
        }))
        get().saveToLocalStorage()
      }
    },

    // 重做操作
    redo: async () => {
      const { localHistory, currentIndex, isOnline } = get()
      
      if (currentIndex >= localHistory.length - 1) return

      const actionToRedo = localHistory[currentIndex + 1]
      const newIndex = currentIndex + 1

      set({ currentIndex: newIndex })

      // 建立重做操作
      const redoAction: LocalUndoAction = {
        id: crypto.randomUUID(),
        action_type: 'redo',
        action_description: `重做: ${actionToRedo.action_description}`,
        order_id: actionToRedo.order_id,
        item_id: actionToRedo.item_id,
        frontend_changes: actionToRedo.frontend_changes,
        backend_changes: actionToRedo.backend_changes,
        user_id: actionToRedo.user_id,
        session_id: actionToRedo.session_id,
        created_at: new Date(),
        is_undo: false
      }

      // 執行重做
      await executeRedo(actionToRedo)

      // 如果離線，加入待同步佇列
      if (!isOnline) {
        set(state => ({
          pendingActions: [...state.pendingActions, redoAction]
        }))
        get().saveToLocalStorage()
        return
      }

      // 線上直接同步
      try {
        set({ isSyncing: true })
        await syncRedoToBackend(redoAction)
        set({ 
          isSyncing: false,
          lastSyncTime: new Date()
        })
      } catch (error) {
        console.error('重做同步失敗:', error)
        set(state => ({
          pendingActions: [...state.pendingActions, redoAction],
          syncErrors: [...state.syncErrors, error.message]
        }))
        get().saveToLocalStorage()
      }
    },

    canUndo: () => get().currentIndex >= 0,
    canRedo: () => get().currentIndex < get().localHistory.length - 1,

    setOnlineStatus: (isOnline) => {
      set({ isOnline })
      if (isOnline && get().pendingActions.length > 0) {
        get().syncPendingActions()
      }
    },

    syncPendingActions: async () => {
      const { pendingActions } = get()
      if (pendingActions.length === 0) return

      set({ isSyncing: true })

      try {
        for (const action of pendingActions) {
          await syncToBackend(action)
        }

        set({
          pendingActions: [],
          syncedActions: [...get().syncedActions, ...pendingActions.map(a => a.id)],
          isSyncing: false,
          lastSyncTime: new Date()
        })
        get().saveToLocalStorage()
      } catch (error) {
        console.error('批次同步失敗:', error)
        set({ 
          isSyncing: false,
          syncErrors: [...get().syncErrors, error.message]
        })
      }
    },

    resolveConflicts: (localState, serverState) => {
      // 簡單的時間戳記衝突解決
      const localTime = new Date(localState.timestamp).getTime()
      const serverTime = new Date(serverState.timestamp).getTime()
      return localTime > serverTime ? localState : serverState
    },

    saveToLocalStorage: () => {
      if (typeof window === 'undefined') return
      
      const state = get()
      localStorage.setItem('kds_local_undo_state', JSON.stringify({
        localHistory: state.localHistory,
        currentIndex: state.currentIndex,
        pendingActions: state.pendingActions,
        items: state.items,
        selectedItemIds: state.selectedItemIds
      }))
    },

    loadFromLocalStorage: () => {
      if (typeof window === 'undefined') return
      
      try {
        const saved = localStorage.getItem('kds_local_undo_state')
        if (saved) {
          const data = JSON.parse(saved)
          set({
            localHistory: data.localHistory || [],
            currentIndex: data.currentIndex || -1,
            pendingActions: data.pendingActions || [],
            items: data.items || [],
            selectedItemIds: data.selectedItemIds || []
          })
        }
      } catch (error) {
        console.error('載入本地儲存失敗:', error)
      }
    },

    clearLocalStorage: () => {
      if (typeof window === 'undefined') return
      localStorage.removeItem('kds_local_undo_state')
    },

    updateItems: (items) => {
      set({ items })
      get().saveToLocalStorage()
    },

    updateSelectedItems: (itemIds) => {
      set({ selectedItemIds: itemIds })
      get().saveToLocalStorage()
    }
  }))
)

// 執行回復
async function executeUndo(action: LocalUndoAction) {
  const { frontend_changes, backend_changes } = action
  
  // 回復前端狀態
  if (frontend_changes) {
    const { updateItems, updateSelectedItems } = useLocalUndoStore.getState()
    if (frontend_changes.items) updateItems(frontend_changes.items)
    if (frontend_changes.selectedItemIds) updateSelectedItems(frontend_changes.selectedItemIds)
  }
}

// 執行重做
async function executeRedo(action: LocalUndoAction) {
  const { frontend_changes, backend_changes } = action
  
  // 重做前端狀態
  if (frontend_changes) {
    const { updateItems, updateSelectedItems } = useLocalUndoStore.getState()
    if (frontend_changes.items) updateItems(frontend_changes.items)
    if (frontend_changes.selectedItemIds) updateSelectedItems(frontend_changes.selectedItemIds)
  }
}

// 同步到後端
async function syncToBackend(action: LocalUndoAction) {
  const response = await fetch('/api/orders/sync-local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'record',
      data: action
    })
  })

  if (!response.ok) {
    throw new Error('同步失敗')
  }
}

// 同步回復到後端
async function syncUndoToBackend(action: LocalUndoAction) {
  const response = await fetch('/api/orders/sync-local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'undo',
      data: action
    })
  })

  if (!response.ok) {
    throw new Error('回復同步失敗')
  }
}

// 同步重做到後端
async function syncRedoToBackend(action: LocalUndoAction) {
  const response = await fetch('/api/orders/sync-local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'redo',
      data: action
    })
  })

  if (!response.ok) {
    throw new Error('重做同步失敗')
  }
} 