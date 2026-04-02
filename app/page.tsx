import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Menu from '@/components/Menu'
import Story from '@/components/Story'
import Gallery from '@/components/Gallery'
import InstagramFeed from '@/components/InstagramFeed' // Importul nou
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
      <Story />
      <Gallery />
      <InstagramFeed /> {/* Secțiunea nouă cu slider-ul Instagram */}
      <Testimonials />
      <Reservation />
      <Footer />
      <ChatBot />
    </main>
  )
}