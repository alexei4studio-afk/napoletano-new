'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, MenuItemRow } from '@/lib/supabaseClient'
import { LogOut, Save, ChefHat, Loader2, CheckCircle, XCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────
type EditableItem = MenuItemRow & {
  _dirty: boolean
  _saving: boolean
  _toast: 'success' | 'error' | null
}

type GroupedItems = Record<string, EditableItem[]>

const CATEGORIES = [
  { id: 'pizza',     label: '🍕 Pizza Napoletano' },
  { id: 'speciale',  label: '⭐ Pizza Speciale' },
  { id: 'antipasti', label: '🧀 Antipasti' },
  { id: 'paste',     label: '🍝 Paste' },
  { id: 'desert',    label: '🍮 Desert' },
  { id: 'parteneri', label: '🤝 Produse Parteneri' },
  { id: 'panini',    label: '🥪 Panini & Produse Pui' },
]

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c.label])
)

const BADGES = ['', 'Bestseller', 'Signature', 'Premium', 'Picantă', 'Veggie', 'Top', 'Per 2', 'Clasic']

const EMPTY_FORM = {
  name: '',
  name_it: '',
  category_id: 'pizza',
  ingredients: '',
  price: '',
  weight: '',
  badge: '',
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
      {message}
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
    if (err) setError('Email sau parolă incorectă.')
    else onLogin()
  }

  return (
    <div className="min-h-screen bg-[#1C1A17] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-[#CE2B37] rounded-full flex items-center justify-center">
              <ChefHat size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-white font-display text-3xl font-light tracking-widest">NAPOLETANO</h1>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-1">Admin Dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs tracking-widest uppercase text-white/50 mb-2">Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@napoletano.ro"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 text-sm rounded-lg focus:outline-none focus:border-[#CE2B37] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-white/50 mb-2">Parolă</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 text-sm rounded-lg focus:outline-none focus:border-[#CE2B37] transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button
            type="submit" disabled={loading}
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

// ── Add Product Form ──────────────────────────────────────────
function AddProductForm({ onAdded }: { onAdded: (categoryId: string) => void }) {
  const [form, setForm]       = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState<'success' | 'error' | null>(null)
  const [open, setOpen]       = useState(true)

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: existing } = await supabase
      .from('menu_items')
      .select('sort_order')
      .eq('category_id', form.category_id)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order + 1) : 1

    const { error } = await supabase.from('menu_items').insert({
      category_id:  form.category_id,
      name:         form.name.trim(),
      name_it:      form.name_it.trim() || null,
      ingredients:  form.ingredients.trim(),
      price:        parseFloat(form.price) || 0,
      weight:       form.weight.trim() || null,
      badge:        form.badge || null,
      sort_order:   nextOrder,
    })

    setLoading(false)

    if (error) {
      setToast('error')
    } else {
      setToast('success')
      const addedCat = form.category_id
      setForm(EMPTY_FORM)
      onAdded(addedCat)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#CE2B37] rounded-full flex items-center justify-center">
            <Plus size={16} className="text-white" />
          </div>
          <span className="font-bold text-[#1C1A17] text-sm tracking-wide">Adaugă Produs Nou</span>
        </div>
        {open
          ? <ChevronUp size={18} className="text-gray-400" />
          : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {open && (
        <form onSubmit={handleAdd} className="px-5 pb-5 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">Nume *</label>
              <input
                required type="text" value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="ex: Margherita"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">
                Nume Italian <span className="normal-case text-gray-300">(opțional)</span>
              </label>
              <input
                type="text" value={form.name_it}
                onChange={(e) => set('name_it', e.target.value)}
                placeholder="ex: La classica"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">Categorie *</label>
              <select
                value={form.category_id}
                onChange={(e) => set('category_id', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">Preț (lei) *</label>
              <input
                required type="number" step="0.5" min="0"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="ex: 49"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">
                Gramaj <span className="normal-case text-gray-300">(opțional)</span>
              </label>
              <input
                type="text" value={form.weight}
                onChange={(e) => set('weight', e.target.value)}
                placeholder="ex: 500g"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">Badge</label>
              <select
                value={form.badge}
                onChange={(e) => set('badge', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50"
              >
                {BADGES.map(b => (
                  <option key={b} value={b}>{b || '— Fără badge —'}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="mt-4">
            <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">Ingrediente *</label>
            <textarea
              required rows={2} value={form.ingredients}
              onChange={(e) => set('ingredients', e.target.value)}
              placeholder="ex: Aluat 280g, sos de roșii, mozzarella, parmezan, busuioc"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50 resize-none"
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>
              {toast === 'success' && (
                <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                  <CheckCircle size={13} /> Produs adăugat cu succes!
                </span>
              )}
              {toast === 'error' && (
                <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
                  <XCircle size={13} /> Eroare la adăugare!
                </span>
              )}
            </div>
            <button
              type="submit" disabled={loading}
              className="flex items-center gap-2 bg-[#CE2B37] hover:bg-[#b02330] disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors shadow-md"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              {loading ? 'Se adaugă...' : 'Adaugă Produs'}
            </button>
          </div>
        </form>
      )}

      {toast && (
        <Toast
          type={toast}
          message={toast === 'success' ? 'Produs adăugat cu succes!' : 'Eroare la adăugare!'}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
export default function AdminPage() {
  const [session, setSession]             = useState<boolean | null>(null)
  const [items, setItems]                 = useState<GroupedItems>({})
  const [loadingData, setLoadingData]     = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('pizza')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session))
  }, [])

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
  }, [])

  useEffect(() => {
    if (session) loadItems()
  }, [session, loadItems])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(false)
  }

  const handleAdded = (categoryId: string) => {
    setActiveCategory(categoryId)
    loadItems()
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
    setItems(prev => ({
      ...prev,
      [catId]: prev[catId].map(i => i.id === item.id ? { ...i, _saving: true } : i)
    }))

    const { error } = await supabase
      .from('menu_items')
      .update({ price: item.price, ingredients: item.ingredients, weight: item.weight, badge: item.badge })
      .eq('id', item.id)

    setItems(prev => ({
      ...prev,
      [catId]: prev[catId].map(i =>
        i.id === item.id
          ? { ...i, _saving: false, _dirty: false, _toast: error ? 'error' : 'success' }
          : i
      )
    }))

    setTimeout(() => {
      setItems(prev => ({
        ...prev,
        [catId]: prev[catId].map(i => i.id === item.id ? { ...i, _toast: null } : i)
      }))
    }, 2500)
  }

  if (session === null) {
    return (
      <div className="min-h-screen bg-[#1C1A17] flex items-center justify-center">
        <Loader2 size={32} className="text-[#CE2B37] animate-spin" />
      </div>
    )
  }

  if (!session) return <LoginForm onLogin={() => setSession(true)} />

  const categories = Object.keys(items)
  const currentItems = items[activeCategory] ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1C1A17] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
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

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── ADD PRODUCT ──────────────────────────────────── */}
        <AddProductForm onAdded={handleAdded} />

        {/* ── TABS ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-4">
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
              <span className="ml-1.5 opacity-60">({items[catId]?.length ?? 0})</span>
            </button>
          ))}
        </div>

        {loadingData && (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="text-[#CE2B37] animate-spin" />
          </div>
        )}

        {/* ── ITEMS ────────────────────────────────────────── */}
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
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-[#1C1A17] text-sm">{item.name}</h3>
                      {item.name_it && <p className="text-[#CE2B37] text-xs italic">{item.name_it}</p>}
                    </div>
                    {item._dirty && (
                      <span className="flex-shrink-0 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        Modificat
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">Preț (lei)</label>
                      <input
                        type="number" step="0.5" min="0" value={item.price}
                        onChange={(e) => updateField(activeCategory, item.id, 'price', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">Gramaj</label>
                        <input
                          type="text" value={item.weight ?? ''}
                          onChange={(e) => updateField(activeCategory, item.id, 'weight', e.target.value)}
                          placeholder="ex: 500g"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">Badge</label>
                        <select
                          value={item.badge ?? ''}
                          onChange={(e) => updateField(activeCategory, item.id, 'badge', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50"
                        >
                          {BADGES.map(b => (
                            <option key={b} value={b}>{b || 'Fără'}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-1">Ingrediente</label>
                    <textarea
                      rows={2} value={item.ingredients}
                      onChange={(e) => updateField(activeCategory, item.id, 'ingredients', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1C1A17] focus:outline-none focus:border-[#CE2B37] transition-colors bg-gray-50 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
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
                      {item._saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      {item._saving ? 'Se salvează...' : 'Salvează'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loadingData && currentItems.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">Niciun produs în această categorie.</p>
            <p className="text-xs mt-1">Adaugă primul produs folosind formularul de mai sus.</p>
          </div>
        )}

      </div>
    </div>
  )
}