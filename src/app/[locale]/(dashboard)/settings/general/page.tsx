import { SETTINGS_PERMISSIONS } from "@/constants/permissions";
import {
  createNavPageMetadata,
  renderNavPlaceholder,
} from "@/shared/components/layout/nav-placeholder-page";

export const generateMetadata = () => createNavPageMetadata("general");

export default async function Page() {
  return renderNavPlaceholder("general", SETTINGS_PERMISSIONS.view);
}
