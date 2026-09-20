import { GeneralSettingsView } from "@/features/settings";
import { createNavPageMetadata } from "@/shared/components/layout/nav-placeholder-page";

export const generateMetadata = () => createNavPageMetadata("settings");

export default function Page() {
  return <GeneralSettingsView />;
}
