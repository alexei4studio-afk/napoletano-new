'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { supabase, GalleryItem } from '@/lib/supabaseClient'

const TABS = [
  { id: 'all', label: 'TOT' },
  { id: 'restaurant', label: 'RESTAURANT' },
  { id: 'terasa', label: 'TERASĂ' },
  { id: 'evenimente', label: 'EVENIMENTE' },
]

const generateAltText = (item: GalleryItem) => {
  if (item.alt_text && item.alt_text.trim() !== '') return item.alt_text

  const categoryContext: Record<string, string> = {
    restaurant: 'Design interior și atmosferă restaurant Napoletano București',
    terasa: 'Terasă exterioară primitoare Napoletano Pizzeria',
    evenimente: 'Evenimente private și momente speciale la Napoletano',
    all: 'Pizza Napoletană autentică și experiență culinară italiană',
  }

  return `${categoryContext[item.category] || categoryContext['all']} — Foto #${item.id}`
}

export default function GaleriePage() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [activeTab, setActiveTab] = useState(searchParams.get('category') || 'all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
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

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const goPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex(i => (i !== null && i > 0 ? i - 1 : i))
  }, [])

  const goNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex(i => (i !== null && i < filtered.length - 1 ? i + 1 : i))
  }, [filtered.length])

  useEffect(() => {
    if (lightboxIndex === null) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i !== null && i > 0 ? i - 1 : i))
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i !== null && i < filtered.length - 1 ? i + 1 : i))
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, filtered.length, closeLightbox])

  const currentItem = lightboxIndex !== null ? filtered[lightboxIndex] : null

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">

        {/* Back to Home */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white/60 group-hover:border-white/60 group-hover:text-white transition-all duration-300">
              <ArrowLeft size={18} strokeWidth={1.5} />
            </span>
            <span className="text-base tracking-[0.25em] uppercase font-body">
              <span className="text-[#009246]">A</span>
              <span className="text-white">cas</span>
              <span className="text-[#ce2b37]">ă</span>
            </span>
          </Link>
        </div>

        {/* Header */}
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

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square cursor-pointer group bg-zinc-900 overflow-hidden"
              onClick={() => setLightboxIndex(i)}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={generateAltText(item)}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={e => {
                    const el = e.currentTarget
                    el.style.display = 'none'
                  }}
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

      {/* Lightbox Cinematic */}
      <AnimatePresence>
        {currentItem && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] text-white/40 uppercase select-none">
              {lightboxIndex + 1} / {filtered.length}
            </div>

            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 p-2 text-white/60 hover:text-white transition-colors duration-200"
              onClick={closeLightbox}
              aria-label="Închide"
            >
              <X size={28} strokeWidth={1.5} />
            </button>

            {/* Prev arrow */}
            {lightboxIndex > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white/50 hover:text-white transition-colors duration-200"
                onClick={goPrev}
                aria-label="Poza anterioară"
              >
                <ChevronLeft size={36} strokeWidth={1.2} />
              </button>
            )}

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-full h-full px-16 py-16"
                onClick={e => e.stopPropagation()}
              >
                {currentItem.type === 'image' ? (
                  <img
                    src={currentItem.url}
                    alt={generateAltText(currentItem)}
                    className="max-w-full max-h-[82vh] object-contain shadow-2xl"
                  />
                ) : (
                  <video
                    src={currentItem.url}
                    className="max-w-full max-h-[82vh] object-contain shadow-2xl"
                    controls
                    autoPlay
                    muted
                    playsInline
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Next arrow */}
            {lightboxIndex < filtered.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white/50 hover:text-white transition-colors duration-200"
                onClick={goNext}
                aria-label="Poza următoare"
              >
                <ChevronRight size={36} strokeWidth={1.2} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
