import Header from "@/components/Header"
import HeroSection from "@/components/HeroSection"
import FeaturesSection from "@/components/FeaturesSection"
import PricingSection from "@/components/PricingSection"
import AboutSection from "@/components/AboutSection"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <AboutSection />
      </main>
    </div>
  );
}