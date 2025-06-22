import Hero from "../../components/landingPage/Hero"
import LandingHeader from "../../components/landingPage/Header"
import Features from "../../components/landingPage/Features"
import Community from "../../components/landingPage/Community"
import About from "../../components/landingPage/About"
import Footer from "../../components/landingPage/Footer"

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0A1128]">
      {/* Main content */}
      <div className="relative z-10">
        <div className="animate-fade-in">
          <LandingHeader />
        </div>
        
        <main className="overflow-hidden">
          <section className="animate-slide-up">
            <Hero />
          </section>

          <section className="relative">
            <Features />
          </section>

          <section className="relative">
            <About />
          </section>

          <section className="relative">
            <Community />
          </section>

          <section>
            <Footer />
          </section>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;