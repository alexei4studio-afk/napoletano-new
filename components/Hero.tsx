'use client'

import { motion } from 'framer-motion'
import { ChevronDown, MapPin, Phone, Clock } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image via Unsplash (pizza napoletana) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1920&q=85&auto=format')`,
        }}
      />

      {/* Dark vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Warm tinted texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-pomodoro-900/30 via-transparent to-transparent" />

      {/* Decorative left border */}
      <div className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 hidden md:flex">
        <div className="h-24 w-px bg-white/30" />
        <span
          className="text-white/40 text-xs tracking-widest uppercase font-body"
          style={{ writingMode: 'vertical-rl' }}
        >
          Napoli · 1889 · Autentico
        </span>
        <div className="h-24 w-px bg-white/30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-5xl mx-auto">
        {/* Pre-title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <div className="h-px w-12 bg-pomodoro-400/70" />
          <span className="text-pomodoro-300 text-xs tracking-[0.4em] uppercase font-body font-light">
            Pizzeria Napoletana · București
          </span>
          <div className="h-px w-12 bg-pomodoro-400/70" />
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-display font-light text-white text-balance leading-none"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 7rem)', letterSpacing: '-0.01em' }}
        >
          L&apos;Arte della
          <br />
          <em className="italic text-cream-200">Pizza Napoletana</em>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-6 text-white/70 font-body font-light text-base md:text-lg max-w-xl mx-auto leading-relaxed"
        >
          Tradiție napolitană autentică. Ingrediente importate din Italia.
          Cuptor cu lemne. Rețete de peste 130 de ani.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#rezerva"
            className="w-full sm:w-auto bg-pomodoro-600 hover:bg-pomodoro-700 text-white font-body text-sm tracking-widest uppercase px-10 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-pomodoro-900/40 hover:-translate-y-0.5"
          >
            Rezervă Masă
          </a>
          <a
            href="#meniu"
            className="w-full sm:w-auto border border-white/40 hover:border-white/80 text-white font-body text-sm tracking-widest uppercase px-10 py-4 transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
          >
            Vezi Meniu
          </a>
        </motion.div>

        {/* Info bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/50 text-xs tracking-widest uppercase font-body"
        >
          {[
            { Icon: MapPin, text: 'Ion Nonna Otescu nr. 2, Sector 6' },
            { Icon: Phone, text: '0731 333 112' },
            { Icon: Clock, text: 'Lun–Joi: 12–23 · Vin–Dum: 12–00' },
          ].map(({ Icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              <Icon size={13} className="text-pomodoro-400" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-white/30 text-xs tracking-widest uppercase font-body">Descoperă</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown size={18} className="text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  )
}
