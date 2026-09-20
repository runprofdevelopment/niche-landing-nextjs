import { HeroSection } from "./HeroSection";
import { LandingFooter } from "./LandingFooter";
import { LandingNavbar } from "./LandingNavbar";

export function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <LandingNavbar />
      <main>
        <HeroSection />
      </main>
      <LandingFooter />
    </div>
  );
}
