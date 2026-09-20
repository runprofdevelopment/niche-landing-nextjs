import { INVITATION_PERMISSIONS } from "@/constants/permissions";
import {
  createNavPageMetadata,
  renderNavPlaceholder,
} from "@/shared/components/layout/nav-placeholder-page";

export const generateMetadata = () => createNavPageMetadata("sent");

export default async function Page() {
  return renderNavPlaceholder("sent", INVITATION_PERMISSIONS.view);
}
