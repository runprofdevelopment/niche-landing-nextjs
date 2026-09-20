"use client";

import { SIDEBAR_DRAWER_WIDTH, SIDEBAR_RAIL_WIDTH, SIDEBAR_RADIUS } from "@/config/site";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { useSidebar } from "@/shared/components/ui/sidebar";

import { SidebarNavContent } from "./sidebar-nav-content";

export function DashboardSidebar() {
  const isMobile = useIsMobile();
  const { open, setOpen, openMobile, setOpenMobile } = useSidebar();

  const drawerOpen = isMobile ? openMobile : open;
  const setDrawerOpen = isMobile ? setOpenMobile : setOpen;

  return (
    <>
      {!isMobile ? (
        <aside
          className={cn(
            "hidden h-full w-(--sidebar-rail-width) shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground md:flex",
            "rounded-(--sidebar-radius)",
          )}
          style={
            {
              "--sidebar-rail-width": SIDEBAR_RAIL_WIDTH,
              "--sidebar-radius": SIDEBAR_RADIUS,
            } as React.CSSProperties
          }
        >
          <SidebarNavContent variant="rail" />
        </aside>
      ) : null}

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="left"
          className="w-(--sidebar-drawer-width) max-w-[85vw] border-e border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={{ "--sidebar-drawer-width": SIDEBAR_DRAWER_WIDTH } as React.CSSProperties}
        >
          <SidebarNavContent variant="drawer" onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
