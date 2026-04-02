'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { menuData } from '@/lib/menuData'

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('pizza')

  const activeData = menuData.find((c) => c.id === activeCategory)!

  return (
    <section id="meniu" className="py-24 md:py-32 bg-cream-50">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-pomodoro-600 text-xs tracking-[0.4em] uppercase font-body mb-4"
          >
            Cucina Napoletana
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-6xl font-light text-charcoal-900 mb-4"
          >
            Il Nostro Menù
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-charcoal-800/60 font-body font-light text-base max-w-lg mx-auto"
          >
            Fiecare preparat este gătit cu pasiune și ingrediente de origine
            italiană, conform rețetelor tradiționale napoletane.
          </motion.p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-14">
          {menuData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase font-body transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'text-white'
                  : 'text-charcoal-800/70 border border-charcoal-800/20 hover:border-pomodoro-400/60 hover:text-pomodoro-600'
              }`}
            >
              {activeCategory === cat.id && (
                <motion.span
                  layoutId="pill"
                  className="absolute inset-0 bg-pomodoro-600"
                  style={{ borderRadius: 0 }}
                />
              )}
              <span className="relative z-10 text-sm">{cat.icon}</span>
              <span className="relative z-10">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Category subtitle */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + '-header'}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-10"
          >
            <p className="font-display italic text-xl text-pomodoro-600/70">
              {activeData.labelIt}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Menu items grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
          >
            {activeData.items.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-white border border-cream-300 p-5 md:p-6 card-lift cursor-default"
              >
                {/* Badge */}
                {item.badge && (
                  <span className="absolute top-4 right-4 bg-pomodoro-600 text-white text-[10px] tracking-widest uppercase font-body px-2.5 py-1">
                    {item.badge}
                  </span>
                )}

                {/* Item header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-display text-xl font-light text-charcoal-900 leading-snug">
                      {item.name}
                    </h3>
                    {item.nameIt && (
                      <p className="font-display italic text-sm text-pomodoro-600/70 mt-0.5">
                        {item.nameIt}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="font-display text-2xl font-light text-charcoal-900">
                      {item.price}
                    </span>
                    <span className="text-xs font-body text-charcoal-800/50 ml-0.5">lei</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-cream-300 mb-3 group-hover:bg-pomodoro-200 transition-colors" />

                {/* Ingredients */}
                <p className="text-charcoal-800/60 font-body font-light text-sm leading-relaxed">
                  {item.ingredients}
                </p>

                {/* Weight */}
                {item.weight && (
                  <p className="mt-3 text-[11px] tracking-widest uppercase font-body text-charcoal-800/30">
                    Gramaj: {item.weight}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Allergens note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-charcoal-800/40 font-body mt-10 max-w-lg mx-auto"
        >
          * Informații despre alergeni disponibile la cerere. Prețurile includ TVA.
          Gramajele sunt înainte de preparare.
        </motion.p>
      </div>
    </section>
  )
}
