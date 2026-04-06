'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Constante ────────────────────────────────────────────────────────────────
const MENU_BUCKET    = 'menu-images';
const GALLERY_BUCKET = 'gallery';

const MENU_CATEGORY_MAP: Record<string, string> = {
  pizza:     'Le Pizze',
  speciale:  'Le Speciali',
  antipasti: 'Antipasti',
  paste:     'Primi Piatti',
  desert:    'Dolci',
  parteneri: 'I Partner',
  panini:    'Panini',
};

const GALLERY_CATEGORIES = ['restaurant', 'terasa', 'evenimente'] as const;
type GalleryCategory = typeof GALLERY_CATEGORIES[number];

const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  restaurant: 'Restaurant',
  terasa:     'Terasă',
  evenimente: 'Evenimente',
};

// Alt-text SEO generat automat în funcție de categorie + tip
const ALT_TEXT_MAP: Record<GalleryCategory, Record<'image' | 'video', string>> = {
  restaurant: {
    image: 'Interior elegant al Restaurantului Napoletano București',
    video: 'Video interior Restaurant Napoletano București',
  },
  terasa: {
    image: 'Terasa amenajată a Restaurantului Napoletano București',
    video: 'Video terasa Restaurant Napoletano București',
  },
  evenimente: {
    image: 'Eveniment privat la Restaurantului Napoletano București',
    video: 'Video eveniment privat Restaurant Napoletano București',
  },
};

// ─── Tipuri ───────────────────────────────────────────────────────────────────
type Badge = 'new' | 'popular' | 'chef' | 'top' | 'hot' | 'picant' | null;

interface MenuItem {
  id:         number;
  name:       string;
  description: string;
  price:      number;
  category:   string;
  category_id?: string;
  ingredients: string;
  weight:     string;
  badge:      Badge;
  sort_order: number;
  image_url:  string | null;
}

interface GalleryItem {
  id:         number;
  url:        string;
  category:   GalleryCategory;
  type:       'image' | 'video';
  alt_text:   string;
  created_at: string;
}

interface ProcessStats {
  originalKb:   number;
  finalKb:      number;
  width:        number;
  height:       number;
  wasResized:   boolean;
  finalQuality: number; // 0-100
}

// ─── Canvas utils ─────────────────────────────────────────────────────────────

/** Canvas → WebP Blob la calitatea dată (0–1). */
function canvasToWebP(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('canvas.toBlob a returnat null'))),
      'image/webp',
      quality
    )
  );
}

/**
 * Pipeline complet pentru imagini din galerie:
 *  1. Decodare via createImageBitmap
 *  2. Redimensionare la max 1920 px lățime (dacă e necesar)
 *  3. Binary-search pe calitate WebP → target ≤ 300 KB (max 8 iterații)
 *  4. Redenumire SEO: napoletano-bucuresti-[categorie]-[timestamp].webp
 *  5. Generare alt_text conform ALT_TEXT_MAP
 */
async function processGalleryImage(
  file: File,
  category: GalleryCategory
): Promise<{ file: File; altText: string; fileName: string; stats: ProcessStats }> {
  const MAX_WIDTH    = 1920;
  const TARGET_BYTES = 300 * 1024; // 300 KB
  const timestamp    = Date.now();
  const seoFileName  = `napoletano-bucuresti-${category}-${timestamp}.webp`;

  // 1. Decodare
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  const wasResized = width > MAX_WIDTH;

  // 2. Redimensionare proporțională
  if (wasResized) {
    height = Math.round((height * MAX_WIDTH) / width);
    width  = MAX_WIDTH;
  }

  // 3. Desenare pe canvas
  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close(); // eliberăm memoria

  // 4. Încearcă calitate 0.85; dacă tot > 300 KB → binary search
  let quality = 0.85;
  let blob    = await canvasToWebP(canvas, quality);

  if (blob.size > TARGET_BYTES) {
    let lo = 0.10, hi = 0.84;
    for (let i = 0; i < 8; i++) {
      const mid = (lo + hi) / 2;
      blob = await canvasToWebP(canvas, mid);
      blob.size > TARGET_BYTES ? (hi = mid) : (lo = mid);
    }
    quality = lo;
    blob    = await canvasToWebP(canvas, quality);
  }

  return {
    file:     new File([blob], seoFileName, { type: 'image/webp' }),
    altText:  ALT_TEXT_MAP[category].image,
    fileName: seoFileName,
    stats: {
      originalKb:   Math.round(file.size / 1024),
      finalKb:      Math.round(blob.size / 1024),
      width,
      height,
      wasResized,
      finalQuality: Math.round(quality * 100),
    },
  };
}

