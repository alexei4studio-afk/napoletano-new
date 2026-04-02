'use client'

import { motion } from 'framer-motion'
import { Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="contact" className="bg-charcoal-900 border-t border-white/5">
      {/* Top CTA band */}
      <div className="bg-pomodoro-600 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display text-2xl text-white font-light">
              Rezervă masa ta acum
            </p>
            <p className="text-white/70 font-body text-sm mt-1">
              Capacitate limitată — recomandăm rezervarea în avans
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="tel:+40731333112"
              className="flex items-center gap-2 border border-white/40 hover:border-white text-white font-body text-xs tracking-widest uppercase px-6 py-3 transition-colors"
            >
              <Phone size={13} />
              Sună Acum
            </a>
            <a
              href="#rezerva"
              className="bg-white text-pomodoro-700 hover:bg-cream-100 font-body text-xs tracking-widest uppercase px-6 py-3 transition-colors"
            >
              Rezervă Online
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <p
              className="font-display text-3xl font-light text-white tracking-widest mb-2"
              style={{ letterSpacing: '0.2em' }}
            >
              NAPOLETANO
            </p>
            <p className="text-xs tracking-[0.35em] text-pomodoro-400 uppercase font-body mb-6">
              Pizzeria Napoletana · București
            </p>
            <p className="text-white/40 font-body font-light text-sm leading-relaxed max-w-sm">
              Autentică pizzerie napoletană în București. Ingrediente italiene de calitate
              superioară, aluat dospit 72 de ore, cuptor cu lemne la 450°C.
            </p>
            {/* Social */}
            <div className="flex gap-4 mt-8">
              {[
                { href: 'https://www.facebook.com/profile.php?id=61583032340967', Icon: Facebook, label: 'Facebook' },
                { href: 'https://www.instagram.com/ventonapoletano/', Icon: Instagram, label: 'Instagram' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 border border-white/20 hover:border-pomodoro-400 flex items-center justify-center text-white/50 hover:text-pomodoro-400 transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs tracking-widest uppercase font-body text-white/30 mb-5">
              Navigare
            </p>
            <ul className="space-y-3">
              {[
                { href: '#meniu', label: 'Meniu' },
                { href: '#poveste', label: 'Povestea Noastră' },
                { href: '#galerie', label: 'Galerie' },
                { href: '#rezerva', label: 'Rezervă Masă' },
                { href: '#contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-white/50 hover:text-white font-body text-sm font-light transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <p className="text-xs tracking-widest uppercase font-body text-white/30 mb-5">
              Contact
            </p>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-pomodoro-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/50 font-body text-sm font-light leading-relaxed">
                  Ion Nonna Otescu nr. 2<br />București, Sector 6
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-pomodoro-400 flex-shrink-0" />
                <a
                  href="tel:+40731333112"
                  className="text-white/50 hover:text-white font-body text-sm font-light transition-colors"
                >
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

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
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
