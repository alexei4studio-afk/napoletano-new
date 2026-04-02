'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { menuData } from '@/lib/menuData'
import { Facebook, Instagram } from 'lucide-react'

// ── STIL TRICOLOR (Doar pentru categorii/tabs pe fundal inchis) ─────────────
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
        {/* Tricolor de sus */}
        <div className="absolute top-0 left-0 right-0 flex h-[5px]">
          <div className="flex-1 bg-[#009246]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#CE2B37]" />
        </div>

        {/* BUTOANE SOCIAL MEDIA */}
        <div className="flex justify-center gap-6 mb-6">
          <a 
            href="https://www.facebook.com/ventonapoletano" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/40 hover:text-[#1877F2] transition-colors duration-300"
          >
            <Facebook size={20} />
          </a>
          <a 
            href="https://www.instagram.com/ventonapoletano" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/40 hover:text-[#E4405F] transition-colors duration-300"
          >
            <Instagram size={20} />
          </a>
          <a 
            href="https://www.tiktok.com/@ventonapoletano" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/40 hover:text-[#00f2ea] transition-colors duration-300"
          >
            {/* SVG Custom pentru TikTok */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
          </a>
        </div>

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

      {/* ── TABS (Categorii) ────────────────────── */}
      <div className="bg-[#2E2B25] border-b-[3px] border-[#CE2B37] px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center">
          {menuData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`relative flex items-center gap-2 px-4 py-4 text-[11px] tracking-[0.18em] uppercase font-bold transition-all duration-200 border-b-[3px] -mb-[3px] ${
                activeCategory === cat.id ? 'border-[#CE2B37]' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <span className="text-[15px]">{cat.icon}</span>
              <span style={TRICOLOR_TAB_STYLE}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────────── */}
      <div className="bg-[#FDF8EE] min-h-[60vh]">
        
        <AnimatePresence mode="wait">
          <motion.div key={activeCategory + '-label'} className="text-center py-7 px-4">
            <p className="font-display italic text-[#CE2B37] text-xl font-light">
              {activeData.labelIt}
            </p>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div key={activeCategory} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgba(206,43,55,0.15)] border border-[rgba(206,43,55,0.15)]">
              {activeData.items.map((item, i) => (
                <motion.div
                  key={item.name}
                  className="group relative bg-[#FFFEF5] hover:bg-[#FFFBF0] transition-colors duration-200 p-5 md:p-6"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#009246] scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300" />

                  <h3 
                    className="font-display text-[1.25rem] font-semibold text-[#1C1A17] leading-snug pr-20 uppercase"
                    style={{ fontWeight: 600 }}
                  >
                    {item.name}
                  </h3>

                  {item.nameIt && (
                    <p className="font-display italic text-[0.88rem] font-light text-[#CE2B37] mt-0.5">
                      {item.nameIt}
                    </p>
                  )}

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
        </AnimatePresence>
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