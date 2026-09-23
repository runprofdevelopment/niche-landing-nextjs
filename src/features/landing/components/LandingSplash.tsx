"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";

import { useLandingMotion, useLockBodyScroll } from "./LandingMotion";

/** Hard cap: splash must finish within 5s including exit. */
const SPLASH_HOLD_MS = 4200;
const EXIT_MS = 700;

export function LandingSplash() {
  const t = useTranslations("landing");
  const { markReady } = useLandingMotion();
  const reduceMotion = useReducedMotion();
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);

  useLockBodyScroll(!gone);

  useEffect(() => {
    const hold = reduceMotion ? 900 : SPLASH_HOLD_MS;
    const exit = reduceMotion ? 200 : EXIT_MS;

    const exitTimer = window.setTimeout(() => setExiting(true), hold);
    const doneTimer = window.setTimeout(() => {
      setGone(true);
      markReady();
    }, hold + exit);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [markReady, reduceMotion]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary"
          aria-hidden={exiting}
          role="presentation"
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: EXIT_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="relative h-28 w-72 sm:h-36 sm:w-[22rem] lg:h-44 lg:w-[28rem]"
            initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.82 }}
            animate={
              exiting
                ? { opacity: 0, scale: 1.08 }
                : { opacity: 1, scale: 1 }
            }
            transition={
              reduceMotion
                ? { duration: 0.2 }
                : {
                    opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    scale: { type: "spring", stiffness: 120, damping: 16 },
                  }
            }
          >
            <Image
              src="/images/logo.png"
              alt={t("logoAlt")}
              fill
              priority
              className="object-contain object-center mix-blend-screen"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
