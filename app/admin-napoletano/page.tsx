'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORY_FALLBACK = [
  { id: 'pizza', label: 'Pizza' },
  { id: 'speciale', label: 'Speciale' },
  { id: 'antipasti', label: 'Antipasti' },
  { id: 'paste', label: 'Paste' },
  { id: 'desert', label: 'Desert' },
  { id: 'parteneri', label: 'Parteneri' },
  { id: 'panini', label: 'Panini' },
];

const LABEL_MAP: Record<string, string> = {
  pizza: 'Pizza',
  speciale: 'Speciale',
  antipasti: 'Antipasti',
  paste: 'Paste',
  desert: 'Desert',
  parteneri: 'Parteneri',
  panini: 'Panini',
};

function buildCategories(items: { category: string }[]): { id: string; label: string }[] {
  if (items.length === 0) return CATEGORY_FALLBACK;
  const seen = new Set<string>();
  const cats: { id: string; label: string }[] = [];
  for (const item of items) {
    if (item.category && !seen.has(item.category)) {
      seen.add(item.category);
      const label = LABEL_MAP[item.category.toLowerCase()] ?? (item.category.charAt(0).toUpperCase() + item.category.slice(1));
      cats.push({ id: item.category, label });
    }
  }
  return cats;
}

const BUCKET = 'menu-images';
type Badge = 'new' | 'popular' | 'chef' | null;

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  category_id?: string;
  ingredients: string;
  weight: string;
  badge: Badge;
  sort_order: number;
  image_url: string | null;
}

interface NewProduct {
  name: string;
  description: string;
  price: string;
  ingredients: string;
  weight: string;
  badge: Badge;
}

