"use client";

import LegalPage, {
  ContactBlock,
  List,
  P,
  type LegalSection,
} from "@/components/public/LegalPage";
import {
  TRUST_ADDRESS,
  TRUST_NAME,
  TRUST_PHONE,
} from "@/components/public/legal-contact";

const LAST_UPDATED = "01/01/2026";

const preamble = (
  <>
    <P>
      Welcome to the website of {TRUST_NAME} (&ldquo;School&rdquo;,
      &ldquo;Trust&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or
      &ldquo;our&rdquo;).
    </P>
    <P>
      These Terms &amp; Conditions govern your use of our website and the
      services, information, educational activities, boarding/hostel facilities
      and donation facilities provided through or in connection with the Trust.
    </P>
    <P>
      By accessing or using this website, you agree to comply with these Terms
      &amp; Conditions.
    </P>
  </>
);

const sections: LegalSection[] = [
  {
    id: "about-the-trust",
    title: { en: "About the Trust", hi: "ट्रस्ट के बारे में" },
    body: (
      <P>
        {TRUST_NAME} is involved in educational and boarding/hostel-related
        activities and may also receive donations and contributions for
        charitable and institutional purposes.
      </P>
    ),
  },
  {
    id: "use-of-website",
    title: { en: "Use of Website", hi: "वेबसाइट का उपयोग" },
    body: (
      <>
        <P>Users agree to use this website only for lawful purposes.</P>
        <P>You must not:</P>
        <List>
          <li>Use the website for any fraudulent or unlawful activity</li>
          <li>
            Attempt to gain unauthorised access to the website or its systems
          </li>
          <li>Submit false, misleading or inaccurate information</li>
          <li>Interfere with the security or operation of the website</li>
          <li>Use the website to distribute harmful or malicious content</li>
        </List>
      </>
    ),
  },
  {
    id: "educational-boarding-services",
    title: {
      en: "Educational and Boarding Services",
      hi: "शैक्षणिक एवं बोर्डिंग सेवाएँ",
    },
    body: (
      <>
        <P>
          Information relating to admissions, education, boarding, hostel
          facilities, fees, eligibility and other services displayed on the
          website is provided for general information.
        </P>
        <P>
          Admission, accommodation and other facilities are subject to
          availability, eligibility requirements and the rules and policies of
          the Trust.
        </P>
        <P>
          The Trust reserves the right to modify, suspend or discontinue any
          facility or service where reasonably necessary.
        </P>
      </>
    ),
  },
  {
    id: "donations",
    title: { en: "Donations", hi: "दान" },
    body: (
      <>
        <P>
          The Trust may accept voluntary donations and contributions through
          online payment facilities.
        </P>
        <P>
          Donors are responsible for providing accurate information while making
          a donation.
        </P>
        <P>
          Once a donation has been successfully processed, a transaction
          acknowledgement or receipt may be provided based on the information
          supplied by the donor.
        </P>
        <P>
          Donations received by the Trust will be used for the purposes and
          activities of the Trust, subject to applicable laws and regulations.
        </P>
      </>
    ),
  },
  {
    id: "online-payments",
    title: { en: "Online Payments", hi: "ऑनलाइन भुगतान" },
    body: (
      <>
        <P>
          Online payments may be processed through authorised third-party
          payment gateways and payment service providers.
        </P>
        <P>
          The Trust does not directly store complete debit/credit card details,
          CVV, PIN or other confidential payment credentials on its own systems.
        </P>
        <P>
          Users are responsible for ensuring that the payment information
          provided by them is accurate and that they are authorised to use the
          selected payment method.
        </P>
      </>
    ),
  },
  {
    id: "third-party-services",
    title: { en: "Third-Party Services", hi: "तृतीय-पक्ष सेवाएँ" },
    body: (
      <>
        <P>
          The website may contain links or integrations with third-party
          websites, payment gateways or other services.
        </P>
        <P>
          The Trust is not responsible for the content, availability, security
          or privacy practices of third-party websites or services.
        </P>
        <P>
          Users should review the relevant third-party terms and policies before
          using such services.
        </P>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: { en: "Intellectual Property", hi: "बौद्धिक संपदा" },
    body: (
      <>
        <P>
          Unless otherwise stated, the content available on this website,
          including text, photographs, logos, graphics and other materials,
          belongs to or is used by the Trust with appropriate rights.
        </P>
        <P>
          Users may not reproduce, modify, distribute or commercially exploit
          such content without prior written permission, except where permitted
          by applicable law.
        </P>
      </>
    ),
  },
  {
    id: "website-availability",
    title: { en: "Website Availability", hi: "वेबसाइट उपलब्धता" },
    body: (
      <>
        <P>
          We endeavour to keep the website available and operational. However,
          we do not guarantee uninterrupted or error-free access.
        </P>
        <P>
          The website may occasionally be unavailable due to maintenance,
          technical issues, updates or circumstances beyond our reasonable
          control.
        </P>
      </>
    ),
  },
  {
    id: "accuracy-of-information",
    title: { en: "Accuracy of Information", hi: "जानकारी की सटीकता" },
    body: (
      <>
        <P>
          We endeavour to keep the information on the website accurate and
          updated. However, information may change from time to time.
        </P>
        <P>
          The Trust reserves the right to correct, update or modify website
          information without prior notice.
        </P>
      </>
    ),
  },
  {
    id: "limitation-of-liability",
    title: { en: "Limitation of Liability", hi: "दायित्व की सीमा" },
    body: (
      <>
        <P>
          To the extent permitted by applicable law, the Trust shall not be
          liable for losses arising from temporary website unavailability,
          technical interruptions, third-party services or events beyond the
          Trust&rsquo;s reasonable control.
        </P>
        <P>
          Nothing in these Terms shall exclude liability that cannot legally be
          excluded under applicable law.
        </P>
      </>
    ),
  },
  {
    id: "changes-to-terms",
    title: { en: "Changes to Terms", hi: "शर्तों में परिवर्तन" },
    body: (
      <>
        <P>
          The Trust may modify these Terms &amp; Conditions from time to time.
        </P>
        <P>
          Updated Terms &amp; Conditions will be published on this website, and
          continued use of the website after such changes constitutes acceptance
          of the updated terms.
        </P>
      </>
    ),
  },
  {
    id: "governing-law",
    title: { en: "Governing Law", hi: "शासी विधि" },
    body: (
      <P>
        These Terms &amp; Conditions shall be governed by and interpreted in
        accordance with the applicable laws of India.
      </P>
    ),
  },
  {
    id: "contact-information",
    title: { en: "Contact Information", hi: "संपर्क जानकारी" },
    body: (
      <ContactBlock
        name={TRUST_NAME}
        address={TRUST_ADDRESS}
        phone={TRUST_PHONE}
      />
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title={{ en: "Terms & Conditions", hi: "नियम एवं शर्तें" }}
      subtitle={{
        en: "The terms governing your use of this website and our services",
        hi: "इस वेबसाइट और हमारी सेवाओं के उपयोग को नियंत्रित करने वाली शर्तें",
      }}
      lastUpdated={LAST_UPDATED}
      preamble={preamble}
      sections={sections}
    />
  );
}
