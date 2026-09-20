import { routes } from "@/constants/routes";
import { redirect } from "@/providers/i18n";
import { getLocale } from "@/providers/i18n/server";

export default async function LoginPage() {
  const locale = await getLocale();
  redirect({ href: routes.login, locale });
}
