"use client";

/**
 * Accordion — built on Base UI's Accordion primitive with an animated panel.
 */

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("overflow-hidden rounded-lg bg-muted", className)}
      {...props}
    />
  );
}

/** `action` renders as a sibling of the trigger button (e.g. a kebab menu) so it stays independently clickable. */
function AccordionTrigger({
  className,
  children,
  action,
  ...props
}: AccordionPrimitive.Trigger.Props & { action?: ReactNode }) {
  return (
    <AccordionPrimitive.Header className="flex items-center gap-2 px-4 py-3">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 cursor-pointer items-center justify-between gap-4 text-start text-sm font-semibold outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring",
          "[&[data-panel-open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
      {action}
    </AccordionPrimitive.Header>
  );
}

function AccordionPanel({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-panel"
      className={cn(
        "overflow-hidden bg-background text-sm text-foreground",
        // Prefer measured height; force collapse when closed so panels never leave ghost space.
        "h-(--accordion-panel-height,0px) transition-[height] duration-200 ease-out",
        "data-starting-style:h-0 data-ending-style:h-0 data-closed:h-0",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-3 px-4 py-4">{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionPanel };
