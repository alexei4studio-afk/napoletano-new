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
  finalQuality: number;
}

interface Category {
  id:         number;
  name:       string;
  label:      string;
  label_it:   string | null;
  sort_order: number;
}

interface Product {
  id:          number;
  category_id: number;
  name:        string;
  description: string;
  price:       number;
  weight:      string | null;
  badge:       string | null;
  sub_title:   string | null;
  sort_order:  number;
  image_url:   string | null;
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
  const TARGET_BYTES = 300 * 1024;
  const timestamp    = Date.now();
  const seoFileName  = `napoletano-bucuresti-${category}-${timestamp}.webp`;

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  const wasResized = width > MAX_WIDTH;

  if (wasResized) {
    height = Math.round((height * MAX_WIDTH) / width);
    width  = MAX_WIDTH;
  }

  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

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
  const [activeView, setActiveView] = useState<'cms' | 'gallery'>('cms');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Stare GALERIE ──────────────────────────────────────────────────────────
  const [galleryItems,    setGalleryItems]    = useState<GalleryItem[]>([]);
  const [galCat,          setGalCat]          = useState<GalleryCategory>('restaurant');
  const [galType,         setGalType]         = useState<'image' | 'video'>('image');
  const [galFile,         setGalFile]         = useState<File | null>(null);
  const [galLoading,      setGalLoading]      = useState(false);
  const [uploadStep,      setUploadStep]      = useState<'idle' | 'processing' | 'uploading'>('idle');
  const [processStats,    setProcessStats]    = useState<ProcessStats | null>(null);
  const [filterCat,       setFilterCat]       = useState<GalleryCategory | 'all'>('all');

  // ── Stare CMS ──────────────────────────────────────────────────────────────
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [products,      setProducts]      = useState<Product[]>([]);
  const [cmsProdCat,    setCmsProdCat]    = useState<string>('');
  const [showCatForm,   setShowCatForm]   = useState(false);
  const [showProdForm,  setShowProdForm]  = useState(false);
  const [editingCat,    setEditingCat]    = useState<Category | null>(null);
  const [editingProd,   setEditingProd]   = useState<Product | null>(null);
  const [catForm,       setCatForm]       = useState({
    name: '', label: '', label_it: '', sort_order: '1',
  });
  const [prodForm,      setProdForm]      = useState({
    category_id: '', name: '', description: '', price: '', weight: '', badge: '', sub_title: '', sort_order: '1',
  });
  const [prodImageFile, setProdImageFile] = useState<File | null>(null);
  const [cmsLoading,    setCmsLoading]    = useState(false);

  // ── Data fetchers ──────────────────────────────────────────────────────────
  const loadGalleryItems = useCallback(async () => {
    const { data } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setGalleryItems(data as GalleryItem[]);
  }, []);

