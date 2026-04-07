'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MapPin, Clock, MessageCircle } from 'lucide-react'

const PLACE_ID = 'ChIJ3cczhqH_sUARuysISXSoz_8'
const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=Napoletano+Pizzeria+Napoletana&destination_place_id=${PLACE_ID}&travelmode=driving`

const WHATSAPP_NUMBER = '40731333112'

export default function Reservation() {
  const [form, setForm] = useState({
    name: '',
    date: '',
    time: '',
    persons: '2',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const message = [
      'Rezervare Nouă Napoletano:',
      `Nume: ${form.name}`,
      `Data: ${form.date}`,
      `Ora: ${form.time}`,
      `Persoane: ${form.persons}`,
    ].join('\n')
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <section id="rezerva" className="py-24 md:py-32 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Rândul 1: Info stânga | Formular dreapta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Stânga: Header + Info */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-pomodoro-600 text-xs tracking-[0.4em] uppercase font-body mb-4"
            >
              Vino la noi
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl md:text-5xl font-light text-charcoal-900 mb-10 leading-tight"
            >
              Rezervă-ți
              <br />
              <em className="italic text-pomodoro-600">masa acum.</em>
            </motion.h2>

            <div className="flex flex-col sm:flex-row gap-8 flex-wrap">
              {[
                {
                  Icon: MapPin,
                  title: 'Adresă',
                  lines: ['Ion Nonna Otescu nr. 2', 'București, Sector 6'],
                },
                {
                  Icon: Phone,
                  title: 'Telefon',
                  lines: ['0731 333 112'],
                  href: 'tel:+40731333112',
                },
                {
                  Icon: Clock,
                  title: 'Program',
                  lines: ['Luni – Joi: 12:00 – 23:00', 'Vineri – Duminică: 12:00 – 00:00'],
                },
              ].map(({ Icon, title, lines, href }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 border border-pomodoro-600/30 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-pomodoro-600" />
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase font-body text-charcoal-800/50 mb-1">
                      {title}
                    </p>
                    {lines.map((line) =>
                      href ? (
                        <a
                          key={line}
                          href={href}
                          className="block font-body text-charcoal-900 font-light text-base hover:text-pomodoro-600 transition-colors"
                        >
                          {line}
                        </a>
                      ) : (
                        <p key={line} className="font-body text-charcoal-900 font-light text-base">
                          {line}
                        </p>
                      )
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 mt-2 border border-cream-300 px-4 py-2 w-fit"
            >
              <span className="text-base leading-none">🏳️‍🌈</span>
              <span className="font-body text-xs tracking-widest uppercase text-charcoal-800/60">
                LGBT+ Friendly
              </span>
            </motion.div>
          </div>

          {/* Dreapta: Formular */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-cream-300 p-8 md:p-10"
          >
            <h3 className="font-display text-2xl font-light text-charcoal-900 mb-2">
              Formular de Rezervare
            </h3>
            <p className="text-sm font-body text-charcoal-800/50 mb-8">
              Sau sună direct la{' '}
              <a href="tel:+40731333112" className="text-pomodoro-600 hover:underline">
                0731 333 112
              </a>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs tracking-widest uppercase font-body text-charcoal-800/60 mb-2">
                  Nume *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-cream-300 bg-cream-50 px-4 py-3 text-sm font-body text-charcoal-900 focus:outline-none focus:border-pomodoro-400 transition-colors"
                  placeholder="Numele tău"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-1">
                  <label className="block text-xs tracking-widest uppercase font-body text-charcoal-800/60 mb-2">
                    Persoane
                  </label>
                  <select
                    value={form.persons}
                    onChange={(e) => setForm({ ...form, persons: e.target.value })}
                    className="w-full border border-cream-300 bg-cream-50 px-4 py-3 text-sm font-body text-charcoal-900 focus:outline-none focus:border-pomodoro-400"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'persoană' : 'persoane'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase font-body text-charcoal-800/60 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-cream-300 bg-cream-50 px-4 py-3 text-sm font-body text-charcoal-900 focus:outline-none focus:border-pomodoro-400"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase font-body text-charcoal-800/60 mb-2">
                    Ora *
                  </label>
                  <select
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full border border-cream-300 bg-cream-50 px-4 py-3 text-sm font-body text-charcoal-900 focus:outline-none focus:border-pomodoro-400"
                  >
                    <option value="">Alege ora</option>
                    {['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
                      '16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30',
                      '20:00','20:30','21:00','21:30','22:00'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-white font-body text-sm tracking-widest uppercase py-4 flex items-center justify-center gap-3 transition-colors duration-200"
                style={{ backgroundColor: '#25D366' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1ebe5d')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#25D366')}
              >
                <MessageCircle size={18} />
                Trimite pe WhatsApp
              </button>
            </form>
          </motion.div>

        </div>

        {/* Rândul 2: Hartă full-width */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="h-[520px] overflow-hidden border border-cream-300 relative"
        >
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:ChIJ3cczhqH_sUARuysISXSoz_8&zoom=15&language=ro`}
            style={{ border: 0, width: '100%', height: '100%' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Napoletano Pizzeria Napoletana"
          />
          <a
            href={MAPS_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-4 flex items-center gap-2 bg-pomodoro-600 hover:bg-pomodoro-700 text-white font-body text-xs tracking-widest uppercase px-5 py-3 transition-colors shadow-lg z-10"
          >
            <MapPin size={14} />
            Obține Direcții
          </a>
        </motion.div>

      </div>
    </section>
  )
}
