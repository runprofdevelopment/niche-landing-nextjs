import { middleware } from "@/providers/i18n/middleware";

export default middleware;

export const config = {
  // Locale-prefix all app routes so unknown paths still get a locale + 404 page.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
