import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  size?: "sm" | "default" | "lg";
};

const sizeClassName: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "size-4",
  default: "size-5",
  lg: "size-8",
};

function Spinner({ className, size = "default" }: SpinnerProps) {
  return <Loader2 aria-hidden className={cn("animate-spin", sizeClassName[size], className)} />;
}

export { Spinner };
