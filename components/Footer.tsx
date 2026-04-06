'use client'

import { motion } from 'framer-motion'
import { Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react'

// ─── SVG-uri iconițe (Restaurate 100%) ─────────────────────────────────────────
const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)
const WoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M2 6L4.8 14L7 8.5L10 14L12.2 6L14.5 11.5L17 6"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const GlovoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M10 2C7.239 2 5 4.239 5 7c0 4.5 5 11 5 11s5-6.5 5-11c0-2.761-2.239-5-5-5z"
      stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="10" cy="7" r="2" fill="currentColor" />
  </svg>
)
const BoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M11.5 2L4.5 11H9.5L8.5 18L15.5 9H10.5L11.5 2Z"
      stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
)

// ─── Glow handler ─────────────────────────────────────────────────────────────
function glow(base: string, neon: string, rgba: string) {
  return {
    style: { color: base, transition: 'color 0.2s ease, filter 0.2s ease, transform 0.2s ease' } as React.CSSProperties,
    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.currentTarget.style.color = neon
      e.currentTarget.style.filter = `drop-shadow(0 0 7px ${rgba})`
      e.currentTarget.style.transform = 'scale(1.25)'
    },
    onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.currentTarget.style.color = base
      e.currentTarget.style.filter = 'none'
      e.currentTarget.style.transform = 'scale(1)'
    },
  }
}

const SOCIAL = [
  { label: 'Facebook',  href: 'https://www.facebook.com/ventonapoletano',   Icon: () => <Facebook size={16} />,  base: 'rgba(24,119,242,0.75)',  neon: '#1877F2', rgba: 'rgba(24,119,242,0.9)' },
  { label: 'Instagram', href: 'https://www.instagram.com/ventonapoletano',  Icon: () => <Instagram size={16} />, base: 'rgba(228,64,95,0.75)',   neon: '#E4405F', rgba: 'rgba(228,64,95,0.9)' },
  { label: 'TikTok',   href: 'https://www.tiktok.com/@ventonapoletano',     Icon: TikTokIcon,                    base: 'rgba(255,255,255,0.55)', neon: '#ffffff', rgba: 'rgba(255,255,255,0.8)' },
]
const DELIVERY = [
  { label: 'Wolt',      href: 'https://wolt.com/ro-ro/rou/bucharest/restaurant/napoletano-6881e1f8128fa8d9f6654e08', Icon: WoltIcon,  base: '#009DE0', neon: '#00d4ff', rgba: 'rgba(0,157,224,0.95)' },
  { label: 'Glovo',     href: 'https://glovoapp.com/ro/ro/bucharest/stores/napoletan-buc',                           Icon: GlovoIcon, base: '#FFC244', neon: '#FFD700', rgba: 'rgba(255,194,68,0.95)' },
  { label: 'Bolt Food', href: 'https://food.bolt.eu/ro-ro/325-bucharest/p/152391-napoletano/',                       Icon: BoltIcon,  base: '#34D186', neon: '#50ffaa', rgba: 'rgba(52,209,134,0.95)' },
]

