import { REPORT_PERMISSIONS } from "@/constants/permissions";
import {
  createNavPageMetadata,
  renderNavPlaceholder,
} from "@/shared/components/layout/nav-placeholder-page";

export const generateMetadata = () => createNavPageMetadata("overview");

export default async function Page() {
  return renderNavPlaceholder("overview", REPORT_PERMISSIONS.overviewView);
}
