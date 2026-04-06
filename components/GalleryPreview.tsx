'use client'

import { useState, useEffect } from 'react'
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

  if (items.length === 0) return null

  return (
    <section id="galerie" className="py-24 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-pomodoro-600 text-xs tracking-[0.4em] uppercase font-body mb-3"
          >
            Galerie Foto
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-light text-charcoal-900"
          >
            La Nostra Cucina
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {items.map((item, i) => (
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
