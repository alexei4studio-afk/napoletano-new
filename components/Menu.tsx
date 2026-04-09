'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { Facebook, Instagram } from 'lucide-react'

// ─── Tipuri ───────────────────────────────────────────────────────────────────

interface Category {
  id:         number
  name:       string
  label:      string
  label_it:   string | null
  icon:       string | null
  sort_order: number
}

interface Product {
  id:          number
  category_id: string
  name:        string
  description: string
  price:       number
  weight:      string | null
  badge:       string | null
  sub_title:   string | null
  sort_order:  number
  image_url:   string | null
}

// ─── Constante design ─────────────────────────────────────────────────────────

const TRICOLOR_TAB_STYLE = {
  background: 'linear-gradient(to right, #CE2B37 33.33%, #ffffff 33.33%, #ffffff 66.66%, #009246 66.66%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
}

// Badge DB value → { label, class }
const BADGE_MAP: Record<string, { label: string; cls: string }> = {
  new:     { label: 'Noutate',   cls: 'bg-[#009246] text-white' },
  popular: { label: 'Popular',   cls: 'bg-[#CE2B37] text-white' },
  top:     { label: 'Signature', cls: 'bg-[#1C1A17] text-white' },
  hot:     { label: 'Intense',   cls: 'bg-[#E85D1A] text-white' },
  picant:  { label: 'Piquant',   cls: 'bg-[#E85D1A] text-white' },
  chef:    { label: 'Chef',      cls: 'bg-[#C9922A] text-white' },
}

// ─── Grupare produse după sub_title ──────────────────────────────────────────

function groupProducts(products: Product[]): { sub_title: string | null; items: Product[] }[] {
  const sorted = [...products].sort((a, b) => {
    const ga = a.sub_title ?? ''
    const gb = b.sub_title ?? ''
    if (ga < gb) return -1
    if (ga > gb) return 1
    return a.sort_order - b.sort_order
  })

  const groups: { sub_title: string | null; items: Product[] }[] = []
  let lastGroup: string | null | undefined = undefined

  for (const prod of sorted) {
    const g = prod.sub_title ?? null
    if (g !== lastGroup) {
      lastGroup = g
      groups.push({ sub_title: g, items: [] })
    }
    groups[groups.length - 1].items.push(prod)
  }

  return groups
}

// ─── Card produs ─────────────────────────────────────────────────────────────