  const loadCategories = useCallback(async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) {
      setCategories(data as Category[]);
      if (data.length > 0 && !cmsProdCat) setCmsProdCat(String(data[0].id));
    }
  }, [cmsProdCat]);

  const loadProducts = useCallback(async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setProducts(data as Product[]);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSession(true);
    });
  }, []);

  useEffect(() => {
    if (session) {
      loadGalleryItems();
      loadCategories();
      loadProducts();
    }
  }, [session, loadGalleryItems, loadCategories, loadProducts]);

  // ── Handlers imagine produs CMS ────────────────────────────────────────────

  const uploadMenuImage = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage.from(MENU_BUCKET).upload(fileName, file);
    if (error) return null;
    return supabase.storage.from(MENU_BUCKET).getPublicUrl(fileName).data.publicUrl;
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

  const filteredGallery = filterCat === 'all'
    ? galleryItems
    : galleryItems.filter(i => i.category === filterCat);

  // ── Handlers CMS ───────────────────────────────────────────────────────────

  const openCatForm = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({
        name:       cat.name,
        label:      cat.label,
        label_it:   cat.label_it ?? '',
        sort_order: String(cat.sort_order),
      });
    } else {
      setEditingCat(null);
      setCatForm({ name: '', label: '', label_it: '', sort_order: String(categories.length + 1) });
    }
    setShowCatForm(true);
    setShowProdForm(false);
  };

  const openProdForm = (prod?: Product) => {
    if (prod) {
      setEditingProd(prod);
      setProdForm({
        category_id: String(prod.category_id),
        name:        prod.name,
        description: prod.description,
        price:       String(prod.price),
        weight:      prod.weight ?? '',
        badge:       prod.badge ?? '',
        sub_title:   prod.sub_title ?? '',
        sort_order:  String(prod.sort_order),
      });
    } else {
      setEditingProd(null);
      const catProducts = products.filter(p => String(p.category_id) === cmsProdCat);
      setProdForm({
        category_id: cmsProdCat,
        name: '', description: '', price: '', weight: '', badge: '', sub_title: '',
        sort_order: String(catProducts.length + 1),
      });
    }
    setProdImageFile(null);
    setShowProdForm(true);
    setShowCatForm(false);
  };

  const handleSaveCategory = async () => {
    if (!catForm.name || !catForm.label) return showToast('SLUG ȘI LABEL SUNT OBLIGATORII');
    setCmsLoading(true);
    const payload = {
      name:       catForm.name.toLowerCase().replace(/\s+/g, '_'),
      label:      catForm.label,
      label_it:   catForm.label_it || null,
      sort_order: parseInt(catForm.sort_order) || 1,
    };
    const { error } = editingCat
      ? await supabase.from('categories').update(payload).eq('id', editingCat.id)
      : await supabase.from('categories').insert(payload);
    if (!error) {
      showToast(editingCat ? 'CATEGORIE ACTUALIZATĂ' : 'CATEGORIE ADĂUGATĂ');
      setShowCatForm(false);
      setEditingCat(null);
      await loadCategories();
    } else {
      showToast('EROARE: ' + error.message);
    }
    setCmsLoading(false);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Ștergi această categorie? Produsele asociate rămân în DB.')) return;
    await supabase.from('categories').delete().eq('id', id);
    showToast('CATEGORIE ELIMINATĂ');
    loadCategories();
  };

  const handleSaveProduct = async () => {
    if (!prodForm.name || !prodForm.price || !prodForm.category_id) {
      return showToast('NUME, PREȚ ȘI CATEGORIE SUNT OBLIGATORII');
    }
    setCmsLoading(true);
    let imageUrl: string | null = editingProd?.image_url ?? null;
    if (prodImageFile) {
      const uploaded = await uploadMenuImage(prodImageFile);
      if (uploaded) imageUrl = uploaded;
    }
    const payload = {
      category_id: parseInt(prodForm.category_id),
      name:        prodForm.name,
      description: prodForm.description,
      price:       parseFloat(prodForm.price),
      weight:      prodForm.weight || null,
      badge:       prodForm.badge || null,
      sub_title:   prodForm.sub_title || null,
      sort_order:  parseInt(prodForm.sort_order) || 1,
      image_url:   imageUrl,
    };
    const { error } = editingProd
      ? await supabase.from('products').update(payload).eq('id', editingProd.id)
      : await supabase.from('products').insert(payload);
    if (!error) {
      showToast(editingProd ? 'PRODUS ACTUALIZAT' : 'PRODUS ADĂUGAT');
      setShowProdForm(false);
      setEditingProd(null);
      setProdImageFile(null);
      await loadProducts();
    } else {
      showToast('EROARE: ' + error.message);
    }
    setCmsLoading(false);
  };

  const handleDeleteCmsProduct = async (prod: Product) => {
    if (!confirm('Ștergi definitiv acest produs?')) return;
    if (prod.image_url) {
      const fileName = prod.image_url.split('/').pop();
      if (fileName) await supabase.storage.from(MENU_BUCKET).remove([fileName]);
    }
    await supabase.from('products').delete().eq('id', prod.id);
    showToast('PRODUS ELIMINAT');
    loadProducts();
  };

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
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-black text-lg tracking-tighter whitespace-nowrap">
            NAPOLETANO <span className="text-gray-400 font-light">ADMIN</span>
          </span>

          {/* Switcher secțiuni */}
          <div className="flex overflow-hidden border border-gray-200 rounded-lg">
            {(['cms', 'gallery'] as const).map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`text-[10px] font-black px-4 py-2 uppercase tracking-widest transition-all ${
                  activeView === v ? 'bg-black text-white' : 'text-gray-400 hover:text-black'
                }`}
              >
                {v === 'cms' ? 'CMS' : 'GALERIE MEDIA'}
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
            SECȚIUNEA: CMS — CATEGORII + PRODUSE
        ══════════════════════════════════════════════════════════════ */}
        {activeView === 'cms' && (
          <div className="space-y-8">

            {/* Header luxury dark */}
            <div className="bg-[#0d0d0d] rounded-2xl overflow-hidden">
              {/* Tricolor accent — verde / alb / roșu (italian) */}
              <div className="flex h-1">
                <div className="flex-1 bg-[#009246]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#ce2b37]" />
              </div>
              <div className="px-8 py-6 flex items-end justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.5em] uppercase text-white/40 mb-1">Admin · Meniu Special</p>
                  <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide">
                    Gestiune Categorii &amp; Produse
                  </h2>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-[10px] uppercase tracking-widest text-white/30">
                    {categories.length} categorii · {products.length} produse
                  </p>
                </div>
              </div>
            </div>

            {/* Layout 2 coloane */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

              {/* ── Coloana STÂNGA: CATEGORII ─────────────────────────────── */}
              <div className="space-y-4">

                {/* Header categorii */}
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl tracking-wide text-[#0d0d0d]">Categorii</h3>
                  <button
                    onClick={() => openCatForm()}
                    className="text-[10px] font-black uppercase tracking-widest bg-[#0d0d0d] text-white px-5 py-2.5 rounded-lg hover:bg-[#222] transition-all"
                  >
                    + Adaugă
                  </button>
                </div>

                {/* Formular categorie inline */}
                {showCatForm && (
                  <div className="bg-[#0d0d0d] rounded-xl p-6 space-y-4 border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">
                      {editingCat ? 'Editează Categorie' : 'Categorie Nouă'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Slug (cheie DB)', key: 'name',     placeholder: 'mic_dejun'       },
                        { label: 'Label Română',    key: 'label',    placeholder: 'Mic Dejun'        },
                        { label: 'Label Italiană',  key: 'label_it', placeholder: 'Prima Colazione'  },
                      ].map(f => (
                        <div key={f.key} className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">{f.label}</label>
                          <input
                            type="text"
                            placeholder={f.placeholder}
                            value={(catForm as Record<string, string>)[f.key]}
                            onChange={e => setCatForm(p => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-white/40"
                          />
                        </div>
                      ))}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Ordine (sort_order)</label>
                        <input
                          type="number"
                          min="1"
                          value={catForm.sort_order}
                          onChange={e => setCatForm(p => ({ ...p, sort_order: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-white/40"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveCategory}
                        disabled={cmsLoading}
                        className="flex-1 bg-white text-black py-3 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-cream-100 transition-all disabled:opacity-50"
                      >
                        {cmsLoading ? 'SE SALVEAZĂ...' : 'SALVEAZĂ'}
                      </button>
                      <button
                        onClick={() => { setShowCatForm(false); setEditingCat(null); }}
                        className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border border-white/20 text-white/60 rounded-lg hover:border-white/40 transition-all"
                      >
                        ANULEAZĂ
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista categorii */}
                <div className="space-y-2">
                  {categories.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-100 rounded-xl py-12 text-center">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300">
                        NICIO CATEGORIE — ADAUGĂ PRIMA CATEGORIE
                      </p>
                    </div>
                  ) : (
                    categories.map(cat => (
                      <div
                        key={cat.id}
                        onClick={() => setCmsProdCat(String(cat.id))}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all group cursor-pointer ${
                          cmsProdCat === String(cat.id)
                            ? 'bg-[#0d0d0d] border-[#0d0d0d]'
                            : 'bg-[#f7f5f0] border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`font-black text-sm truncate ${cmsProdCat === String(cat.id) ? 'text-white' : ''}`}>{cat.label}</p>
                          <p className={`text-[9px] uppercase tracking-widest ${cmsProdCat === String(cat.id) ? 'text-white/50' : 'text-gray-400'}`}>
                            #{cat.sort_order} · <span className="font-mono">{cat.name}</span>
                            {cat.label_it && <span className="ml-1 italic">· {cat.label_it}</span>}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => openCatForm(cat)}
                            className={`text-[9px] font-black uppercase px-3 py-1.5 border rounded-lg transition-all ${cmsProdCat === String(cat.id) ? 'border-white/30 text-white hover:bg-white hover:text-black' : 'border-gray-300 hover:bg-black hover:text-white hover:border-black'}`}
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-[9px] font-black uppercase px-3 py-1.5 border border-red-200 text-red-400 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ── Coloana DREAPTA: PRODUSE ──────────────────────────────── */}
              <div className="space-y-4">

                {/* Header produse */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="font-display text-2xl tracking-wide text-[#0d0d0d]">Produse</h3>
                  <div className="flex gap-2 items-center">
                    {categories.length > 0 && (
                      <select
                        value={cmsProdCat}
                        onChange={e => setCmsProdCat(e.target.value)}
                        className="text-[10px] font-black uppercase border border-gray-200 p-2 rounded-lg focus:outline-none focus:border-black bg-white"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={String(c.id)}>{c.label}</option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => openProdForm()}
                      className="text-[10px] font-black uppercase tracking-widest bg-[#0d0d0d] text-white px-5 py-2.5 rounded-lg hover:bg-[#222] transition-all whitespace-nowrap"
                    >
                      + Adaugă
                    </button>
                  </div>
                </div>

                {/* Formular produs inline */}
                {showProdForm && (
                  <div className="bg-[#0d0d0d] rounded-xl p-6 space-y-4 border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">
                      {editingProd ? 'Editează Produs' : 'Produs Nou'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">

                      {/* Categorie */}
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Categorie</label>
                        <select
                          value={prodForm.category_id}
                          onChange={e => setProdForm(p => ({ ...p, category_id: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-white/40"
                        >
                          <option value="">— Alege categoria —</option>
                          {categories.map(c => (
                            <option key={c.id} value={String(c.id)}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Nume */}
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Nume</label>
                        <input
                          type="text"
                          placeholder="Ex: Spaghetti Carbonara"
                          value={prodForm.name}
                          onChange={e => setProdForm(p => ({ ...p, name: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-white/40"
                        />
                      </div>

                      {/* Ingrediente → coloana description în DB */}
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                          Ingrediente <span className="text-white/20 normal-case">(scrie în coloana &ldquo;description&rdquo; din DB)</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ex: Spaghetti, bacon, ou, parmezan, piper"
                          value={prodForm.description}
                          onChange={e => setProdForm(p => ({ ...p, description: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-white/40 resize-none"
                        />
                      </div>

                      {/* Grup / Sub-titlu */}
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                          Grup <span className="text-white/20 normal-case">(ex: PUI, PORC, VITĂ — scrie în coloana &ldquo;sub_title&rdquo; din DB)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: PUI"
                          value={prodForm.sub_title}
                          onChange={e => setProdForm(p => ({ ...p, sub_title: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-white/40"
                        />
                      </div>

                      {/* Preț */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Preț (LEI)</label>
                        <input
                          type="number"
                          placeholder="49"
                          value={prodForm.price}
                          onChange={e => setProdForm(p => ({ ...p, price: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-white/40"
                        />
                      </div>

                      {/* Gramaj */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Gramaj</label>
                        <input
                          type="text"
                          placeholder="Ex: 250gr"
                          value={prodForm.weight}
                          onChange={e => setProdForm(p => ({ ...p, weight: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-white/40"
                        />
                      </div>

                      {/* Badge */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Badge</label>
                        <select
                          value={prodForm.badge}
                          onChange={e => setProdForm(p => ({ ...p, badge: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-white/40"
                        >
                          <option value="">Fără badge</option>
                          <option value="new">Nouveauté</option>
                          <option value="popular">Popular</option>
                          <option value="top">Signature</option>
                          <option value="hot">Intense</option>
                          <option value="picant">Piquant</option>
                        </select>
                      </div>

                      {/* Sort order */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Ordine</label>
                        <input
                          type="number"
                          min="1"
                          value={prodForm.sort_order}
                          onChange={e => setProdForm(p => ({ ...p, sort_order: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-white/40"
                        />
                      </div>

                      {/* Upload imagine */}
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Imagine (opțional)</label>
                        <label className="flex items-center gap-3 w-full border border-dashed border-white/20 rounded-lg p-3 cursor-pointer hover:border-white/40 transition-all">
                          <span className="text-[10px] font-bold uppercase text-white/50">
                            {prodImageFile ? `✓ ${prodImageFile.name}` : '📸 Selectează imagine'}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={e => setProdImageFile(e.target.files?.[0] || null)}
                          />
                        </label>
                        {editingProd?.image_url && !prodImageFile && (
                          <p className="text-[8px] text-white/30 italic">Imagine existentă va fi păstrată dacă nu selectezi alta.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveProduct}
                        disabled={cmsLoading}
                        className="flex-1 bg-white text-black py-3 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-cream-100 transition-all disabled:opacity-50"
                      >
                        {cmsLoading ? 'SE SALVEAZĂ...' : 'SALVEAZĂ PRODUSUL'}
                      </button>
                      <button
                        onClick={() => { setShowProdForm(false); setEditingProd(null); }}
                        className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border border-white/20 text-white/60 rounded-lg hover:border-white/40 transition-all"
                      >
                        ANULEAZĂ
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista produse — grupate după sub_title, sortate după sort_order */}
                {(() => {
                  const filtered = products
                    .filter(p => String(p.category_id) === cmsProdCat)
                    .sort((a, b) => {
                      const ga = (a.sub_title ?? '').toLowerCase();
                      const gb = (b.sub_title ?? '').toLowerCase();
                      if (ga < gb) return -1;
                      if (ga > gb) return 1;
                      return a.sort_order - b.sort_order;
                    });

                  if (filtered.length === 0) return (
                    <div className="border-2 border-dashed border-gray-100 rounded-xl py-12 text-center">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300">
                        {cmsProdCat
                          ? `NICIUN PRODUS ÎN "${cmsProdCat.toUpperCase()}"`
                          : 'SELECTEAZĂ O CATEGORIE'}
                      </p>
                    </div>
                  );

                  const rows: React.ReactNode[] = [];
                  let lastGroup: string | null = undefined as unknown as null;

                  filtered.forEach(prod => {
                    const group = prod.sub_title ?? '';
                    if (group !== lastGroup) {
                      lastGroup = group;
                      if (group) {
                        rows.push(
                          <div key={`grp-${group}`} className="flex items-center gap-3 pt-2 pb-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
                              {group}
                            </span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                        );
                      }
                    }
                    rows.push(
                      <div
                        key={prod.id}
                        className="flex items-center gap-3 p-4 bg-[#f7f5f0] rounded-xl border border-transparent hover:border-gray-200 transition-all group"
                      >
                        {prod.image_url ? (
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] text-gray-400 font-bold">IMG</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-black text-sm truncate">{prod.name}</p>
                            {prod.badge && (
                              <span className="text-[7px] font-black uppercase px-1.5 py-0.5 bg-[#c0392b] text-white rounded">
                                {prod.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                            #{prod.sort_order} · {prod.price} lei
                            {prod.weight && <span className="ml-1">· {prod.weight}</span>}
                          </p>
                          {prod.description && (
                            <p className="text-[9px] text-gray-500 truncate mt-0.5">{prod.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                          <button
                            onClick={() => openProdForm(prod)}
                            className="text-[9px] font-black uppercase px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-black hover:text-white hover:border-black transition-all"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteCmsProduct(prod)}
                            className="text-[9px] font-black uppercase px-3 py-1.5 border border-red-200 text-red-400 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  });

                  return <div className="space-y-1">{rows}</div>;
                })()}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
