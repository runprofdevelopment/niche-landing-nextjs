import { REPORT_PERMISSIONS } from "@/constants/permissions";
import {
  createNavPageMetadata,
  renderNavPlaceholder,
} from "@/shared/components/layout/nav-placeholder-page";

export const generateMetadata = () => createNavPageMetadata("analytics");

export default async function Page() {
  return renderNavPlaceholder("analytics", REPORT_PERMISSIONS.analyticsView);
}
