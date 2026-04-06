'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, GalleryItem } from '@/lib/supabaseClient'

const TABS = [
  { id: 'all', label: 'TOT' },
  { id: 'restaurant', label: 'RESTAURANT' },
  { id: 'terasa', label: 'TERASĂ' },
  { id: 'evenimente', label: 'EVENIMENTE' },
]

// FUNCȚIE PENTRU GENERARE AUTOMATĂ ALT TEXT (SEO)
const generateAltText = (item: GalleryItem) => {
  if (item.alt_text && item.alt_text.trim() !== '') return item.alt_text;
  
  const categoryContext: Record<string, string> = {
    restaurant: 'Design interior și atmosferă restaurant Napoletano București',
    terasa: 'Terasă exterioară primitoare Napoletano Pizzeria',
    evenimente: 'Evenimente private și momente speciale la Napoletano',
    all: 'Pizza Napoletană autentică și experiență culinară italiană'
  };
  
  return `${categoryContext[item.category] || categoryContext['all']} — Foto #${item.id}`;
};

export default function GaleriePage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data as GalleryItem[])
        setLoading(false)
      })
  }, [])

  const filtered = activeTab === 'all' ? items : items.filter(i => i.category === activeTab)

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.5em] text-white/30 uppercase mb-4">
            Arhiva Vizuală · Napoletano
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-light tracking-tight mb-8">
            Galleria
          </h1>
          
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 border-b border-white/10 pb-6">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${
                  activeTab === tab.id ? 'text-white font-bold' : 'text-white/40 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square cursor-pointer group bg-zinc-900 overflow-hidden"
              onClick={() => setLightbox(item)}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={generateAltText(item)}
                  loading="lazy" // LAZY LOADING ACTIVAT
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <video src={item.url} className="w-full h-full object-cover" muted playsInline />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-[10px] tracking-widest uppercase">Vezi Detalii</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox remain as is but with optimized alt */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
             <img
                src={lightbox.url}
                alt={generateAltText(lightbox)}
                className="max-w-full max-h-[86vh] object-contain shadow-2xl"
              />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}