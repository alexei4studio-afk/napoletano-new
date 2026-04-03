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
    const catId = item.category || 'pizza';
    if (!seen.has(catId)) {
      seen.add(catId);
      const label = LABEL_MAP[catId.toLowerCase()] ?? (catId.charAt(0).toUpperCase() + catId.slice(1));
      cats.push({ id: catId, label });
    }
  }
  return cats;
}

const BUCKET = 'menu-images';
type Badge = 'new' | 'popular' | 'chef' | 'top' | 'hot' | 'picant' | null;

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
  if (!url) return <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-300">🖼️</div>;
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
  };
  return (
    <div className="flex items-center gap-2">
      <ProductThumbnail url={item.image_url} name={item.name} />
      <div className="relative">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" disabled={uploading} />
        <button disabled={uploading} className="text-[10px] px-2 py-1 rounded border border-gray-200 text-gray-500 bg-white">
          {uploading ? '...' : 'Upload'}
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({ name: '', description: '', price: '', ingredients: '', weight: '', badge: null });
  const [newProductFile, setNewProductFile] = useState<File | null>(null);
  const [newProductPreview, setNewProductPreview] = useState<string | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    const { data, error } = await supabase.from('menu_items').select('*').order('sort_order', { ascending: true });
    if (!error && data) {
      const loaded = data.map(i => ({ ...i, category: i.category_id || 'pizza' })) as MenuItem[];
      setAllItems(loaded);
      const cats = buildCategories(loaded);
      setCategories(cats);
      if (!activeCategory) setActiveCategory(cats[0]?.id || 'pizza');
    }
  }, [activeCategory]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) setSession(true); });
  }, []);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);

  useEffect(() => {
    if (session && activeCategory) {
      setItems(allItems.filter(i => i.category === activeCategory));
      setModifiedIds(new Set());
    }
  }, [activeCategory, allItems, session]);

  const handleLogin = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError('Eroare la logare.'); else setSession(true);
    setAuthLoading(false);
  };

  const handleFieldChange = (id: number, field: keyof MenuItem, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    setModifiedIds(prev => new Set(prev).add(id));
  };

  const handleSave = async (item: MenuItem) => {
    setSavingIds(prev => new Set(prev).add(item.id));
    const { error } = await supabase.from('menu_items').update({
      name: item.name,
      price: item.price,
      ingredients: item.ingredients,
      weight: item.weight,
      badge: item.badge,
      sort_order: item.sort_order
    }).eq('id', item.id);

    if (error) showToast('Eroare la salvare', 'error');
    else {
      showToast(`Salvat: ${item.name}`);
      setModifiedIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
      loadData();
    }
    setSavingIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Ștergi ${item.name}?`)) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', item.id);
    if (error) showToast('Eroare la ștergere', 'error');
    else { showToast('Șters!'); loadData(); }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return showToast('Nume și preț obligatorii', 'error');
    setAddingProduct(true);
    let url = null;
    if (newProductFile) url = await uploadImage(newProductFile);
    
    const { error } = await supabase.from('menu_items').insert({
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category_id: activeCategory,
      ingredients: newProduct.ingredients,
      weight: newProduct.weight,
      badge: newProduct.badge,
      image_url: url,
      sort_order: 100
    });

    if (error) showToast('Eroare: ' + error.message, 'error');
    else {
      showToast('Adăugat cu succes!');
      setShowAddForm(false);
      setNewProduct({ name: '', description: '', price: '', ingredients: '', weight: '', badge: null });
      setNewProductFile(null);
      loadData();
    }
    setAddingProduct(false);
  };

  if (!session) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6 text-center">Napoletano Admin</h1>
        {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}
        <input type="email" placeholder="Email" className="w-full mb-3 p-2 border rounded" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Parolă" className="w-full mb-6 p-2 border rounded" onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-red-600 text-white p-2 rounded font-bold">{authLoading ? '...' : 'Intră'}</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdf8ee] pb-20">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.message}</div>}
      
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="font-bold text-red-600">NAPOLETANO ADMIN</h1>
        <button onClick={() => supabase.auth.signOut().then(() => setSession(false))} className="text-xs text-gray-400">Ieșire</button>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {categories.map(c => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeCategory === c.id ? 'bg-red-600 text-white' : 'bg-white border'}`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <span className="font-bold text-sm uppercase">{activeCategory}</span>
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-black text-white text-xs px-4 py-2 rounded-lg"> + Produs Nou</button>
          </div>

          {showAddForm && (
            <div className="p-4 bg-orange-50 border-b space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <input placeholder="Nume *" className="p-2 border rounded text-sm" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} />
                <input placeholder="Preț *" type="number" className="p-2 border rounded text-sm" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} />
                <input placeholder="Gramaj" className="p-2 border rounded text-sm" value={newProduct.weight} onChange={e => setNewProduct(p => ({ ...p, weight: e.target.value }))} />
                <select className="p-2 border rounded text-sm" onChange={e => setNewProduct(p => ({ ...p, badge: (e.target.value as Badge) || null }))}>
                  <option value="">Fără Badge</option>
                  <option value="picant">🌶️ Picant</option>
                  <option value="hot">🔥 Hot</option>
                  <option value="top">🔝 Top</option>
                  <option value="new">🆕 New</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
              <input placeholder="Ingrediente" className="w-full p-2 border rounded text-sm" value={newProduct.ingredients} onChange={e => setNewProduct(p => ({ ...p, ingredients: e.target.value }))} />
              
              <div className="flex items-center gap-4">
                <label className="relative overflow-hidden bg-white border px-4 py-2 rounded text-xs font-bold cursor-pointer hover:bg-gray-50">
                  {newProductFile ? '✅ Foto selectată' : '📸 Alege Foto (Opțional)'}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setNewProductFile(e.target.files?.[0] || null)} />
                </label>
                <button onClick={handleAddProduct} disabled={addingProduct} className="bg-red-600 text-white px-6 py-2 rounded text-xs font-bold uppercase">{addingProduct ? '...' : 'Salvează'}</button>
              </div>
            </div>
          )}

          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400">
              <tr>
                <th className="p-3">Foto</th>
                <th className="p-3">Produs / Ingrediente</th>
                <th className="p-3 w-20">Preț</th>
                <th className="p-3 w-16">Sort</th>
                <th className="p-3 w-20 text-center">Acțiune</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(item => (
                <tr key={item.id} className={modifiedIds.has(item.id) ? 'bg-yellow-50' : ''}>
                  <td className="p-3"><ImageUploadCell item={item} onUploaded={loadData} /></td>
                  <td className="p-3">
                    <input className="font-bold w-full bg-transparent" value={item.name} onChange={e => handleFieldChange(item.id, 'name', e.target.value)} />
                    <input className="text-xs text-gray-500 w-full bg-transparent" value={item.ingredients} onChange={e => handleFieldChange(item.id, 'ingredients', e.target.value)} />
                    <div className="flex gap-2 mt-1">
                       <select className="text-[10px] border rounded" value={item.badge || ''} onChange={e => handleFieldChange(item.id, 'badge', e.target.value || null)}>
                         <option value="">Fără</option>
                         <option value="picant">🌶️ Picant</option>
                         <option value="hot">🔥 Hot</option>
                         <option value="top">🔝 Top</option>
                       </select>
                       <span className="text-[10px] text-gray-300 italic">{item.weight}</span>
                    </div>
                  </td>
                  <td className="p-3"><input type="number" className="w-full font-bold text-red-600 bg-transparent" value={item.price} onChange={e => handleFieldChange(item.id, 'price', parseFloat(e.target.value))} /></td>
                  <td className="p-3"><input type="number" className="w-full text-center bg-gray-50 rounded" value={item.sort_order} onChange={e => handleFieldChange(item.id, 'sort_order', parseInt(e.target.value))} /></td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      {modifiedIds.has(item.id) && <button onClick={() => handleSave(item)} className="bg-green-600 text-white text-[10px] py-1 rounded font-bold uppercase">OK</button>}
                      <button onClick={() => handleDelete(item)} className="text-[10px] text-gray-300 hover:text-red-600 uppercase">Șterge</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}