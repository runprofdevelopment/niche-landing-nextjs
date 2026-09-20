import { REPORT_PERMISSIONS } from "@/constants/permissions";
import {
  createNavPageMetadata,
  renderNavPlaceholder,
} from "@/shared/components/layout/nav-placeholder-page";

export const generateMetadata = () => createNavPageMetadata("reports");

export default async function Page() {
  return renderNavPlaceholder("reports", REPORT_PERMISSIONS.view);
}
