'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = [
  { id: 'pizza', label: 'Pizza' },
  { id: 'speciale', label: 'Speciale' },
  { id: 'antipasti', label: 'Antipasti' },
  { id: 'paste', label: 'Paste' },
  { id: 'desert', label: 'Desert' },
  { id: 'parteneri', label: 'Parteneri' },
  { id: 'panini', label: 'Panini' },
];

type Badge = 'new' | 'popular' | 'chef' | null;

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string;
  weight: string;
  badge: Badge;
  sort_order: number;
}

interface NewProduct {
  name: string;
  description: string;
  price: string;
  ingredients: string;
  weight: string;
  badge: Badge;
}

export default function AdminPage() {
  const [session, setSession] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeCategory, setActiveCategory] = useState('pizza');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modifiedIds, setModifiedIds] = useState<Set<number>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    description: '',
    price: '',
    ingredients: '',
    weight: '',
    badge: null,
  });
  const [addingProduct, setAddingProduct] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load all items (for counters) and category items
  const loadAllItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setAllItems(data as MenuItem[]);
    }
  }, []);

  const loadCategoryItems = useCallback(async (category: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', category)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setItems(data as MenuItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSession(true);
    });
  }, []);

  useEffect(() => {
    if (session) {
      loadAllItems();
      loadCategoryItems(activeCategory);
      setModifiedIds(new Set());
    }
  }, [session, activeCategory, loadAllItems, loadCategoryItems]);

  // Category counters derived from allItems
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = allItems.filter((item) => item.category === cat.id).length;
    return acc;
  }, {} as Record<string, number>);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError('Email sau parolă incorectă.');
    } else {
      setSession(true);
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(false);
  };

  const handleFieldChange = (id: number, field: keyof MenuItem, value: string | number | Badge) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setModifiedIds((prev) => new Set(prev).add(id));
  };

  const handleSave = async (item: MenuItem) => {
    setSavingIds((prev) => new Set(prev).add(item.id));
    const { error } = await supabase
      .from('menu_items')
      .update({
        name: item.name,
        price: item.price,
        ingredients: item.ingredients,
        weight: item.weight,
        badge: item.badge,
      })
      .eq('id', item.id);

    if (error) {
      showToast('Eroare la salvare.', 'error');
    } else {
      showToast(`"${item.name}" salvat cu succes!`);
      setModifiedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      await loadAllItems();
    }
    setSavingIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
  };

  const handleDelete = async (item: MenuItem) => {
    const confirmed = window.confirm(`Ești sigur că vrei să ștergi "${item.name}"?`);
    if (!confirmed) return;

    setDeletingIds((prev) => new Set(prev).add(item.id));
    const { error } = await supabase.from('menu_items').delete().eq('id', item.id);

    if (error) {
      showToast('Eroare la ștergere.', 'error');
    } else {
      showToast(`"${item.name}" a fost șters.`, 'success');
      // Remove from local state immediately (no refresh needed)
      setItems((prev) => prev.filter((p) => p.id !== item.id));
      setAllItems((prev) => prev.filter((p) => p.id !== item.id));
      setModifiedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      showToast('Numele și prețul sunt obligatorii.', 'error');
      return;
    }
    setAddingProduct(true);

    const maxSortOrder = allItems
      .filter((i) => i.category === activeCategory)
      .reduce((max, i) => Math.max(max, i.sort_order ?? 0), 0);

    const { error } = await supabase.from('menu_items').insert({
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category: activeCategory,
      ingredients: newProduct.ingredients,
      weight: newProduct.weight,
      badge: newProduct.badge,
      sort_order: maxSortOrder + 1,
    });

    if (error) {
      showToast('Eroare la adăugare.', 'error');
    } else {
      showToast(`"${newProduct.name}" adăugat cu succes!`);
      setNewProduct({ name: '', description: '', price: '', ingredients: '', weight: '', badge: null });
      setShowAddForm(false);
      await loadCategoryItems(activeCategory);
      await loadAllItems();
    }
    setAddingProduct(false);
  };

  // ─── LOGIN SCREEN ───────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen bg-[#fdf8ee] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#1a1a1a]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Napoletano Admin
            </h1>
            <p className="text-sm text-gray-500 mt-1">Autentifică-te pentru a continua</p>
          </div>
          {authError && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{authError}</div>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30"
          />
          <input
            type="password"
            placeholder="Parolă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30"
          />
          <button
            onClick={handleLogin}
            disabled={authLoading}
            className="w-full bg-[#c0392b] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#a93226] transition-colors disabled:opacity-60"
          >
            {authLoading ? 'Se autentifică...' : 'Autentificare'}
          </button>
        </div>
      </div>
    );
  }

  // ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fdf8ee]">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#c0392b] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">N</span>
          </div>
          <h1 className="text-lg font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Napoletano — Panou Admin
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
        >
          Deconectare
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ── PRODUCT COUNTERS ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Total badge */}
            <div className="flex items-center gap-2 bg-[#c0392b]/10 text-[#c0392b] rounded-xl px-4 py-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-semibold text-sm">
                Total: <strong>{allItems.length}</strong> produse
              </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />

            {/* Per-category counters */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-[#1a1a1a] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                  <span className={`ml-1.5 ${activeCategory === cat.id ? 'text-gray-300' : 'text-gray-400'}`}>
                    ({categoryCounts[cat.id] ?? 0})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CATEGORY TABS ──────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#c0392b] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── PRODUCTS TABLE ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {/* Table header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#1a1a1a]">
                {CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {items.length} {items.length === 1 ? 'produs' : 'produse'} în această categorie
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Produs Nou
            </button>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <div className="px-5 py-4 bg-amber-50 border-b border-amber-100">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
                Adaugă produs nou în {CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <input
                  placeholder="Nume produs *"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30 col-span-2 md:col-span-1"
                />
                <input
                  placeholder="Preț (lei) *"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30"
                  type="number"
                />
                <input
                  placeholder="Gramaj (ex: 350g)"
                  value={newProduct.weight}
                  onChange={(e) => setNewProduct((p) => ({ ...p, weight: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30"
                />
                <input
                  placeholder="Ingrediente"
                  value={newProduct.ingredients}
                  onChange={(e) => setNewProduct((p) => ({ ...p, ingredients: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30 col-span-2"
                />
                <select
                  value={newProduct.badge ?? ''}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, badge: (e.target.value as Badge) || null }))
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30"
                >
                  <option value="">Fără badge</option>
                  <option value="new">New</option>
                  <option value="popular">Popular</option>
                  <option value="chef">Chef</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddProduct}
                  disabled={addingProduct}
                  className="bg-[#c0392b] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors disabled:opacity-60"
                >
                  {addingProduct ? 'Se adaugă...' : 'Adaugă Produs'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Anulează
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Se încarcă...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">Niciun produs în această categorie.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-5 py-3 font-medium">Produs</th>
                    <th className="px-4 py-3 font-medium w-28">Preț (lei)</th>
                    <th className="px-4 py-3 font-medium">Ingrediente</th>
                    <th className="px-4 py-3 font-medium w-28">Gramaj</th>
                    <th className="px-4 py-3 font-medium w-28">Badge</th>
                    <th className="px-4 py-3 font-medium w-24 text-center">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) => {
                    const isModified = modifiedIds.has(item.id);
                    const isSaving = savingIds.has(item.id);
                    const isDeleting = deletingIds.has(item.id);

                    return (
                      <tr
                        key={item.id}
                        className={`group transition-colors ${
                          isModified ? 'bg-amber-50/60' : 'hover:bg-gray-50/60'
                        } ${isDeleting ? 'opacity-40' : ''}`}
                      >
                        {/* Name */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {isModified && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Modificat" />
                            )}
                            <input
                              value={item.name}
                              onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                              className="bg-transparent border-0 focus:outline-none focus:bg-white focus:border focus:border-gray-200 rounded px-1 py-0.5 w-full font-medium text-[#1a1a1a] transition-all"
                            />
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleFieldChange(item.id, 'price', parseFloat(e.target.value))}
                            className="bg-transparent border-0 focus:outline-none focus:bg-white focus:border focus:border-gray-200 rounded px-1 py-0.5 w-full text-[#c0392b] font-semibold transition-all"
                          />
                        </td>

                        {/* Ingredients */}
                        <td className="px-4 py-3">
                          <input
                            value={item.ingredients ?? ''}
                            onChange={(e) => handleFieldChange(item.id, 'ingredients', e.target.value)}
                            className="bg-transparent border-0 focus:outline-none focus:bg-white focus:border focus:border-gray-200 rounded px-1 py-0.5 w-full text-gray-600 transition-all"
                          />
                        </td>

                        {/* Weight */}
                        <td className="px-4 py-3">
                          <input
                            value={item.weight ?? ''}
                            onChange={(e) => handleFieldChange(item.id, 'weight', e.target.value)}
                            className="bg-transparent border-0 focus:outline-none focus:bg-white focus:border focus:border-gray-200 rounded px-1 py-0.5 w-full text-gray-500 transition-all"
                          />
                        </td>

                        {/* Badge */}
                        <td className="px-4 py-3">
                          <select
                            value={item.badge ?? ''}
                            onChange={(e) =>
                              handleFieldChange(item.id, 'badge', (e.target.value as Badge) || null)
                            }
                            className="bg-transparent border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30 w-full"
                          >
                            <option value="">—</option>
                            <option value="new">🆕 New</option>
                            <option value="popular">🔥 Popular</option>
                            <option value="chef">👨‍🍳 Chef</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Save button */}
                            {isModified && (
                              <button
                                onClick={() => handleSave(item)}
                                disabled={isSaving}
                                title="Salvează modificările"
                                className="flex items-center gap-1 bg-green-600 text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 font-medium"
                              >
                                {isSaving ? (
                                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                Salvează
                              </button>
                            )}

                            {/* Delete button */}
                            <button
                              onClick={() => handleDelete(item)}
                              disabled={isDeleting}
                              title={`Șterge "${item.name}"`}
                              className={`
                                flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all font-medium
                                ${isDeleting
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 opacity-0 group-hover:opacity-100'
                                }
                              `}
                            >
                              {isDeleting ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                              <span className="hidden sm:inline">Șterge</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 pb-6">
          Napoletano Admin · Modificările se salvează direct în Supabase
        </p>
      </div>
    </div>
  );
}