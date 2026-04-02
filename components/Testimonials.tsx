'use client'

import { motion } from 'framer-motion'

const reviews = [
  {
    name: 'Andrei M.',
    stars: 5,
    text: 'Cea mai bună pizza napoletană din București. Aluatul este incredibil — ușor, aromat, exact ca în Napoli. Burrata e proaspătă și calitatea ingredientelor se simte la fiecare mușcătură.',
    date: 'Google Reviews',
  },
  {
    name: 'Maria P.',
    stars: 5,
    text: 'Am vizitat de mai multe ori și de fiecare dată experiența este perfectă. Napoletano cu crudo și bufala este pur și simplu divin. Serviciu prompt și atmosferă caldă.',
    date: 'Google Reviews',
  },
  {
    name: 'Radu C.',
    stars: 5,
    text: 'Dacă vrei pizza autentică napolitană în București, nu există altă opțiune. Am stat 3 ani în Napoli și pot spune că este la nivelul pizzeriilor de acolo. Impresionant.',
    date: 'Google Reviews',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-pomodoro-600 text-xs tracking-[0.4em] uppercase font-body mb-3"
          >
            Ce spun clienții noștri
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-light text-charcoal-900"
          >
            Recenzii Autentice
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-cream-300 p-7 card-lift"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: review.stars }).map((_, s) => (
                  <span key={s} className="text-amber-500 text-sm">★</span>
                ))}
              </div>

              {/* Quote mark */}
              <p
                className="font-display text-6xl text-pomodoro-200 leading-none -mt-4 mb-2"
                aria-hidden
              >
                "
              </p>

              <p className="text-charcoal-800/70 font-body font-light text-sm leading-relaxed mb-6">
                {review.text}
              </p>

              <div className="flex items-center justify-between border-t border-cream-200 pt-4">
                <p className="font-body text-sm font-medium text-charcoal-900">
                  {review.name}
                </p>
                <p className="text-xs text-charcoal-800/40 font-body tracking-wide">
                  {review.date}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {[
            { icon: '🇮🇹', label: 'Ingrediente DOP din Italia' },
            { icon: '🔥', label: 'Cuptor cu lemne · 450°C' },
            { icon: '🌾', label: 'Aluat dospit 72 ore' },
            { icon: '👨‍🍳', label: 'Maestru Pizzaiolo certificat' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-charcoal-800/50">
              <span className="text-2xl">{icon}</span>
              <span className="font-body text-xs tracking-widest uppercase">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