/**
 * Procesare video — doar redenumire SEO.
 * (Compresia video client-side necesită ffmpeg.wasm; exclusă intenționat.)
 */
function processGalleryVideo(
  file: File,
  category: GalleryCategory
): { file: File; altText: string; fileName: string } {
  const ext         = file.name.split('.').pop() || 'mp4';
  const seoFileName = `napoletano-bucuresti-${category}-${Date.now()}.${ext}`;
  return {
    file:     new File([file], seoFileName, { type: file.type }),
    altText:  ALT_TEXT_MAP[category].video,
    fileName: seoFileName,
  };
}

// ─── Componenta principală ────────────────────────────────────────────────────
export default function AdminPage() {

  // Auth
  const [session,  setSession]  = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // Navigare între secțiuni
  const [activeView, setActiveView] = useState<'menu' | 'gallery'>('menu');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Stare MENIU ────────────────────────────────────────────────────────────
  const [activeMenuCat, setActiveMenuCat] = useState('pizza');
  const [allItems,      setAllItems]      = useState<MenuItem[]>([]);
  const [modifiedIds,   setModifiedIds]   = useState<Set<number>>(new Set());
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [newProduct,    setNewProduct]    = useState({
    name: '', price: '', ingredients: '', weight: '', badge: null as Badge,
  });
  const [newProductFile, setNewProductFile] = useState<File | null>(null);
  const [menuLoading,    setMenuLoading]    = useState(false);

  // ── Stare GALERIE ──────────────────────────────────────────────────────────
  const [galleryItems,    setGalleryItems]    = useState<GalleryItem[]>([]);
  const [galCat,          setGalCat]          = useState<GalleryCategory>('restaurant');
  const [galType,         setGalType]         = useState<'image' | 'video'>('image');
  const [galFile,         setGalFile]         = useState<File | null>(null);
  const [galLoading,      setGalLoading]      = useState(false);
  const [uploadStep,      setUploadStep]      = useState<'idle' | 'processing' | 'uploading'>('idle');
  const [processStats,    setProcessStats]    = useState<ProcessStats | null>(null);
  const [filterCat,       setFilterCat]       = useState<GalleryCategory | 'all'>('all');

  // ── Data fetchers ──────────────────────────────────────────────────────────
  const loadMenuItems = useCallback(async () => {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setAllItems(data.map(i => ({ ...i, category: i.category_id || 'pizza' })));
  }, []);

  const loadGalleryItems = useCallback(async () => {
    const { data } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setGalleryItems(data as GalleryItem[]);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSession(true);
    });
  }, []);

  useEffect(() => {
    if (session) {
      loadMenuItems();
      loadGalleryItems();
    }
  }, [session, loadMenuItems, loadGalleryItems]);

  // ── Handlers MENIU ─────────────────────────────────────────────────────────

  /** Upload imagine simplă pentru produsele din meniu. */
  const uploadMenuImage = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage.from(MENU_BUCKET).upload(fileName, file);
    if (error) return null;
    return supabase.storage.from(MENU_BUCKET).getPublicUrl(fileName).data.publicUrl;
  };

  const handleDeleteMenuImage = async (item: MenuItem) => {
    if (!confirm('Ștergi definitiv imaginea acestui produs?')) return;
    const fileName = item.image_url?.split('/').pop();
    if (fileName) await supabase.storage.from(MENU_BUCKET).remove([fileName]);
    const { error } = await supabase
      .from('menu_items')
      .update({ image_url: null })
      .eq('id', item.id);
    if (!error) { showToast('IMAGINE ELIMINATĂ'); loadMenuItems(); }
  };

  const handleUpdateMenuImage = async (item: MenuItem, file: File) => {
    setMenuLoading(true);
    const url = await uploadMenuImage(file);
    if (url) {
      await supabase.from('menu_items').update({ image_url: url }).eq('id', item.id);
      showToast('IMAGINE ACTUALIZATĂ');
      loadMenuItems();
    }
    setMenuLoading(false);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return showToast('NUME ȘI PREȚ OBLIGATORII');
    setMenuLoading(true);
    let url: string | null = null;
    if (newProductFile) url = await uploadMenuImage(newProductFile);
    const { error } = await supabase.from('menu_items').insert({
      name:        newProduct.name,
      price:       parseFloat(newProduct.price),
      ingredients: newProduct.ingredients,
      weight:      newProduct.weight,
      badge:       newProduct.badge,
      category_id: activeMenuCat,
      image_url:   url,
      sort_order:  100,
    });
    if (!error) {
      showToast('PRODUS ADĂUGAT');
      setShowAddForm(false);
      setNewProduct({ name: '', price: '', ingredients: '', weight: '', badge: null });
      setNewProductFile(null);
      loadMenuItems();
    }
    setMenuLoading(false);
  };

  const handleSaveEdit = async (item: MenuItem) => {
    const { error } = await supabase.from('menu_items').update({
      name:        item.name,
      price:       item.price,
      ingredients: item.ingredients,
      weight:      item.weight,
      badge:       item.badge,
      sort_order:  item.sort_order,
    }).eq('id', item.id);
    if (!error) {
      showToast('SALVAT CU SUCCES');
      setModifiedIds(prev => { const s = new Set(prev); s.delete(item.id); return s; });
      loadMenuItems();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Ștergi tot produsul din listă?')) return;
    await supabase.from('menu_items').delete().eq('id', id);
    showToast('PRODUS ELIMINAT');
    loadMenuItems();
  };

  // ── Helpers inline edit ────────────────────────────────────────────────────
  const updateField = <K extends keyof MenuItem>(id: number, key: K, val: MenuItem[K]) => {
    setAllItems(prev => prev.map(i => i.id === id ? { ...i, [key]: val } : i));
    setModifiedIds(prev => new Set(prev).add(id));
  };

  // ── Handlers GALERIE ───────────────────────────────────────────────────────
  const handleUploadGalleryMedia = async () => {
    if (!galFile) return showToast('SELECTEAZĂ UN FIȘIER ÎNAINTE');
    setGalLoading(true);
    setProcessStats(null);

    let finalFile: File;
    let altText:   string;
    let fileName:  string;

    if (galType === 'image') {
      setUploadStep('processing');
      try {
        const res = await processGalleryImage(galFile, galCat);
        finalFile = res.file;
        altText   = res.altText;
        fileName  = res.fileName;
        setProcessStats(res.stats);
      } catch {
        showToast('EROARE LA PROCESAREA IMAGINII');
        setGalLoading(false);
        setUploadStep('idle');
        return;
      }
    } else {
      const res = processGalleryVideo(galFile, galCat);
      finalFile = res.file;
      altText   = res.altText;
      fileName  = res.fileName;
    }

    setUploadStep('uploading');
    const { error: uploadErr } = await supabase.storage
      .from(GALLERY_BUCKET)
      .upload(fileName, finalFile, { contentType: finalFile.type, upsert: false });

    if (uploadErr) {
      showToast('EROARE LA UPLOAD — verifică bucket-ul "gallery" în Supabase');
      setGalLoading(false);
      setUploadStep('idle');
      return;
    }

    const publicUrl = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(fileName).data.publicUrl;

    const { error: dbErr } = await supabase.from('gallery_items').insert({
      url:      publicUrl,
      category: galCat,
      type:     galType,
      alt_text: altText,
    });

    if (!dbErr) {
      showToast('MEDIA PUBLICATĂ ÎN GALERIE');
      setGalFile(null);
      loadGalleryItems();
    } else {
      showToast('EROARE LA SALVARE ÎN DB — verifică tabela gallery_items');
    }

    setGalLoading(false);
    setUploadStep('idle');
  };

  const handleDeleteGalleryItem = async (item: GalleryItem) => {
    if (!confirm('Ștergi definitiv acest fișier din galerie?')) return;
    const fileName = item.url.split('/').pop();
    if (fileName) await supabase.storage.from(GALLERY_BUCKET).remove([fileName]);
    await supabase.from('gallery_items').delete().eq('id', item.id);
    showToast('ELEMENT ELIMINAT');
    loadGalleryItems();
  };

  // ── Filtrare galerie ───────────────────────────────────────────────────────
  const filteredGallery = filterCat === 'all'
    ? galleryItems
    : galleryItems.filter(i => i.category === filterCat);

  // ─── Ecran LOGIN ────────────────────────────────────────────────────────────
  if (!session) return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400">Napoletano</p>
          <h1 className="text-3xl font-black tracking-tighter">ADMIN PANOU</h1>
        </div>
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-black"
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Parolă"
          autoComplete="current-password"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-black"
          onChange={e => setPassword(e.target.value)}
        />
        <button
          onClick={() =>
            supabase.auth
              .signInWithPassword({ email, password })
              .then(({ error }) => error ? showToast('CREDENȚIALE INCORECTE') : setSession(true))
          }
          className="w-full bg-black text-white py-4 font-black tracking-widest uppercase hover:bg-gray-900 transition-colors rounded-lg"
        >
          INTRĂ ÎN PANOU
        </button>
        {toast && <p className="text-center text-sm text-red-500">{toast}</p>}
      </div>
    </div>
  );

  // ─── Panou principal ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24">

      {/* Toast global */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-8 py-4 font-bold tracking-widest border-2 border-white shadow-2xl text-sm">
          {toast}
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white border-b px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <span className="font-black text-lg tracking-tighter whitespace-nowrap">
            NAPOLETANO <span className="text-gray-400 font-light">ADMIN</span>
          </span>

          {/* Switcher secțiuni */}
          <div className="flex overflow-hidden border border-gray-200 rounded-lg">
            {(['menu', 'gallery'] as const).map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`text-[10px] font-black px-5 py-2 uppercase tracking-widest transition-all ${
                  activeView === v ? 'bg-black text-white' : 'text-gray-400 hover:text-black'
                }`}
              >
                {v === 'menu' ? 'MENIU' : 'GALERIE MEDIA'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => { supabase.auth.signOut(); setSession(false); }}
          className="text-[10px] font-bold border px-4 py-2 hover:bg-black hover:text-white transition-all uppercase tracking-widest"
        >
          IEȘIRE
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-10">

        {/* ══════════════════════════════════════════════════════════════
            SECȚIUNEA: GALERIE MEDIA
        ══════════════════════════════════════════════════════════════ */}
        {activeView === 'gallery' && (
          <div className="space-y-10">

            {/* Header */}
            <div className="flex items-end justify-between border-b pb-4">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 mb-1">Admin · Galerie</p>
                <h2 className="text-3xl font-black uppercase tracking-tighter">GALERIE MEDIA</h2>
              </div>
              <span className="text-[10px] tracking-widest uppercase text-gray-400">
                {galleryItems.length} fișiere în total
              </span>
            </div>

            {/* ── Upload Form ─────────────────────────────────────────── */}
            <div className="bg-gray-50 border-2 border-black rounded-xl p-8 space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
                Adaugă fișier nou · Pipeline SEO activ
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Categorie */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Categorie
                  </label>
                  <select
                    value={galCat}
                    onChange={e => setGalCat(e.target.value as GalleryCategory)}
                    className="w-full border border-gray-300 p-3 rounded-lg bg-white font-bold text-sm focus:outline-none focus:border-black"
                  >
                    {GALLERY_CATEGORIES.map(c => (
                      <option key={c} value={c}>{GALLERY_CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                  {/* Preview alt-text */}
                  <p className="text-[8px] text-gray-400 italic leading-tight">
                    Alt: &ldquo;{ALT_TEXT_MAP[galCat][galType]}&rdquo;
                  </p>
                </div>

                {/* Tip */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Tip fișier
                  </label>
                  <div className="flex gap-2">
                    {(['image', 'video'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => { setGalType(t); setGalFile(null); setProcessStats(null); }}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest border-2 rounded-lg transition-all ${
                          galType === t ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-400 hover:border-gray-400'
                        }`}
                      >
                        {t === 'image' ? '🖼 Imagine' : '🎬 Video'}
                      </button>
                    ))}
                  </div>
                  <p className="text-[8px] text-gray-400 italic">
                    {galType === 'image'
                      ? 'Automat: WebP · max 1920px · max 300KB'
                      : 'Redenumire SEO automată · fără compresie browser'}
                  </p>
                </div>

                {/* File picker */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Fișier
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-[76px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-black transition-all bg-white">
                    {galFile ? (
                      <span className="text-[10px] font-bold text-green-600 text-center px-2">
                        ✓ {galFile.name}
                        <span className="block text-gray-400 font-normal">
                          {Math.round(galFile.size / 1024)} KB
                        </span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-gray-400">
                        + SELECTEAZĂ FIȘIER
                      </span>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept={galType === 'image' ? 'image/*' : 'video/*'}
                      onChange={e => { setGalFile(e.target.files?.[0] || null); setProcessStats(null); }}
                    />
                  </label>
                  {galFile && galType === 'image' && (
                    <p className="text-[8px] text-gray-400 italic">
                      Fișier SEO: napoletano-bucuresti-{galCat}-[timestamp].webp
                    </p>
                  )}
                </div>
              </div>

              {/* Upload button */}
              <button
                onClick={handleUploadGalleryMedia}
                disabled={galLoading || !galFile}
                className="w-full py-4 font-black uppercase tracking-widest text-sm transition-all rounded-lg
                           bg-black text-white hover:bg-gray-900
                           disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {uploadStep === 'processing' && '⚙️  CONVERSIE WEBP + COMPRESIE INTELIGENTĂ...'}
                {uploadStep === 'uploading'  && '☁️  UPLOAD PE SUPABASE STORAGE...'}
                {uploadStep === 'idle'       && 'PUBLICĂ ÎN GALERIA SITE-ULUI'}
              </button>

              {/* ── Tabel statistici procesare ──────────────────────── */}
              {processStats && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 overflow-hidden">
                  <div className="px-6 py-3 bg-emerald-100 border-b border-emerald-200">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-800">
                      ✓ Raport Optimizare
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-emerald-200">
                    {[
                      { label: 'Original',    value: `${processStats.originalKb} KB`,       highlight: false },
                      { label: 'Final WebP',  value: `${processStats.finalKb} KB`,           highlight: processStats.finalKb <= 300 },
                      { label: 'Economie',    value: `-${processStats.originalKb - processStats.finalKb} KB`, highlight: true },
                      { label: 'Rezoluție',   value: `${processStats.width}×${processStats.height}`, highlight: false },
                      { label: 'Calitate',    value: `${processStats.finalQuality}%`,        highlight: false },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className="text-center py-4 px-2">
                        <p className="text-[9px] uppercase tracking-widest text-emerald-600 mb-1">{label}</p>
                        <p className={`text-lg font-black ${highlight ? 'text-emerald-700' : 'text-gray-800'}`}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {processStats.wasResized && (
                    <div className="px-6 py-2 bg-amber-50 border-t border-amber-200">
                      <p className="text-[9px] uppercase tracking-widest text-amber-700 font-bold">
                        ↓ Imaginea a fost redimensionată automat de la dimensiunea originală la 1920px
                      </p>
                    </div>
                  )}
                  <div className="px-6 py-3 border-t border-emerald-200">
                    <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-widest">
                      Economie totală:{' '}
                      {Math.round((1 - processStats.finalKb / processStats.originalKb) * 100)}% ·
                      Format: WebP · SEO: napoletano-bucuresti-{galCat}-[timestamp].webp
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Grid galerie existentă ──────────────────────────────── */}
            <div className="space-y-5">

              {/* Filtre categorie */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(['all', ...GALLERY_CATEGORIES] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setFilterCat(c)}
                    className={`text-[10px] font-black px-4 py-2 uppercase tracking-widest whitespace-nowrap border rounded-full transition-all ${
                      filterCat === c ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-black'
                    }`}
                  >
                    {c === 'all' ? `TOT (${galleryItems.length})` : `${GALLERY_CATEGORY_LABELS[c]} (${galleryItems.filter(i => i.category === c).length})`}
                  </button>
                ))}
              </div>

              {filteredGallery.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300">
                    {filterCat === 'all' ? 'GALERIA ESTE GOALĂ' : `NICIUN ELEMENT ÎN CATEGORIA "${filterCat.toUpperCase()}"`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {filteredGallery.map(item => (
                    <div
                      key={item.id}
                      className="relative group aspect-square bg-gray-100 overflow-hidden rounded-xl border border-gray-200"
                    >
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.alt_text}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      )}

                      {/* Overlay hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/75 transition-all duration-300 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 p-3">
                        <span className="text-[8px] font-black uppercase text-white tracking-widest bg-white/10 border border-white/20 px-2 py-0.5 rounded">
                          {GALLERY_CATEGORY_LABELS[item.category]} · {item.type}
                        </span>
                        {item.alt_text && (
                          <p className="text-[8px] text-white/80 text-center leading-snug px-2">
                            {item.alt_text}
                          </p>
                        )}
                        <button
                          onClick={() => handleDeleteGalleryItem(item)}
                          className="mt-1 text-[9px] font-black uppercase text-red-400 hover:text-red-300 transition-colors"
                        >
                          × ȘTERGE
                        </button>
                      </div>

                      {/* Badge tip */}
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                          item.type === 'video' ? 'bg-purple-600 text-white' : 'bg-black/60 text-white'
                        }`}>
                          {item.type === 'video' ? '▶ VIDEO' : '📷 IMG'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SECȚIUNEA: MENIU
        ══════════════════════════════════════════════════════════════ */}
        {activeView === 'menu' && (
          <div className="space-y-8">

            {/* Tab-uri categorii meniu */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b">
              {Object.entries(MENU_CATEGORY_MAP).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveMenuCat(id)}
                  className={`text-[10px] font-black px-4 py-2 uppercase tracking-widest whitespace-nowrap transition-all rounded ${
                    activeMenuCat === id ? 'bg-black text-white' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Header secțiune */}
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase tracking-tighter">
                {MENU_CATEGORY_MAP[activeMenuCat]}
              </h2>
              <button
                onClick={() => setShowAddForm(v => !v)}
                className="bg-blue-600 text-white px-6 py-3 font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all rounded-lg"
              >
                {showAddForm ? '× ÎNCHIDE' : '+ ADAUGĂ PRODUS'}
              </button>
            </div>

            {/* Formular produs nou */}
            {showAddForm && (
              <div className="bg-gray-50 p-8 border-2 border-black rounded-xl space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
                  Produs nou în {MENU_CATEGORY_MAP[activeMenuCat]}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Nume Produs', key: 'name',        placeholder: 'Ex: Margherita', type: 'text'   },
                    { label: 'Preț (LEI)',  key: 'price',       placeholder: 'Ex: 35',         type: 'number' },
                    { label: 'Ingrediente',key: 'ingredients',  placeholder: 'Sos roșii, mozzarella...', type: 'text' },
                    { label: 'Gramaj',     key: 'weight',       placeholder: 'Ex: 350g',       type: 'text'   },
                  ].map(f => (
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={(newProduct as Record<string, string>)[f.key] ?? ''}
                        onChange={e => setNewProduct(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full border border-gray-300 p-3 rounded-lg bg-white font-bold focus:outline-none focus:border-black"
                      />
                    </div>
                  ))}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Label</label>
                    <select
                      className="w-full border border-gray-300 p-3 rounded-lg bg-white font-bold focus:outline-none focus:border-black"
                      value={newProduct.badge ?? ''}
                      onChange={e => setNewProduct(p => ({ ...p, badge: (e.target.value as Badge) || null }))}
                    >
                      <option value="">FĂRĂ LABEL</option>
                      <option value="new">NOUVEAUTÉ</option>
                      <option value="popular">POPULAR</option>
                      <option value="top">SIGNATURE</option>
                      <option value="hot">INTENSE</option>
                      <option value="picant">PIQUANT</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-stretch gap-4 pt-4 border-t">
                  <label className="flex-shrink-0 bg-white border-2 border-dashed border-gray-300 px-8 py-4 text-center cursor-pointer hover:border-black transition-all rounded-lg">
                    <span className="text-[10px] font-bold uppercase">
                      {newProductFile ? `✓ ${newProductFile.name}` : '📸 ÎNCARCĂ POZĂ'}
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={e => setNewProductFile(e.target.files?.[0] || null)} />
                  </label>
                  <button
                    onClick={handleAddProduct}
                    disabled={menuLoading}
                    className="flex-1 bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-gray-900 disabled:bg-gray-300 transition-all rounded-lg"
                  >
                    {menuLoading ? 'SE SALVEAZĂ...' : 'PUBLICĂ PRODUSUL PE SITE'}
                  </button>
                </div>
              </div>
            )}

            {/* Tabel produse */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-black text-white text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="p-4 w-28">Imagine</th>
                    <th className="p-4">Detalii Produs</th>
                    <th className="p-4 w-28">Preț</th>
                    <th className="p-4 w-32 text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allItems
                    .filter(i => i.category === activeMenuCat)
                    .map(item => (
                    <tr
                      key={item.id}
                      className={`transition-colors ${modifiedIds.has(item.id) ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                    >
                      {/* Imagine */}
                      <td className="p-4">
                        <div className="relative group w-20 h-20 bg-gray-100 border rounded-xl overflow-hidden">
                          {item.image_url ? (
                            <>
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                              <button
                                onClick={() => handleDeleteMenuImage(item)}
                                className="absolute inset-0 bg-red-600/85 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all uppercase"
                              >
                                Șterge
                              </button>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-all">
                              <span className="text-[9px] font-bold text-gray-400 text-center leading-tight">FĂRĂ POZĂ</span>
                              <span className="text-[8px] text-blue-600 font-black">+ ADD</span>
                              <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleUpdateMenuImage(item, e.target.files[0])} />
                            </label>
                          )}
                        </div>
                      </td>

                      {/* Detalii */}
                      <td className="p-4 space-y-1">
                        <input
                          className="font-black text-base w-full bg-transparent focus:bg-white focus:outline-none focus:border-b focus:border-blue-400 p-1 rounded"
                          value={item.name}
                          onChange={e => updateField(item.id, 'name', e.target.value)}
                        />
                        <input
                          className="text-sm text-gray-500 w-full bg-transparent focus:bg-white focus:outline-none focus:border-b focus:border-blue-400 p-1 rounded"
                          value={item.ingredients}
                          onChange={e => updateField(item.id, 'ingredients', e.target.value)}
                        />
                        <select
                          className="text-[9px] font-black border border-gray-200 uppercase p-1 rounded mt-1"
                          value={item.badge ?? ''}
                          onChange={e => updateField(item.id, 'badge', (e.target.value as Badge) || null)}
                        >
                          <option value="">Fără Badge</option>
                          <option value="new">NOUVEAUTÉ</option>
                          <option value="popular">POPULAR</option>
                          <option value="top">SIGNATURE</option>
                          <option value="hot">INTENSE</option>
                          <option value="picant">PIQUANT</option>
                        </select>
                      </td>

                      {/* Preț */}
                      <td className="p-4">
                        <div className="flex items-baseline gap-1">
                          <input
                            type="number"
                            className="w-16 text-lg font-black bg-transparent border-b border-dashed border-gray-300 focus:border-black focus:outline-none p-1"
                            value={item.price}
                            onChange={e => updateField(item.id, 'price', parseFloat(e.target.value))}
                          />
                          <span className="text-[10px] uppercase text-gray-500">Lei</span>
                        </div>
                      </td>

                      {/* Acțiuni */}
                      <td className="p-4 text-right space-y-2">
                        {modifiedIds.has(item.id) && (
                          <button
                            onClick={() => handleSaveEdit(item)}
                            className="w-full bg-emerald-600 text-white text-[9px] font-black py-2 rounded-lg uppercase animate-pulse"
                          >
                            ✓ Salvează
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="w-full text-[9px] font-bold text-red-400 hover:text-red-700 uppercase transition-colors"
                        >
                          Șterge Produs
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {allItems.filter(i => i.category === activeMenuCat).length === 0 && (
                <div className="py-16 text-center border-t">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300">
                    NICIUN PRODUS ÎN ACEASTĂ CATEGORIE
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
