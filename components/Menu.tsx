'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { menuData } from '@/lib/menuData'

// ── CONSTANTE STIL TRICOLOR ────────────────────────────────────────────────
const TRICOLOR_STYLE = {
  background: 'linear-gradient(to right, #009246 33.3%, #ffffff 33.3%, #ffffff 66.6%, #CE2B37 66.6%)',
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
  Top:         'bg-[#9E1A23] text-white',
  'Per 2':    'bg-[#2E2B25] text-white',
  Clasic:     'bg-[#C9922A] text-white',
}

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('pizza')
  const activeData = menuData.find((c) => c.id === activeCategory)!

  return (
    <section id="meniu" className="py-0">

      {/* ── HEADER DARK ────────────────────────────────────────────────── */}
      <div className="relative bg-[#1C1A17] text-center px-4 pt-10 pb-8">
        <div className="absolute top-0 left-0 right-0 flex h-[5px]">
          <div className="flex-1 bg-[#009246]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#CE2B37]" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-[2px] w-7 bg-[#009246]" />
          <div className="h-[2px] w-7 bg-white/40" />
          <div className="h-[2px] w-7 bg-[#CE2B37]" />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[#CE2B37] text-[10px] tracking-[0.4em] uppercase font-body mb-3"
        >
          Cucina Napoletana · București
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-5xl md:text-6xl font-light text-white mb-3"
          style={{ letterSpacing: '-0.01em' }}
        >
          Il Nostro Menù
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-white/50 font-body font-light text-sm"
        >
          Ingrediente DOP din Italia · Aluat dospit 72 ore · Cuptor cu lemne 450°C
        </motion.p>

        <div className="absolute bottom-0 left-0 right-0 flex h-[3px]">
          <div className="flex-1 bg-[#009246]" />
          <div className="flex-1 bg-white/30" />
          <div className="flex-1 bg-[#CE2B37]" />
        </div>
      </div>

      {/* ── TABS (Categorii cu Tricolor) ────────────────────────────────────── */}
      <div className="bg-[#2E2B25] border-b-[3px] border-[#CE2B37] px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center">
          {menuData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`relative flex items-center gap-2 px-4 py-4 text-[11px] tracking-[0.18em] uppercase font-bold transition-all duration-200 border-b-[3px] -mb-[3px] ${
                activeCategory === cat.id
                  ? 'border-[#CE2B37]'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <span className="text-[15px]">{cat.icon}</span>
              {/* TITLU CATEGORIE TRICOLOR */}
              <span style={TRICOLOR_STYLE} className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────────── */}
      <div className="bg-[#FDF8EE] min-h-[60vh]">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + '-label'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center py-7 px-4"
          >
            <p className="font-display italic text-[#CE2B37] text-xl font-light">
              {activeData.labelIt}
            </p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#CE2B37]/40 to-transparent" />
              <div className="w-[5px] h-[5px] bg-[#CE2B37] rotate-45" />
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#CE2B37]/40 to-transparent" />
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgba(206,43,55,0.15)] border border-[rgba(206,43,55,0.15)]">
              {activeData.items.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group relative bg-[#FFFEF5] hover:bg-[#FFFBF0] transition-colors duration-200 p-5 md:p-6"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#009246] scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300" />

                  {item.badge && (
                    <span className={`absolute top-4 right-4 text-[9px] tracking-[0.18em] uppercase font-body px-2.5 py-1 ${BADGE[item.badge] ?? 'bg-[#1C1A17] text-white'}`}>
                      {item.badge}
                    </span>
                  )}

                  {/* TITLU PRODUS TRICOLOR (MARGHERITA, etc) */}
                  <h3 
                    className="font-display text-[1.4rem] uppercase leading-snug pr-20 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
                    style={{ ...TRICOLOR_STYLE, fontWeight: 900 }}
                  >
                    {item.name}
                  </h3>

                  {item.nameIt && (
                    <p className="font-display italic text-[0.88rem] font-light text-[#CE2B37] mt-0.5">
                      {item.nameIt}
                    </p>
                  )}

                  <div className="flex items-center gap-3 my-[0.6rem]">
                    <div className="flex-1 border-b border-dashed border-[#CE2B37]/20" style={{ borderBottomWidth: '1px' }} />
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
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-6 pb-6 flex flex-wrap gap-x-5 gap-y-2 justify-center">
          {[
            { label: 'Bestseller', cls: 'bg-[#CE2B37]' },
            { label: 'Signature',  cls: 'bg-[#1C1A17]' },
            { label: 'Premium',    cls: 'bg-[#C9922A]' },
            { label: 'Veggie',      cls: 'bg-[#009246]' },
            { label: 'Picant',      cls: 'bg-[#E85D1A]' },
          ].map(({ label, cls }) => (
            <span key={label} className="flex items-center gap-1.5 text-[11px] text-[#5A5340] font-body">
              <span className={`inline-block w-[9px] h-[9px] ${cls}`} />
              {label}
            </span>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-10">
          <p className="text-center text-[11px] text-[#8C7E65] font-body font-light border-t pt-4 border-[rgba(206,43,55,0.15)]">
            * Informații despre alergeni disponibile la cerere &nbsp;·&nbsp;
            Prețurile includ TVA &nbsp;·&nbsp;
            Gramajele sunt înainte de preparare
          </p>
        </div>
      </div>

      <div className="flex h-[6px]">
        <div className="flex-1 bg-[#009246]" />
        <div className="flex-1 bg-white border-y border-[rgba(206,43,55,0.15)]" />
        <div className="flex-1 bg-[#CE2B37]" />
      </div>
    </section>
  )
}