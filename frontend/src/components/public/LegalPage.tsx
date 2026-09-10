"use client";

import { type ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import PublicLayout from "./PublicLayout";
import PageHero from "./PageHero";

interface Bilingual {
  en: string;
  hi: string;
}

export interface LegalSection {
  /** Anchor id, used by the contents list and for deep links. */
  id: string;
  title: Bilingual;
  body: ReactNode;
}

interface LegalPageProps {
  title: Bilingual;
  subtitle: Bilingual;
  /** Displayed verbatim, in the format used by the source document. */
  lastUpdated: string;
  /** Paragraphs shown above the contents list. */
  preamble: ReactNode;
  sections: LegalSection[];
}

/** Paragraph of legal body text. */
export const P = ({ children }: { children: ReactNode }) => (
  <p className="mb-4 leading-relaxed text-muted-foreground">{children}</p>
);

/** Subheading within a numbered section. */
export const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="mb-3 mt-6 font-heading text-base font-semibold text-foreground">
    {children}
  </h3>
);

/** Bulleted list of legal body text. */
export const List = ({ children }: { children: ReactNode }) => (
  <ul className="mb-4 list-disc space-y-2 pl-6 leading-relaxed text-muted-foreground">
    {children}
  </ul>
);

/** Boxed name / address / phone block used by the contact section. */
export const ContactBlock = ({
  name,
  address,
  phone,
}: {
  name: string;
  address: string;
  phone: string;
}) => (
  <div className="rounded-lg border border-border bg-muted/40 p-5">
    <p className="mb-3 font-heading font-semibold text-foreground">{name}</p>
    <dl className="space-y-2 text-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
        <dt className="w-24 shrink-0 font-medium text-foreground">Address</dt>
        <dd className="text-muted-foreground">{address}</dd>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
        <dt className="w-24 shrink-0 font-medium text-foreground">Phone</dt>
        <dd className="text-muted-foreground">
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="underline-offset-2 hover:text-primary hover:underline"
          >
            {phone}
          </a>
        </dd>
      </div>
    </dl>
  </div>
);

/**
 * Shared shell for the Trust's public legal documents: hero, last-updated
 * line, preamble, a contents list of jump links, and numbered sections.
 *
 * Section titles are bilingual; the legal body is authored in English, since
 * the published documents are English and any translation is for convenience
 * only.
 */
const LegalPage = ({
  title,
  subtitle,
  lastUpdated,
  preamble,
  sections,
}: LegalPageProps) => {
  const { t, language } = useLanguage();

  return (
    <PublicLayout>
      <PageHero title={title[language]} subtitle={subtitle[language]} />

      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <p className="mb-10 text-sm text-muted-foreground">
              {t("Last Updated", "अंतिम बार अद्यतन")}:{" "}
              <span className="font-medium text-foreground">{lastUpdated}</span>
            </p>

            <div className="mb-12">{preamble}</div>

            <nav
              aria-label={t("Contents", "विषय-सूची")}
              className="mb-12 rounded-lg border border-border bg-muted/40 p-6"
            >
              <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
                {t("Contents", "विषय-सूची")}
              </h2>
              <ol className="space-y-2">
                {sections.map((section, index) => (
                  <li key={section.id} className="flex gap-3 text-sm">
                    <span className="w-5 shrink-0 tabular-nums text-muted-foreground">
                      {index + 1}.
                    </span>
                    <a
                      href={`#${section.id}`}
                      className="text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
                    >
                      {section.title[language]}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="space-y-12">
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="mb-4 font-heading text-xl font-bold text-foreground md:text-2xl">
                    <span className="mr-2 tabular-nums text-primary">
                      {index + 1}.
                    </span>
                    {section.title[language]}
                  </h2>
                  {section.body}
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LegalPage;
