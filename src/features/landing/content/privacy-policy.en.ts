export type PrivacyShareRow = {
  recipient: string;
  reason: string;
};

export type PrivacySection = {
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
  table?: {
    headers: [string, string];
    rows: PrivacyShareRow[];
  };
  closing?: string[];
};

export type PrivacyPolicyContent = {
  title: string;
  organization: string;
  product: string;
  effectiveDate: string;
  intro: string[];
  sections: PrivacySection[];
};

export const privacyPolicyEn: PrivacyPolicyContent = {
  title: "Privacy Policy",
  organization: "Niche Society",
  product: "Product: Niche Frontdesk",
  effectiveDate: "Effective date: 21 September 2026",
  intro: [
    "Niche Society (“we”, “us”, “our”) operates Niche Frontdesk, a mobile application for authorised front-desk and event staff. This policy explains how we collect, use, store, and share personal data when you use the app.",
    "If you do not agree with this policy, please do not use Niche Frontdesk.",
  ],
  sections: [
    {
      id: "who-this-policy-covers",
      title: "1. Who this policy covers",
      intro: "This policy applies to:",
      bullets: [
        "Operators — staff who create an account, wait for approval, and use the app to manage assigned events and guest check-in.",
        "People whose data appears in the app in the course of an event — for example guests on an assigned guest list. We process that data to provide the service to the event organiser.",
      ],
      closing: [
        "This policy does not replace any privacy notice the event organiser gives to their guests.",
      ],
    },
    {
      id: "who-we-are",
      title: "2. Who we are",
      paragraphs: [
        "Controller (operator accounts and app operations): Niche Society",
        "Contact: support@niche-society.com",
        "Website: www.niche-society.com",
        "For guest names, seating, invitation codes, and check-in status, we typically act as a processor on behalf of the event organiser (the controller of that guest data). We use that data only to run check-in and related event operations.",
      ],
    },
    {
      id: "data-we-collect",
      title: "3. Data we collect",
      subsections: [
        {
          id: "account-and-profile",
          title: "3.1 Account and profile",
          intro: "When you register or complete your account, we collect:",
          bullets: [
            "Full name",
            "Email address",
            "Phone number and country code",
            "Gender (if you choose to provide it)",
            "Password, or sign-in through Google or Apple",
            "Profile photo, if you add one",
            "Account status (for example pending approval or active)",
          ],
        },
        {
          id: "authentication-and-security",
          title: "3.2 Authentication and security",
          bullets: [
            "Sign-in credentials and one-time verification codes (email or SMS)",
            "Authentication identifiers from Firebase, Google, or Apple",
            "Session tokens needed to keep you signed in",
          ],
          paragraphs: ["We do not store your Google or Apple password."],
        },
        {
          id: "device-and-notifications",
          title: "3.3 Device and notifications",
          bullets: [
            "A device notification token, so we can send operational alerts",
            "Language preference (English or Arabic) stored on the device",
            "Basic technical logs (for example failed requests) used to keep the service working",
          ],
        },
        {
          id: "camera-qr-scanning",
          title: "3.4 Camera (QR scanning)",
          paragraphs: [
            "If you use Scan QR Code, the camera is used on the device to read invitation codes. We do not keep a camera stream or photo of the QR code. We send the scanned or typed code to our servers only to verify the guest and record check-in.",
            "The camera is not used for past (completed) events.",
          ],
        },
        {
          id: "event-and-guest-operations",
          title: "3.5 Event and guest operations",
          intro: "Depending on events you are assigned to, the app may show and update:",
          bullets: [
            "Event name, date, time, venue, and status (live, upcoming, completed)",
            "Guest name, invitation code, table, seat, companion details, and arrival status",
            "Check-in counts and related event statistics",
          ],
          paragraphs: [
            "This information is provided by the event organiser’s systems. You should use it only for your assigned duties.",
          ],
        },
        {
          id: "support",
          title: "3.6 Support",
          paragraphs: [
            "If you contact us, we collect whatever you send (for example name, email, and the content of the message) so we can respond.",
            "We do not sell personal data.",
          ],
        },
      ],
    },
    {
      id: "how-we-use-data",
      title: "4. How we use data",
      intro: "We use personal data to:",
      bullets: [
        "Create and manage operator accounts, including admin approval",
        "Sign you in and protect accounts (verification codes, session security)",
        "Show assigned events and guest lists",
        "Record guest check-in when you scan or enter an invitation code",
        "Send service notifications (for example operational alerts)",
        "Remember language and similar app settings",
        "Improve reliability, diagnose errors, and secure the service",
        "Meet legal and regulatory obligations",
      ],
      closing: ["We do not use operator or guest data for third-party advertising."],
    },
    {
      id: "legal-basis",
      title: "5. Legal basis (Saudi PDPL)",
      intro: "Where the Saudi Personal Data Protection Law applies, we process data because:",
      bullets: [
        "Contract — we need it to provide Frontdesk (account, assigned events, check-in)",
        "Legitimate interest / operational necessity — security, fraud prevention, service logs, product reliability, in a way that does not override your rights",
        "Consent — where required (for example optional profile fields, or notifications where consent is legally needed)",
        "Legal obligation — if the law requires us to keep or disclose information",
      ],
      closing: [
        "You may withdraw consent where processing is based on consent. That does not affect processing we already carried out, or processing we still need for the contract or the law.",
      ],
    },
    {
      id: "who-we-share-data-with",
      title: "6. Who we share data with",
      intro: "We share data only as needed:",
      table: {
        headers: ["Recipient", "Why"],
        rows: [
          {
            recipient: "Event organisers / venue operators",
            reason: "So they can run the event and see check-in results",
          },
          {
            recipient: "Cloud and infrastructure providers",
            reason: "Hosting, database, and API delivery",
          },
          {
            recipient: "Firebase (Google)",
            reason: "Authentication, and push notifications if enabled",
          },
          {
            recipient: "Google / Apple",
            reason: "Only if you choose that sign-in method",
          },
          {
            recipient: "SMS / email providers",
            reason: "To send verification codes",
          },
          {
            recipient: "Professional advisers and authorities",
            reason: "If required by law, dispute, or safety",
          },
        ],
      },
      closing: [
        "These parties may process data only for the purposes above, under appropriate contracts where required.",
        "We do not share your data with unrelated marketers.",
      ],
    },
    {
      id: "retention",
      title: "7. Retention",
      intro: "We keep data only as long as needed for the purposes above:",
      bullets: [
        "Operator account — while the account is active, then for a limited period after deletion or deactivation unless the law requires longer",
        "Check-in and event records — for the life of the event operations and any period the organiser or the law requires",
        "Security and technical logs — for a short operational period",
        "Support messages — as long as needed to resolve the request and keep a reasonable record",
      ],
      closing: [
        "When data is no longer needed, we delete or irreversibly anonymise it where practicable.",
      ],
    },
    {
      id: "security",
      title: "8. Security",
      intro: "We use reasonable technical and organisational measures, including:",
      bullets: [
        "Encrypted transport (HTTPS) between the app and our servers",
        "Authenticated API access",
        "Role-based access so operators see only assigned events",
        "Admin approval before a new operator can use the service",
      ],
      closing: [
        "No method of transmission or storage is completely secure. Please keep your device and sign-in details confidential.",
      ],
    },
    {
      id: "international-transfers",
      title: "9. International transfers",
      paragraphs: [
        "Our infrastructure and vendors (including Firebase / Google) may process data outside Saudi Arabia. Where we transfer personal data abroad, we take steps required by applicable law, such as contractual safeguards.",
      ],
    },
    {
      id: "your-rights",
      title: "10. Your rights",
      intro: "Subject to the PDPL and other applicable law, you may request to:",
      bullets: [
        "Access the personal data we hold about you",
        "Correct inaccurate or incomplete data",
        "Request deletion of your account and related personal data",
        "Withdraw consent where processing is based on consent",
        "Object to or restrict certain processing",
        "Lodge a complaint with the competent Saudi authority (SDAIA)",
      ],
      closing: [
        "You can update much of your profile in Account Settings, and you can request account deletion from the app.",
        "We may need to verify your identity before fulfilling a request. We may refuse or limit a request where the law allows (for example, data we must keep, or data that belongs to an event organiser).",
        "For guest-list data, the event organiser is usually the right first contact. We will help where we are required to.",
        "Contact for privacy requests: support@niche-society.com",
      ],
    },
    {
      id: "children",
      title: "11. Children",
      paragraphs: [
        "Niche Frontdesk is for authorised adult staff. It is not directed at children. We do not knowingly create operator accounts for anyone under 18.",
        "Guest lists may include minors if the event organiser collected that information. We process it only to provide the service to that organiser.",
      ],
    },
    {
      id: "local-storage",
      title: "12. Local storage on your device",
      intro: "The app stores on the device items such as:",
      bullets: ["Sign-in session", "Cached profile", "Language preference"],
      closing: [
        "Clearing app data or uninstalling the app removes local copies. It does not by itself delete your account on our servers. Use account deletion or contact us for that.",
      ],
    },
    {
      id: "changes",
      title: "13. Changes to this policy",
      paragraphs: [
        "We may update this policy from time to time. The “Effective date” at the top will change when we do. Material changes may also be communicated in the app or by email. Continued use after an update means you accept the revised policy.",
      ],
    },
    {
      id: "contact",
      title: "14. Contact",
      paragraphs: [
        "Niche Society",
        "Email: support@niche-society.com",
        "Website: www.niche-society.com",
        "If you have questions about this policy or how we handle personal data, write to us at the email above.",
      ],
    },
  ],
};
