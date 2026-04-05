'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, MenuItemRow } from '@/lib/supabaseClient'
import { menuData } from '@/lib/menuData'
import { Facebook, Instagram } from 'lucide-react'

const TRICOLOR_TAB_STYLE = {
  background: 'linear-gradient(to right, #CE2B37 33.33%, #ffffff 33.33%, #ffffff 66.66%, #009246 66.66%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
}

const BADGE: Record<string, string> = {
  Bestseller: 'bg-[#CE2B37] text-white',
  Signature:  'bg-[#1C1A17] text-white',
  Premium:    'bg-[#C9922A] text-white',
  Picantă:    'bg-[#E85D1A] text-white',
  Veggie:     'bg-[#009246] text-white',
  Top:        'bg-[#9E1A23] text-white',
  'Per 2':    'bg-[#2E2B25] text-white',
  Clasic:     'bg-[#C9922A] text-white',
}

function toMenuItem(row: MenuItemRow) {
  return {
    name:        row.name,
    nameIt:      row.name_it  ?? undefined,
    ingredients: row.ingredients,
    price:       row.price,
    weight:      row.weight   ?? undefined,
    badge:       row.badge    ?? undefined,
  }
}

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('pizza')
  const [itemsCache, setItemsCache] = useState<Record<string, ReturnType<typeof toMenuItem>[]>>({})
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const activeData  = menuData.find((c) => c.id === activeCategory)!
  const activeItems = itemsCache[activeCategory]

  useEffect(() => {
    if (itemsCache[activeCategory]) return
    setLoading(true)
    setError(null)
    supabase
      .from('menu_items')
      .select('*')
      .eq('category_id', activeCategory)
      .order('sort_order', { ascending: true })
      .then(({ data, error: err }) => {
        setLoading(false)
        if (err || !data) {
          setError('Eroare la încărcarea meniului. Reîncarcă pagina.')
          return
        }
        setItemsCache((prev) => ({
          ...prev,
          [activeCategory]: (data as MenuItemRow[]).map(toMenuItem),
        }))
      })
  }, [activeCategory]) // eslint-disable-line react-hooks/exhaustive-deps

  const items = activeItems ?? []

  return (
    <section id="meniu" className="py-0">

      {/* ── HEADER DARK ─────────────────────────────────────────────────── */}
      <div className="relative bg-[#1C1A17] text-center px-4 pt-10 pb-8">

        {/* Tricolor sus */}
        <div className="absolute top-0 left-0 right-0 flex h-[5px]">
          <div className="flex-1 bg-[#009246]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#CE2B37]" />
        </div>

        {/* Social + Delivery */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-8">

          {/* Social */}
          <div className="flex items-center gap-6">
            <a href="https://www.facebook.com/ventonapoletano" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
               className="text-[#1877F2]/50 hover:text-[#1877F2] hover:drop-shadow-[0_0_8px_#1877F2] transition-all duration-300">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/ventonapoletano" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
               className="text-[#E4405F]/50 hover:text-[#E4405F] hover:drop-shadow-[0_0_8px_#E4405F] transition-all duration-300">
              <Instagram size={20} />
            </a>
            <a href="https://www.tiktok.com/@ventonapoletano" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
               className="text-white/40 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-5 bg-white/15" />

          {/* Delivery */}
          <div className="flex items-center gap-6">
            <a href="https://wolt.com/ro-ro/rou/bucharest/restaurant/napoletano-6881e1f8128fa8d9f6654e08"
               target="_blank" rel="noopener noreferrer" aria-label="Comandă pe Wolt" title="Wolt"
               className="text-[#009DE0]/50 hover:text-[#009DE0] hover:drop-shadow-[0_0_8px_#009DE0] transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6L4.8 14L7 8.5L10 14L12.2 6L14.5 11.5L17 6"/>
              </svg>
            </a>
            <a href="https://glovoapp.com/ro/ro/bucharest/stores/napoletan-buc"
               target="_blank" rel="noopener noreferrer" aria-label="Comandă pe Glovo" title="Glovo"
               className="text-[#FFC244]/50 hover:text-[#FFC244] hover:drop-shadow-[0_0_8px_#FFC244] transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2C7.239 2 5 4.239 5 7c0 4.5 5 11 5 11s5-6.5 5-11c0-2.761-2.239-5-5-5z"/>
                <circle cx="10" cy="7" r="2" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="https://food.bolt.eu/ro-ro/325-bucharest/p/152391-napoletano/"
               target="_blank" rel="noopener noreferrer" aria-label="Comandă pe Bolt Food" title="Bolt Food"
               className="text-[#34D186]/50 hover:text-[#34D186] hover:drop-shadow-[0_0_8px_#34D186] transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.5 2L4.5 11H9.5L8.5 18L15.5 9H10.5L11.5 2Z"/>
              </svg>
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

      {/* ── TABS ──────────────────────────────────────────────── */}
      <div className="bg-[#2E2B25] border-b-[3px] border-[#CE2B37] px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center">
          {menuData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`relative flex items-center gap-2 px-4 py-4 text-[11px] tracking-[0.18em] uppercase font-bold transition-all duration-200 border-b-[3px] -mb-[3px] ${
                activeCategory === cat.id
                  ? 'text-white border-[#CE2B37]'
                  : 'text-white/40 border-transparent hover:text-white/70 hover:border-white/20'
              }`}
            >
              <span>{cat.icon}</span>
              <span style={activeCategory === cat.id ? TRICOLOR_TAB_STYLE : undefined}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────── */}
      <div className="bg-[#FAF7F2] min-h-[400px] px-4 py-12">
        <div className="max-w-7xl mx-auto">

          {loading && (
            <div className="flex justify-center py-20">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
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
            {!loading && !error && (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >      
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.04 }}
                      className="bg-white border border-[#E8E0D5] p-6 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <p className="font-display text-[1.2rem] font-light text-[#1C1A17] leading-tight">
                            {item.name}
                          </p>
                          {item.nameIt && (
                            <p className="text-[11px] italic text-[#8C7E65] font-body mt-0.5">
                              {item.nameIt}
                            </p>
                          )}
                        </div>
                        {item.badge && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 flex-shrink-0 ${
                            BADGE[item.badge] ?? 'bg-gray-200 text-gray-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 my-[0.6rem]">
                        <div className="flex-1 border-b border-dashed border-[#CE2B37]/20" />
                        <span className="font-display text-[1.45rem] font-light text-[#1C1A17]">
                          {item.price}
                        </span>
                        <span className="text-[11px] text-[#8C7E65] font-body">lei</span>
                      </div>

                      <p className="text-[13px] font-body font-light text-[#3D3428] leading-[1.7]">
                        {item.ingredients}
                      </p>

                      {item.weight && (
                        <p className="mt-3 text-[10px] tracking-[0.2em] uppercase font-body text-[#8C7E65]">
                          Gramaj: {item.weight}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FOOTER TRICOLOR */}
      <div className="flex h-[6px]">
        <div className="flex-1 bg-[#CE2B37]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#009246]" />
      </div>
    </section>
  )
}