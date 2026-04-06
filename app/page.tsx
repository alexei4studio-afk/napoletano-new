import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Menu from '@/components/Menu'
import Story from '@/components/Story'
import Gallery from '@/components/Gallery'
import Events from '@/components/Events'
import Testimonials from '@/components/Testimonials'
import Reservation from '@/components/Reservation'
import Footer from '@/components/Footer'
import ChatBot from '@/components/ChatBot'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Menu />

      {/* Gallery CTA */}
      <section className="bg-black py-20 flex items-center justify-center">
        <a
          href="/galerie-napoletano"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-6 border border-white/20 px-14 py-7 hover:border-white/60 transition-all duration-500"
        >
          <span className="text-[10px] tracking-[0.55em] uppercase text-white font-light">
            DESCOPERĂ GALERIA NAPOLETANO
          </span>
          <span className="text-white/30 group-hover:text-white/80 transition-colors duration-500 text-sm">→</span>
        </a>
      </section>

      <Story />
      <Gallery />
      <Events /> {/* Secțiunea: Capacitate 35 pers & Terasă */}
      <Testimonials />
      <Reservation />
      <Footer />
      <ChatBot />
    </main>
  )
}