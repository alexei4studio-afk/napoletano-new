'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

interface GalleryItem {
  id: number
  url: string
  alt_text: string
  type: 'image' | 'video'
}

export default function GalleryPreview() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    supabase
      .from('gallery_items')
      .select('id, url, alt_text, type')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setItems(data as GalleryItem[])
        setLoaded(true)
      })
  }, [])

  return (
    <section className="bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Title — link towards gallery page */}
        <Link href="/galerie-napoletano" className="group block text-center mb-14">
          <p className="text-[9px] tracking-[0.55em] uppercase text-white/30 mb-5">
            Napoletano · București
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-light tracking-[0.18em] uppercase text-white group-hover:text-white/70 transition-colors duration-500">
            Galerie Foto
          </h2>
          <div
            className="mx-auto mt-4 h-px bg-white/20 transition-all duration-500 group-hover:bg-white/40"
            style={{ width: '4rem' }}
          />
          <p className="mt-5 text-[10px] tracking-[0.55em] uppercase text-white/35 group-hover:text-white/60 transition-colors duration-300">
            La Nostra Cucina →
          </p>
        </Link>

        {/* Photo grid */}
        {!loaded || items.length === 0 ? (
          <p className="text-center text-[10px] tracking-[0.45em] uppercase text-white/25 py-20 animate-pulse">
            Imaginile se încarcă...
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[2px]">
            {items.map((item) => (
              <Link
                key={item.id}
                href="/galerie-napoletano"
                className="relative aspect-square overflow-hidden group bg-zinc-900 block"
              >
                {item.type !== 'video' ? (
                  <img
                    src={item.url}
                    alt={item.alt_text || 'Napoletano București'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
              </Link>
            ))}
          </div>
        )}

        {/* CTA link */}
        <div className="text-center mt-12">
          <Link
            href="/galerie-napoletano"
            className="group inline-flex items-center gap-6 border border-white/20 px-12 py-5 hover:border-white/60 transition-all duration-500"
          >
            <span className="text-[10px] tracking-[0.55em] uppercase text-white font-light">
              VEZI GALERIA COMPLETĂ
            </span>
            <span className="text-white/30 group-hover:text-white/80 transition-colors duration-500 text-sm">→</span>
          </Link>
        </div>

      </div>
    </section>
  )
}
