import {
  BarChart3,
  CalendarDays,
  ChartPie,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Mail,
  Settings,
  Shield,
  UserPlus,
  Users,
  UserRoundCog,
} from "lucide-react";

import {
  DASHBOARD_PERMISSIONS,
  EVENT_PERMISSIONS,
  INVITATION_PERMISSIONS,
  REPORT_PERMISSIONS,
  REQUEST_PERMISSIONS,
  SECURITY_PERMISSIONS,
  SETTINGS_PERMISSIONS,
  STAFF_PERMISSIONS,
  ROLE_PERMISSIONS,
  REGISTRATION_USERS_PERMISSIONS,
  type PermissionKey,
} from "@/constants/permissions";
import { routes } from "@/constants/routes";

import type enNavigation from "@/locales/en/navigation";
import type { LucideIcon } from "lucide-react";

type NavigationTitleKey = keyof typeof enNavigation;

export type DashboardNavChild = {
  titleKey: NavigationTitleKey;
  href: string;
  icon: LucideIcon;
  permission: PermissionKey;
};

export type DashboardNavItem = {
  titleKey: NavigationTitleKey;
  href: string;
  icon: LucideIcon;
  permission: PermissionKey;
  children?: DashboardNavChild[];
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    titleKey: "dashboard",
    href: routes.dashboard,
    icon: LayoutDashboard,
    permission: DASHBOARD_PERMISSIONS.view,
  },
  {
    titleKey: "events",
    href: routes.events,
    icon: CalendarDays,
    permission: EVENT_PERMISSIONS.view,
  },
  {
    titleKey: "security",
    href: routes.security,
    icon: Shield,
    permission: SECURITY_PERMISSIONS.view,
  },
  {
    titleKey: "reports",
    href: routes.reports,
    icon: BarChart3,
    permission: REPORT_PERMISSIONS.view,
    children: [
      {
        titleKey: "overview",
        href: routes.reportsOverview,
        icon: ChartPie,
        permission: REPORT_PERMISSIONS.overviewView,
      },
      {
        titleKey: "analytics",
        href: routes.reportsAnalytics,
        icon: BarChart3,
        permission: REPORT_PERMISSIONS.analyticsView,
      },
    ],
  },
  {
    titleKey: "settings",
    href: routes.settings,
    icon: Settings,
    permission: SETTINGS_PERMISSIONS.view,
  },
  {
    titleKey: "users",
    href: routes.users,
    icon: Users,
    permission: STAFF_PERMISSIONS.view,
    children: [
      {
        titleKey: "registerUsers",
        href: routes.usersAll,
        icon: UserPlus,
        permission: REGISTRATION_USERS_PERMISSIONS.view,
      },
      {
        titleKey: "staff",
        href: routes.usersStaff,
        icon: UserRoundCog,
        permission: STAFF_PERMISSIONS.view,
      },
      {
        titleKey: "roles",
        href: routes.usersRoles,
        icon: KeyRound,
        permission: ROLE_PERMISSIONS.view,
      },
    ],
  },
  {
    titleKey: "requests",
    href: routes.requests,
    icon: Inbox,
    permission: REQUEST_PERMISSIONS.view,
  },
  {
    titleKey: "invitations",
    href: routes.invitations,
    icon: Mail,
    permission: INVITATION_PERMISSIONS.view,
  },
];

export function getNavItemByPath(pathname: string): DashboardNavItem | undefined {
  const normalized = pathname.replace(/^\/(en|ar)/, "") || "/";

  return dashboardNavItems.find((item) => {
    if (normalized === item.href || normalized.startsWith(`${item.href}/`)) {
      return true;
    }

    return item.children?.some(
      (child) => normalized === child.href || normalized.startsWith(`${child.href}/`),
    );
  });
}
