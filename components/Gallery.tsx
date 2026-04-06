'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const photos = [
  {
    src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&auto=format',
    alt: 'Pizza Margherita napoletana proaspătă scoasă din cuptor',
    span: 'col-span-1 row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format',
    alt: 'Maestru pizzar pregătind aluatul dospit 72 ore',
    span: 'col-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=800&q=80&auto=format',
    alt: 'Ingrediente italiene premium DOP Napoletano',
    span: 'col-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80&auto=format',
    alt: 'Design interior restaurant Napoletano București',
    span: 'col-span-2',
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
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}