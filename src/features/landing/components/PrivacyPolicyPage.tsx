import { routes } from "@/constants/routes";
import { LandingFooter } from "@/features/landing/components/LandingFooter";
import { LandingNavbar } from "@/features/landing/components/LandingNavbar";
import {
  getPrivacyPolicy,
  type PrivacyPolicyContent,
} from "@/features/landing/content/privacy-policy";
import { Link } from "@/providers/i18n";

import type { Locale } from "@/config/i18n";

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 ps-5 text-white/80">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Paragraphs({ items }: { items: readonly string[] }) {
  return (
    <div className="mt-3 space-y-3 text-white/80">
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  );
}

type PrivacyPolicyPageProps = {
  locale: Locale;
};

export function PrivacyPolicyPage({ locale }: PrivacyPolicyPageProps) {
  const privacyPolicy: PrivacyPolicyContent = getPrivacyPolicy(locale);

  return (
    <div className="bg-[#080608] text-[#fffaf3]">
      <LandingNavbar />
      <main className="mx-auto w-full max-w-3xl px-5 pt-28 pb-16 sm:px-8 sm:pt-32 sm:pb-20 lg:px-12">
        <p className="font-geist text-[11px] font-medium tracking-[0.2em] text-secondary uppercase">
          <Link href={routes.home} className="transition-opacity hover:opacity-80">
            Niche Society
          </Link>
        </p>
        <h1 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl">
          {privacyPolicy.title}
        </h1>
        <div className="mt-4 space-y-1 font-geist text-sm text-white/55">
          <p>{privacyPolicy.organization}</p>
          <p>{privacyPolicy.product}</p>
          <p>{privacyPolicy.effectiveDate}</p>
        </div>

        <div className="mt-8 space-y-3 border-b border-white/15 pb-8 font-geist text-base leading-relaxed text-white/85">
          {privacyPolicy.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 space-y-10 font-geist text-base leading-relaxed">
          {privacyPolicy.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="font-display text-xl font-normal sm:text-2xl">{section.title}</h2>

              {section.intro ? <p className="mt-3 text-white/80">{section.intro}</p> : null}

              {section.paragraphs ? <Paragraphs items={section.paragraphs} /> : null}
              {section.bullets ? <BulletList items={section.bullets} /> : null}

              {section.subsections?.map((subsection) => (
                <div key={subsection.id} id={subsection.id} className="mt-6 scroll-mt-28">
                  <h3 className="font-display text-lg font-normal sm:text-xl">
                    {subsection.title}
                  </h3>
                  {subsection.intro ? (
                    <p className="mt-3 text-white/80">{subsection.intro}</p>
                  ) : null}
                  {subsection.bullets ? <BulletList items={subsection.bullets} /> : null}
                  {subsection.paragraphs ? <Paragraphs items={subsection.paragraphs} /> : null}
                </div>
              ))}

              {section.table ? (
                <div className="mt-4 overflow-x-auto rounded-sm border border-white/15">
                  <table className="w-full min-w-md text-start text-sm">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 font-medium">{section.table.headers[0]}</th>
                        <th className="px-4 py-3 font-medium">{section.table.headers[1]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.recipient} className="border-t border-white/10">
                          <td className="px-4 py-3 align-top font-medium text-[#fffaf3]">
                            {row.recipient}
                          </td>
                          <td className="px-4 py-3 align-top text-white/75">{row.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {section.closing ? (
                <div className="mt-3 space-y-3 text-white/80">
                  {section.closing.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
