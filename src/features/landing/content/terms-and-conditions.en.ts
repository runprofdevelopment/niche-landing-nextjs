export type TermsSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  intro?: string;
  subsections?: {
    id: string;
    title: string;
    intro?: string;
    paragraphs?: string[];
    bullets?: string[];
  }[];
  closing?: string[];
};

export type TermsAndConditionsContent = {
  title: string;
  organization: string;
  product: string;
  effectiveDate: string;
  intro: string[];
  sections: TermsSection[];
};

export const termsAndConditionsEn: TermsAndConditionsContent = {
  title: "Terms and Conditions",
  organization: "Niche Society",
  product: "Product: Niche Frontdesk & Website",
  effectiveDate: "Effective date: 23 September 2026",
  intro: [
    "These Terms and Conditions (“Terms”) govern your access to and use of Niche Society’s website (www.niche-society.com), related marketing pages, and the Niche Frontdesk application and services (together, the “Services”).",
    "By accessing or using the Services, you agree to these Terms. If you do not agree, please do not use the Services.",
  ],
  sections: [
    {
      id: "who-we-are",
      title: "1. Who we are",
      paragraphs: [
        "The Services are operated by Niche Society (“Niche Society”, “we”, “us”, “our”).",
        "Contact: support@niche-society.com",
        "Website: www.niche-society.com",
      ],
    },
    {
      id: "eligibility",
      title: "2. Eligibility and accounts",
      intro: "To use Niche Frontdesk as an operator, you must:",
      bullets: [
        "Be at least 18 years old",
        "Provide accurate registration information",
        "Keep your login credentials confidential",
        "Be authorised by your organisation (or by Niche Society) to access assigned events",
      ],
      closing: [
        "We may approve, suspend, or reject operator accounts at our discretion, including where approval or role assignment is required before full access is granted.",
        "You are responsible for activity under your account. Notify us promptly if you suspect unauthorised use.",
      ],
    },
    {
      id: "services-description",
      title: "3. Description of the Services",
      paragraphs: [
        "Niche Society provides luxury event and household management solutions. Niche Frontdesk supports authorised staff with tools such as event operations, guest lists, seating, invitations, and check-in workflows.",
        "The public website provides information about our services and a contact form for enquiries. Submitting a contact request does not create a binding contract until we confirm engagement in writing.",
      ],
    },
    {
      id: "acceptable-use",
      title: "4. Acceptable use",
      intro: "You agree not to:",
      bullets: [
        "Use the Services for any unlawful, harmful, or fraudulent purpose",
        "Attempt to gain unauthorised access to systems, accounts, or data",
        "Interfere with or disrupt the Services or other users",
        "Upload malware, scrape content in an abusive way, or reverse-engineer the app except where permitted by law",
        "Misuse guest, staff, or client data accessed through the Services",
        "Misrepresent your identity or affiliation with Niche Society",
      ],
      closing: [
        "We may suspend or terminate access if we reasonably believe these rules have been breached.",
      ],
    },
    {
      id: "client-data",
      title: "5. Client and guest data",
      paragraphs: [
        "When you use Niche Frontdesk for an event, guest and event data are typically provided by or on behalf of the event organiser. You must only use that data for authorised event operations.",
        "You must comply with applicable privacy and data-protection laws, including the Saudi Personal Data Protection Law (PDPL) where it applies, and with any instructions from the event organiser.",
        "Our handling of personal data is described in our Privacy Policy.",
      ],
    },
    {
      id: "intellectual-property",
      title: "6. Intellectual property",
      paragraphs: [
        "The Services, including branding, text, design, software, and materials, are owned by Niche Society or its licensors and are protected by intellectual-property laws.",
        "You receive a limited, non-exclusive, non-transferable right to use the Services as permitted by these Terms. You may not copy, modify, distribute, or create derivative works from our materials without prior written consent, except for fair use or other rights that cannot be waived under applicable law.",
      ],
    },
    {
      id: "third-party",
      title: "7. Third-party services",
      paragraphs: [
        "The Services may rely on third-party providers (for example hosting, authentication, messaging, or analytics). Your use of those providers may also be subject to their terms.",
        "We are not responsible for third-party websites or services linked from our website, except as required by law.",
      ],
    },
    {
      id: "disclaimers",
      title: "8. Disclaimers",
      paragraphs: [
        "The Services are provided on an “as is” and “as available” basis to the fullest extent permitted by law. We do not warrant uninterrupted or error-free operation.",
        "Website content is for general information. It does not constitute professional advice unless we expressly agree otherwise in a signed engagement.",
      ],
    },
    {
      id: "liability",
      title: "9. Limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by applicable law, Niche Society and its directors, employees, and agents are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, arising from your use of the Services.",
        "Nothing in these Terms excludes or limits liability that cannot be excluded under applicable Saudi law.",
      ],
    },
    {
      id: "indemnity",
      title: "10. Indemnity",
      paragraphs: [
        "You agree to indemnify and hold Niche Society harmless from claims, losses, and expenses (including reasonable legal fees) arising from your misuse of the Services, your breach of these Terms, or your violation of applicable law or third-party rights — except to the extent caused by our wilful misconduct or gross negligence.",
      ],
    },
    {
      id: "termination",
      title: "11. Suspension and termination",
      paragraphs: [
        "You may stop using the Services at any time. Operator accounts may be deleted through the app or by contacting support@niche-society.com.",
        "We may suspend or terminate access where reasonably necessary for security, legal compliance, non-payment (where applicable), or material breach of these Terms.",
        "Provisions that by their nature should survive (including intellectual property, disclaimers, liability limits, and indemnity) will survive termination.",
      ],
    },
    {
      id: "changes",
      title: "12. Changes to these Terms",
      paragraphs: [
        "We may update these Terms from time to time. The “Effective date” at the top will change when we do. Material changes may also be communicated on the website, in the app, or by email.",
        "Continued use of the Services after an update means you accept the revised Terms.",
      ],
    },
    {
      id: "governing-law",
      title: "13. Governing law and disputes",
      paragraphs: [
        "These Terms are governed by the laws of the Kingdom of Saudi Arabia.",
        "Courts in Riyadh, Kingdom of Saudi Arabia, shall have exclusive jurisdiction over disputes arising from these Terms, subject to any mandatory consumer protections that apply.",
      ],
    },
    {
      id: "contact",
      title: "14. Contact",
      paragraphs: [
        "Niche Society",
        "Email: support@niche-society.com",
        "Phone: +966 57 395 0656",
        "Website: www.niche-society.com",
        "If you have questions about these Terms, write to us at the email above.",
      ],
    },
  ],
};
