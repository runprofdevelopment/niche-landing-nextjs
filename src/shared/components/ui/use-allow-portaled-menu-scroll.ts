"use client";

import { useEffect, useRef } from "react";

/**
 * Stops wheel/touchmove from bubbling out of a portaled menu so parent
 * scroll-locks (if any) do not steal the gesture.
 */
export function useAllowPortaledMenuScroll(open: boolean) {
  const popupRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const stopIfInsidePopup = (event: Event) => {
      const popup = popupRef.current;
      if (!popup) return;
      const target = event.target;
      if (target instanceof Node && popup.contains(target)) {
        event.stopPropagation();
      }
    };

    document.addEventListener("wheel", stopIfInsidePopup, true);
    document.addEventListener("touchmove", stopIfInsidePopup, true);
    return () => {
      document.removeEventListener("wheel", stopIfInsidePopup, true);
      document.removeEventListener("touchmove", stopIfInsidePopup, true);
    };
  }, [open]);

  return popupRef;
}
