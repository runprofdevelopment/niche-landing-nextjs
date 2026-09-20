"use client";

import { Pipette } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input, fieldInvalidClassName } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Select } from "@/shared/components/ui/select";
import { Slider } from "@/shared/components/ui/slider";

type ColorFormat = "hex" | "rgb" | "hsl";

type ColorPickerProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

type HsvColor = {
  h: number;
  s: number;
  v: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hsvToHex({ h, s, v }: HsvColor): string {
  const sat = s / 100;
  const val = v / 100;
  const c = val * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = val - c;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (channel: number) =>
    Math.round((channel + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToHsv(hex: string): HsvColor {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return { h: 0, s: 0, v: 100 };

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  return { h, s, v };
}

function ColorPicker({
  value,
  defaultValue = "#602234",
  onValueChange,
  placeholder,
  disabled = false,
  className,
}: ColorPickerProps) {
  const t = useTranslations("common");
  const [internalHex, setInternalHex] = useState(defaultValue.toUpperCase());
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [open, setOpen] = useState(false);

  const hex = (value ?? internalHex).toUpperCase();
  const hsv = useMemo(() => hexToHsv(hex), [hex]);

  const updateHex = useCallback(
    (nextHex: string) => {
      const normalized = nextHex.startsWith("#")
        ? nextHex.toUpperCase()
        : `#${nextHex.toUpperCase()}`;
      if (value === undefined) setInternalHex(normalized);
      onValueChange?.(normalized);
    },
    [onValueChange, value],
  );

  const updateHsv = useCallback(
    (next: Partial<HsvColor>) => {
      updateHex(hsvToHex({ ...hsv, ...next }));
    },
    [hsv, updateHex],
  );

  const eyedropperSupported = typeof window !== "undefined" && "EyeDropper" in window;

  const pickFromScreen = async () => {
    if (!eyedropperSupported) return;
    // @ts-expect-error EyeDropper is not in TS lib yet
    const dropper = new window.EyeDropper();
    const result = await dropper.open();
    updateHex(result.sRGBHex);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start gap-2 rounded-lg px-3 font-normal",
            fieldInvalidClassName,
            className,
          )}
        >
          <span
            className="size-4 shrink-0 rounded-sm border border-border"
            style={{ backgroundColor: hex }}
          />
          <span className="truncate">{hex || (placeholder ?? t("selectPlaceholder"))}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4 p-4" align="start">
        <div
          className="relative h-40 w-full cursor-crosshair rounded-lg border border-border"
          style={{
            backgroundColor: hsvToHex({ h: hsv.h, s: 100, v: 100 }),
          }}
          onPointerDown={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const move = (clientX: number, clientY: number) => {
              const s = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
              const v = clamp(100 - ((clientY - rect.top) / rect.height) * 100, 0, 100);
              updateHsv({ s, v });
            };
            move(event.clientX, event.clientY);
            const onMove = (moveEvent: PointerEvent) => move(moveEvent.clientX, moveEvent.clientY);
            const onUp = () => {
              window.removeEventListener("pointermove", onMove);
              window.removeEventListener("pointerup", onUp);
            };
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
          }}
        >
          <div className="absolute inset-0 rounded-lg bg-linear-to-r from-white to-transparent" />
          <div className="absolute inset-0 rounded-lg bg-linear-to-t from-black to-transparent" />
          <span
            className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Hue</label>
          <Slider
            min={0}
            max={360}
            step={1}
            value={[hsv.h]}
            onValueChange={([h]) => {
              if (h !== undefined) updateHsv({ h });
            }}
          />
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Select
            value={format}
            onValueChange={(next) => setFormat((next as ColorFormat) ?? "hex")}
            searchable={false}
            items={[
              { value: "hex", label: "HEX" },
              { value: "rgb", label: "RGB" },
              { value: "hsl", label: "HSL" },
            ]}
          />
          {eyedropperSupported ? (
            <Button type="button" variant="outline" size="icon" onClick={pickFromScreen}>
              <Pipette className="size-4" />
            </Button>
          ) : null}
        </div>

        <Input
          value={hex}
          onChange={(event) => updateHex(event.target.value)}
          aria-label="Color value"
        />
      </PopoverContent>
    </Popover>
  );
}

export { ColorPicker, type ColorPickerProps };
