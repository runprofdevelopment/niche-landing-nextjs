import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";

/** Templates index redirects to the invitations collection. */
export default function InvitationTemplatesIndexPage() {
  redirect(routes.invitations);
}
