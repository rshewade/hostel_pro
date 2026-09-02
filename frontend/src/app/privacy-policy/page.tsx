"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

/**
 * Contact details for the Data Protection Officer.
 *
 * TODO: These are placeholders pending confirmation from the Trust office.
 * Replace all four values before this policy is treated as published.
 */
const DPO = {
  name: "[Data Protection Officer name]",
  email: "[Data Protection Officer email]",
  phone: "[Data Protection Officer phone]",
  address: "[Institution Address]",
};

const LAST_UPDATED = { en: "2 September 2026", hi: "2 सितंबर 2026" };

const P = ({ children }: { children: ReactNode }) => (
  <p className="mb-4 leading-relaxed text-muted-foreground">{children}</p>
);

const List = ({ children }: { children: ReactNode }) => (
  <ul className="mb-4 list-disc space-y-2 pl-6 leading-relaxed text-muted-foreground">
    {children}
  </ul>
);

const Placeholder = ({ children }: { children: ReactNode }) => (
  <span className="rounded bg-accent/20 px-1 font-medium text-foreground">
    {children}
  </span>
);

interface Section {
  id: string;
  title: { en: string; hi: string };
  body: ReactNode;
}

export default function PrivacyPolicyPage() {
  const { t, language } = useLanguage();

  const sections: Section[] = [
    {
      id: "introduction",
      title: {
        en: "Introduction and scope",
        hi: "परिचय एवं दायरा",
      },
      body: (
        <>
          <P>
            This Privacy Policy describes how Seth Hirachand Gumanji Jain Trust
            (the &ldquo;Trust&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo; or
            &ldquo;Our&rdquo;) collects, uses, stores, shares and protects
            information about you when you visit this website or use the online
            hostel management platform made available through it (collectively,
            the &ldquo;Platform&rdquo;).
          </P>
          <P>
            The Platform is used to administer admissions, stay and exit for the
            Boys&rsquo; Hostel, the R.R. Shravika Ashram (Girls&rsquo; Ashram)
            and the Dharamshala operated by the Trust. It is used by applicants
            and their parents or guardians, resident students, alumni,
            Dharamshala guests, and the Trust&rsquo;s own staff and trustees.
          </P>
          <P>
            We process personal data in accordance with the Digital Personal
            Data Protection Act, 2023 and the Information Technology Act, 2000
            together with the rules framed under them. By accessing the Platform
            or submitting information through it, you acknowledge that you have
            read and understood this Privacy Policy.
          </P>
          <P>
            If you do not agree with any part of this Privacy Policy, please do
            not use the Platform. You may instead contact the Trust office
            directly to enquire about admission or accommodation.
          </P>
        </>
      ),
    },
    {
      id: "information-collected",
      title: {
        en: "What information about you is collected on the Platform?",
        hi: "प्लेटफ़ॉर्म पर आपकी कौन सी जानकारी एकत्र की जाती है?",
      },
      body: (
        <>
          <P>
            We collect only the information we need in order to assess an
            application, manage a stay, meet Our legal obligations and keep
            residents safe. The categories of information We collect are set out
            below.
          </P>
          <P>
            <strong>Information you give Us directly.</strong> When you begin an
            application, track it, book Dharamshala accommodation, register as
            an alumnus or use a resident, parent or staff account, you may
            provide:
          </P>
          <List>
            <li>
              <strong>Identity details</strong> &mdash; full name, date of
              birth, gender, photograph, and details of the Jain community or
              Sangh to which you belong.
            </li>
            <li>
              <strong>Contact details</strong> &mdash; mobile number, email
              address, permanent and correspondence addresses.
            </li>
            <li>
              <strong>Family and guardian details</strong> &mdash; names,
              relationship, occupation, contact numbers and addresses of
              parents, guardians and local guardians, and emergency contacts.
            </li>
            <li>
              <strong>Academic details</strong> &mdash; the institution you
              attend, course, year of study, enrolment number, and academic
              records or results submitted in support of an application.
            </li>
            <li>
              <strong>Supporting documents</strong> &mdash; identity proof,
              address proof, admission or bonafide certificates, income or
              recommendation letters, and any other document you upload.
            </li>
            <li>
              <strong>Financial details</strong> &mdash; fee payments, deposits,
              refunds, receipts and, where you request a refund or a bank
              transfer, the bank account details you provide.
            </li>
            <li>
              <strong>Health and dietary information</strong> &mdash; medical
              conditions, allergies, dietary requirements and emergency medical
              contacts. Providing this is voluntary, but it helps Us respond
              appropriately in an emergency.
            </li>
            <li>
              <strong>Declarations and consents</strong> &mdash; the
              undertakings, rules acceptances and consents you record on the
              Platform, including at each renewal.
            </li>
          </List>
          <P>
            <strong>Information generated while you use the Platform.</strong>{" "}
            This includes your application tracking number and its status
            history, interview scheduling and outcomes, room allocation,
            attendance, leave requests and approvals, complaints and
            maintenance requests, notices sent to you, and records of exit and
            clearance.
          </P>
          <P>
            <strong>Verification information.</strong> To submit or track an
            application without creating a permanent account, We send a one-time
            password (OTP) to your mobile number or email address and record
            that the verification took place, including the time and the channel
            used.
          </P>
          <P>
            <strong>Technical information.</strong> When you visit the Platform,
            Our servers automatically record limited technical information such
            as your IP address, browser type and version, device type, the pages
            you visited and the date and time of access. We use this to keep the
            Platform secure and working correctly.
          </P>
          <P>
            We do not knowingly collect information about your caste, political
            opinions or biometric identifiers through the Platform. If any such
            information appears in a document you upload, We ask that you redact
            it where it is not required.
          </P>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: {
        en: "How do We use the information We collect?",
        hi: "एकत्र की गई जानकारी का उपयोग हम कैसे करते हैं?",
      },
      body: (
        <>
          <P>
            We use your information only for the purposes described below, and
            for purposes reasonably connected with them:
          </P>
          <List>
            <li>
              <strong>Processing applications</strong> &mdash; to verify your
              eligibility, review your documents, schedule and record
              interviews, and communicate the outcome to you.
            </li>
            <li>
              <strong>Managing your stay</strong> &mdash; to allocate a room,
              maintain attendance and leave records, issue notices, handle
              complaints and maintenance, and administer the six-monthly renewal
              cycle.
            </li>
            <li>
              <strong>Fees and accounting</strong> &mdash; to raise demands,
              record payments and deposits, issue receipts, process refunds and
              maintain the Trust&rsquo;s books of account.
            </li>
            <li>
              <strong>Safety and security</strong> &mdash; to identify residents
              and their visitors, contact your parents, guardians or emergency
              contacts when necessary, and respond to medical or other
              emergencies.
            </li>
            <li>
              <strong>Communication</strong> &mdash; to send you
              service-related messages by SMS, WhatsApp, email or in-app notice,
              including OTPs, application updates, fee reminders, renewal
              reminders and institutional announcements.
            </li>
            <li>
              <strong>Legal and regulatory compliance</strong> &mdash; to meet
              obligations under applicable law, respond to lawful requests from
              government authorities, and maintain the audit records the Trust
              is required to keep.
            </li>
            <li>
              <strong>Alumni and institutional records</strong> &mdash; to
              maintain a record of former residents where you have chosen to
              register as an alumnus.
            </li>
            <li>
              <strong>Improving the Platform</strong> &mdash; to diagnose
              technical faults, prevent misuse and improve how the Platform
              works.
            </li>
          </List>
          <P>
            We do not sell your personal data. We do not use your personal data
            for advertising, and We do not use it to build behavioural profiles
            about you.
          </P>
        </>
      ),
    },
    {
      id: "consent",
      title: {
        en: "Consent and the basis on which We process your data",
        hi: "सहमति एवं आपके डेटा के प्रसंस्करण का आधार",
      },
      body: (
        <>
          <P>
            We process most of your personal data on the basis of the consent
            you give when you submit an application, accept the undertakings, or
            complete a renewal. Where the law permits or requires Us to process
            data without consent &mdash; for example to comply with a court
            order or a statutory obligation, or to respond to a medical
            emergency &mdash; We may do so on that basis.
          </P>
          <P>
            Consent is recorded on the Platform together with the date, time and
            the version of the terms you accepted, so that both you and the
            Trust have a reliable record of what was agreed. Because residency
            is renewed every six months, We ask you to review and reconfirm your
            consent at each renewal.
          </P>
          <P>
            You may withdraw your consent at any time by writing to the Data
            Protection Officer at the address in section 13. Withdrawal takes
            effect going forward and does not affect anything We lawfully did
            before it. Please note that some information is necessary in order
            to offer or continue accommodation: if you withdraw consent to Our
            processing of it, We may be unable to process your application or to
            continue your residency.
          </P>
        </>
      ),
    },
    {
      id: "sharing",
      title: {
        en: "Do We share the information We receive?",
        hi: "क्या हम प्राप्त जानकारी साझा करते हैं?",
      },
      body: (
        <>
          <P>
            We share your information only where it is necessary for the
            purposes described in this Privacy Policy, and only with the
            recipients listed below:
          </P>
          <List>
            <li>
              <strong>Trust officials.</strong> Superintendents, trustees,
              accounts staff and administrative staff, each of whom is given
              access only to the records their role requires. Access is
              role-based and is logged.
            </li>
            <li>
              <strong>Parents, guardians and local guardians.</strong> Where you
              are a resident, We share attendance, leave, fee and disciplinary
              information with the parent or guardian recorded against your
              file, and We notify them of leave requests and emergencies. For
              residents who are minors, this sharing is a condition of
              admission.
            </li>
            <li>
              <strong>Educational institutions.</strong> To verify enrolment or
              academic standing, and to coordinate on matters affecting your
              residency.
            </li>
            <li>
              <strong>Service providers.</strong> Payment gateways, SMS,
              WhatsApp and email delivery providers, hosting providers, and
              mess, security and maintenance contractors. They receive only the
              data they need to perform their function, are bound by contract to
              protect it, and are not permitted to use it for their own
              purposes.
            </li>
            <li>
              <strong>Government and law enforcement.</strong> Where We are
              required to disclose information by law, by court order, or by a
              lawful request from a government agency, including the police and
              local administration.
            </li>
            <li>
              <strong>Professional advisers.</strong> Auditors and legal
              advisers, under a duty of confidentiality, where necessary for the
              Trust&rsquo;s governance.
            </li>
          </List>
          <P>
            We do not otherwise disclose your personal data to third parties
            without your consent. Payment card and bank credentials entered on a
            payment gateway are handled by that gateway and are not stored by
            the Trust.
          </P>
        </>
      ),
    },
    {
      id: "security",
      title: {
        en: "How secure is information about you?",
        hi: "आपकी जानकारी कितनी सुरक्षित है?",
      },
      body: (
        <>
          <P>
            We maintain reasonable security safeguards designed to protect your
            information against loss, misuse, unauthorised access, disclosure
            and alteration. These include:
          </P>
          <List>
            <li>
              Encryption of data in transit between your device and the Platform.
            </li>
            <li>
              Storage of passwords in hashed form, and OTP-based verification for
              applicants and parents who do not hold a permanent account.
            </li>
            <li>
              Role-based access control, so that each user sees only the records
              their role requires.
            </li>
            <li>
              Audit logging of changes to application status, financial
              transactions and record access.
            </li>
            <li>
              Restricted access to uploaded documents, served only to those
              authorised to view them.
            </li>
          </List>
          <P>
            No method of transmission or storage is completely secure, and We
            cannot guarantee absolute security. You are responsible for keeping
            your password and any OTP confidential, and for signing out of
            shared devices. If you believe your account or an OTP has been
            compromised, please tell Us immediately using the contact details in
            section 13.
          </P>
          <P>
            If a personal data breach occurs, We will notify the affected
            individuals and the Data Protection Board of India as required under
            applicable law.
          </P>
        </>
      ),
    },
    {
      id: "retention",
      title: {
        en: "How long do We retain your information?",
        hi: "हम आपकी जानकारी कितने समय तक रखते हैं?",
      },
      body: (
        <>
          <P>
            We keep your personal data only for as long as it is needed for the
            purpose it was collected for, or for as long as the law requires Us
            to keep it. In practice:
          </P>
          <List>
            <li>
              <strong>Active residents</strong> &mdash; for the full period of
              your stay, including across renewals.
            </li>
            <li>
              <strong>Rejected or withdrawn applications</strong> &mdash; for
              one year from the date of rejection or withdrawal, after which the
              record is archived with personal identifiers removed.
            </li>
            <li>
              <strong>Former residents</strong> &mdash; for one year after exit
              for institutional records, unless you have registered as an
              alumnus, in which case We keep the details you chose to share
              until you ask Us to remove them.
            </li>
            <li>
              <strong>Financial and accounting records</strong> &mdash; for the
              period required under tax and audit law, currently eight years
              from the end of the relevant financial year.
            </li>
            <li>
              <strong>Consent and audit records</strong> &mdash; retained for as
              long as necessary to evidence the Trust&rsquo;s compliance, with
              withdrawals recorded against them.
            </li>
          </List>
          <P>
            At the end of the applicable period We securely delete the data or
            anonymise it so that it can no longer be linked to you.
          </P>
        </>
      ),
    },
    {
      id: "your-rights",
      title: {
        en: "What information can you access, and what are your rights?",
        hi: "आप किस जानकारी तक पहुँच सकते हैं, और आपके क्या अधिकार हैं?",
      },
      body: (
        <>
          <P>
            You can view and, where permitted, update much of your information
            directly on the Platform &mdash; your profile, your application and
            its status, your documents, your fee and receipt history, and your
            leave records. In addition, under the Digital Personal Data
            Protection Act, 2023 you have the following rights:
          </P>
          <List>
            <li>
              <strong>Right to access</strong> &mdash; to obtain a summary of
              the personal data We hold about you and how it is processed.
            </li>
            <li>
              <strong>Right to correction</strong> &mdash; to have inaccurate or
              incomplete data corrected or completed.
            </li>
            <li>
              <strong>Right to erasure</strong> &mdash; to have your data
              deleted, except where We are required to retain it by law or for
              the establishment or defence of a legal claim.
            </li>
            <li>
              <strong>Right to withdraw consent</strong> &mdash; as described in
              section 4.
            </li>
            <li>
              <strong>Right to nominate</strong> &mdash; to nominate another
              individual to exercise your rights on your behalf in the event of
              your death or incapacity.
            </li>
            <li>
              <strong>Right to grievance redressal</strong> &mdash; to have a
              complaint about Our handling of your data addressed by the Data
              Protection Officer, and to escalate it to the Data Protection
              Board of India if you remain dissatisfied.
            </li>
          </List>
          <P>
            To exercise any of these rights, write to the Data Protection
            Officer using the details in section 13. We may ask you to verify
            your identity before We act on a request. We aim to respond within
            thirty days.
          </P>
        </>
      ),
    },
    {
      id: "minors",
      title: {
        en: "Are minors allowed to use the Platform?",
        hi: "क्या नाबालिग प्लेटफ़ॉर्म का उपयोग कर सकते हैं?",
      },
      body: (
        <>
          <P>
            Some residents and applicants are below eighteen years of age. Where
            an applicant is a minor, the application must be made and consented
            to by a parent or lawful guardian, and We verify the guardian&rsquo;s
            details as part of the admission process.
          </P>
          <P>
            We do not process a minor&rsquo;s personal data in any manner likely
            to cause a detrimental effect on their well-being, and We do not
            undertake tracking, behavioural monitoring or targeted advertising
            directed at minors.
          </P>
          <P>
            A parent or guardian may review, correct or request deletion of a
            minor&rsquo;s information by contacting the Data Protection Officer.
          </P>
        </>
      ),
    },
    {
      id: "cookies",
      title: {
        en: "Cookies and similar technologies",
        hi: "कुकीज़ एवं समान तकनीकें",
      },
      body: (
        <>
          <P>
            The Platform uses a small number of cookies and similar browser
            storage mechanisms. We use them to keep you signed in, to remember
            your language preference, to protect forms against cross-site
            request forgery, and to keep the Platform secure.
          </P>
          <P>
            We do not use advertising cookies or third-party tracking cookies.
            You can block or delete cookies through your browser settings, but
            if you block the cookies We use for sign-in, you will not be able to
            use the parts of the Platform that require an account.
          </P>
        </>
      ),
    },
    {
      id: "third-party-links",
      title: {
        en: "Third-party links and services",
        hi: "तृतीय-पक्ष लिंक एवं सेवाएँ",
      },
      body: (
        <>
          <P>
            The Platform may contain links to websites operated by others, and
            may hand you over to a third-party payment gateway to complete a
            payment. Those websites and services are governed by their own
            privacy policies, and this Privacy Policy does not apply to them.
          </P>
          <P>
            We are not responsible for the content or privacy practices of any
            third-party website. We encourage you to read the privacy policy of
            any site you visit through a link on the Platform.
          </P>
        </>
      ),
    },
    {
      id: "changes-to-your-information",
      title: {
        en: "Changes to your information",
        hi: "आपकी जानकारी में परिवर्तन",
      },
      body: (
        <>
          <P>
            Please keep the information you have given Us accurate and up to
            date, particularly your mobile number, email address and the contact
            details of your parents, guardians and emergency contacts. We rely
            on these to reach you and your family in an emergency.
          </P>
          <P>
            You can update most details from your profile on the Platform. Some
            fields &mdash; such as your name, date of birth or the institution
            you attend &mdash; affect your admission record and can be changed
            only by the Trust office on production of supporting documents.
            Requests of that kind can be raised with the Superintendent of your
            institution or with the Trust office.
          </P>
        </>
      ),
    },
    {
      id: "notices-grievances",
      title: {
        en: "Notices, grievances and the Data Protection Officer",
        hi: "सूचनाएँ, शिकायतें एवं डेटा संरक्षण अधिकारी",
      },
      body: (
        <>
          <P>
            Notices We send you under this Privacy Policy will be sent to the
            mobile number or email address recorded against your file, or
            displayed to you on the Platform. Notices you send Us should be
            addressed to the Data Protection Officer:
          </P>
          <div className="mb-4 rounded-lg border border-border bg-muted/40 p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="w-40 shrink-0 font-medium text-foreground">
                  Data Protection Officer
                </dt>
                <dd className="text-muted-foreground">
                  <Placeholder>{DPO.name}</Placeholder>
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="w-40 shrink-0 font-medium text-foreground">
                  Email
                </dt>
                <dd className="text-muted-foreground">
                  <Placeholder>{DPO.email}</Placeholder>
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="w-40 shrink-0 font-medium text-foreground">
                  Telephone
                </dt>
                <dd className="text-muted-foreground">
                  <Placeholder>{DPO.phone}</Placeholder>
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="w-40 shrink-0 font-medium text-foreground">
                  Address
                </dt>
                <dd className="text-muted-foreground">
                  <Placeholder>{DPO.address}</Placeholder>
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs italic text-muted-foreground">
              {t(
                "These contact details are pending confirmation by the Trust office and will be published here once finalised.",
                "ये संपर्क विवरण ट्रस्ट कार्यालय द्वारा पुष्टि किए जाने बाकी हैं और अंतिम रूप दिए जाने पर यहाँ प्रकाशित किए जाएँगे।"
              )}
            </p>
          </div>
          <P>
            We will acknowledge a grievance when We receive it and aim to
            resolve it within thirty days. If you are not satisfied with Our
            response, you may complain to the Data Protection Board of India.
          </P>
        </>
      ),
    },
    {
      id: "policy-changes",
      title: {
        en: "Changes to this Privacy Policy",
        hi: "इस गोपनीयता नीति में परिवर्तन",
      },
      body: (
        <>
          <P>
            We may update this Privacy Policy from time to time to reflect
            changes in Our practices or in the law. The date at the top of this
            page shows when it was last revised.
          </P>
          <P>
            Where a change materially affects how We use your personal data, We
            will notify you on the Platform or by SMS, WhatsApp or email, and
            where the law requires it We will ask for your consent again.
            Residents are in any event asked to review this Privacy Policy at
            each six-monthly renewal.
          </P>
        </>
      ),
    },
    {
      id: "miscellaneous",
      title: {
        en: "Miscellaneous and governing law",
        hi: "विविध एवं शासी विधि",
      },
      body: (
        <>
          <P>
            This Privacy Policy is governed by the laws of India. The courts at
            Mumbai, Maharashtra have exclusive jurisdiction over any dispute
            arising out of it.
          </P>
          <P>
            If any provision of this Privacy Policy is held to be invalid or
            unenforceable, the remaining provisions continue in full force. Our
            failure to enforce any provision is not a waiver of it.
          </P>
          <P>
            This Privacy Policy should be read together with the{" "}
            <Link
              href="/dpdp-policy"
              className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
            >
              {t(
                "Data Protection & Privacy (DPDP) notice",
                "डेटा संरक्षण एवं गोपनीयता (DPDP) सूचना"
              )}
            </Link>{" "}
            shown within the application, and with the undertakings and rules
            you accept at admission and at each renewal. Where there is a
            conflict, this Privacy Policy prevails on matters of personal data.
          </P>
          <P>
            This Privacy Policy is published in English. Any translation is
            provided for convenience only; in the event of any inconsistency,
            the English version governs.
          </P>
        </>
      ),
    },
  ];

  return (
    <PublicLayout>
      <PageHero
        title={t("Privacy Policy", "गोपनीयता नीति")}
        subtitle={t(
          "How the Trust collects, uses and protects your personal information",
          "ट्रस्ट आपकी व्यक्तिगत जानकारी को कैसे एकत्र, उपयोग और सुरक्षित करता है"
        )}
      />

      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <p className="mb-10 text-sm text-muted-foreground">
              {t("Last updated", "अंतिम बार अद्यतन")}:{" "}
              <span className="font-medium text-foreground">
                {LAST_UPDATED[language]}
              </span>
            </p>

            {/* Contents */}
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

            {/* Sections */}
            <div className="space-y-12">
              {sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24"
                >
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

            <div className="mt-14 border-t border-border pt-8 text-sm text-muted-foreground">
              <p>
                {t(
                  "Questions about this Privacy Policy can be sent to the Data Protection Officer, or raised with the Trust office.",
                  "इस गोपनीयता नीति के बारे में प्रश्न डेटा संरक्षण अधिकारी को भेजे जा सकते हैं, या ट्रस्ट कार्यालय में उठाए जा सकते हैं।"
                )}{" "}
                <Link
                  href="/contact"
                  className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
                >
                  {t("Contact us", "हमसे संपर्क करें")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
