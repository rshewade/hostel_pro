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
      {TRUST_NAME} (&ldquo;School&rdquo;, &ldquo;Trust&rdquo;,
      &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;) accepts voluntary
      donations and payments through online payment facilities available on our
      website.
    </P>
    <P>
      This Refund &amp; Cancellation Policy explains the terms applicable to
      donations and payments made through our website.
    </P>
  </>
);

const sections: LegalSection[] = [
  {
    id: "donations",
    title: { en: "Donations", hi: "दान" },
    body: (
      <>
        <P>
          All donations made to the Trust are voluntary contributions and are
          generally non-refundable and non-cancellable once the transaction has
          been successfully completed.
        </P>
        <P>
          Donors are requested to verify the donation amount and transaction
          details before completing the payment.
        </P>
      </>
    ),
  },
  {
    id: "duplicate-or-incorrect-payments",
    title: {
      en: "Duplicate or Incorrect Payments",
      hi: "दोहरे या गलत भुगतान",
    },
    body: (
      <>
        <P>
          In case a donor has accidentally made a duplicate payment or an amount
          has been debited from the donor&rsquo;s account due to a technical
          error, the donor may contact the Trust for verification.
        </P>
        <P>
          After reviewing and verifying the transaction, the Trust may process
          an appropriate refund where applicable.
        </P>
      </>
    ),
  },
  {
    id: "failed-transactions",
    title: { en: "Failed Transactions", hi: "असफल लेन-देन" },
    body: (
      <>
        <P>
          If an amount has been debited from the donor&rsquo;s bank account but
          the transaction has not been successfully received or recorded by the
          Trust, the transaction will be verified with the relevant payment
          gateway or financial institution.
        </P>
        <P>
          Where the payment has not been successfully received by the Trust, the
          amount may be refunded through the original payment method, subject to
          applicable payment-processing procedures.
        </P>
      </>
    ),
  },
  {
    id: "refund-requests",
    title: { en: "Refund Requests", hi: "धनवापसी अनुरोध" },
    body: (
      <>
        <P>A refund request, where applicable, should include:</P>
        <List>
          <li>Donor&rsquo;s name</li>
          <li>Mobile number or email address</li>
          <li>Transaction/reference ID</li>
          <li>Date of transaction</li>
          <li>Amount paid</li>
          <li>Reason for the refund request</li>
          <li>Payment confirmation or transaction details</li>
        </List>
        <P>
          The Trust may request additional information to verify the
          transaction.
        </P>
      </>
    ),
  },
  {
    id: "refund-processing-timeframe",
    title: {
      en: "Refund Processing Timeframe",
      hi: "धनवापसी प्रक्रिया की समय-सीमा",
    },
    body: (
      <>
        <P>
          Once a refund request has been approved after successful verification,
          the Trust will initiate the refund within 7 working days.
        </P>
        <P>
          After the refund is initiated, the amount may take an additional
          5&ndash;10 working days to reflect in the donor&rsquo;s bank account
          or original payment method, depending on the payment gateway, bank or
          financial institution.
        </P>
        <P>
          The Trust shall not be responsible for delays caused by banks, payment
          gateways or other third-party financial service providers.
        </P>
      </>
    ),
  },
  {
    id: "cancellation",
    title: { en: "Cancellation", hi: "रद्दीकरण" },
    body: (
      <>
        <P>
          Once a donation or payment has been successfully processed, it
          generally cannot be cancelled.
        </P>
        <P>
          However, requests relating to duplicate transactions, technical errors
          or unsuccessful transactions may be reviewed by the Trust on a
          case-by-case basis.
        </P>
      </>
    ),
  },
  {
    id: "third-party-payment-gateway",
    title: {
      en: "Third-Party Payment Gateway",
      hi: "तृतीय-पक्ष भुगतान गेटवे",
    },
    body: (
      <>
        <P>
          Online payments may be processed through authorised third-party
          payment gateways.
        </P>
        <P>
          The Trust may verify the transaction status with the relevant payment
          gateway or financial institution before approving any refund.
        </P>
      </>
    ),
  },
  {
    id: "contact-details",
    title: { en: "Contact Details", hi: "संपर्क विवरण" },
    body: (
      <ContactBlock
        name={TRUST_NAME}
        address={TRUST_ADDRESS}
        phone={TRUST_PHONE}
      />
    ),
  },
  {
    id: "policy-updates",
    title: { en: "Policy Updates", hi: "नीति अद्यतन" },
    body: (
      <P>
        The Trust reserves the right to modify or update this Refund &amp;
        Cancellation Policy from time to time. Any changes will be published on
        this website with the updated effective date.
      </P>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title={{
        en: "Refund & Cancellation Policy",
        hi: "धनवापसी एवं रद्दीकरण नीति",
      }}
      subtitle={{
        en: "The terms applicable to donations and payments made through our website",
        hi: "हमारी वेबसाइट के माध्यम से किए गए दान और भुगतान पर लागू शर्तें",
      }}
      lastUpdated={LAST_UPDATED}
      preamble={preamble}
      sections={sections}
    />
  );
}
