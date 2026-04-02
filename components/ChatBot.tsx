'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react'

type Message = {
  role: 'bot' | 'user'
  text: string
}

const BOT_RESPONSES: Record<string, string> = {
  default:
    'Ciao! Sunt Napoletano Bot 🍕 Pot să te ajut cu informații despre meniu, rezervări sau program. Întreabă-mă orice!',
  rezervare:
    'Pentru rezervări poți completa formularul din secțiunea "Rezervă Masă" de pe site, sau poți suna direct la 0731 333 112. Program: Lun–Joi 12–23, Vin–Dum 12–24.',
  program:
    'Suntem deschiși Luni – Joi între orele 12:00 – 23:00 și Vineri – Duminică între 12:00 – 00:00. Ne găsești la Ion Nonna Otescu nr. 2, Sector 6, București.',
  adresa:
    'Ne găsești la Ion Nonna Otescu nr. 2, Sector 6, București. Parcare disponibilă în zonă. 📍',
  telefon: 'Numărul nostru de telefon este 0731 333 112. Poți suna oricând în timpul programului.',
  pizza:
    'Avem peste 18 sortimente de pizza napoletană autentică — de la Margherita clasică (45 lei) până la specialitățile noastre cu bufala și crudo (65–69 lei). Aluatul este dospit 72 de ore!',
  pret:
    'Pizzele clasice pornesc de la 45 lei (Margherita), specialitățile de la 55 lei. Antipastele: 25–60 lei. Pastele: 38–65 lei. Desertele: 22–29 lei.',
  parcare: 'Există parcare disponibilă în zona restaurantului, pe strada Ion Nonna Otescu.',
  gluten:
    'Momentan oferim pizza cu aluat tradițional. Pentru informații despre alergeni specifici, te rugăm să ne contactezi la 0731 333 112.',
}

function getResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('rezerv') || lower.includes('masa') || lower.includes('loc'))
    return BOT_RESPONSES.rezervare
  if (lower.includes('program') || lower.includes('orar') || lower.includes('deschis'))
    return BOT_RESPONSES.program
  if (lower.includes('adres') || lower.includes('unde') || lower.includes('sector') || lower.includes('otescu'))
    return BOT_RESPONSES.adresa
  if (lower.includes('telefon') || lower.includes('suna') || lower.includes('contact'))
    return BOT_RESPONSES.telefon
  if (lower.includes('pizza') || lower.includes('meniu') || lower.includes('mancare'))
    return BOT_RESPONSES.pizza
  if (lower.includes('pret') || lower.includes('cost') || lower.includes('lei') || lower.includes('cat'))
    return BOT_RESPONSES.pret
  if (lower.includes('parcar')) return BOT_RESPONSES.parcare
  if (lower.includes('gluten') || lower.includes('alerg')) return BOT_RESPONSES.gluten
  return 'Mulțumesc pentru întrebare! Pentru detalii suplimentare, sună-ne la 0731 333 112 sau vizitează secțiunile site-ului. 🍕'
}

const QUICK_REPLIES = ['Program', 'Rezervare', 'Meniu & Prețuri', 'Adresă']

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: BOT_RESPONSES.default },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [...prev, { role: 'bot', text: getResponse(text) }])
    }, 900 + Math.random() * 600)
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-pomodoro-600 hover:bg-pomodoro-700 text-white flex items-center justify-center shadow-lg shadow-pomodoro-900/30 transition-colors ${open ? 'hidden' : 'flex'}`}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Deschide chat"
      >
        <MessageCircle size={22} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-olive rounded-full flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">1</span>
        </span>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] bg-white border border-cream-300 shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '520px', height: '520px' }}
          >
            {/* Header */}
            <div className="bg-pomodoro-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 flex items-center justify-center text-sm">
                  🍕
                </div>
                <div>
                  <p className="text-white font-body text-sm font-medium">Napoletano Bot</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="text-white/70 text-xs font-body">Online acum</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-cream-50">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] px-4 py-2.5 text-sm font-body leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-pomodoro-600 text-white'
                        : 'bg-white border border-cream-300 text-charcoal-900'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-cream-300 px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 bg-pomodoro-400 rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2 bg-white border-t border-cream-200 flex gap-2 overflow-x-auto flex-shrink-0">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr}
                  onClick={() => sendMessage(qr)}
                  className="flex-shrink-0 text-xs font-body border border-pomodoro-200 text-pomodoro-600 px-3 py-1.5 hover:bg-pomodoro-50 transition-colors whitespace-nowrap"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-cream-200 flex gap-3 flex-shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Scrie un mesaj..."
                className="flex-1 text-sm font-body text-charcoal-900 placeholder:text-charcoal-800/40 bg-cream-50 border border-cream-300 px-4 py-2.5 focus:outline-none focus:border-pomodoro-400 transition-colors"
              />
              <button
                onClick={() => sendMessage(input)}
                className="w-10 h-10 bg-pomodoro-600 hover:bg-pomodoro-700 text-white flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
