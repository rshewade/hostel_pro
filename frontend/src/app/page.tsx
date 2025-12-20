import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      {/* Header */}
      <header
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderColor: "var(--border-primary)",
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Hirachand Gumanji Family Charitable Trust"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <div>
              <h1
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}
              >
                Hirachand Gumanji Family
              </h1>
              <p className="text-caption">Charitable Trust</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {["Home", "About Us", "Institutions", "Admissions", "Alumni", "Trustees", "Gallery", "News", "Donate", "Contact"].map(
              (item) => (
                <Link key={item} href="#" className="nav-link">
                  {item}
                </Link>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative py-16 px-6"
        style={{
          backgroundColor: "var(--bg-brand)",
          backgroundImage: "linear-gradient(rgba(26, 54, 93, 0.9), rgba(26, 54, 93, 0.95))",
        }}
      >
        <div className="mx-auto max-w-6xl text-center">
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-accent)" }}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--text-on-accent)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              color: "var(--text-inverse)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Boys' Hostel Admissions
          </h2>
          <p
            className="text-lg"
            style={{ color: "var(--color-navy-200)" }}
          >
            Seth Hirachand Gumanji Jain Hostel
          </p>
          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "var(--bg-accent)" }}
            />
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "var(--color-navy-600)" }}
            />
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "var(--color-navy-600)" }}
            />
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "var(--color-navy-600)" }}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Two Column Cards */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Application Process Card */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "var(--color-gold-600)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="text-heading-4">Application Process</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Check eligibility criteria",
                  "Create account / Login",
                  "Fill online application form",
                  "Upload required documents",
                  "Submit and track application",
                ].map((step, index) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="number-badge">{index + 1}</span>
                    <span className="text-body">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents Card */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "var(--color-gold-600)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-heading-4">Required Documents</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Birth Certificate",
                  "Caste Certificate (Jain Community)",
                  "College Admission Letter",
                  "Previous Academic Records",
                  "Passport Size Photographs",
                  "Recommendation Letter from Jain Sangh",
                ].map((doc) => (
                  <li key={doc} className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 flex-shrink-0 check-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-body">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <section
            className="mt-12 rounded-2xl py-10 px-8 text-center"
            style={{ backgroundColor: "var(--bg-brand)" }}
          >
            <h3
              className="text-2xl font-semibold mb-2"
              style={{
                color: "var(--text-inverse)",
                fontFamily: "var(--font-serif)",
              }}
            >
              Start Your Application
            </h3>
            <p
              className="mb-6"
              style={{ color: "var(--color-navy-200)" }}
            >
              Login to continue your application or register as a new applicant.
            </p>
            <button className="btn-primary">Login / Register</button>
            <p
              className="mt-4 text-sm"
              style={{ color: "var(--color-navy-300)" }}
            >
              You will be redirected to our secure portal
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="px-6 py-12 mt-8"
        style={{ backgroundColor: "var(--bg-inverse)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Logo & Description */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo.png"
                  alt="Hirachand Gumanji Family Charitable Trust"
                  width={40}
                  height={40}
                  className="h-10 w-auto brightness-0 invert"
                />
                <div>
                  <h4
                    className="font-semibold"
                    style={{ color: "var(--text-inverse)", fontFamily: "var(--font-serif)" }}
                  >
                    Seth Hirachand Gumanji
                  </h4>
                  <p style={{ color: "var(--color-navy-300)", fontSize: "var(--text-sm)" }}>
                    Jain Trust, Mumbai
                  </p>
                </div>
              </div>
              <p style={{ color: "var(--color-navy-300)", fontSize: "var(--text-sm)" }}>
                Serving the Jain community through education, shelter, and spiritual welfare since 1940.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4
                className="font-semibold mb-4"
                style={{ color: "var(--text-inverse)" }}
              >
                Quick Links
              </h4>
              <ul className="space-y-2">
                {["About Us", "Boys' Hostel", "Girls' Hostel", "Dharamshala", "Donate", "Contact Us"].map(
                  (link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm hover:underline"
                        style={{ color: "var(--color-navy-300)" }}
                      >
                        {link}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4
                className="font-semibold mb-4"
                style={{ color: "var(--text-inverse)" }}
              >
                Contact Us
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: "var(--color-navy-300)" }}>
                <li className="flex items-start gap-2">
                  <span>📍</span>
                  <span>Hirabaug, Dr. B.A. Road, Mumbai - 400014</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <span>+91 22 2414 1234</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>info@shgjaintrust.org</span>
                </li>
              </ul>
            </div>

            {/* Support Our Mission */}
            <div>
              <h4
                className="font-semibold mb-4"
                style={{ color: "var(--text-inverse)" }}
              >
                Support Our Mission
              </h4>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--color-navy-300)" }}
              >
                Your generous donations help us continue our service to the community.
              </p>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  backgroundColor: "var(--bg-accent)",
                  color: "var(--text-on-accent)",
                }}
              >
                <span>❤️</span> Donate Now
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Design System Link - Dev Only */}
      <Link
        href="/design-system"
        className="fixed bottom-4 right-4 px-4 py-2 rounded-md text-sm font-medium shadow-lg"
        style={{
          backgroundColor: "var(--surface-primary)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border-primary)",
        }}
      >
        Design System →
      </Link>
    </div>
  );
}
