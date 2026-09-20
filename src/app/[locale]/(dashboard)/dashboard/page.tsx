import { DashboardHomePage } from "@/features/dashboard/components/DashboardHomePage";
import { createNavPageMetadata } from "@/shared/components/layout/nav-placeholder-page";

export const generateMetadata = () => createNavPageMetadata("dashboard");

export default function DashboardPage() {
  return <DashboardHomePage />;
}
