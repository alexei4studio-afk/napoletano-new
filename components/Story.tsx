'use client'

import { motion } from 'framer-motion'

const stats = [
  { value: '130+', label: 'Ani de tradiție' },
  { value: '72h', label: 'Dospit aluatul' },
  { value: '450°', label: 'Cuptor cu lemne' },
  { value: '100%', label: 'Ingrediente DOP' },
]

export default function Story() {
  return (
    <section id="poveste" className="relative overflow-hidden py-24 md:py-36 bg-charcoal-900">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Red accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-pomodoro-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — Text content */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-pomodoro-400 text-xs tracking-[0.4em] uppercase font-body mb-5"
            >
              La Nostra Storia
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-8"
            >
              O rețetă veche
              <br />
              <em className="text-cream-200 italic">de 130 de ani,</em>
              <br />
              în inima Bucureștiului.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="space-y-5 text-white/60 font-body font-light text-base leading-relaxed"
            >
              <p>
                Pizza napoletană nu este un simplu preparat — este o artă recunoscută
                de UNESCO ca patrimoniu cultural imaterial al umanității. La Napoletano,
                aducem această tradiție în București cu respect absolut față de rețetele originale.
              </p>
              <p>
                Aluatul nostru dospit timp de 72 de ore din făină tip &quot;00&quot; importată din
                Campania, sosul de roșii San Marzano DOP și mozzarella fior di latte de calitate
                superioară — toate coapte în 90 de secunde la 450°C în cuptorul nostru cu lemne.
              </p>
              <p>
                Fiecare pizza este o declarație de dragoste față de Napoli, frământată cu
                mâinile și coaptă cu sufletul.
              </p>
            </motion.div>

            {/* Signature */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex items-center gap-4"
            >
              <div className="h-px w-12 bg-pomodoro-600" />
              <span className="font-display italic text-lg text-cream-200">
                Maestrul Pizzaiolo
              </span>
            </motion.div>
          </div>

          {/* Right — Stats grid + image accent */}
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="border border-white/10 p-6 hover:border-pomodoro-600/50 transition-colors duration-300"
                >
                  <p className="font-display text-4xl md:text-5xl font-light text-white mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs tracking-widest uppercase font-body text-white/40">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Featured image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="relative overflow-hidden aspect-video"
            >
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80&auto=format"
                alt="Pizzaiolo napoletano"
                className="w-full h-full object-cover grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white/60 text-xs tracking-widest uppercase font-body">
                  Ion Nonna Otescu nr. 2, Sector 6, București
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
