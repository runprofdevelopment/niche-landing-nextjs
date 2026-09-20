"use client";

import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { useEffect, useRef, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";

export type QrScannerProps = {
  /** Called when a QR payload is decoded. */
  onScan: (value: string) => void;
  /** Pause decoding (keeps camera preview). */
  paused?: boolean;
  facingMode?: "environment" | "user";
  className?: string;
  /** Extra classes for the video frame container. */
  frameClassName?: string;
};

type ScannerStatus = "starting" | "ready" | "denied" | "error" | "unsupported";

/**
 * Reusable camera QR scanner built on @zxing/browser.
 * Feature screens supply their own result UI via `onScan`.
 */
export function QrScanner({
  onScan,
  paused = false,
  facingMode = "environment",
  className,
  frameClassName,
}: QrScannerProps) {
  const t = useTranslations("common");
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const onScanRef = useRef(onScan);
  const pausedRef = useRef(paused);
  const lastScanRef = useRef<{ value: string; at: number }>({ value: "", at: 0 });
  const [status, setStatus] = useState<ScannerStatus>("starting");

  const unsupported = typeof navigator !== "undefined" && !navigator.mediaDevices?.getUserMedia;
  const viewStatus: ScannerStatus = unsupported ? "unsupported" : status;

  useEffect(() => {
    onScanRef.current = onScan;
    pausedRef.current = paused;
  }, [onScan, paused]);

  useEffect(() => {
    if (unsupported) return;

    let cancelled = false;
    const reader = new BrowserQRCodeReader();

    const start = async () => {
      if (!videoRef.current) return;

      try {
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoRef.current,
          (result) => {
            if (cancelled || pausedRef.current) return;
            if (!result) return;

            const value = result.getText().trim();
            if (!value) return;

            const now = Date.now();
            if (lastScanRef.current.value === value && now - lastScanRef.current.at < 2500) {
              return;
            }
            lastScanRef.current = { value, at: now };
            onScanRef.current(value);
          },
        );

        if (cancelled) {
          controls.stop();
          return;
        }

        controlsRef.current = controls;
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        const name = error instanceof DOMException ? error.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setStatus("denied");
        } else {
          setStatus("error");
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      BrowserQRCodeReader.releaseAllStreams();
    };
  }, [facingMode, unsupported]);

  const statusMessage =
    viewStatus === "starting"
      ? t("scannerStarting")
      : viewStatus === "ready"
        ? paused
          ? t("scannerPaused")
          : t("scannerWaiting")
        : viewStatus === "denied"
          ? t("scannerPermissionDenied")
          : viewStatus === "unsupported"
            ? t("scannerUnsupported")
            : t("scannerError");

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p className="text-center text-sm font-medium text-foreground">{t("scannerPointCamera")}</p>

      <div
        className={cn(
          "relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-xl bg-muted/40",
          frameClassName,
        )}
      >
        <video ref={videoRef} className="size-full object-cover" muted playsInline autoPlay />

        <div className="pointer-events-none absolute inset-[12%] rounded-sm">
          <span className="absolute inset-s-0 top-0 size-10 border-s-4 border-t-4 border-primary" />
          <span className="absolute inset-e-0 top-0 size-10 border-e-4 border-t-4 border-primary" />
          <span className="absolute bottom-0 inset-s-0 size-10 border-s-4 border-b-4 border-primary" />
          <span className="absolute bottom-0 inset-e-0 size-10 border-e-4 border-b-4 border-primary" />
          {viewStatus === "ready" && !paused ? (
            <span className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 bg-destructive/80 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
          ) : null}
        </div>

        {(viewStatus === "denied" || viewStatus === "error" || viewStatus === "unsupported") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85 p-6 text-center">
            <p className="text-sm text-muted-foreground">{statusMessage}</p>
            {(viewStatus === "denied" || viewStatus === "error") && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                {t("tryAgain")}
              </Button>
            )}
          </div>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">{statusMessage}</p>
    </div>
  );
}
