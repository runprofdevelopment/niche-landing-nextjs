import { AboutSection } from "./AboutSection";
import { CelebrateSection } from "./CelebrateSection";
import { ContactSection } from "./ContactSection";
import { HeroSection } from "./HeroSection";
import { LandingFooter } from "./LandingFooter";
import { LandingNavbar } from "./LandingNavbar";
import { PhilosophySection } from "./PhilosophySection";
import { ServicesSection } from "./ServicesSection";

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
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}
