import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Hero from '../../components/sections/Hero'
import Problem from '../../components/sections/Problem'
import Solution from '../../components/sections/Solution'
import Advisor from '../../components/sections/Advisor'
import Market from '../../components/sections/Market'
import Marketplace from '../../components/sections/Marketplace'
import FinalCta from '../../components/sections/FinalCta'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ivory font-sans text-ink antialiased">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Advisor />
        <Market />
        <Marketplace />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}