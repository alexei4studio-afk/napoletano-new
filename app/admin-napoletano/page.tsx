'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, MenuItemRow } from '@/lib/supabaseClient'
import { LogOut, Save, ChefHat, Loader2, CheckCircle, XCircle } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────
type EditableItem = MenuItemRow & {
  _dirty: boolean
  _saving: boolean
  _toast: 'success' | 'error' | null
}

type GroupedItems = Record<string, EditableItem[]>

const CATEGORY_LABELS: Record<string, string> = {
  pizza:     '🍕 Pizza Napoletano',
  speciale:  '⭐ Pizza Speciale',
  antipasti: '🧀 Antipasti',
  paste:     '🍝 Paste',
  desert:    '🍮 Desert',
  parteneri: '🤝 Produse Parteneri',
  panini:    '🥪 Panini & Produse Pui',
}

// ── Toast component ───────────────────────────────────────────
function Toast({ type, onClose }: { type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {type === 'success'
        ? <CheckCircle size={16} />
        : <XCircle size={16} />}
      {type === 'success' ? 'Salvat cu succes!' : 'Eroare la salvare!'}
    </div>
  )
}

// ── Login Form ────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError('Email sau parolă incorectă.')
    } else {
      onLogin()
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1A17] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-[#CE2B37] rounded-full flex items-center justify-center">
              <ChefHat size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-white font-display text-3xl font-light tracking-widest">NAPOLETANO</h1>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-1">Admin Dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs tracking-widest uppercase text-white/50 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@napoletano.ro"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 text-sm rounded-lg focus:outline-none focus:border-[#CE2B37] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-white/50 mb-2">Parolă</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 text-sm rounded-lg focus:outline-none focus:border-[#CE2B37] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#CE2B37] hover:bg-[#b02330] disabled:opacity-60 text-white py-3 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Se conectează...' : 'Intră în Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
export default function AdminPage() {
  const [session, setSession]       = useState<boolean | null>(null) // null = loading
  const [items, setItems]           = useState<GroupedItems>({})
  const [loadingData, setLoadingData] = useState(false)
  const [globalToast, setGlobalToast] = useState<'success' | 'error' | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('pizza')

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session)
    })
  }, [])

  // Load all items once logged in
  const loadItems = useCallback(async () => {
    setLoadingData(true)
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category_id')
      .order('sort_order')

    setLoadingData(false)
    if (error || !data) return

    const grouped: GroupedItems = {}
    for (const row of data as MenuItemRow[]) {
      if (!grouped[row.category_id]) grouped[row.category_id] = []
      grouped[row.category_id].push({ ...row, _dirty: false, _saving: false, _toast: null })
    }
    setItems(grouped)
    // Set first category as active
    const firstCat = Object.keys(grouped)[0]
    if (firstCat) setActiveCategory(firstCat)
  }, [])

  useEffect(() => {
    if (session) loadItems()
  }, [session, loadItems])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(false)
  }

  const updateField = (catId: string, itemId: number, field: 'price' | 'ingredients' | 'weight' | 'badge', value: string) => {
    setItems(prev => ({
      ...prev,
      [catId]: prev[catId].map(item =>
        item.id === itemId
          ? { ...item, [field]: field === 'price' ? parseFloat(value) || 0 : value, _dirty: true }
          : item
      )
    }))
  }

  const saveItem = async (catId: string, item: EditableItem) => {
    // Mark as saving
    setItems(prev => ({
      ...prev,
      [catId]: prev[catId].map(i => i.id === item.id ? { ...i, _saving: true } : i)
    }))

    const { error } = await supabase
      .from('menu_items')
      .update({
        price:       item.price,
        ingredients: item.ingredients,
        weight:      item.weight,
        badge:       item.badge,
      })
      .eq('id', item.id)

    setItems(prev => ({
      ...prev,
      [catId]: prev[catId].map(i =>
        i.id === item.id
          ? { ...i, _saving: false, _dirty: false, _toast: error ? 'error' : 'success' }
          : i
      )
    }))

    // Clear toast after 2.5s
    setTimeout(() => {
      setItems(prev => ({
        ...prev,
        [catId]: prev[catId].map(i => i.id === item.id ? { ...i, _toast: null } : i)
      }))
    }, 2500)
  }

  // ── Loading state ─────────────────────────────────────────
  if (session === null) {
    return (
      <div className="min-h-screen bg-[#1C1A17] flex items-center justify-center">
        <Loader2 size={32} className="text-[#CE2B37] animate-spin" />
      </div>
    )
  }

  // ── Login ─────────────────────────────────────────────────
  if (!session) {
    return <LoginForm onLogin={() => setSession(true)} />
  }

  // ── Dashboard ─────────────────────────────────────────────
  const categories = Object.keys(items)
  const currentItems = items[activeCategory] ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1C1A17] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#CE2B37] rounded-full flex items-center justify-center">
              <ChefHat size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold tracking-wider">NAPOLETANO</p>
              <p className="text-white/40 text-[10px] tracking-widest uppercase">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/50 hover:text-white text-xs tracking-widest uppercase border border-white/20 hover:border-white/50 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(catId => (
            <button
              key={catId}
              onClick={() => setActiveCategory(catId)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                activeCategory === catId
                  ? 'bg-[#CE2B37] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#CE2B37] hover:text-[#CE2B37]'
              }`}
            >
              {CATEGORY_LABELS[catId] ?? catId}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loadingData && (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="text-[#CE2B37] animate-spin" />
          </div>
        )}

        {/* Items table */}
        {!loadingData && currentItems.length > 0 && (
          <div className="space-y-3">
            {currentItems.map(item => (
              <div
                key={item.id}
                className={`bg-white rounded-xl border transition-all ${
                  item._dirty ? 'border-amber-300 shadow-md shadow-amber-50' : 'border-gray-100 shadow-sm'
                }`}
              >
                <div className="p-4">
                  {/* Name row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-[#1C1A17] text-sm">{item.name}</h3>
                      {item.name_it && (
                        <p className="text-[#CE2B37] text-xs italic">{item.name_it}</p>
                      )}
                    </div>
                    {item._dirty && (
                      <span className="flex-shrink-0 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        Modificat
                      </span>
                    )}
                  </div>

                  {/* Editable fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {/* Price */}
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">
                        Preț (lei)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={item.price}
                        onChange={(e) => updateField(activeCategory, item.id, 'price', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50"
                      />
                    </div>

                    {/* Weight / Badge */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">
                          Gramaj
                        </label>
                        <input
                          type="text"
                          value={item.weight ?? ''}
                          onChange={(e) => updateField(activeCategory, item.id, 'weight', e.target.value)}
                          placeholder="ex: 500g"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">
                          Badge
                        </label>
                        <select
                          value={item.badge ?? ''}
                          onChange={(e) => updateField(activeCategory, item.id, 'badge', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50"
                        >
                          <option value="">Fără</option>
                          <option value="Bestseller">Bestseller</option>
                          <option value="Signature">Signature</option>
                          <option value="Premium">Premium</option>
                          <option value="Picantă">Picantă</option>
                          <option value="Veggie">Veggie</option>
                          <option value="Top">Top</option>
                          <option value="Per 2">Per 2</option>
                          <option value="Clasic">Clasic</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-3">
                    <label className="block text-[10px] tracking-widests uppercase text-gray-400 mb-1">
                      Ingrediente
                    </label>
                    <textarea
                      rows={2}
                      value={item.ingredients}
                      onChange={(e) => updateField(activeCategory, item.id, 'ingredients', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50 resize-none"
                    />
                  </div>

                  {/* Save button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item._toast === 'success' && (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                          <CheckCircle size={13} /> Salvat!
                        </span>
                      )}
                      {item._toast === 'error' && (
                        <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
                          <XCircle size={13} /> Eroare!
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => saveItem(activeCategory, item)}
                      disabled={!item._dirty || item._saving}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all ${
                        item._dirty
                          ? 'bg-[#CE2B37] hover:bg-[#b02330] text-white shadow-md'
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {item._saving
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Save size={12} />}
                      {item._saving ? 'Se salvează...' : 'Salvează'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global toast */}
      {globalToast && (
        <Toast type={globalToast} onClose={() => setGlobalToast(null)} />
      )}
    </div>
  )
}
