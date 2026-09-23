"use client";

import { AboutSection } from "./AboutSection";
import { AppPromoSection } from "./AppPromoSection";
import { CelebrateSection } from "./CelebrateSection";
import { ContactSection } from "./ContactSection";
import { HeroSection } from "./HeroSection";
import { LandingFooter } from "./LandingFooter";
import { LandingMotionProvider } from "./LandingMotion";
import { LandingNavbar } from "./LandingNavbar";
import { LandingSplash } from "./LandingSplash";
import { PhilosophySection } from "./PhilosophySection";
import { Reveal } from "./Reveal";
import { ServicesSection } from "./ServicesSection";
// import { StatsSection } from "./StatsSection";

export function LandingPage() {
  return (
    <LandingMotionProvider>
      <LandingSplash />
      <div className="bg-background text-foreground">
        <LandingNavbar />
        <main>
          <HeroSection />
          <Reveal>
            <PhilosophySection />
          </Reveal>
          <Reveal delay={60}>
            <CelebrateSection />
          </Reveal>
          <AboutSection />
          <ServicesSection />
          <Reveal variant="scale" delay={60}>
            <AppPromoSection />
          </Reveal>
          {/* <Reveal delay={40}>
            <StatsSection />
          </Reveal> */}
          <Reveal delay={60}>
            <ContactSection />
          </Reveal>
        </main>
        <Reveal delay={40}>
          <LandingFooter />
        </Reveal>
      </div>
    </LandingMotionProvider>
  );
}
