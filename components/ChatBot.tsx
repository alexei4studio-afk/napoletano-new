'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'

type Message = {
  role: 'bot' | 'user'
  text: string
}

// ── CONFIGURARE RĂSPUNSURI ──────────────────────────────────────────────
const BOT_RESPONSES: Record<string, string> = {
  default:
    'Ciao! Sunt Napoletano Bot 🍕 Pot să te ajut cu informații despre meniu, livrare sau rezervări.',
  
  whatsapp: 
    'Poți să ne scrii direct pe WhatsApp aici pentru detalii rapide: <a href="https://wa.me/40731333112" target="_blank" class="underline font-bold text-[#25D366]">Deschide WhatsApp</a>',

  rezervare:
    'Pentru rezervări poți completa <a href="#rezervare" class="underline font-bold text-[#CE2B37]">formularul de pe site</a>, sau poți suna direct la <a href="tel:0731333112" class="underline font-bold text-[#CE2B37]">0731 333 112</a>. <br/><br/><b>Program:</b> Lun–Joi 12–23, Vin–Dum 12–24.',
  
  program:
    '<b>Program:</b><br/>Luni – Joi: 12:00 – 23:00<br/>Vineri – Duminică: 12:00 – 00:00.<br/><br/>📍 Ion Nonna Otescu nr. 2, Sector 6.',
  
  adresa:
    'Ne găsești la <b>Ion Nonna Otescu nr. 2, Sector 6, București</b>. Parcare disponibilă în zonă. 📍',
  
  meniu:
    'Avem pizza napoletană autentică, <b>Panini & Produse Pui</b> și Paste. <a href="#meniu" class="underline font-bold text-[#CE2B37]">Vezi meniul complet aici.</a><br/><br/>🎉 <b>Vii la noi? Ai 10% reducere la orice comandă cu pick-up!</b>',

  livrare:
    'Livrăm direct la tine acasă! 🛵<br/><br/><b>Comandă online:</b><br/><div class="flex flex-wrap gap-2 mt-2"><a href="https://wolt.com/ro-ro/rou/bucharest/restaurant/napoletano-6881e1f8128fa8d9f6654e08" target="_blank" class="inline-block bg-[#009DE0] text-white px-3 py-1.5 rounded-full text-[10px] font-bold no-underline">WOLT</a><a href="https://glovoapp.com/ro/ro/bucharest/stores/napoletan-buc" target="_blank" class="inline-block bg-[#FFC244] text-black px-3 py-1.5 rounded-full text-[10px] font-bold no-underline">GLOVO</a><a href="https://food.bolt.eu/ro-ro/325-bucharest/p/152391-napoletano/" target="_blank" class="inline-block bg-[#34D186] text-white px-3 py-1.5 rounded-full text-[10px] font-bold no-underline">BOLT FOOD</a></div><br/><b>Sau contactează-ne direct:</b><br/>📞 <a href="tel:0731333112" class="underline font-bold text-[#CE2B37]">0731 333 112</a><br/>💬 <a href="https://wa.me/40731333112" target="_blank" class="underline font-bold text-[#25D366]">WhatsApp</a><br/><br/>🍕 <b>Vii la restaurant? Ai 10% reducere la orice comandă cu pick-up!</b>',

  produse_noi:
    'Încearcă noile noastre produse: <b>Panini artizanale</b>, fâșii de pui <b>Crispy</b> sau aripioare picante! Avem și o selecție de produse italiene pentru acasă în secțiunea Parteneri. 🤝',

  oferta:
    'Avem o ofertă specială: <b>10% reducere la orice comandă cu pick-up</b> când vii direct la noi! 🎉<br/><br/>📍 Valabil la restaurant — <b>Ion Nonna Otescu nr. 2, Sector 6</b>.<br/><br/>Te așteptăm! <a href="#rezervare" class="underline font-bold text-[#CE2B37]">Rezervă o masă aici.</a>'
}

function getResponse(input: string): string {
  const lower = input.toLowerCase()
  
  if (lower.includes('reducere') || lower.includes('discount') || lower.includes('ofert') || lower.includes('10%')) return BOT_RESPONSES.oferta
  if (lower.includes('whatsapp') || lower.includes('scrie') || lower.includes('mesaj')) return BOT_RESPONSES.whatsapp
  if (lower.includes('rezerv') || lower.includes('masa')) return BOT_RESPONSES.rezervare
  if (lower.includes('program') || lower.includes('orar')) return BOT_RESPONSES.program
  if (lower.includes('adres') || lower.includes('unde')) return BOT_RESPONSES.adresa
  if (lower.includes('livr') || lower.includes('wolt') || lower.includes('comand') || lower.includes('acasa')) return BOT_RESPONSES.livrare
  if (lower.includes('pui') || lower.includes('panini') || lower.includes('crispy') || lower.includes('parteneri')) return BOT_RESPONSES.produse_noi
  if (lower.includes('meniu') || lower.includes('pret') || lower.includes('preț') || lower.includes('mancare')) return BOT_RESPONSES.meniu
  
  return 'Te pot ajuta cu detalii despre <b>WhatsApp</b>, <b>Meniu</b>, <b>Livrare</b> sau <b>Rezervări</b>. 🍕'
}

// AICI AM PUS WHATSAPP PRIMUL:
const QUICK_REPLIES = ['WhatsApp', 'Livrare', 'Meniu', 'Panini & Pui', 'Rezervare']

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
      <motion.button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#CE2B37] text-white rounded-full items-center justify-center shadow-xl ${open ? 'hidden' : 'flex'}`}
        whileHover={{ scale: 1.1 }}
      >
        <MessageCircle size={24} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden rounded-t-xl"
            style={{ height: '550px' }}
          >
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