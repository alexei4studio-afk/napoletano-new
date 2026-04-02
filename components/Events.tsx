'use client'

import { motion } from 'framer-motion'
import { Users, Music, Pizza, Sun } from 'lucide-react'

const FEATURES = [
  {
    icon: <Users className="text-[#CE2B37]" size={28} />,
    title: "Capacitate 35 Persoane",
    desc: "Spațiu intim și primitor, perfect pentru grupuri și evenimente private."
  },
  {
    icon: <Music className="text-[#009246]" size={28} />,
    title: "Muzică Ambientală",
    desc: "Playlisturi curatoriate pentru un vibe autentic italienesc."
  },
  {
    icon: <Pizza className="text-[#CE2B37]" size={28} />,
    title: "Meniu 100% Italian",
    desc: "Pizza pe vatră, paste artizanale și deserturi delicioase."
  },
  {
    icon: <Sun className="text-[#009246]" size={28} />,
    title: "Terasă Primitoare",
    desc: "Locul ideal pentru a savura o experiență culinară relaxată."
  }
]

export default function Events() {
  return (
    <section id="evenimente" className="py-20 bg-[#FFFEF5] border-y border-[rgba(206,43,55,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl text-[#1C1A17] mb-4"
          >
            Evenimente & Atmosferă
          </motion.h2>
          <div className="flex justify-center gap-2 mb-6">
            <div className="h-1 w-12 bg-[#009246]" />
            <div className="h-1 w-12 bg-white border border-gray-200" />
            <div className="h-1 w-12 bg-[#CE2B37]" />
          </div>
          <p className="max-w-2xl mx-auto font-body text-gray-600 text-lg">
            Organizează-ți momentul special pe terasa noastră primitoare din inima Bucureștiului.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="flex justify-center mb-4">{f.icon}</div>
              <h3 className="font-display text-xl font-bold mb-2 text-[#1C1A17]">{f.title}</h3>
              <p className="font-body text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-[#1C1A17] p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-display text-2xl md:text-3xl mb-4 italic">Vrei să rezervi întreaga terasă?</h3>
            <p className="font-body text-white/70 mb-8 max-w-xl mx-auto">
              Suntem aici să facem din evenimentul tău o experiență memorabilă cu arome napoletane.
            </p>
            <a 
              href="tel:0731333112" 
              className="inline-block bg-[#CE2B37] hover:bg-white hover:text-[#CE2B37] text-white px-10 py-4 transition-all font-bold uppercase tracking-widest text-sm"
            >
              Cere o ofertă: 0731 333 112
            </a>
          </div>
          {/* Decor subtil */}
          <div className="absolute top-0 right-0 opacity-10 font-display text-[150px] pointer-events-none select-none translate-x-1/3 translate-y-1/3">
            🇮🇹
          </div>
        </div>

      </div>
    </section>
  )
}