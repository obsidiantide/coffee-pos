import { beforeEach, describe, expect, it } from 'vitest'
import { useOrder } from '@/store/order'
import type { Extra, Product } from '@/types'

const latte: Product = {
  id: 1,
  name: 'Latte',
  price: '10.00',
  price_small: '8.00',
  price_large: '12.50',
  category: 1,
  is_active: true,
}

const americano: Product = { id: 2, name: 'Americano', price: '6', category: 1, is_active: true }
const syrup: Extra = { id: 7, name: 'Syrup', price: '1.50', is_active: true }

describe('order store', () => {
  beforeEach(() => {
    useOrder.getState().clear()
  })

  it('adds a product as size M and merges repeated additions', () => {
    const s = useOrder.getState()
    s.addProduct(latte)
    s.addProduct(latte)
    const { items } = useOrder.getState()
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ size: 'M', quantity: 2 })
  })

  it('removes the line when quantity drops to zero', () => {
    const s = useOrder.getState()
    s.addProduct(latte)
    s.decrement(latte.id, 'M')
    expect(useOrder.getState().items).toHaveLength(0)
  })

  it('merges lines when changing size to an existing one', () => {
    const s = useOrder.getState()
    s.addProduct(latte)
    s.setSize(latte.id, 'M', 'L')
    s.addProduct(latte)
    s.setSize(latte.id, 'M', 'L')
    const { items } = useOrder.getState()
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ size: 'L', quantity: 2 })
  })

  it('prices items by size and falls back to the base price', () => {
    const s = useOrder.getState()
    s.addProduct(latte)
    s.setSize(latte.id, 'M', 'S')
    expect(useOrder.getState().total()).toBe(8)
    s.setSize(latte.id, 'S', 'L')
    expect(useOrder.getState().total()).toBe(12.5)
    s.addProduct(americano)
    s.setSize(americano.id, 'M', 'L')
    expect(useOrder.getState().total()).toBe(18.5)
  })

  it('includes extras in the total and drops them at zero quantity', () => {
    const s = useOrder.getState()
    s.addProduct(latte)
    s.addExtra(latte.id, 'M', syrup)
    s.incExtra(latte.id, 'M', syrup.id)
    expect(useOrder.getState().total()).toBe(13)
    s.decExtra(latte.id, 'M', syrup.id)
    s.decExtra(latte.id, 'M', syrup.id)
    expect(useOrder.getState().items[0].extras).toHaveLength(0)
    expect(useOrder.getState().total()).toBe(10)
  })

  it('resets split amounts when payment type changes and on clear', () => {
    const s = useOrder.getState()
    s.setSplitPayment(4, 6)
    expect(useOrder.getState()).toMatchObject({ paymentType: 'split', cashAmount: 4, cardAmount: 6 })
    s.setPaymentType('card')
    expect(useOrder.getState()).toMatchObject({ paymentType: 'card', cashAmount: 0, cardAmount: 0 })
    s.addProduct(latte)
    s.clear()
    expect(useOrder.getState()).toMatchObject({ items: [], paymentType: 'cash' })
  })
})
