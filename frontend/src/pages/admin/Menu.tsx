import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Category, Product, Extra } from '@/types'
import { azn } from '@/lib/format'

export default function AdminMenu() {
  const [tab, setTab] = useState<'products' | 'categories' | 'extras'>('products')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [extras, setExtras] = useState<Extra[]>([])

  const load = async () => {
    const [cats, prods, exs] = await Promise.all([
      api.get('/categories/'),
      api.get('/products/'),
      api.get('/extras/'),
    ])
    setCategories(cats.data)
    setProducts(prods.data)
    setExtras(exs.data)
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (type: 'product' | 'category' | 'extra', id: number, is_active: boolean) => {
    const url = type === 'product' ? `/products/${id}/` : type === 'category' ? `/categories/${id}/` : `/extras/${id}/`
    await api.patch(url, { is_active: !is_active })
    await load()
  }

  const updatePrice = async (id: number, price: string) => {
    await api.patch(`/products/${id}/`, { price })
    await load()
  }

  const createCategory = async (name: string) => {
    await api.post('/categories/', { name })
    await load()
  }

  const createProduct = async (name: string, price: string, price_small: string, price_large: string, category: number) => {
    await api.post('/products/', { 
      name, 
      price, 
      price_small: price_small || null,
      price_large: price_large || null,
      category 
    })
    await load()
  }

  const createExtra = async (name: string, price: string) => {
    await api.post('/extras/', { name, price })
    await load()
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={`px-3 py-2 border rounded ${tab==='products' ? 'bg-primary text-white' : 'bg-white'}`} onClick={() => setTab('products')}>Products</button>
        <button className={`px-3 py-2 border rounded ${tab==='categories' ? 'bg-primary text-white' : 'bg-white'}`} onClick={() => setTab('categories')}>Categories</button>
        <button className={`px-3 py-2 border rounded ${tab==='extras' ? 'bg-primary text-white' : 'bg-white'}`} onClick={() => setTab('extras')}>Extras</button>
      </div>

      {tab === 'products' && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3 space-y-2">
            <div className="font-semibold">Create Product</div>
            <ProductForm categories={categories} onSubmit={createProduct} />
          </div>
          <div className="col-span-2 card p-3 space-y-2">
            <div className="font-semibold">All Products</div>
            <div className="space-y-2 max-h-[70vh] overflow-auto">
              {products.map((p) => (
                <div key={p.id} className="border rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-500">{p.category_name}</div>
                    </div>
                    <button className={`px-3 py-1 rounded ${p.is_active ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => toggleActive('product', p.id, p.is_active)}>{p.is_active ? 'Active' : 'Inactive'}</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <label className="text-xs text-gray-600">Small (S)</label>
                      <input type="number" step="0.01" defaultValue={p.price_small || ''} placeholder="-" className="w-full border rounded px-2 py-1" onBlur={(e) => api.patch(`/products/${p.id}/`, { price_small: e.target.value || null }).then(load)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Medium (M)</label>
                      <input type="number" step="0.01" defaultValue={p.price} className="w-full border rounded px-2 py-1" onBlur={(e) => updatePrice(p.id, e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Large (L)</label>
                      <input type="number" step="0.01" defaultValue={p.price_large || ''} placeholder="-" className="w-full border rounded px-2 py-1" onBlur={(e) => api.patch(`/products/${p.id}/`, { price_large: e.target.value || null }).then(load)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'categories' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-3 space-y-2">
            <div className="font-semibold">Create Category</div>
            <CategoryForm onSubmit={createCategory} />
          </div>
          <div className="card p-3 space-y-2">
            <div className="font-semibold">All Categories</div>
            <div className="space-y-2">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between border rounded p-2">
                  <div className="font-medium">{c.name}</div>
                  <button className={`px-3 py-1 rounded ${c.is_active ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => toggleActive('category', c.id, c.is_active)}>{c.is_active ? 'Active' : 'Inactive'}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'extras' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-3 space-y-2">
            <div className="font-semibold">Create Extra</div>
            <ExtraForm onSubmit={createExtra} />
          </div>
          <div className="card p-3 space-y-2">
            <div className="font-semibold">All Extras</div>
            <div className="space-y-2">
              {extras.map((e) => (
                <div key={e.id} className="flex items-center justify-between border rounded p-2">
                  <div className="font-medium">{e.name} · {azn(e.price)}</div>
                  <button className={`px-3 py-1 rounded ${e.is_active ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => toggleActive('extra', e.id, e.is_active)}>{e.is_active ? 'Active' : 'Inactive'}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryForm({ onSubmit }: { onSubmit: (name: string) => Promise<void> }) {
  const [name, setName] = useState('')
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await onSubmit(name); setName('') }} className="space-y-2">
      <input className="w-full border rounded px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <button className="button w-full">Create</button>
    </form>
  )
}

function ProductForm({ categories, onSubmit }: { categories: Category[]; onSubmit: (name: string, price: string, price_small: string, price_large: string, category: number) => Promise<void> }) {
  const [name, setName] = useState('')
  const [priceM, setPriceM] = useState('')
  const [priceS, setPriceS] = useState('')
  const [priceL, setPriceL] = useState('')
  const [category, setCategory] = useState<number | ''>('')
  return (
    <form onSubmit={async (e) => { e.preventDefault(); if (!category) return; await onSubmit(name, priceM, priceS, priceL, Number(category)); setName(''); setPriceM(''); setPriceS(''); setPriceL(''); setCategory('') }} className="space-y-2">
      <input className="w-full border rounded px-3 py-2" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <select className="w-full border rounded px-3 py-2" value={category} onChange={(e) => setCategory(Number(e.target.value))} required>
        <option value="" disabled>Select category</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Prices by Size</label>
        <input className="w-full border rounded px-3 py-2" placeholder="Small (S) - optional" type="number" step="0.01" value={priceS} onChange={(e) => setPriceS(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Medium (M) - required" type="number" step="0.01" value={priceM} onChange={(e) => setPriceM(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Large (L) - optional" type="number" step="0.01" value={priceL} onChange={(e) => setPriceL(e.target.value)} />
      </div>
      <button className="button w-full">Create Product</button>
    </form>
  )
}

function ExtraForm({ onSubmit }: { onSubmit: (name: string, price: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await onSubmit(name, price); setName(''); setPrice('') }} className="space-y-2">
      <input className="w-full border rounded px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="w-full border rounded px-3 py-2" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
      <button className="button w-full">Create</button>
    </form>
  )
}
