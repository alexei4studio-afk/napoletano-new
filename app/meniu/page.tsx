'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

// ─── Tipuri ───────────────────────────────────────────────────────────────────

interface Category {
  id:         number
  name:       string
  label:      string
  label_it:   string | null
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

const TRICOLOR_STYLE: React.CSSProperties = {
  background: 'linear-gradient(to right, #CE2B37 33.33%, #ffffff 33.33%, #ffffff 66.66%, #009246 66.66%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  display: 'inline-block',
}

const BADGE_MAP: Record<string, { label: string; cls: string }> = {
  new:     { label: 'Noutate',   cls: 'bg-[#009246] text-white' },
  popular: { label: 'Popular',   cls: 'bg-[#CE2B37] text-white' },
  top:     { label: 'Signature', cls: 'bg-[#1C1A17] text-white border border-white/20' },
  hot:     { label: 'Intense',   cls: 'bg-[#E85D1A] text-white' },
  picant:  { label: 'Piquant',   cls: 'bg-[#E85D1A] text-white' },
  chef:    { label: 'Chef',      cls: 'bg-[#C9922A] text-white' },
}

// ─── Grupare produse ──────────────────────────────────────────────────────────

function groupProducts(products: Product[]): { sub_title: string | null; items: Product[] }[] {
  const sorted = [...products].sort((a, b) => a.sort_order - b.sort_order)
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

// ─── Card produs (mobil-optimizat) ───────────────────────────────────────────

function ProductCard({ item, idx }: { item: Product; idx: number }) {
  const badge = item.badge ? BADGE_MAP[item.badge] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.35) }}
      className="bg-[#1C1A17] border border-white/10 overflow-hidden"
    >
      {item.image_url ? (
        // ── Cu imagine ────────────────────────────────
        <div className="flex items-start gap-4 p-4">
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="w-20 h-20 object-cover rounded flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-display text-[1.05rem] font-light text-white leading-tight">
                {item.name}
              </p>
              {badge && (
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 flex-shrink-0 ${badge.cls}`}>
                  {badge.label}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-[12px] font-body font-light text-white/45 leading-[1.6] mb-2 line-clamp-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className="font-display text-[1.3rem] font-light text-[#CE2B37]">
                {item.price > 0 ? item.price : '—'}
              </span>
              <span className="text-[10px] text-white/35 font-body">lei</span>
              {item.weight && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-[10px] tracking-[0.15em] uppercase font-body text-white/35">
                    {item.weight}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        // ── Fără imagine ──────────────────────────────
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-display text-[1.1rem] font-light text-white leading-tight">
              {item.name}
            </p>
            {badge && (
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 flex-shrink-0 ${badge.cls}`}>
                {badge.label}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-[12px] font-body font-light text-white/45 leading-[1.6] mb-3">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 border-t border-dashed border-white/10" />
            <span className="font-display text-[1.35rem] font-light text-[#CE2B37]">
              {item.price > 0 ? item.price : '—'}
            </span>
            <span className="text-[10px] text-white/35 font-body">lei</span>
            {item.weight && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-[10px] tracking-[0.15em] uppercase font-body text-white/35">
                  {item.weight}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── Conținut principal ───────────────────────────────────────────────────────

function MeniuContent() {
  const [categories,    setCategories]    = useState<Category[]>([])
  const [activeId,      setActiveId]      = useState<string>('')
  const [productsCache, setProductsCache] = useState<Record<string, Product[]>>({})
  const [loading,       setLoading]       = useState(false)
  const [catLoading,    setCatLoading]    = useState(true)
  const [error,         setError]         = useState<string | null>(null)

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
        setActiveId(String(cats[0].id))
      })
  }, [])

  const loadProducts = useCallback((categoryId: string) => {
    if (!categoryId || productsCache[categoryId]) return
    setLoading(true)
    setError(null)
    supabase
      .from('products')
      .select('*')
      .eq('category_id', parseInt(categoryId))
      .order('sort_order', { ascending: true })
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
  const activeCategory = categories.find(c => String(c.id) === activeId)

  return (
    <main className="min-h-screen bg-[#0d0d0d]">

      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      <div className="relative bg-[#1C1A17] px-4 pt-10 pb-8 text-center">

        {/* Tricolor sus */}
        <div className="absolute top-0 left-0 right-0 flex h-[5px]">
          <div className="flex-1 bg-[#009246]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#CE2B37]" />
        </div>

        <p className="text-[#CE2B37] text-[9px] tracking-[0.5em] uppercase font-body mb-2">
          Pizzerie Napoletană · București
        </p>

        <h1 className="font-display text-5xl font-light text-white mb-1">
          Napoletano
        </h1>

        <p className="text-white/35 font-body font-light text-xs tracking-[0.2em] uppercase mb-4">
          L&apos;Arte della Pizza Napoletana
        </p>

        {/* Tricolor decorativ */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-[1.5px] w-8 bg-[#CE2B37]" />
          <div className="h-[1.5px] w-8 bg-white/25" />
          <div className="h-[1.5px] w-8 bg-[#009246]" />
        </div>
      </div>

      {/* ── TABS CATEGORII ────────────────────────────────────────────────────── */}
      <div className="bg-[#2E2B25] sticky top-0 z-50 border-b border-[#CE2B37]/25">
        <div className="flex flex-wrap justify-center px-2 py-1">
          {catLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-5 py-3 w-20 animate-pulse">
                  <div className="h-2 bg-white/10 rounded" />
                </div>
              ))
            : categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveId(String(cat.id))}
                  className={`px-4 py-3.5 text-[11px] tracking-[0.15em] uppercase font-bold transition-all duration-200 border-b-2 ${
                    activeId === String(cat.id)
                      ? 'border-[#CE2B37]'
                      : 'border-transparent'
                  }`}
                >
                  <span style={TRICOLOR_STYLE}>{cat.label || cat.name}</span>
                </button>
              ))}
        </div>
      </div>

      {/* ── LISTA PRODUSE ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-8 max-w-6xl mx-auto">

        {/* Titlu categorie */}
        {activeCategory && !loading && (
          <div className="text-center mb-6">
            <h2 className="font-display text-3xl font-light text-white">
              {activeCategory.label || activeCategory.name}
            </h2>
            {activeCategory.label_it && (
              <p className="text-[11px] italic text-white/30 font-body tracking-widest mt-0.5">
                {activeCategory.label_it}
              </p>
            )}
          </div>
        )}

        {/* Spinner */}
        {loading && (
          <div className="flex justify-center py-16">
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {hasGroups
                ? groups.flatMap((group, gIdx) => [
                    group.sub_title ? (
                      <div
                        key={`sep-${gIdx}`}
                        className="col-span-full flex items-center gap-3 mt-4"
                      >
                        <div className="h-px flex-1 bg-[#CE2B37]/20" />
                        <span className="font-display text-base italic font-light text-white/40 tracking-[0.2em]">
                          {group.sub_title.charAt(0).toUpperCase() + group.sub_title.slice(1).toLowerCase()}
                        </span>
                        <div className="h-px flex-1 bg-[#CE2B37]/20" />
                      </div>
                    ) : null,
                    ...group.items.map((item, idx) => (
                      <ProductCard key={item.id} item={item} idx={idx} />
                    )),
                  ]).filter(Boolean)
                : activeProducts.map((item, idx) => (
                    <ProductCard key={item.id} item={item} idx={idx} />
                  ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !error && activeProducts.length === 0 && activeId && (
          <div className="text-center py-16">
            <p className="text-white/25 font-body text-sm tracking-widest uppercase">
              Meniu în pregătire
            </p>
          </div>
        )}
      </div>

      {/* ── FOOTER MINIMAL ────────────────────────────────────────────────────── */}
      <div className="flex h-[5px]">
        <div className="flex-1 bg-[#CE2B37]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#009246]" />
      </div>
      <div className="bg-[#1C1A17] px-4 py-6 text-center">
        <Link
          href="/"
          className="text-[#CE2B37]/60 font-body text-[11px] tracking-[0.2em] uppercase hover:text-[#CE2B37] transition-colors"
        >
          ← Vizitează site-ul complet
        </Link>
      </div>

    </main>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function MeniuPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0d0d0d]" />}>
      <MeniuContent />
    </Suspense>
  )
}
