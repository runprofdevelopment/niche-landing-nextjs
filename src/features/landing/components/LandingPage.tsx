import { AboutSection } from "./AboutSection";
import { AppPromoSection } from "./AppPromoSection";
import { CelebrateSection } from "./CelebrateSection";
import { ContactSection } from "./ContactSection";
import { HeroSection } from "./HeroSection";
import { LandingFooter } from "./LandingFooter";
import { LandingNavbar } from "./LandingNavbar";
import { PhilosophySection } from "./PhilosophySection";
import { ServicesSection } from "./ServicesSection";
import { StatsSection } from "./StatsSection";

export function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <LandingNavbar />
      <main>
        <HeroSection />
        <PhilosophySection />
        <CelebrateSection />
        <AboutSection />
        <ServicesSection />
        <AppPromoSection />
        <StatsSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}
