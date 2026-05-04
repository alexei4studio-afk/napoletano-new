'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Menu, X } from 'lucide-react'
import Link from 'next/link'

const navLinks = [
  { href: '#meniu', label: 'Meniu' },
  { href: '#evenimente', label: 'Oferte' }, // Direcționează către secțiunea de Evenimente (Capacitate 35 pers)
  { href: '#poveste', label: 'Povestea Noastră' },
  { href: '/galerie-napoletano', label: 'Galerie' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-9 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-cream-50/95 backdrop-blur-md border-b border-cream-300 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex flex-col leading-none">
              <span
                className="font-display text-2xl md:text-3xl font-light tracking-widest text-charcoal-900"
                style={{ letterSpacing: '0.2em' }}
              >
                NAPOLETANO
              </span>
              <span
                className="text-[10px] tracking-[0.35em] text-pomodoro-600 uppercase font-body font-light"
              >
                Pizzeria Napoletana
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) =>
                link.href.startsWith('/') ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm tracking-widest uppercase font-body font-light text-charcoal-800 hover:text-pomodoro-600 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm tracking-widest uppercase font-body font-light text-charcoal-800 hover:text-pomodoro-600 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                )
              )}
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="tel:+40731333112"
                className="flex items-center gap-2 text-sm font-body text-charcoal-800 hover:text-pomodoro-600 transition-colors"
              >
                <Phone size={14} />
                <span>0731 333 112</span>
              </a>
              <a
                href="#rezervare"
                className="bg-pomodoro-600 hover:bg-pomodoro-700 text-white text-xs tracking-widest uppercase font-body px-5 py-2.5 transition-colors duration-200"
              >
                Rezervă Masă
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-charcoal-900 p-2"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 bg-charcoal-900 flex flex-col justify-center items-center gap-10 md:hidden"
          >
            {/* Decorative */}
            <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
              <span className="font-display text-xl text-white/30 tracking-widest">NAPOLETANO</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            {navLinks.map((link, i) =>
              link.href.startsWith('/') ? (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-display text-4xl text-white font-light tracking-widest hover:text-pomodoro-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ) : (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="font-display text-4xl text-white font-light tracking-widest hover:text-pomodoro-400 transition-colors"
                >
                  {link.label}
                </motion.a>
              )
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center gap-4 mt-4"
            >
              <a
                href="tel:+40731333112"
                className="flex items-center gap-2 text-white/60 font-body text-sm tracking-wider"
              >
                <Phone size={14} />
                0731 333 112
              </a>
              <a
                href="#rezervare"
                onClick={() => setMenuOpen(false)}
                className="bg-pomodoro-600 text-white text-xs tracking-widest uppercase font-body px-8 py-3"
              >
                Rezervă Masă
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}