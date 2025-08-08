import { pool } from './mysql-local'
import type { Order, OrderItem, ActionHistory } from './mysql-local'

// 訂單操作
export const orderOperations = {
  // 取得所有訂單
  async getAllOrders(): Promise<Order[]> {
    const [rows] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC')
    return rows as Order[]
  },

  // 取得特定狀態的訂單
  async getOrdersByStatus(status: string): Promise<Order[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC',
      [status]
    )
    return rows as Order[]
  },

  // 建立新訂單
  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const [result] = await pool.execute(
      `INSERT INTO orders (order_number, customer_name, table_number, status, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order.order_number, order.customer_name, order.table_number, order.status, order.total_amount, order.notes]
    )
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [(result as any).insertId])
    return (rows as any)[0] as Order
  },

  // 更新訂單狀態
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await pool.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, orderId]
    )
  },

  // 刪除訂單
  async deleteOrder(orderId: string): Promise<void> {
    await pool.execute('DELETE FROM orders WHERE id = ?', [orderId])
  },

  // 取得訂單項目
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC',
      [orderId]
    )
    return rows as OrderItem[]
  },

  // 建立訂單項目
  async createOrderItem(item: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>): Promise<OrderItem> {
    const [result] = await pool.execute(
      `INSERT INTO order_items (order_id, item_name, quantity, unit_price, total_price, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item.order_id, item.item_name, item.quantity, item.unit_price, item.total_price, item.status, item.notes]
    )
    const [rows] = await pool.execute('SELECT * FROM order_items WHERE id = ?', [(result as any).insertId])
    return (rows as any)[0] as OrderItem
  },

  // 更新訂單項目狀態
  async updateOrderItemStatus(itemId: string, status: string): Promise<void> {
    await pool.execute(
      'UPDATE order_items SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, itemId]
    )
  }
}

// 操作歷史記錄
export const actionHistoryOperations = {
  // 記錄操作
  async recordAction(action: Omit<ActionHistory, 'id' | 'created_at'>): Promise<ActionHistory> {
    const [result] = await pool.execute(
      `INSERT INTO action_history (action_type, action_description, order_id, item_id, 
        frontend_changes, backend_changes, user_id, session_id, is_undo, undo_of_action_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        action.action_type,
        action.action_description,
        action.order_id,
        action.item_id,
        JSON.stringify(action.frontend_changes),
        JSON.stringify(action.backend_changes),
        action.user_id,
        action.session_id,
        action.is_undo,
        action.undo_of_action_id
      ]
    )
    const [rows] = await pool.execute('SELECT * FROM action_history WHERE id = ?', [(result as any).insertId])
    return (rows as any)[0] as ActionHistory
  },

  // 取得操作歷史
  async getActionHistory(limit: number = 100): Promise<ActionHistory[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM action_history ORDER BY created_at DESC LIMIT ?',
      [limit]
    )
    return rows as ActionHistory[]
  },

  // 取得特定訂單的操作歷史
  async getOrderActionHistory(orderId: string): Promise<ActionHistory[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM action_history WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    )
    return rows as ActionHistory[]
  },

  // 標記操作為已同步
  async markActionSynced(actionId: string): Promise<void> {
    await pool.execute(
      'UPDATE action_history SET synced_at = NOW() WHERE id = ?',
      [actionId]
    )
  },

  // 取得最後一次操作
  async getLastAction(): Promise<ActionHistory | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM action_history ORDER BY created_at DESC LIMIT 1'
    )
    return (rows as any).length > 0 ? (rows as any)[0] as ActionHistory : null
  },

  // 取得可回復的操作
  async getUndoableActions(limit: number = 10): Promise<ActionHistory[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM action_history 
       WHERE is_undo = FALSE 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [limit]
    )
    return rows as ActionHistory[]
  }
}

// 即時訂閱 (使用輪詢模擬)
export const realtimeSubscriptions = {
  // 訂閱訂單變更
  subscribeToOrders(callback: (order: Order) => void) {
    // 在實際應用中，這裡會使用 WebSocket 或 Server-Sent Events
    // 目前使用輪詢模擬
    const interval = setInterval(async () => {
      try {
        const orders = await orderOperations.getAllOrders()
        // 這裡需要實作差異檢測邏輯
      } catch (error) {
        console.error('訂閱錯誤:', error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }
} 