export default function Footer() {
  // URL-ul care forțează direcțiile în Google Maps
  const mapsDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=44.444636,26.046522";

  return (
    <footer id="contact" className="bg-charcoal-900 border-t border-white/5">

      {/* ── CTA band ──────────────────────────────────────────────────────── */}
      <div className="bg-pomodoro-600 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-display text-2xl text-white font-light">
              Rezervă masa ta acum
            </p>
            <p className="text-white/70 font-body text-sm mt-1">
              Capacitate limitată — recomandăm rezervarea în avans
            </p>
          </div>
          <div className="flex gap-3">
            <a href="tel:+40731333112"
              className="flex items-center gap-2 border border-white/40 hover:border-white text-white font-body text-xs tracking-widest uppercase px-5 py-3 transition-colors">
              <Phone size={13} /> Sună Acum
            </a>
            <a href="#rezerva"
              className="bg-white text-pomodoro-700 hover:bg-cream-100 font-body text-xs tracking-widest uppercase px-5 py-3 transition-colors">
              Rezervă Online
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand col ── */}
          <div className="sm:col-span-2 lg:col-span-2">
            <p className="font-display text-3xl font-light text-white tracking-widest mb-1"
              style={{ letterSpacing: '0.2em' }}>
              NAPOLETANO
            </p>
            <p className="text-xs tracking-[0.35em] text-pomodoro-400 uppercase font-body mb-5">
              Pizzeria Napoletana · București
            </p>
            <p className="text-white/40 font-body font-light text-sm leading-relaxed max-w-sm mb-8">
              Autentică pizzerie napoletană în București. Ingrediente italiene de calitate
              superioară, aluat dospit 72 de ore, cuptor cu lemne la 450°C.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-5">
                {SOCIAL.map(({ label, href, Icon, base, neon, rgba }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank" rel="noopener noreferrer"
                    aria-label={label} title={label}
                    initial={{ opacity: 0, y: 4 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    {...glow(base, neon, rgba)}
                  >
                    <Icon />
                  </motion.a>
                ))}
                <span className="w-px h-4 bg-white/10" />
                {DELIVERY.map(({ label, href, Icon, base, neon, rgba }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank" rel="noopener noreferrer"
                    aria-label={`Comandă pe ${label}`} title={`Comandă pe ${label}`}
                    initial={{ opacity: 0, y: 4 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    {...glow(base, neon, rgba)}
                  >
                    <Icon />
                  </motion.a>
                ))}
              </div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-white/20 font-body font-light">
                Social · Wolt · Glovo · Bolt Food
              </p>
            </div>
          </div>

          {/* ── Navigare ── */}
          <div>
            <p className="text-xs tracking-widest uppercase font-body text-white/30 mb-5">
              Navigare
            </p>
            <ul className="space-y-3">
              {[
                { href: '#meniu',   label: 'Meniu' },
                { href: '#poveste', label: 'Povestea Noastră' },
                { href: '#galerie', label: 'Galerie' },
                { href: '#rezerva', label: 'Rezervă Masă' },
                { href: '#contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href}
                    className="text-white/50 hover:text-white font-body text-sm font-light transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact (REPARAT CU DIRECȚII MAPS) ── */}
          <div>
            <p className="text-xs tracking-widest uppercase font-body text-white/30 mb-5">
              Contact
            </p>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 group">
                <MapPin size={14} className="text-pomodoro-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-2">
                  <a 
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/50 hover:text-white font-body text-sm font-light leading-relaxed transition-colors"
                  >
                    Ion Nonna Otescu nr. 2<br />București, Sector 6
                  </a>
                  {/* Buton Navigație */}
                  <a 
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[10px] tracking-widest uppercase font-bold text-pomodoro-400 hover:text-pomodoro-300 transition-all border-b border-pomodoro-400/20 pb-0.5 w-fit"
                  >
                    Vezi Traseu Maps →
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-pomodoro-400 flex-shrink-0" />
                <a href="tel:+40731333112"
                  className="text-white/50 hover:text-white font-body text-sm font-light transition-colors">
                  0731 333 112
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={14} className="text-pomodoro-400 mt-0.5 flex-shrink-0" />
                <div className="text-white/50 font-body text-sm font-light leading-relaxed">
                  <p>Lun – Joi: 12:00 – 23:00</p>
                  <p>Vin – Dum: 12:00 – 00:00</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/5 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-white/25 font-body text-xs">
            © {new Date().getFullYear()} Napoletano Pizzeria. Toate drepturile rezervate.
          </p>
          <p className="text-white/25 font-body text-xs">
            Pizza napoletană autentică din 1889 · București
          </p>
        </div>
      </div>

    </footer>
  )
}