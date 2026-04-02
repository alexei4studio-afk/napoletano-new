'use client'

import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'

const STORIES = [
  { id: 1, img: '/s1.jpg', label: 'Vibe' },
  { id: 2, img: '/s2.jpg', label: 'Pizza' },
  { id: 3, img: '/s3.jpg', label: 'Proces' },
  { id: 4, img: '/s4.jpg', label: 'Echipa' },
]

export default function InstagramFeed() {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Secțiune */}
        <div className="flex flex-col items-center mb-10 text-center">
          <Instagram className="text-[#CE2B37] mb-3" size={32} />
          <h2 className="font-display text-3xl md:text-4xl mb-2">Urmărește-ne pe Instagram</h2>
          <a 
            href="https://www.instagram.com/ventonapoletano/" 
            target="_blank" 
            className="text-[#009246] font-bold text-lg hover:underline"
          >
            @ventonapoletano
          </a>
        </div>

        {/* Slider Stories (Cerculețe) */}
        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar justify-start md:justify-center">
          {STORIES.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100">
                  {/* Aici vei pune pozele salvate ca s1.jpg, s2.jpg etc */}
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 italic">Story</div>
                </div>
              </div>
              <span className="text-[11px] font-body uppercase tracking-wider text-gray-500">{story.label}</span>
            </div>
          ))}
        </div>

        {/* Postările (Grid / Slider) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((post) => (
            <motion.div 
              key={post}
              whileHover={{ scale: 0.98 }}
              className="aspect-square bg-gray-100 relative group cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">Postare</div>
              {/* Overlay la hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="text-white" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button className="px-8 py-3 border-2 border-[#CE2B37] text-[#CE2B37] font-bold hover:bg-[#CE2B37] hover:text-white transition-all uppercase tracking-widest text-xs">
            Vezi tot feed-ul
          </button>
        </div>
      </div>
    </section>
  )
}