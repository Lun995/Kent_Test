import { createClient } from '@planetscale/database'

// PlanetScale 資料庫連線
const db = createClient({
  url: process.env.DATABASE_URL!,
  fetch: (url: string, init: any) => {
    delete (init as any)['cache']
    return fetch(url, init)
  }
})

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

export { db } 