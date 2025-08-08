import { useEffect, useCallback, useRef } from 'react'
import { useOfflineStore } from '../lib/supabase-offline'
import type { Order, OrderItem, ActionHistory } from '../lib/supabase-offline'

interface UseSupabaseOfflineOptions {
  autoSync?: boolean
  syncInterval?: number
  maxRetries?: number
  enableConflictDetection?: boolean
}

export const useSupabaseOffline = (options: UseSupabaseOfflineOptions = {}) => {
  const {
    autoSync = true,
    syncInterval = 30000,
    maxRetries = 3,
    enableConflictDetection = true
  } = options

  const {
    // 狀態
    isOnline,
    isSyncing,
    lastSyncTime,
    syncErrors,
    orders,
    orderItems,
    selectedOrderIds,
    localHistory,
    currentIndex,
    pendingActions,
    syncedActions,
    
    // 方法
    setOnlineStatus,
    addOrder,
    updateOrder,
    deleteOrder,
    selectOrders,
    recordAction,
    undo,
    redo,
    canUndo,
    canRedo,
    syncPendingActions,
    retryFailedSync,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    resolveConflicts,
    detectConflicts
  } = useOfflineStore()

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)

  // 初始化：載入本地儲存
  useEffect(() => {
    loadFromLocalStorage()
  }, [loadFromLocalStorage])

  // 網路狀態監聽
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true)
    const handleOffline = () => setOnlineStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnlineStatus])

  // 自動同步
  useEffect(() => {
    if (autoSync && isOnline) {
      syncIntervalRef.current = setInterval(() => {
        if (pendingActions.length > 0) {
          syncPendingActions()
        }
      }, syncInterval)
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [autoSync, isOnline, pendingActions.length, syncInterval, syncPendingActions])

  // 衝突檢測
  useEffect(() => {
    if (enableConflictDetection && isOnline && !isSyncing) {
      const checkConflicts = async () => {
        const hasConflict = await detectConflicts()
        if (hasConflict) {
          console.warn('檢測到資料衝突，建議手動同步')
        }
      }
      
      checkConflicts()
    }
  }, [enableConflictDetection, isOnline, isSyncing, detectConflicts])

  // 重試機制
  const retrySync = useCallback(async () => {
    if (retryCountRef.current >= maxRetries) {
      console.error('重試次數已達上限')
      return
    }

    retryCountRef.current++
    const delay = Math.pow(2, retryCountRef.current) * 1000 // 指數退避

    retryTimeoutRef.current = setTimeout(async () => {
      try {
        await syncPendingActions()
        retryCountRef.current = 0 // 重置重試計數
      } catch (error) {
        console.error(`重試同步失敗 (${retryCountRef.current}/${maxRetries}):`, error)
        if (retryCountRef.current < maxRetries) {
          retrySync() // 繼續重試
        }
      }
    }, delay)
  }, [maxRetries, syncPendingActions])

  // 手動同步
  const manualSync = useCallback(async () => {
    try {
      await syncPendingActions()
    } catch (error) {
      console.error('手動同步失敗:', error)
      retrySync()
    }
  }, [syncPendingActions, retrySync])

  // 強制同步
  const forceSync = useCallback(async () => {
    retryCountRef.current = 0
    await manualSync()
  }, [manualSync])

  // 清除同步錯誤
  const clearSyncErrors = useCallback(() => {
    retryCountRef.current = 0
    retryFailedSync()
  }, [retryFailedSync])

  // 取得同步狀態
  const getSyncStatus = useCallback(() => {
    const status = {
      isOnline,
      isSyncing,
      pendingCount: pendingActions.length,
      syncedCount: syncedActions.length,
      lastSync: lastSyncTime,
      errors: syncErrors,
      canRetry: syncErrors.length > 0 && retryCountRef.current < maxRetries
    }

    if (isSyncing) {
      status.message = '正在同步...'
      status.status = 'syncing'
    } else if (!isOnline) {
      status.message = '離線模式'
      status.status = 'offline'
    } else if (pendingActions.length > 0) {
      status.message = `待同步: ${pendingActions.length} 個操作`
      status.status = 'pending'
    } else if (syncErrors.length > 0) {
      status.message = `同步錯誤: ${syncErrors.length} 個`
      status.status = 'error'
    } else {
      status.message = '已同步'
      status.status = 'synced'
    }

    return status
  }, [isOnline, isSyncing, pendingActions.length, syncedActions.length, lastSyncTime, syncErrors, maxRetries])

  // 清理定時器
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  // 高級操作
  const completeOrder = useCallback(async (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    // 記錄操作
    await recordAction({
      action_type: 'STATUS_CHANGE',
      action_description: `完成訂單 ${order.order_number}`,
      order_id: orderId,
      frontend_changes: {
        itemsRemoved: [order],
        selectedItemsCleared: true
      },
      backend_changes: {
        orderId,
        newStatus: 'COMPLETED',
        previousStatus: order.status
      }
    })

    // 更新本地狀態
    updateOrder(orderId, { status: 'COMPLETED' })
    selectOrders([])
  }, [orders, recordAction, updateOrder, selectOrders])

  const startPreparingOrder = useCallback(async (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    await recordAction({
      action_type: 'STATUS_CHANGE',
      action_description: `開始準備訂單 ${order.order_number}`,
      order_id: orderId,
      frontend_changes: {},
      backend_changes: {
        orderId,
        newStatus: 'PREPARING',
        previousStatus: order.status
      }
    })

    updateOrder(orderId, { status: 'PREPARING' })
  }, [orders, recordAction, updateOrder])

  const markOrderReady = useCallback(async (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    await recordAction({
      action_type: 'STATUS_CHANGE',
      action_description: `訂單 ${order.order_number} 準備完成`,
      order_id: orderId,
      frontend_changes: {},
      backend_changes: {
        orderId,
        newStatus: 'READY',
        previousStatus: order.status
      }
    })

    updateOrder(orderId, { status: 'READY' })
  }, [orders, recordAction, updateOrder])

  const cancelOrder = useCallback(async (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    await recordAction({
      action_type: 'STATUS_CHANGE',
      action_description: `取消訂單 ${order.order_number}`,
      order_id: orderId,
      frontend_changes: {
        itemsRemoved: [order],
        selectedItemsCleared: true
      },
      backend_changes: {
        orderId,
        newStatus: 'CANCELLED',
        previousStatus: order.status
      }
    })

    updateOrder(orderId, { status: 'CANCELLED' })
    selectOrders([])
  }, [orders, recordAction, updateOrder, selectOrders])

  return {
    // 狀態
    isOnline,
    isSyncing,
    lastSyncTime,
    syncErrors,
    orders,
    orderItems,
    selectedOrderIds,
    localHistory,
    currentIndex,
    pendingActions,
    syncedActions,
    
    // 基本操作
    addOrder,
    updateOrder,
    deleteOrder,
    selectOrders,
    recordAction,
    undo,
    redo,
    canUndo,
    canRedo,
    
    // 同步操作
    manualSync,
    forceSync,
    retrySync,
    clearSyncErrors,
    getSyncStatus,
    
    // 本地儲存
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    
    // 高級操作
    completeOrder,
    startPreparingOrder,
    markOrderReady,
    cancelOrder,
    
    // 衝突解決
    resolveConflicts,
    detectConflicts,
    
    // 選項
    options: {
      autoSync,
      syncInterval,
      maxRetries,
      enableConflictDetection
    }
  }
} 