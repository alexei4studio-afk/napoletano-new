'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORY_MAP: Record<string, string> = {
  pizza: 'Le Pizze',
  speciale: 'Le Speciali',
  antipasti: 'Antipasti',
  paste: 'Primi Piatti',
  desert: 'Dolci',
  parteneri: 'I Partner',
  panini: 'Panini',
};

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

export default function AdminPage() {
  const [session, setSession] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeCategory, setActiveCategory] = useState('pizza');
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [modifiedIds, setModifiedIds] = useState<Set<number>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', ingredients: '', weight: '', badge: null as Badge });
  const [newProductFile, setNewProductFile] = useState<File | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    const { data } = await supabase.from('menu_items').select('*').order('sort_order', { ascending: true });
    if (data) setAllItems(data.map(i => ({ ...i, category: i.category_id || 'pizza' })));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) setSession(true); });
  }, []);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);

  // --- LOGICA IMAGINI ---
  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file);
    if (error) return null;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleDeleteImage = async (item: MenuItem) => {
    if (!confirm("Ștergi definitiv imaginea acestui produs?")) return;
    
    // Extragem numele fișierului din URL pentru a-l șterge din Storage
    const fileName = item.image_url?.split('/').pop();
    if (fileName) {
      await supabase.storage.from(BUCKET).remove([fileName]);
    }

    const { error } = await supabase.from('menu_items').update({ image_url: null }).eq('id', item.id);
    if (!error) {
      showToast("IMAGINE ELIMINATĂ");
      loadData();
    }
  };

  const handleUpdateImage = async (item: MenuItem, file: File) => {
    setLoading(true);
    const url = await uploadImage(file);
    if (url) {
      await supabase.from('menu_items').update({ image_url: url }).eq('id', item.id);
      showToast("IMAGINE ACTUALIZATĂ");
      loadData();
    }
    setLoading(false);
  };

  // --- LOGICA PRODUSE ---
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return showToast("NUME ȘI PREȚ OBLIGATORII");
    setLoading(true);
    
    let url = null;
    if (newProductFile) url = await uploadImage(newProductFile);

    const { error } = await supabase.from('menu_items').insert({
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      ingredients: newProduct.ingredients,
      weight: newProduct.weight,
      badge: newProduct.badge,
      category_id: activeCategory,
      image_url: url,
      sort_order: 100
    });

    if (!error) {
      showToast("PRODUS ADĂUGAT");
      setShowAddForm(false);
      setNewProduct({ name: '', price: '', ingredients: '', weight: '', badge: null });
      setNewProductFile(null);
      loadData();
    }
    setLoading(false);
  };

  const handleSaveEdit = async (item: MenuItem) => {
    const { error } = await supabase.from('menu_items').update({
      name: item.name, price: item.price, ingredients: item.ingredients, weight: item.weight, badge: item.badge, sort_order: item.sort_order
    }).eq('id', item.id);
    if (!error) {
      showToast("SALVAT CU SUCCES");
      setModifiedIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
      loadData();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Ștergi tot produsul din listă?")) return;
    await supabase.from('menu_items').delete().eq('id', id);
    showToast("PRODUS ELIMINAT");
    loadData();
  };

  if (!session) return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <h1 className="text-3xl font-bold tracking-tighter text-center">ADMIN LOGIN</h1>
        <input type="email" placeholder="Email" className="w-full border p-3 rounded" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Parolă" className="w-full border p-3 rounded" onChange={e => setPassword(e.target.value)} />
        <button onClick={() => supabase.auth.signInWithPassword({ email, password }).then(() => setSession(true))} className="w-full bg-black text-white py-4 font-bold">INTRĂ ÎN PANOU</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      {toast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 z-50 font-bold border-2 border-white shadow-2xl">{toast}</div>}
      
      <nav className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-40">
        <span className="font-black text-xl tracking-tighter">NAPOLETANO <span className="text-gray-400 font-light">ADMIN</span></span>
        <button onClick={() => { supabase.auth.signOut(); setSession(false); }} className="text-xs font-bold border px-4 py-2 hover:bg-black hover:text-white transition-all">DECONECTARE</button>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* CATEGORII */}
        <div className="flex gap-4 overflow-x-auto mb-10 pb-2 border-b">
          {Object.entries(CATEGORY_MAP).map(([id, label]) => (
            <button key={id} onClick={() => setActiveCategory(id)} className={`text-xs font-black px-4 py-2 uppercase tracking-widest transition-all ${activeCategory === id ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>{label}</button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter">{CATEGORY_MAP[activeCategory]}</h2>
          <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-6 py-3 font-bold text-xs uppercase shadow-lg hover:bg-blue-700 transition-all">
            {showAddForm ? 'X ÎNCHIDE FORMULAR' : '+ ADAUGĂ PRODUS'}
          </button>
        </div>

        {/* FORMULAR PRODUS NOU */}
        {showAddForm && (
          <div className="mb-10 bg-gray-50 p-8 border-2 border-black rounded-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Nume Produs</label>
                <input placeholder="Ex: Margherita" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border p-3 rounded bg-white font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Preț (LEI)</label>
                <input placeholder="Ex: 35" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full border p-3 rounded bg-white font-bold text-blue-600" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Ingrediente</label>
                <input placeholder="Ex: Sos rosii, mozzarella..." value={newProduct.ingredients} onChange={e => setNewProduct({...newProduct, ingredients: e.target.value})} className="w-full border p-3 rounded bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Label (Badge)</label>
                <select className="w-full border p-3 rounded bg-white font-bold" onChange={e => setNewProduct({...newProduct, badge: (e.target.value as Badge) || null})}>
                  <option value="">FĂRĂ LABEL</option>
                  <option value="picant">PIQUANT</option>
                  <option value="hot">INTENSE</option>
                  <option value="top">SIGNATURE</option>
                  <option value="new">NOUVEAUTÉ</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 pt-4 border-t">
              <label className="w-full md:w-auto bg-white border-2 border-dashed border-gray-300 px-8 py-4 text-center cursor-pointer hover:border-black transition-all">
                <span className="text-xs font-bold uppercase">{newProductFile ? '✅ FOTO SELECTATĂ' : '📸 ÎNCARCĂ POZĂ'}</span>
                <input type="file" className="hidden" onChange={e => setNewProductFile(e.target.files?.[0] || null)} />
              </label>
              <button onClick={handleAddProduct} disabled={loading} className="w-full md:w-auto flex-1 bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400">
                {loading ? 'SE SALVEAZĂ...' : 'PUBLICĂ PRODUSUL PE SITE'}
              </button>
            </div>
          </div>
        )}

        {/* TABEL PRODUSE */}
        <div className="border border-black rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black text-white text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-4 w-32">Imagine</th>
                <th className="p-4">Detalii Produs</th>
                <th className="p-4 w-28">Preț (Lei)</th>
                <th className="p-4 w-32 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allItems.filter(i => i.category === activeCategory).map(item => (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${modifiedIds.has(item.id) ? 'bg-yellow-50' : ''}`}>
                  <td className="p-4">
                    <div className="relative group w-24 h-24 bg-gray-100 border rounded-lg overflow-hidden">
                      {item.image_url ? (
                        <>
                          <img src={item.image_url} className="w-full h-full object-cover" />
                          <button onClick={() => handleDeleteImage(item)} className="absolute inset-0 bg-red-600/80 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all uppercase">Șterge Poză</button>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-all">
                          <span className="text-[10px] font-bold text-gray-400">FĂRĂ POZĂ</span>
                          <span className="text-[8px] text-blue-600 font-black">+ ADAUGĂ</span>
                          <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpdateImage(item, e.target.files[0])} />
                        </label>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <input className="font-black text-lg w-full bg-transparent focus:bg-white focus:outline-blue-500 p-1" value={item.name} onChange={e => {
                      const n = [...allItems]; n[n.findIndex(i => i.id === item.id)].name = e.target.value;
                      setAllItems(n); setModifiedIds(new Set(modifiedIds).add(item.id));
                    }} />
                    <input className="text-sm text-gray-500 w-full bg-transparent focus:bg-white focus:outline-blue-500 mt-1 p-1" value={item.ingredients} onChange={e => {
                      const n = [...allItems]; n[n.findIndex(i => i.id === item.id)].ingredients = e.target.value;
                      setAllItems(n); setModifiedIds(new Set(modifiedIds).add(item.id));
                    }} />
                    <div className="mt-2 flex gap-2">
                       <select className="text-[9px] font-black border uppercase p-1" value={item.badge || ''} onChange={e => {
                         const n = [...allItems]; n[n.findIndex(i => i.id === item.id)].badge = (e.target.value as Badge) || null;
                         setAllItems(n); setModifiedIds(new Set(modifiedIds).add(item.id));
                       }}>
                         <option value="">Fără Badge</option>
                         <option value="picant">PIQUANT</option>
                         <option value="hot">INTENSE</option>
                         <option value="top">SIGNATURE</option>
                         <option value="new">NOUVEAUTÉ</option>
                       </select>
                    </div>
                  </td>
                  <td className="p-4 font-black">
                    <div className="flex items-center gap-1">
                      <input type="number" className="w-16 text-xl bg-transparent border-b border-dashed focus:bg-white p-1" value={item.price} onChange={e => {
                        const n = [...allItems]; n[n.findIndex(i => i.id === item.id)].price = parseFloat(e.target.value);
                        setAllItems(n); setModifiedIds(new Set(modifiedIds).add(item.id));
                      }} />
                      <span className="text-xs uppercase">Lei</span>
                    </div>
                  </td>
                  <td className="p-4 text-right space-y-4">
                    {modifiedIds.has(item.id) && (
                      <button onClick={() => handleSaveEdit(item)} className="w-full bg-green-600 text-white text-[10px] font-black py-2 rounded shadow-lg uppercase animate-pulse">💾 Salvează</button>
                    )}
                    <button onClick={() => handleDeleteProduct(item.id)} className="text-[9px] font-bold text-red-400 hover:text-red-700 uppercase transition-colors">Șterge Produs</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}