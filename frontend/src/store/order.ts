import { create } from 'zustand'
import type { StateCreator } from 'zustand'
import type { Extra, Product } from '@/types'

export interface CartExtra {
  extra: Extra
  quantity: number
}

export interface CartItem {
  product: Product
  quantity: number
  size: 'S' | 'M' | 'L'
  extras: CartExtra[]
}

interface OrderState {
  items: CartItem[]
  paymentType: 'cash' | 'card' | 'split'
  cashAmount: number
  cardAmount: number
  addProduct: (product: Product) => void
  increment: (productId: number, size: 'S' | 'M' | 'L') => void
  decrement: (productId: number, size: 'S' | 'M' | 'L') => void
  setSize: (productId: number, oldSize: 'S' | 'M' | 'L', newSize: 'S' | 'M' | 'L') => void
  setPaymentType: (type: 'cash' | 'card' | 'split') => void
  setSplitPayment: (cashAmount: number, cardAmount: number) => void
  addExtra: (productId: number, size: 'S' | 'M' | 'L', extra: Extra) => void
  incExtra: (productId: number, size: 'S' | 'M' | 'L', extraId: number) => void
  decExtra: (productId: number, size: 'S' | 'M' | 'L', extraId: number) => void
  clear: () => void
  total: () => number
}

const creator: StateCreator<OrderState> = (set, get) => ({
  items: [],
  paymentType: 'cash',
  cashAmount: 0,
  cardAmount: 0,
  addProduct: (product: Product) => set((state) => {
    const idx = state.items.findIndex((i) => i.product.id === product.id && i.size === 'M')
    if (idx >= 0) {
      const items = [...state.items]
      items[idx] = { ...items[idx], quantity: items[idx].quantity + 1 }
      return { items }
    }
    return { items: [...state.items, { product, quantity: 1, size: 'M', extras: [] }] }
  }),
  increment: (productId: number, size: 'S' | 'M' | 'L') => set((state) => ({
    items: state.items.map((i) => (i.product.id === productId && i.size === size ? { ...i, quantity: i.quantity + 1 } : i)),
  })),
  decrement: (productId: number, size: 'S' | 'M' | 'L') => set((state) => ({
    items: state.items
      .map((i) => (i.product.id === productId && i.size === size ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0),
  })),
  setSize: (productId: number, oldSize: 'S' | 'M' | 'L', newSize: 'S' | 'M' | 'L') => set((state) => {
    const items = [...state.items]
    const idx = items.findIndex((i) => i.product.id === productId && i.size === oldSize)
    if (idx < 0) return { items }
    
    const item = items[idx]
    const existingIdx = items.findIndex((i) => i.product.id === productId && i.size === newSize)
    
    if (existingIdx >= 0) {
      items[existingIdx] = { ...items[existingIdx], quantity: items[existingIdx].quantity + item.quantity }
      items.splice(idx, 1)
    } else {
      items[idx] = { ...item, size: newSize }
    }
    
    return { items }
  }),
  setPaymentType: (type: 'cash' | 'card' | 'split') => set({ paymentType: type, cashAmount: 0, cardAmount: 0 }),
  setSplitPayment: (cashAmount: number, cardAmount: number) => set({ paymentType: 'split', cashAmount, cardAmount }),
  addExtra: (productId: number, size: 'S' | 'M' | 'L', extra: Extra) => set((state) => {
    const items = state.items.map((i) => {
      if (i.product.id !== productId || i.size !== size) return i
      const idx = i.extras.findIndex((e) => e.extra.id === extra.id)
      if (idx >= 0) {
        const extras = [...i.extras]
        extras[idx] = { ...extras[idx], quantity: extras[idx].quantity + 1 }
        return { ...i, extras }
      }
      return { ...i, extras: [...i.extras, { extra, quantity: 1 }] }
    })
    return { items }
  }),
  incExtra: (productId: number, size: 'S' | 'M' | 'L', extraId: number) => set((state) => ({
    items: state.items.map((i) => {
      if (i.product.id !== productId || i.size !== size) return i
      const extras = i.extras.map((e) => (e.extra.id === extraId ? { ...e, quantity: e.quantity + 1 } : e))
      return { ...i, extras }
    }),
  })),
  decExtra: (productId: number, size: 'S' | 'M' | 'L', extraId: number) => set((state) => ({
    items: state.items.map((i) => {
      if (i.product.id !== productId || i.size !== size) return i
      const extras = i.extras
        .map((e) => (e.extra.id === extraId ? { ...e, quantity: e.quantity - 1 } : e))
        .filter((e) => e.quantity > 0)
      return { ...i, extras }
    }),
  })),
  clear: () => set({ items: [], paymentType: 'cash', cashAmount: 0, cardAmount: 0 }),
  total: () => {
    return get().items.reduce((sum, item) => {
      let price = Number(item.product.price)
      if (item.size === 'S' && item.product.price_small) {
        price = Number(item.product.price_small)
      } else if (item.size === 'L' && item.product.price_large) {
        price = Number(item.product.price_large)
      }
      const base = price * item.quantity
      const extras = item.extras.reduce((s, e) => s + Number(e.extra.price) * e.quantity, 0)
      return sum + base + extras
    }, 0)
  },
})

export const useOrder = create<OrderState>()(creator)
