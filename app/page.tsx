import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Menu from '@/components/Menu'
import Gallery from '@/components/Gallery'
import Story from '@/components/Story'
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
      <Story />
      <Gallery />
      <Events />
      <Testimonials />
      <Reservation />
      <Footer />
      <ChatBot />
    </main>
  )
}