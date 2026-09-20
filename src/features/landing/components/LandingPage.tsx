import { ContactSection } from "./ContactSection";
import { HeroSection } from "./HeroSection";
import { LandingFooter } from "./LandingFooter";
import { LandingNavbar } from "./LandingNavbar";
import { PhilosophySection } from "./PhilosophySection";

export function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <LandingNavbar />
      <main>
        <HeroSection />
        <PhilosophySection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}
