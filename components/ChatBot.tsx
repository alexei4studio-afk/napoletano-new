'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'

type Message = {
  role: 'bot' | 'user'
  text: string
}

// ── CONFIGURARE RĂSPUNSURI (Cu link-uri active) ──────────────────────────────
const BOT_RESPONSES: Record<string, string> = {
  default:
    'Ciao! Sunt Napoletano Bot 🍕 Pot să te ajut cu informații despre meniu, rezervări sau program.',
  rezervare:
    'Pentru rezervări poți completa <a href="#rezervare" class="underline font-bold text-pomodoro-600">formularul din secțiunea "Rezervă Masă"</a> de pe site, sau poți suna direct la <a href="tel:0731333112" class="underline font-bold text-pomodoro-600">0731 333 112</a>. <br/><br/><b>Program:</b> Lun–Joi 12–23, Vin–Dum 12–24.',
  program:
    '<b>Program:</b><br/>Luni – Joi: 12:00 – 23:00<br/>Vineri – Duminică: 12:00 – 00:00.<br/><br/>📍 Ion Nonna Otescu nr. 2, Sector 6.',
  adresa:
    'Ne găsești la <b>Ion Nonna Otescu nr. 2, Sector 6, București</b>. Parcare disponibilă în zonă. 📍',
  whatsapp: 
    'Poți să ne scrii direct pe WhatsApp aici: <a href="https://wa.me/40731333112" target="_blank" class="underline font-bold text-green-600">Deschide WhatsApp</a>',
  meniu:
    'Avem pizza napoletană autentică (45-69 lei), paste proaspete și antipasti. <a href="#meniu" class="underline font-bold">Vezi meniul complet aici.</a>',
}

function getResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('rezerv') || lower.includes('masa')) return BOT_RESPONSES.rezervare
  if (lower.includes('program') || lower.includes('orar')) return BOT_RESPONSES.program
  if (lower.includes('adres') || lower.includes('unde')) return BOT_RESPONSES.adresa
  if (lower.includes('whatsapp') || lower.includes('scrie')) return BOT_RESPONSES.whatsapp
  if (lower.includes('meniu') || lower.includes('pret') || lower.includes('preț')) return BOT_RESPONSES.meniu
  return 'Pentru detalii despre rezervări, meniu sau program, alege una din opțiunile de mai jos sau sună-ne la <a href="tel:0731333112">0731 333 112</a>. 🍕'
}

const QUICK_REPLIES = ['Program', 'Rezervare', 'Meniu & Prețuri', 'Adresă', 'WhatsApp']

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ role: 'bot', text: BOT_RESPONSES.default }])
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
    }, 800)
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#CE2B37] text-white rounded-full items-center justify-center shadow-xl ${open ? 'hidden' : 'flex'}`}
        whileHover={{ scale: 1.1 }}
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden rounded-t-xl"
            style={{ height: '550px' }}
          >
            {/* Header */}
            <div className="bg-[#CE2B37] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">🍕</div>
                <div>
                  <p className="text-white font-bold text-sm">Napoletano Bot</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/80 text-xs">Online acum</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                      msg.role === 'user' ? 'bg-[#CE2B37] text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                    }`}
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl">...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr}
                  onClick={() => sendMessage(qr)}
                  className="flex-shrink-0 text-xs border border-[#CE2B37] text-[#CE2B37] px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Întreabă-mă ceva..."
                className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-[#CE2B37]"
              />
              <button onClick={() => sendMessage(input)} className="bg-[#CE2B37] text-white p-2 rounded-full">
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}