function ProductCard({ item, idx }: { item: Product; idx: number }) {
  const badge = item.badge ? BADGE_MAP[item.badge] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4) }}
      className="bg-white border border-[#E8E0D5] p-6 hover:shadow-md transition-shadow duration-300"
    >
      {/* Imagine produs (opțional) */}
      {item.image_url && (
        <div className="mb-4 -mx-6 -mt-6 overflow-hidden h-40">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="font-display text-[1.2rem] font-light text-[#1C1A17] leading-tight">
          {item.name}
        </p>
        {badge && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 flex-shrink-0 ${badge.cls}`}>
            {badge.label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 my-[0.6rem]">
        <div className="flex-1 border-b border-dashed border-[#CE2B37]/20" />
        <span className="font-display text-[1.45rem] font-light text-[#1C1A17]">
          {item.price > 0 ? item.price : '—'}
        </span>
        <span className="text-[11px] text-[#8C7E65] font-body">lei</span>
      </div>

      {item.description && (
        <p className="text-[13px] font-body font-light text-[#3D3428] leading-[1.7]">
          {item.description}
        </p>
      )}

      {item.weight && (
        <p className="mt-3 text-[10px] tracking-[0.2em] uppercase font-body text-[#8C7E65]">
          {item.weight}
        </p>
      )}
    </motion.div>
  )
}

// ─── Componenta principală ────────────────────────────────────────────────────

export default function Menu() {
  const [categories,    setCategories]    = useState<Category[]>([])
  const [activeId,      setActiveId]      = useState<string>('')
  const [productsCache, setProductsCache] = useState<Record<string, Product[]>>({})
  const [loading,       setLoading]       = useState(false)
  const [catLoading,    setCatLoading]    = useState(true)
  const [error,         setError]         = useState<string | null>(null)

  // Încarcă categoriile la mount
  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error: err }) => {
        setCatLoading(false)
        if (err || !data || data.length === 0) return
        const cats = data as Category[]
        setCategories(cats)
        setActiveId(cats[0].name)
      })
  }, [])

  // Încarcă produse pentru categoria activă (cu cache)
  const loadProducts = useCallback((categoryId: string) => {
    if (!categoryId) return
    if (productsCache[categoryId]) return
    setLoading(true)
    setError(null)
    supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .then(({ data, error: err }) => {
        setLoading(false)
        if (err || !data) {
          setError('Eroare la încărcarea meniului. Reîncarcă pagina.')
          return
        }
        setProductsCache(prev => ({ ...prev, [categoryId]: data as Product[] }))
      })
  }, [productsCache])

  useEffect(() => {
    loadProducts(activeId)
  }, [activeId, loadProducts])

  const activeProducts = productsCache[activeId] ?? []
  const groups = groupProducts(activeProducts)
  const hasGroups = groups.some(g => g.sub_title !== null)

  const activeCategory = categories.find(c => c.name === activeId)

  return (
    <section id="meniu" className="py-0">

      {/* ── HEADER DARK ─────────────────────────────────────────────────────── */}
      <div className="relative bg-[#1C1A17] text-center px-4 pt-10 pb-8">

        {/* Tricolor sus */}
        <div className="absolute top-0 left-0 right-0 flex h-[5px]">
          <div className="flex-1 bg-[#009246]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#CE2B37]" />
        </div>

        {/* Social + Delivery */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
          <div className="flex items-center gap-6">
            <a href="https://www.facebook.com/ventonapoletano" target="_blank" rel="noopener noreferrer" className="text-[#1877F2]/50 hover:text-[#1877F2] transition-all duration-300">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/ventonapoletano" target="_blank" rel="noopener noreferrer" className="text-[#E4405F]/50 hover:text-[#E4405F] transition-all duration-300">
              <Instagram size={20} />
            </a>
            <a href="https://www.tiktok.com/@ventonapoletano" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
            </a>
          </div>

          <div className="hidden sm:block w-px h-5 bg-white/15" />

          <div className="flex items-center gap-6">
            <a href="https://wolt.com/ro/ro/rou/bucharest/restaurant/napoletano-6881e1f8128fa8d9f6654e08" target="_blank" title="Wolt" className="text-[#009DE0]/50 hover:text-[#009DE0] transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6L4.8 14L7 8.5L10 14L12.2 6L14.5 11.5L17 6" /></svg>
            </a>
            <a href="https://glovoapp.com/ro/ro/bucharest/stores/napoletan-buc" target="_blank" title="Glovo" className="text-[#FFC244]/50 hover:text-[#FFC244] transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2C7.239 2 5 4.239 5 7c0 4.5 5 11 5 11s5-6.5 5-11c0-2.761-2.239-5-5-5z" /><circle cx="10" cy="7" r="2" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://food.bolt.eu/ro-ro/325-bucharest/p/152391-napoletano/" target="_blank" title="Bolt Food" className="text-[#34D186]/50 hover:text-[#34D186] transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11.5 2L4.5 11H9.5L8.5 18L15.5 9H10.5L11.5 2Z" /></svg>
            </a>
          </div>
        </div>

        {/* Tricolor decorativ */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-[2px] w-7 bg-[#CE2B37]" />
          <div className="h-[2px] w-7 bg-white/40" />
          <div className="h-[2px] w-7 bg-[#009246]" />
        </div>

        <motion.p className="text-[#CE2B37] text-[10px] tracking-[0.4em] uppercase font-body mb-3">
          Cucina Napoletana · București
        </motion.p>
        <motion.h2 className="font-display text-5xl md:text-6xl font-light text-white mb-3">
          Il Nostro Menù
        </motion.h2>
        <motion.p className="text-white/50 font-body font-light text-sm">
          Ingrediente DOP din Italia · Aluat dospit 72 ore · Cuptor cu lemne 450°C
        </motion.p>
      </div>

      {/* ── TABS ─────────────────────────────────────────────────────────────── */}
      <div className="bg-[#2E2B25] border-b-[3px] border-[#CE2B37] px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center">
          {catLoading ? (
            // Skeleton tabs
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-4 py-4 w-20 animate-pulse">
                <div className="h-2 bg-white/10 rounded" />
              </div>
            ))
          ) : (
            categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setActiveId(cat.name)}
                className={`relative flex items-center gap-2 px-4 py-4 text-[11px] tracking-[0.18em] uppercase font-bold transition-all duration-200 border-b-[3px] -mb-[3px] ${
                  activeId === cat.name
                    ? 'text-white border-[#CE2B37]'
                    : 'text-white/40 border-transparent hover:text-white/70 hover:border-white/20'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span style={TRICOLOR_TAB_STYLE}>{cat.label}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#FAF7F2] min-h-[400px] px-4 py-12">
        <div className="max-w-7xl mx-auto">

          {/* Titlu categorie curentă */}
          {activeCategory && !loading && (
            <div className="text-center mb-10">
              <p className="font-display text-4xl md:text-5xl font-light text-[#1C1A17]">
                {activeCategory.label}
              </p>
              {activeCategory.label_it && (
                <p className="text-[12px] italic text-[#8C7E65] font-body tracking-widest mt-1">
                  {activeCategory.label_it}
                </p>
              )}
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#CE2B37]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-center text-[#CE2B37] font-body text-sm py-10">{error}</p>
          )}

          <AnimatePresence mode="wait">
            {!loading && !error && activeProducts.length > 0 && (
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {hasGroups ? (
                    // ── Redare cu grupuri (sub_title headers) ───────────────
                    groups.map((group, gIdx) => (
                      <>
                        {/* Separator grup */}
                        {group.sub_title && (
                          <div
                            key={`sep-${group.sub_title}`}
                            className={`col-span-full flex items-center gap-4 ${gIdx === 0 ? 'mb-2' : 'mt-8 mb-2'}`}
                          >
                            <div className="h-px flex-1 bg-[#CE2B37]/25" />
                            <span className="font-display text-xl italic font-light text-[#8C7E65] tracking-[0.25em] whitespace-nowrap">
                              {group.sub_title.charAt(0).toUpperCase() + group.sub_title.slice(1).toLowerCase()}
                            </span>
                            <div className="h-px flex-1 bg-[#CE2B37]/25" />
                          </div>
                        )}
                        {/* Carduri grup */}
                        {group.items.map((item, idx) => (
                          <ProductCard key={item.id} item={item} idx={idx} />
                        ))}
                      </>
                    ))
                  ) : (
                    // ── Redare simplă fără grupuri ───────────────────────────
                    activeProducts.map((item, idx) => (
                      <ProductCard key={item.id} item={item} idx={idx} />
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mesaj gol */}
          {!loading && !error && activeProducts.length === 0 && activeId && (
            <div className="text-center py-20">
              <p className="text-[#8C7E65] font-body text-sm tracking-widest uppercase">
                Meniu în pregătire
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tricolor jos */}
      <div className="flex h-[6px]">
        <div className="flex-1 bg-[#CE2B37]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#009246]" />
      </div>
    </section>
  )
}
