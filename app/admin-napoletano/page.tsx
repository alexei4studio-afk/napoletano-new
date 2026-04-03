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

// --- UI COMPONENTS (Premium Boutique Look) ---

function RenderPremiumBadge({ type }: { type: Badge }) {
  if (!type) return null;

  const labels: Record<string, string> = {
    picant: 'Piquant',
    hot: 'Intense',
    top: 'Signature',
    new: 'Nouveauté',
    popular: 'Préféré',
    chef: 'Chef’s Selection'
  };

  const isSpicy = type === 'picant' || type === 'hot';
  
  return (
    <span className={`
      inline-block text-[7px] tracking-[0.3em] uppercase font-black px-2 py-0.5 rounded-sm border mt-2
      ${isSpicy 
        ? 'border-red-900/10 text-red-900 bg-red-50/50' 
        : 'border-zinc-200 text-zinc-400 bg-transparent'}
    `}>
      {labels[type] || type}
    </span>
  );
}

function GlassButton({ onClick, children, className = "", disabled = false }: any) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-6 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-500 active:scale-95 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function PremiumInput({ ...props }: any) {
  return (
    <input 
      {...props} 
      className={`bg-transparent border-b border-zinc-200 py-3 px-1 text-sm focus:border-black focus:outline-none transition-all duration-500 placeholder:text-zinc-300 placeholder:text-[10px] placeholder:tracking-widest ${props.className}`}
    />
  );
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
  const [newProduct, setNewProduct] = useState<any>({ name: '', price: '', ingredients: '', weight: '', badge: null });
  const [newProductFile, setNewProductFile] = useState<File | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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

  const handleLogin = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) setSession(true);
    setAuthLoading(false);
  };

  const handleSave = async (item: MenuItem) => {
    const { error } = await supabase.from('menu_items').update({
      name: item.name, price: item.price, ingredients: item.ingredients, weight: item.weight, badge: item.badge, sort_order: item.sort_order
    }).eq('id', item.id);
    if (!error) {
      showToast("ARCHIVÉ AVEC SUCCÈS");
      setModifiedIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
      loadData();
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Supprimer ${item.name}?`)) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', item.id);
    if (!error) {
      showToast("ÉLIMINÉ");
      loadData();
    }
  };

  if (!session) return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-12">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-light tracking-[0.3em] text-black">NAPOLETANO</h1>
          <div className="h-px w-12 bg-black mx-auto"></div>
          <p className="text-[9px] text-zinc-400 tracking-[0.4em] uppercase">Privé</p>
        </div>
        <div className="space-y-6">
          <PremiumInput type="email" placeholder="IDENTIFIANT" onChange={(e: any) => setEmail(e.target.value)} className="w-full" />
          <PremiumInput type="password" placeholder="MOT DE PASSE" onChange={(e: any) => setPassword(e.target.value)} className="w-full" />
          <button onClick={handleLogin} className="w-full bg-black text-white py-5 text-[9px] tracking-[0.4em] font-black uppercase hover:bg-zinc-800 transition-all duration-700">
            {authLoading ? 'VERIFICATION...' : 'ACCÉDER'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] selection:bg-black selection:text-white pb-20">
      {toast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-10 py-4 rounded-sm text-[8px] font-black tracking-[0.4em] uppercase shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          {toast}
        </div>
      )}

      <nav className="p-10 flex justify-between items-center border-b border-zinc-100 bg-white/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-black tracking-[0.4em] uppercase">Napoletano</span>
          <span className="text-[8px] text-zinc-400 tracking-[0.3em] uppercase font-medium">Management Suite</span>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => setSession(false))} className="text-[9px] tracking-[0.3em] font-bold text-zinc-300 hover:text-black transition-colors uppercase">Logout</button>
      </nav>

      <main className="max-w-6xl mx-auto p-10">
        <div className="flex gap-6 overflow-x-auto pb-10 no-scrollbar">
          {Object.entries(CATEGORY_MAP).map(([id, label]) => (
            <button 
              key={id} 
              onClick={() => setActiveCategory(id)} 
              className={`whitespace-nowrap text-[9px] tracking-[0.25em] uppercase font-black transition-all duration-500 pb-2 border-b-2 ${activeCategory === id ? 'border-black text-black' : 'border-transparent text-zinc-300 hover:text-zinc-500'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-end mb-16">
          <div className="space-y-3">
            <h2 className="text-5xl font-light tracking-tighter text-zinc-900">{CATEGORY_MAP[activeCategory]}</h2>
            <div className="flex items-center gap-3">
               <div className="h-px w-8 bg-zinc-200"></div>
               <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">Curating the collection</p>
            </div>
          </div>
          <GlassButton onClick={() => setShowAddForm(!showAddForm)} className="bg-black text-white hover:px-10">
            {showAddForm ? 'Fermer' : 'Add Item'}
          </GlassButton>
        </div>

        {showAddForm && (
          <div className="mb-20 bg-white p-12 rounded-sm shadow-sm border border-zinc-100">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-8">
                   <PremiumInput placeholder="NAME" value={newProduct.name} onChange={(e:any) => setNewProduct({...newProduct, name: e.target.value})} className="w-full text-lg" />
                   <PremiumInput placeholder="PRICE (EUR)" type="number" value={newProduct.price} onChange={(e:any) => setNewProduct({...newProduct, price: e.target.value})} className="w-full" />
                </div>
                <div className="space-y-8">
                   <PremiumInput placeholder="INGREDIENTS" value={newProduct.ingredients} onChange={(e:any) => setNewProduct({...newProduct, ingredients: e.target.value})} className="w-full" />
                   <select 
                    className="w-full bg-transparent border-b border-zinc-200 py-3 text-[10px] tracking-[0.3em] font-black uppercase focus:outline-none appearance-none cursor-pointer"
                    onChange={(e) => setNewProduct({...newProduct, badge: e.target.value || null})}
                   >
                      <option value="">— LABEL —</option>
                      <option value="picant">PIQUANT</option>
                      <option value="hot">INTENSE</option>
                      <option value="top">SIGNATURE</option>
                      <option value="new">NOUVEAUTÉ</option>
                      <option value="chef">CHEF SELECTION</option>
                   </select>
                </div>
                <div className="flex flex-col justify-end gap-6">
                   <label className="text-[9px] tracking-[0.4em] font-black border border-black py-5 text-center cursor-pointer hover:bg-black hover:text-white transition-all duration-700 uppercase">
                      {newProductFile ? 'FILE READY' : 'ATTACH VISUAL'}
                      <input type="file" className="hidden" onChange={(e) => setNewProductFile(e.target.files?.[0] || null)} />
                   </label>
                   <button onClick={() => {/* ADD LOGIC */}} className="bg-black text-white py-5 text-[9px] font-black tracking-[0.4em] uppercase hover:bg-zinc-800 transition-all">Publish Item</button>
                </div>
             </div>
          </div>
        )}

        <div className="bg-white shadow-sm border border-zinc-100 rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="p-8 text-[8px] tracking-[0.4em] font-black text-zinc-400 uppercase text-left w-24">Media</th>
                <th className="p-8 text-[8px] tracking-[0.4em] font-black text-zinc-400 uppercase text-left">Article</th>
                <th className="p-8 text-[8px] tracking-[0.4em] font-black text-zinc-400 uppercase text-left">Price</th>
                <th className="p-8 text-[8px] tracking-[0.4em] font-black text-zinc-400 uppercase text-center">Order</th>
                <th className="p-8 text-[8px] tracking-[0.4em] font-black text-zinc-400 uppercase text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {allItems.filter(i => i.category === activeCategory).map(item => (
                <tr key={item.id} className="group hover:bg-[#faf9f6] transition-all duration-500">
                  <td className="p-8">
                    <div className="relative w-20 h-20 bg-zinc-100 overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 border border-zinc-50 shadow-sm">
                      {item.image_url ? (
                        <img src={item.image_url} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] tracking-tighter text-zinc-300 font-bold uppercase">No Image</div>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    </div>
                  </td>
                  <td className="p-8">
                    <input 
                      className="bg-transparent font-light text-xl w-full focus:outline-none tracking-tight" 
                      value={item.name} 
                      onChange={(e) => {
                        const n = [...allItems];
                        const idx = n.findIndex(i => i.id === item.id);
                        n[idx].name = e.target.value;
                        setAllItems(n);
                        setModifiedIds(new Set(modifiedIds).add(item.id));
                      }}
                    />
                    <input 
                      className="bg-transparent text-[11px] text-zinc-400 w-full mt-2 focus:outline-none italic font-serif" 
                      value={item.ingredients} 
                      onChange={(e) => {
                        const n = [...allItems];
                        const idx = n.findIndex(i => i.id === item.id);
                        n[idx].ingredients = e.target.value;
                        setAllItems(n);
                        setModifiedIds(new Set(modifiedIds).add(item.id));
                      }}
                    />
                    <div className="flex gap-2">
                       <RenderPremiumBadge type={item.badge} />
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-1">
                       <input 
                        type="number" 
                        className="bg-transparent w-16 focus:outline-none text-lg font-light" 
                        value={item.price} 
                        onChange={(e) => {
                          const n = [...allItems];
                          const idx = n.findIndex(i => i.id === item.id);
                          n[idx].price = parseFloat(e.target.value);
                          setAllItems(n);
                          setModifiedIds(new Set(modifiedIds).add(item.id));
                        }}
                       />
                       <span className="text-[9px] font-bold tracking-widest text-zinc-300">EUR</span>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <input 
                      type="number" 
                      className="bg-zinc-50 w-12 py-2 text-center text-[10px] font-black border border-zinc-100 focus:outline-none focus:border-black transition-all" 
                      value={item.sort_order} 
                      onChange={(e) => {
                        const n = [...allItems];
                        const idx = n.findIndex(i => i.id === item.id);
                        n[idx].sort_order = parseInt(e.target.value);
                        setAllItems(n);
                        setModifiedIds(new Set(modifiedIds).add(item.id));
                      }}
                    />
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex flex-col items-end gap-3">
                       {modifiedIds.has(item.id) && (
                         <button onClick={() => handleSave(item)} className="text-[8px] tracking-[0.4em] font-black text-white bg-black px-4 py-2 uppercase hover:bg-zinc-800 transition-all">Update</button>
                       )}
                       <button onClick={() => handleDelete(item)} className="text-[8px] tracking-[0.3em] text-zinc-300 hover:text-red-900 font-bold uppercase transition-colors">Discard</button>
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