'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase, GalleryItem } from '@/lib/supabaseClient'

const CATEGORY_ALT: Record<string, string> = {
  restaurant: 'Interior Restaurant Napoletano București',
  terasa: 'Terasă exterioară Napoletano Pizzeria',
  evenimente: 'Evenimente private la Restaurant Napoletano',
}

function generateAltText(item: GalleryItem): string {
  if (item.alt_text && item.alt_text.trim() !== '') return item.alt_text
  return `${CATEGORY_ALT[item.category] ?? 'Pizza Napoletană autentică București'} — Foto #${item.id}`
}

const FALLBACK_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&auto=format',
    alt: 'Pizza Margherita napoletana proaspătă scoasă din cuptor',
  },
  {
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format',
    alt: 'Maestru pizzar pregătind aluatul dospit 72 ore',
  },
  {
    url: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=800&q=80&auto=format',
    alt: 'Ingrediente italiene premium DOP Napoletano',
  },
  {
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80&auto=format',
    alt: 'Design interior restaurant Napoletano București',
  },
]

export default function GalleryPreview() {
  const [items, setItems] = useState<GalleryItem[]>([])

  useEffect(() => {
    supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setItems(data as GalleryItem[])
      })
  }, [])

  const useFallback = items.length === 0

  return (
    <section id="galerie" className="py-24 bg-white px-4">
      <div className="max-w-7xl mx-auto">

        <Link href="/galerie-napoletano" className="block text-center mb-14 group cursor-pointer">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-pomodoro-600 text-xs tracking-[0.4em] uppercase font-body mb-3 transition-opacity duration-300 group-hover:opacity-70"
          >
            Galerie Foto
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-light text-charcoal-900 transition-opacity duration-300 group-hover:opacity-70"
          >
            La Nostra Cucina
          </motion.h2>
        </Link>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {useFallback
            ? FALLBACK_PHOTOS.map((photo, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative aspect-square overflow-hidden group bg-zinc-100"
                >
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              ))
            : items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative aspect-square overflow-hidden group bg-zinc-100"
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={generateAltText(item)}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              ))}
        </div>

      </div>
    </section>
  )
}
