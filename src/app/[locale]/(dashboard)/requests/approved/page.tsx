import { REQUEST_PERMISSIONS } from "@/constants/permissions";
import {
  createNavPageMetadata,
  renderNavPlaceholder,
} from "@/shared/components/layout/nav-placeholder-page";

export const generateMetadata = () => createNavPageMetadata("approved");

export default async function Page() {
  return renderNavPlaceholder("approved", REQUEST_PERMISSIONS.view);
}
