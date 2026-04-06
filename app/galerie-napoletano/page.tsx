'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TABS = [
  { id: 'all', label: 'TOT' },
  { id: 'restaurant', label: 'RESTAURANT' },
  { id: 'terasa', label: 'TERASĂ' },
  { id: 'evenimente', label: 'EVENIMENTE' },
]

interface GalleryItem {
  id: number
  url: string
  category: string
  type: 'image' | 'video'
  alt_text: string
  created_at: string
}

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
    <main className="min-h-screen bg-black text-white">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-24 text-center border-b border-white/10"
      >
        <p className="text-[10px] tracking-[0.55em] uppercase text-white/30 mb-5">
          Napoletano · București
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-light tracking-[0.15em] uppercase">
          La Nostra Cucina — Galerie
        </h1>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-10 py-8 border-b border-white/10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-[10px] tracking-[0.45em] uppercase transition-all duration-400 pb-px ${
              activeTab === tab.id
                ? 'text-white border-b border-white'
                : 'text-white/35 hover:text-white/65'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <p className="text-[10px] tracking-[0.45em] uppercase text-white/25 animate-pulse">
              SE ÎNCARCĂ...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-40">
            <p className="text-[10px] tracking-[0.45em] uppercase text-white/25">
              NICIUN ELEMENT ÎN ACEASTĂ CATEGORIE
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px]"
          >
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className={`relative aspect-square overflow-hidden group bg-zinc-900 ${
                    item.type === 'image' ? 'cursor-zoom-in' : 'cursor-pointer'
                  }`}
                  onClick={() => item.type === 'image' && setLightbox(item)}
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.alt_text || 'Napoletano București'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={e => {
                        const v = e.target as HTMLVideoElement
                        v.pause()
                        v.currentTime = 0
                      }}
                      onClick={e => {
                        e.stopPropagation()
                        setLightbox(item)
                      }}
                    />
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-400" />

                  {item.type === 'video' && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 px-2.5 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                      <span className="text-[8px] tracking-[0.35em] uppercase text-white/70">VIDEO</span>
                    </div>
                  )}

                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[8px] tracking-[0.3em] uppercase text-white/50 bg-black/50 px-2 py-0.5">
                      {item.category.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/96 z-50 flex items-center justify-center p-6"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-7 right-8 text-[10px] tracking-[0.45em] uppercase text-white/40 hover:text-white transition-colors duration-200"
              onClick={() => setLightbox(null)}
            >
              ÎNCHIDE ×
            </button>

            {lightbox.type === 'image' ? (
              <motion.img
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.35 }}
                src={lightbox.url}
                alt={lightbox.alt_text || 'Napoletano București'}
                className="max-w-full max-h-[86vh] object-contain shadow-2xl"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <motion.video
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.35 }}
                src={lightbox.url}
                controls
                autoPlay
                className="max-w-full max-h-[86vh] shadow-2xl"
                onClick={e => e.stopPropagation()}
              />
            )}

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.4em] uppercase text-white/25">
              {lightbox.category.toUpperCase()} · NAPOLETANO
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
