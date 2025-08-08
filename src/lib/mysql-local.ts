import mysql from 'mysql2/promise'

// 本地 MySQL 資料庫連線設定
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'kds_system',
  charset: 'utf8mb4',
  timezone: '+08:00',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
}

// 建立連線池
const pool = mysql.createPool(dbConfig)

// 類型定義
export interface Order {
  id: string
  order_number: string
  customer_name?: string
  table_number?: number
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
  total_amount: number
  created_at: Date
  updated_at: Date
  completed_at?: Date
  notes?: string
}

export interface OrderItem {
  id: string
  order_id: string
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED'
  created_at: Date
  updated_at: Date
  notes?: string
}

export interface ActionHistory {
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
  synced_at?: Date
  is_undo: boolean
  undo_of_action_id?: string
}

// 測試連線
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log('✅ MySQL 連線成功')
    return true
  } catch (error) {
    console.error('❌ MySQL 連線失敗:', error)
    return false
  }
}

export { pool } 