'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const zones = [
  {
    title: 'RESTAURANT',
    href: '/galerie-napoletano?category=restaurant',
    image: '/nav-zones/restaurant.png',
    alt: 'Interior restaurant Napoletano București',
  },
  {
    title: 'TERASĂ',
    href: '/galerie-napoletano?category=terasa',
    image: '/nav-zones/terasa.png',
    alt: 'Terasă exterioară Napoletano Pizzeria',
  },
  {
    title: 'EVENIMENTE',
    href: '/galerie-napoletano?category=evenimente',
    image: '/nav-zones/evenimente.png',
    alt: 'Evenimente private la Napoletano',
  },
  {
    title: 'TOATE FOTOGRAFIILE',
    href: '/galerie-napoletano',
    image: '/nav-zones/toate.png',
    alt: 'Galerie completă Napoletano Pizzeria Napoletana',
  },
]

export default function VisualNav() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 md:h-[65vh]">
      {zones.map((zone, i) => (
        <motion.div
          key={zone.href}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="h-[55vw] md:h-full border-r border-white/10 last:border-r-0"
        >
          <Link
            href={zone.href}
            className="relative block w-full h-full overflow-hidden group"
          >
            {/* Image — zoom on hover */}
            <div className="absolute inset-0 scale-100 group-hover:scale-105 transition-transform duration-500 ease-out">
              <img
                src={zone.image}
                alt={zone.alt}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlay — lighten on hover */}
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/15 transition-all duration-500" />

            {/* Radial glow — appears on hover */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.13)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Title + underline */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="font-display text-white text-xl md:text-2xl lg:text-3xl tracking-[0.35em] uppercase group-hover:-translate-y-1 transition-transform duration-500">
                {zone.title}
              </span>
              <span className="block h-px bg-white/60 w-0 group-hover:w-10 transition-all duration-500" />
            </div>
          </Link>
        </motion.div>
      ))}
    </section>
  )
}