async function uploadImage(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (error) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

function ProductThumbnail({ url, name }: { url: string | null; name: string }) {
  if (!url) return <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12z" /></svg></div>;
  return <img src={url} alt={name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />;
}

function ImageUploadCell({ item, onUploaded }: { item: MenuItem; onUploaded: (id: number, url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      await supabase.from('menu_items').update({ image_url: url }).eq('id', item.id);
      onUploaded(item.id, url);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };
  return (
    <div className="flex items-center gap-2">
      <ProductThumbnail url={item.image_url} name={item.name} />
      <div className="relative">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" disabled={uploading} />
        <button disabled={uploading} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-[#c0392b] hover:text-[#c0392b]">
          {uploading ? '...' : (item.image_url ? 'Schimbă' : 'Upload')}
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState(CATEGORY_FALLBACK);
  const [loading, setLoading] = useState(false);
  const [modifiedIds, setModifiedIds] = useState<Set<number>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({ name: '', description: '', price: '', ingredients: '', weight: '', badge: null });
  const [newProductFile, setNewProductFile] = useState<File | null>(null);
  const [newProductPreview, setNewProductPreview] = useState<string | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAllItems = useCallback(async () => {
    const { data, error } = await supabase.from('menu_items').select('*').order('sort_order', { ascending: true });
    if (!error && data) {
      const loaded = data.map(item => ({
        ...item,
        category: item.category_id || 'pizza'
      })) as MenuItem[];
      
      setAllItems(loaded);
      const cats = buildCategories(loaded);
      setCategories(cats);
      setActiveCategory((prev) => prev || cats[0]?.id || '');
    }
  }, []);

  const loadCategoryItems = useCallback(async (category: string) => {
    if (!category) return;
    setLoading(true);
    const { data, error } = await supabase.from('menu_items').select('*').eq('category_id', category).order('sort_order', { ascending: true });
    if (!error && data) {
      const loaded = data.map(item => ({
        ...item,
        category: item.category_id || 'pizza'
      })) as MenuItem[];
      setItems(loaded);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) setSession(true); });
  }, []);

  useEffect(() => { if (session) loadAllItems(); }, [session, loadAllItems]);
  useEffect(() => { if (session && activeCategory) { loadCategoryItems(activeCategory); setModifiedIds(new Set()); } }, [session, activeCategory, loadCategoryItems]);

  const categoryCounts = allItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleLogin = async () => {
    setAuthLoading(true); setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError('Email sau parolă incorectă.'); else setSession(true);
    setAuthLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setSession(false); };
  
  const handleFieldChange = (id: number, field: keyof MenuItem, value: string | number | Badge) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    setModifiedIds((prev) => new Set(prev).add(id));
  };

  const handleSave = async (item: MenuItem) => {
    setSavingIds((prev) => new Set(prev).add(item.id));
    const { error } = await supabase.from('menu_items').update({ 
      name: item.name, 
      price: item.price, 
      ingredients: item.ingredients, 
      weight: item.weight, 
      badge: item.badge,
      sort_order: item.sort_order // Am adaugat salvarea ordinii
    }).eq('id', item.id);
    
    if (error) {
      showToast('Eroare la salvare.', 'error');
    } else { 
      showToast(`"${item.name}" salvat!`); 
      setModifiedIds((prev) => { const n = new Set(prev); n.delete(item.id); return n; }); 
      loadAllItems(); 
    }
    setSavingIds((prev) => { const n = new Set(prev); n.delete(item.id); return n; });
  };

  const handleDelete = async (item: MenuItem) => {
    if (!window.confirm(`Ștergi "${item.name}"?`)) return;
    setDeletingIds((prev) => new Set(prev).add(item.id));
    const { error } = await supabase.from('menu_items').delete().eq('id', item.id);
    if (error) showToast('Eroare.', 'error'); else { showToast('Șters!'); setItems((prev) => prev.filter((p) => p.id !== item.id)); setAllItems((prev) => prev.filter((p) => p.id !== item.id)); }
    setDeletingIds((prev) => { const n = new Set(prev); n.delete(item.id); return n; });
  };

  const handleImageUploaded = (id: number, url: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, image_url: url } : item)));
    setAllItems((prev) => prev.map((item) => (item.id === id ? { ...item, image_url: url } : item)));
    showToast('Imagine actualizată!');
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) { showToast('Nume și preț obligatorii.', 'error'); return; }
    setAddingProduct(true);
    let imageUrl: string | null = null;
    if (newProductFile) imageUrl = await uploadImage(newProductFile);
    const maxSortOrder = allItems.filter((i) => i.category === activeCategory).reduce((max, i) => Math.max(max, i.sort_order ?? 0), 0);
    
    const { error } = await supabase.from('menu_items').insert({
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category_id: activeCategory,
      ingredients: newProduct.ingredients,
      weight: newProduct.weight,
      badge: newProduct.badge,
      sort_order: maxSortOrder + 10, // Incrementam cu 10 pentru flexibilitate
      image_url: imageUrl,
    });

    if (error) showToast('Eroare la adăugare.', 'error'); else { showToast('Adăugat!'); resetAddForm(); loadCategoryItems(activeCategory); loadAllItems(); }
    setAddingProduct(false);
  };

  const resetAddForm = () => { setShowAddForm(false); setNewProduct({ name: '', description: '', price: '', ingredients: '', weight: '', badge: null }); setNewProductFile(null); if (newProductPreview) URL.revokeObjectURL(newProductPreview); setNewProductPreview(null); };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#fdf8ee] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6"><h1 className="text-2xl font-bold">Napoletano Admin</h1></div>
          {authError && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{authError}</div>}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30" />
          <input type="password" placeholder="Parolă" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30" />
          <button onClick={handleLogin} disabled={authLoading} className="w-full bg-[#c0392b] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#a93226] disabled:opacity-60">{authLoading ? 'Se autentifică...' : 'Autentificare'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8ee]">
      {toast && <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>{toast.message}</div>}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-[#c0392b] rounded-lg flex items-center justify-center"><span className="text-white text-xs font-bold">N</span></div><h1 className="text-lg font-semibold">Napoletano — Panou Admin</h1></div>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">Deconectare</button>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* COUNTERS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-[#c0392b]/10 text-[#c0392b] rounded-xl px-4 py-2"><span className="font-semibold text-sm">Total: <strong>{allItems.length}</strong> produse</span></div>
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${activeCategory === cat.id ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat.label} ({categoryCounts[cat.id] ?? 0})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABS & TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div><h2 className="font-semibold">{categories.find((c) => c.id === activeCategory)?.label}</h2><p className="text-xs text-gray-400">{items.length} produse</p></div>
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-[#1a1a1a] text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800">Produs Nou</button>
          </div>

          {showAddForm && (
            <div className="px-5 py-5 bg-amber-50 border-b border-amber-100">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <input placeholder="Nume produs *" value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30 col-span-2 md:col-span-1" />
                <input placeholder="Preț (lei) *" type="number" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30" />
                <input placeholder="Gramaj" value={newProduct.weight} onChange={(e) => setNewProduct((p) => ({ ...p, weight: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30" />
                <input placeholder="Ingrediente" value={newProduct.ingredients} onChange={(e) => setNewProduct((p) => ({ ...p, ingredients: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/30 col-span-2" />
                <select value={newProduct.badge ?? ''} onChange={(e) => setNewProduct((p) => ({ ...p, badge: (e.target.value as Badge) || null }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Fără badge</option><option value="new">🆕 New</option><option value="popular">🔥 Popular</option><option value="chef">👨‍🍳 Chef</option>
                </select>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="border border-amber-300 text-amber-700 bg-white px-3 py-2 rounded-lg text-sm cursor-pointer font-medium">
                  {newProductFile ? newProductFile.name : 'Alege imaginea'}
                  <input type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0] ?? null; setNewProductFile(f);
                    if (f) setNewProductPreview(URL.createObjectURL(f));
                  }} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                </label>
                {newProductPreview && <img src={newProductPreview} className="w-12 h-12 rounded object-cover" />}
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddProduct} disabled={addingProduct} className="bg-[#c0392b] text-white px-4 py-2 rounded-lg text-sm font-medium">{addingProduct ? 'Se adaugă...' : 'Salvează'}</button>
                <button onClick={resetAddForm} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">Anulează</button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 w-32">Imagine</th>
                  <th className="px-2 py-3 w-16 text-center">Nr.</th>
                  <th className="px-4 py-3">Produs</th>
                  <th className="px-4 py-3 w-28">Preț</th>
                  <th className="px-4 py-3">Ingrediente</th>
                  <th className="px-4 py-3 w-28 text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className={`group transition-colors ${modifiedIds.has(item.id) ? 'bg-amber-50/60' : 'hover:bg-gray-50/60'}`}>
                    <td className="px-4 py-2.5"><ImageUploadCell item={item} onUploaded={handleImageUploaded} /></td>
                    
                    {/* COLOANA SORTARE */}
                    <td className="px-2 py-2.5">
                      <input 
                        type="number" 
                        value={item.sort_order || 0} 
                        onChange={(e) => handleFieldChange(item.id, 'sort_order', parseInt(e.target.value))}
                        className="bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full text-center font-bold text-gray-700 focus:bg-white focus:ring-1 focus:ring-[#c0392b]/30 outline-none"
                      />
                    </td>

                    <td className="px-4 py-2.5"><input value={item.name} onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)} className="bg-transparent w-full font-medium" /></td>
                    <td className="px-4 py-2.5"><input type="number" value={item.price} onChange={(e) => handleFieldChange(item.id, 'price', parseFloat(e.target.value))} className="bg-transparent w-full text-[#c0392b] font-semibold" /></td>
                    <td className="px-4 py-2.5"><input value={item.ingredients ?? ''} onChange={(e) => handleFieldChange(item.id, 'ingredients', e.target.value)} className="bg-transparent w-full text-gray-600" /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1 justify-center">
                        {modifiedIds.has(item.id) && (
                          <button onClick={() => handleSave(item)} className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-700">
                            OK
                          </button>
                        )}
                        <button onClick={() => handleDelete(item)} className="text-gray-400 hover:text-red-600 text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Șterge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}