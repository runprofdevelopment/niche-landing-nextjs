import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);

/** Query params are locale-agnostic; re-exported here for a single i18n import path. */
export { useSearchParams } from "next/navigation";
