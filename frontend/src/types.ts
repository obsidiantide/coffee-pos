export type Role = 'barista' | 'admin'

export interface User {
  id: number
  username: string
  email?: string
  role: Role
  first_name?: string
  last_name?: string
}

export interface Category {
  id: number
  name: string
  description?: string
  is_active: boolean
}

export interface Product {
  id: number
  name: string
  description?: string
  price: string
  price_small?: string | null
  price_large?: string | null
  category: number
  category_name?: string
  is_active: boolean
  image?: string | null
}

export interface Extra {
  id: number
  name: string
  price: string
  is_active: boolean
}

export interface OrderItemExtraDTO {
  id?: number
  extra: number
  extra_name?: string
  quantity: number
  price_at_time?: string
}

export interface OrderItemDTO {
  id?: number
  product: number
  product_name?: string
  quantity: number
  size?: 'S' | 'M' | 'L'
  price_at_time?: string
  extras: OrderItemExtraDTO[]
  subtotal?: string
}

export interface OrderDTO {
  id: number
  user: number
  user_name?: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  payment_type: 'cash' | 'card' | 'split'
  total_amount: string
  cash_amount?: string
  card_amount?: string
  preparation_started_at?: string | null
  ready_at?: string | null
  items: OrderItemDTO[]
  created_at: string
  updated_at?: string
}

export interface CreateOrderPayload {
  status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  payment_type: 'cash' | 'card' | 'split'
  cash_amount?: string
  card_amount?: string
  items: Array<{
    product: number
    quantity: number
    size?: 'S' | 'M' | 'L'
    extras?: Array<{ extra: number; quantity: number }>
  }>
}

export interface Shift {
  id: number
  user: number
  user_name?: string
  opened_at: string
  closed_at?: string | null
  opening_cash: string
  closing_cash?: string | null
  total_sales: string
  cash_sales: string
  card_sales: string
  total_expenses: string
  depot_amount: string
  is_active: boolean
  cash_remaining?: string
}

export interface ShiftReport {
  opening_cash: string
  total_sales: string
  cash_sales: string
  card_sales: string
  total_amount: string
  total_expenses: string
  depot_amount: string
  cash_remaining: string
  closing_cash?: string | null
  opened_at: string
  closed_at?: string | null
}

export interface Expense {
  id: number
  user: number
  user_name?: string
  shift?: number | null
  description: string
  amount: string
  created_at: string
}
