"use client";

import LegalPage, {
  ContactBlock,
  H3,
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
      {TRUST_NAME} (&ldquo;School&rdquo;, &ldquo;Trust&rdquo;,
      &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;) respects your
      privacy and is committed to protecting the personal information of
      students, parents/guardians, donors, visitors, employees, volunteers and
      other individuals who interact with us through our website, school,
      hostel/boarding facilities, donation activities and related services.
    </P>
    <P>
      This Privacy Policy explains how we collect, use, store, disclose and
      protect personal information when you visit our website, contact us,
      register for our services, make a donation, or otherwise interact with the
      Trust.
    </P>
  </>
);

const sections: LegalSection[] = [
  {
    id: "information-we-collect",
    title: {
      en: "Information We Collect",
      hi: "हम कौन सी जानकारी एकत्र करते हैं",
    },
    body: (
      <>
        <P>Depending on your interaction with us, we may collect:</P>

        <H3>Students and Parents/Guardians</H3>
        <List>
          <li>Student&rsquo;s name, date of birth and gender</li>
          <li>Parent/guardian name and contact details</li>
          <li>Residential and communication address</li>
          <li>Admission and identification information</li>
          <li>Educational and academic information</li>
          <li>Hostel/boarding-related information</li>
          <li>Emergency contact information</li>
          <li>Photographs or videos where appropriate and permitted</li>
        </List>

        <H3>Donors and Supporters</H3>
        <List>
          <li>Name</li>
          <li>Mobile number</li>
          <li>Email address</li>
          <li>Address, where required</li>
          <li>Donation amount and transaction details</li>
          <li>Payment/reference/transaction identification details</li>
          <li>
            Information required for issuing donation receipts or complying with
            applicable laws
          </li>
        </List>
        <P>
          We do not intend to collect or retain complete card numbers, CVV, PIN
          or other payment credentials on our own systems. Online payments may
          be processed through authorised third-party payment service providers.
        </P>

        <H3>Website Visitors</H3>
        <P>We may collect limited technical information such as:</P>
        <List>
          <li>IP address</li>
          <li>Browser and device information</li>
          <li>Website usage information</li>
          <li>Date and time of visits</li>
          <li>Cookies and similar technologies</li>
        </List>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: {
      en: "How We Use Personal Information",
      hi: "हम व्यक्तिगत जानकारी का उपयोग कैसे करते हैं",
    },
    body: (
      <>
        <P>
          We may use personal information for legitimate and specified purposes,
          including:
        </P>
        <List>
          <li>Processing school admissions and registrations</li>
          <li>Providing educational and boarding/hostel-related services</li>
          <li>Maintaining student and parent/guardian records</li>
          <li>Communicating with students, parents/guardians and donors</li>
          <li>Managing hostel and boarding activities</li>
          <li>Processing and acknowledging donations</li>
          <li>Issuing donation receipts and maintaining financial records</li>
          <li>Responding to enquiries and requests</li>
          <li>
            Organising school, educational, charitable and Trust activities
          </li>
          <li>Maintaining safety, security and administration</li>
          <li>Improving our website and services</li>
          <li>Preventing fraud, misuse or unauthorised activities</li>
          <li>
            Complying with applicable legal, regulatory and accounting
            requirements
          </li>
        </List>
        <P>
          We seek to collect and process only information that is reasonably
          necessary for the relevant purpose.
        </P>
      </>
    ),
  },
  {
    id: "childrens-information",
    title: {
      en: "Children's Personal Information",
      hi: "बच्चों की व्यक्तिगत जानकारी",
    },
    body: (
      <>
        <P>
          As the School provides educational and boarding facilities, we may
          process personal information relating to students below 18 years of
          age.
        </P>
        <P>
          Where required, information relating to a child will be collected and
          processed through the child&rsquo;s parent or lawful guardian or
          otherwise in accordance with applicable law.
        </P>
        <P>
          We take reasonable measures to protect children&rsquo;s personal
          information and do not knowingly use children&rsquo;s personal
          information for unrelated purposes or targeted advertising.
        </P>
      </>
    ),
  },
  {
    id: "donations-payments",
    title: {
      en: "Donations and Payment Information",
      hi: "दान एवं भुगतान संबंधी जानकारी",
    },
    body: (
      <>
        <P>The Trust may provide online facilities for making donations.</P>
        <P>
          When a donor makes an online payment, the transaction may be processed
          through an authorised payment gateway or financial service provider.
          Such third parties may process payment information in accordance with
          their own privacy policies and applicable laws.
        </P>
        <P>
          We may retain transaction-related information such as donor name,
          donation amount, transaction reference number, date and payment status
          for accounting, receipt generation, record keeping, audit and legal
          purposes.
        </P>
      </>
    ),
  },
  {
    id: "sharing",
    title: {
      en: "Sharing of Personal Information",
      hi: "व्यक्तिगत जानकारी साझा करना",
    },
    body: (
      <>
        <P>We do not sell or rent personal information to third parties.</P>
        <P>
          We may share personal information where reasonably necessary with:
        </P>
        <List>
          <li>Authorised payment gateway and payment service providers</li>
          <li>Technology, hosting and website service providers</li>
          <li>Professional advisers, auditors and consultants</li>
          <li>Government or regulatory authorities where required by law</li>
          <li>Law-enforcement authorities where legally required</li>
          <li>
            Service providers acting on our behalf and subject to appropriate
            confidentiality obligations
          </li>
          <li>
            Persons or organisations where disclosure is necessary to protect
            the safety, rights or property of the School, Trust, students,
            donors or others
          </li>
        </List>
        <P>
          We endeavour to ensure that information is shared only for legitimate
          and necessary purposes.
        </P>
      </>
    ),
  },
  {
    id: "data-security",
    title: { en: "Data Security", hi: "डेटा सुरक्षा" },
    body: (
      <>
        <P>
          We take reasonable technical and organisational measures to protect
          personal information against:
        </P>
        <List>
          <li>Unauthorised access</li>
          <li>Loss or misuse</li>
          <li>Unauthorised disclosure</li>
          <li>Alteration or destruction</li>
        </List>
        <P>
          However, no website, electronic transmission or storage system can be
          guaranteed to be completely secure.
        </P>
      </>
    ),
  },
  {
    id: "data-retention",
    title: { en: "Data Retention", hi: "डेटा प्रतिधारण" },
    body: (
      <>
        <P>
          We retain personal information only for as long as reasonably
          necessary for the purposes for which it was collected, including:
        </P>
        <List>
          <li>Providing educational and hostel services</li>
          <li>Maintaining student and donor records</li>
          <li>Accounting and financial records</li>
          <li>Legal, regulatory and compliance requirements</li>
          <li>Resolving disputes and enforcing applicable agreements</li>
        </List>
        <P>
          When personal information is no longer required, we may securely
          delete, anonymise or otherwise dispose of it in accordance with
          applicable law and our internal procedures.
        </P>
      </>
    ),
  },
  {
    id: "cookies",
    title: { en: "Cookies", hi: "कुकीज़" },
    body: (
      <>
        <P>
          Our website may use cookies or similar technologies to improve website
          functionality, security and user experience.
        </P>
        <P>
          Cookies may help us understand website usage and remember certain
          preferences.
        </P>
        <P>
          You may be able to control or disable cookies through your browser
          settings. However, disabling certain cookies may affect some website
          functionality.
        </P>
      </>
    ),
  },
  {
    id: "third-party-websites",
    title: { en: "Third-Party Websites", hi: "तृतीय-पक्ष वेबसाइटें" },
    body: (
      <>
        <P>
          Our website may contain links to third-party websites, including
          payment gateways or other external services.
        </P>
        <P>
          We are not responsible for the privacy practices, content or security
          of third-party websites. Users are encouraged to review the privacy
          policies of such websites before providing personal information.
        </P>
      </>
    ),
  },
  {
    id: "privacy-rights",
    title: { en: "Privacy Rights", hi: "गोपनीयता अधिकार" },
    body: (
      <>
        <P>
          Subject to applicable law, individuals may have rights relating to
          their personal information, including the ability to:
        </P>
        <List>
          <li>
            Request information about the processing of their personal data
          </li>
          <li>Request correction of inaccurate or incomplete information</li>
          <li>Request deletion of personal information where applicable</li>
          <li>Withdraw consent where processing is based on consent</li>
          <li>
            Exercise other rights available under applicable data-protection
            laws
          </li>
        </List>
        <P>
          Requests relating to personal information may be submitted using the
          contact details provided below.
        </P>
      </>
    ),
  },
  {
    id: "withdrawal-of-consent",
    title: { en: "Withdrawal of Consent", hi: "सहमति वापस लेना" },
    body: (
      <>
        <P>
          Where we rely on consent to process personal information, you may
          withdraw your consent by contacting us using the contact details
          provided below.
        </P>
        <P>
          Withdrawal of consent will not affect the lawfulness of processing
          carried out before withdrawal. Certain information may continue to be
          retained or processed where required or permitted by applicable law.
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
          We may update this Privacy Policy from time to time to reflect changes
          in our activities, services, technology or applicable laws.
        </P>
        <P>
          Any updated version will be published on this website with the revised
          &ldquo;Last Updated&rdquo; date.
        </P>
      </>
    ),
  },
  {
    id: "contact-us",
    title: { en: "Contact Us", hi: "हमसे संपर्क करें" },
    body: (
      <>
        <P>
          For questions or requests relating to this Privacy Policy or the
          handling of personal information, you may contact:
        </P>
        <ContactBlock
          name={TRUST_NAME}
          address={TRUST_ADDRESS}
          phone={TRUST_PHONE}
        />
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title={{ en: "Privacy Policy", hi: "गोपनीयता नीति" }}
      subtitle={{
        en: "How we collect, use and protect your personal information",
        hi: "हम आपकी व्यक्तिगत जानकारी को कैसे एकत्र, उपयोग और सुरक्षित करते हैं",
      }}
      lastUpdated={LAST_UPDATED}
      preamble={preamble}
      sections={sections}
    />
  );
}
