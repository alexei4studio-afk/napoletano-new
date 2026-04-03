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
  const [authLoading, setAuthLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('pizza');
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [modifiedIds, setModifiedIds] = useState<Set<number>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', ingredients: '', weight: '', badge: null as Badge });
  const [newProductFile, setNewProductFile] = useState<File | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    const { data, error } = await supabase.from('menu_items').select('*').order('sort_order', { ascending: true });
    if (!error && data) {
      setAllItems(data.map(i => ({ ...i, category: i.category_id || 'pizza' })));
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) setSession(true); });
  }, []);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file);

    if (uploadError) return null;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return showToast("NUME ȘI PREȚ OBLIGATORII");
    setSaving(true);
    
    let imageUrl = null;
    if (newProductFile) {
      imageUrl = await uploadImage(newProductFile);
    }

    const { error } = await supabase.from('menu_items').insert({
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      ingredients: newProduct.ingredients,
      weight: newProduct.weight,
      badge: newProduct.badge,
      category_id: activeCategory,
      image_url: imageUrl,
      sort_order: 100
    });

    if (!error) {
      showToast("PRODUS PUBLICAT");
      setShowAddForm(false);
      setNewProduct({ name: '', price: '', ingredients: '', weight: '', badge: null });
      setNewProductFile(null);
      loadData();
    } else {
      showToast("EROARE SALVARE");
    }
    setSaving(false);
  };

  const handleSaveEdit = async (item: MenuItem) => {
    const { error } = await supabase.from('menu_items').update({
      name: item.name, 
      price: item.price, 
      ingredients: item.ingredients, 
      weight: item.weight, 
      badge: item.badge, 
      sort_order: item.sort_order
    }).eq('id', item.id);

    if (!error) {
      showToast("MODIFICARE SALVATĂ");
      setModifiedIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
      loadData();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ești sigur că vrei să elimini acest produs?")) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) {
      showToast("PRODUS ELIMINAT");
      loadData();
    }
  };

  if (!session) return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-light tracking-[0.3em]">NAPOLETANO</h1>
          <p className="text-[10px] tracking-widest text-zinc-400 mt-2 uppercase font-bold">Admin Console</p>
        </div>
        <div className="space-y-4">
          <input type="email" placeholder="E-MAIL" className="w-full border-b border-zinc-300 py-3 outline-none bg-transparent text-sm focus:border-black transition-colors" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="PASSWORD" className="w-full border-b border-zinc-300 py-3 outline-none bg-transparent text-sm focus:border-black transition-colors" onChange={e => setPassword(e.target.value)} />
          <button onClick={() => {
            setAuthLoading(true);
            supabase.auth.signInWithPassword({ email, password }).then(({error}) => {
              if(!error) setSession(true); else alert("Date incorecte");
              setAuthLoading(false);
            });
          }} className="w-full bg-black text-white py-5 text-[10px] tracking-[0.3em] font-bold hover:bg-zinc-800">
            {authLoading ? 'VERIFICARE...' : 'AUTENTIFICARE'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] text-black pb-20">
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-10 py-4 text-[9px] font-black tracking-[0.3em] uppercase animate-bounce">
          {toast}
        </div>
      )}

      <nav className="p-8 border-b border-zinc-200 flex justify-between items-center bg-white sticky top-0 z-40">
        <div className="flex flex-col">
          <span className="text-xs font-black tracking-[0.4em] uppercase">Napoletano</span>
          <span className="text-[8px] text-zinc-500 tracking-widest uppercase">Management Suite</span>
        </div>
        <button onClick={() => { supabase.auth.signOut(); setSession(false); }} className="text-[10px] font-bold text-zinc-400 hover:text-black uppercase tracking-widest">Logout</button>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        {/* CATEGORIES */}
        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar border-b border-zinc-100 mb-10">
          {Object.entries(CATEGORY_MAP).map(([id, label]) => (
            <button 
              key={id} 
              onClick={() => setActiveCategory(id)} 
              className={`text-[10px] tracking-[0.2em] uppercase font-black pb-3 transition-all ${activeCategory === id ? 'border-b-2 border-black text-black' : 'text-zinc-300 hover:text-zinc-500'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-end mb-12">
          <h2 className="text-5xl font-light tracking-tighter">{CATEGORY_MAP[activeCategory]}</h2>
          <button onClick={() => setShowAddForm(!showAddForm)} className="bg-black text-white px-8 py-3 text-[10px] font-black tracking-widest uppercase rounded-sm hover:bg-zinc-800 transition-all">
            {showAddForm ? 'ÎNCHIDE' : '+ PRODUS NOU'}
          </button>
        </div>

        {/* ADD FORM */}
        {showAddForm && (
          <div className="mb-16 bg-white p-10 border border-zinc-200 shadow-sm animate-in fade-in slide-in-from-top-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <input placeholder="NUME PRODUS *" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border-b border-zinc-200 py-2 outline-none focus:border-black transition-colors font-bold" />
                   <div className="flex items-center gap-2 border-b border-zinc-200 py-2">
                      <input placeholder="PREȚ *" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full outline-none bg-transparent" />
                      <span className="text-[10px] font-black text-zinc-400">LEI</span>
                   </div>
                </div>
                <div className="space-y-6">
                   <input placeholder="INGREDIENTE" value={newProduct.ingredients} onChange={e => setNewProduct({...newProduct, ingredients: e.target.value})} className="w-full border-b border-zinc-200 py-2 outline-none focus:border-black transition-colors" />
                   <select 
                    className="w-full bg-transparent border-b border-zinc-200 py-2 text-[10px] tracking-widest font-black uppercase outline-none"
                    onChange={e => setNewProduct({...newProduct, badge: (e.target.value as Badge) || null})}
                   >
                      <option value="">— FĂRĂ LABEL —</option>
                      <option value="picant">PIQUANT</option>
                      <option value="hot">INTENSE</option>
                      <option value="top">SIGNATURE</option>
                      <option value="new">NOUVEAUTÉ</option>
                   </select>
                </div>
             </div>
             <div className="mt-10 flex items-center gap-8">
                <label className="relative overflow-hidden bg-zinc-100 border border-zinc-200 px-6 py-4 text-[10px] font-black tracking-widest cursor-pointer hover:bg-zinc-200 transition-all uppercase">
                   {newProductFile ? '✅ FIȘIER SELECTAT' : '📸 ÎNCARCĂ FOTO'}
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setNewProductFile(e.target.files?.[0] || null)} />
                </label>
                <button 
                  onClick={handleAddProduct} 
                  disabled={saving}
                  className="bg-black text-white px-12 py-4 text-[10px] font-black tracking-[0.2em] uppercase hover:bg-zinc-800 disabled:bg-zinc-400"
                >
                  {saving ? 'SE SALVEAZĂ...' : 'PUBLICĂ PRODUSUL'}
                </button>
             </div>
          </div>
        )}

        {/* LIST TABLE */}
        <div className="bg-white border border-zinc-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="p-6 text-[9px] tracking-[0.3em] font-black text-zinc-400 uppercase">Imagine</th>
                <th className="p-6 text-[9px] tracking-[0.3em] font-black text-zinc-400 uppercase">Produs</th>
                <th className="p-6 text-[9px] tracking-[0.3em] font-black text-zinc-400 uppercase">Preț</th>
                <th className="p-6 text-[9px] tracking-[0.3em] font-black text-zinc-400 uppercase text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {allItems.filter(i => i.category === activeCategory).map(item => (
                <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="p-6">
                    <div className="w-20 h-20 bg-zinc-100 border border-zinc-200 overflow-hidden relative">
                      {item.image_url ? (
                        <img src={item.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-400 font-bold uppercase tracking-tighter">Fără Poză</div>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <input 
                      className="bg-transparent font-bold text-lg w-full focus:outline-none border-b border-transparent focus:border-zinc-200" 
                      value={item.name} 
                      onChange={e => {
                        const n = [...allItems]; n[n.findIndex(i => i.id === item.id)].name = e.target.value;
                        setAllItems(n); setModifiedIds(new Set(modifiedIds).add(item.id));
                      }}
                    />
                    <input 
                      className="bg-transparent text-xs text-zinc-500 w-full mt-2 focus:outline-none italic" 
                      value={item.ingredients} 
                      onChange={e => {
                        const n = [...allItems]; n[n.findIndex(i => i.id === item.id)].ingredients = e.target.value;
                        setAllItems(n); setModifiedIds(new Set(modifiedIds).add(item.id));
                      }}
                    />
                    {item.badge && (
                      <span className="inline-block mt-3 text-[7px] tracking-[0.3em] font-black uppercase border border-zinc-200 px-2 py-1 text-zinc-500">{item.badge}</span>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-1 font-black text-sm">
                      <input 
                        type="number" 
                        className="bg-transparent w-16 focus:outline-none" 
                        value={item.price} 
                        onChange={e => {
                          const n = [...allItems]; n[n.findIndex(i => i.id === item.id)].price = parseFloat(e.target.value);
                          setAllItems(n); setModifiedIds(new Set(modifiedIds).add(item.id));
                        }}
                      />
                      <span className="text-[9px] text-zinc-400 uppercase">Lei</span>
                    </div>
                  </td>
                  <td className="p-6 text-right space-y-3">
                    <div className="flex flex-col items-end gap-3">
                      {modifiedIds.has(item.id) && (
                        <button onClick={() => handleSaveEdit(item)} className="bg-black text-white px-5 py-2 text-[8px] font-black tracking-widest uppercase hover:bg-zinc-800 transition-all">SALVEAZĂ</button>
                      )}
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="text-[9px] font-black tracking-widest text-zinc-800 hover:text-red-700 uppercase transition-colors"
                      >
                        Șterge Produs
                      </button>
                    </div>
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