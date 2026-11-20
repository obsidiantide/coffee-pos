import { describe, expect, it } from 'vitest'
import type { Product } from '@/types'
import { filterProducts } from './products'

const make = (id: number, name: string, category_name?: string): Product => ({
  id,
  name,
  price: '3.00',
  category: 1,
  category_name,
  is_active: true,
})

const products = [
  make(1, 'Cappuccino', 'Coffee'),
  make(2, 'Iced Latte', 'Cold drinks'),
  make(3, 'Cheesecake', 'Desserts'),
  make(4, 'Espresso'),
]

describe('filterProducts', () => {
  it('returns all products for an empty or blank query', () => {
    expect(filterProducts(products, '')).toBe(products)
    expect(filterProducts(products, '   ')).toBe(products)
  })

  it('matches by name case-insensitively', () => {
    expect(filterProducts(products, 'LATTE').map((p) => p.id)).toEqual([2])
  })

  it('matches by category name', () => {
    expect(filterProducts(products, 'dessert').map((p) => p.id)).toEqual([3])
  })

  it('requires every word to match', () => {
    expect(filterProducts(products, 'iced cold').map((p) => p.id)).toEqual([2])
    expect(filterProducts(products, 'iced coffee')).toEqual([])
  })

  it('handles products without a category name', () => {
    expect(filterProducts(products, 'espresso').map((p) => p.id)).toEqual([4])
    expect(filterProducts(products, 'undefined')).toEqual([])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterProducts(products, 'pizza')).toEqual([])
  })
})
