import type { Product } from '@/types'

/**
 * Case-insensitive product search by name or category name.
 * Every whitespace-separated word of the query must match one of the two fields.
 * An empty query returns the list unchanged.
 */
export function filterProducts(products: Product[], query: string): Product[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return products
  return products.filter((p) => {
    const haystack = `${p.name} ${p.category_name ?? ''}`.toLowerCase()
    return words.every((w) => haystack.includes(w))
  })
}
