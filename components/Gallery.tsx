'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const photos = [
  {
    src: '/nav-zones/restaurant.png',
    alt: 'Interior restaurant Napoletano București',
    span: 'col-span-1 row-span-2',
    href: '/galerie-napoletano?category=restaurant',
  },
  {
    src: '/nav-zones/terasa.png',
    alt: 'Terasă restaurant Napoletano',
    span: 'col-span-1',
    href: '/galerie-napoletano?category=terasa',
  },
  {
    src: '/nav-zones/evenimente.png',
    alt: 'Evenimente private Napoletano',
    span: 'col-span-1',
    href: '/galerie-napoletano?category=evenimente',
  },
  {
    src: '/nav-zones/toate.png',
    alt: 'Galerie completă Napoletano',
    span: 'col-span-2',
    href: '/galerie-napoletano',
  },
]

export default function Gallery() {
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[240px]">
          {photos.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden group ${photo.span}`}
            >
              <Link href={photo.href} className="block w-full h-full">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
