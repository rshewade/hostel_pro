/**
 * Design System Demo Page
 *
 * This page showcases all design tokens and validates the design system implementation.
 * It serves as a reference for developers and a visual test for WCAG AA compliance.
 *
 * Design Reference: trust-seva-setu.lovable.app
 */

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      {/* Header */}
      <header
        className="px-6 py-4 border-b sticky top-0 z-10"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderColor: "var(--border-primary)",
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <h1
            className="text-xl font-semibold"
            style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
          >
            Design System
          </h1>
          <a
            href="/"
            className="text-sm font-medium px-4 py-2 rounded-md"
            style={{
              backgroundColor: "var(--bg-brand)",
              color: "var(--text-inverse)",
            }}
          >
            ← Back to Home
          </a>
        </div>
      </header>

      <div className="px-6 py-12">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Intro */}
          <section className="text-center">
            <h2 className="text-heading-1 mb-4">Jain Hostel Design System</h2>
            <p className="text-body-sm max-w-2xl mx-auto">
              Design tokens and components for the Hostel Management Application.
              Matching the visual identity of trust-seva-setu.lovable.app
            </p>
          </section>

          {/* Color Palette */}
          <section className="space-y-8">
            <h2 className="text-heading-2">Color Palette</h2>

            {/* Navy - Primary */}
            <div className="space-y-3">
              <h3 className="text-heading-4">Navy (Primary Brand)</h3>
              <div className="grid grid-cols-5 gap-2 md:grid-cols-11">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
                  (shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className="h-14 w-full rounded-lg border"
                        style={{
                          backgroundColor: `var(--color-navy-${shade})`,
                          borderColor: "var(--border-primary)",
                        }}
                      />
                      <span className="text-caption mt-1 block">{shade}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Gold - Accent */}
            <div className="space-y-3">
              <h3 className="text-heading-4">Gold (Accent)</h3>
              <div className="grid grid-cols-5 gap-2 md:grid-cols-11">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
                  (shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className="h-14 w-full rounded-lg border"
                        style={{
                          backgroundColor: `var(--color-gold-${shade})`,
                          borderColor: "var(--border-primary)",
                        }}
                      />
                      <span className="text-caption mt-1 block">{shade}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Neutral Gray */}
            <div className="space-y-3">
              <h3 className="text-heading-4">Neutral (Warm Gray)</h3>
              <div className="grid grid-cols-5 gap-2 md:grid-cols-11">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
                  (shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className="h-14 w-full rounded-lg border"
                        style={{
                          backgroundColor: `var(--color-gray-${shade})`,
                          borderColor: "var(--border-primary)",
                        }}
                      />
                      <span className="text-caption mt-1 block">{shade}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="space-y-3">
              <h3 className="text-heading-4">Semantic States</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: "var(--state-success-bg)",
                    borderColor: "var(--state-success-border)",
                  }}
                >
                  <p
                    className="text-button"
                    style={{ color: "var(--state-success-text)" }}
                  >
                    Success
                  </p>
                </div>
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: "var(--state-error-bg)",
                    borderColor: "var(--state-error-border)",
                  }}
                >
                  <p
                    className="text-button"
                    style={{ color: "var(--state-error-text)" }}
                  >
                    Error
                  </p>
                </div>
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: "var(--state-warning-bg)",
                    borderColor: "var(--state-warning-border)",
                  }}
                >
                  <p
                    className="text-button"
                    style={{ color: "var(--state-warning-text)" }}
                  >
                    Warning
                  </p>
                </div>
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: "var(--state-info-bg)",
                    borderColor: "var(--state-info-border)",
                  }}
                >
                  <p
                    className="text-button"
                    style={{ color: "var(--state-info-text)" }}
                  >
                    Info
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Typography */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Typography</h2>

            <div className="card p-8">
              <div className="space-y-6">
                <div>
                  <span className="text-caption">Display (Playfair Display / 48px / Bold)</span>
                  <p className="text-display">Boys' Hostel Admissions</p>
                </div>
                <div>
                  <span className="text-caption">Heading 1 (Playfair Display / 36px / Bold)</span>
                  <p className="text-heading-1">Welcome to Jain Hostel</p>
                </div>
                <div>
                  <span className="text-caption">Heading 2 (Playfair Display / 30px / Semibold)</span>
                  <p className="text-heading-2">Application Process</p>
                </div>
                <div>
                  <span className="text-caption">Heading 3 (Playfair Display / 24px / Semibold)</span>
                  <p className="text-heading-3">Required Documents</p>
                </div>
                <div>
                  <span className="text-caption">Heading 4 (Inter / 20px / Semibold)</span>
                  <p className="text-heading-4">Start Your Application</p>
                </div>
                <div>
                  <span className="text-caption">Subheading (Inter / 18px / Medium)</span>
                  <p className="text-subheading">Seth Hirachand Gumanji Jain Trust</p>
                </div>
                <div>
                  <span className="text-caption">Body (Inter / 16px / Normal)</span>
                  <p className="text-body">
                    Serving the Jain community through education, shelter, and spiritual
                    welfare since 1940. Our hostels provide a safe and supportive environment.
                  </p>
                </div>
                <div>
                  <span className="text-caption">Body Small (Inter / 14px / Normal)</span>
                  <p className="text-body-sm">
                    You will be redirected to our secure portal for registration.
                  </p>
                </div>
                <div>
                  <span className="text-caption">Caption (Inter / 12px / Normal)</span>
                  <p className="text-caption">Last updated: December 2024</p>
                </div>
              </div>
            </div>
          </section>

          {/* Spacing */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Spacing Scale</h2>
            <div className="card p-8">
              <div className="space-y-3">
                {[
                  { name: "space-1", value: "4px" },
                  { name: "space-2", value: "8px" },
                  { name: "space-3", value: "12px" },
                  { name: "space-4", value: "16px" },
                  { name: "space-6", value: "24px" },
                  { name: "space-8", value: "32px" },
                  { name: "space-10", value: "40px" },
                  { name: "space-16", value: "64px" },
                ].map(({ name, value }) => (
                  <div key={name} className="flex items-center gap-4">
                    <span className="w-24 text-caption">{name}</span>
                    <div
                      className="h-4 rounded"
                      style={{
                        width: `var(--${name})`,
                        backgroundColor: "var(--bg-brand)",
                      }}
                    />
                    <span className="text-body-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Border Radius */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Border Radius</h2>
            <div className="card p-8">
              <div className="flex flex-wrap gap-8">
                {[
                  { name: "none", value: "0" },
                  { name: "sm", value: "4px" },
                  { name: "md", value: "8px" },
                  { name: "lg", value: "12px" },
                  { name: "xl", value: "16px" },
                  { name: "2xl", value: "24px" },
                  { name: "full", value: "9999px" },
                ].map(({ name, value }) => (
                  <div key={name} className="text-center">
                    <div
                      className="h-16 w-16"
                      style={{
                        borderRadius: `var(--radius-${name})`,
                        backgroundColor: "var(--bg-brand)",
                      }}
                    />
                    <p className="text-caption mt-2">
                      {name} ({value})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Shadows */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Elevation / Shadows</h2>
            <div
              className="p-8 rounded-xl"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <div className="flex flex-wrap gap-8">
                {["xs", "sm", "md", "lg", "xl", "card"].map((size) => (
                  <div key={size} className="text-center">
                    <div
                      className="h-20 w-20 rounded-lg"
                      style={{
                        boxShadow: `var(--shadow-${size})`,
                        backgroundColor: "var(--surface-primary)",
                      }}
                    />
                    <p className="text-caption mt-2">shadow-{size}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Buttons */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Buttons</h2>
            <div className="card p-8">
              <div className="flex flex-wrap gap-4 items-center">
                <button className="btn-primary">Primary Button</button>
                <button className="btn-secondary">Secondary Button</button>
                <button
                  className="btn-primary"
                  style={{ backgroundColor: "var(--bg-brand)" }}
                >
                  Brand Button
                </button>
              </div>
            </div>
          </section>

          {/* Number Badges */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Number Badges</h2>
            <div className="card p-8">
              <div className="flex gap-4 items-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num} className="number-badge">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Sample Cards */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Cards</h2>
            <div className="grid gap-6 md:grid-cols-2">
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
          </section>

          {/* Form Elements */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Form Elements</h2>
            <div className="card p-8 max-w-md">
              <div className="space-y-4">
                <div>
                  <label className="text-label block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg border text-body outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--surface-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-label block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg border text-body outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--surface-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-label block mb-1">Hostel Type</label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border text-body outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--surface-primary)",
                    }}
                  >
                    <option>Boys Hostel</option>
                    <option>Girls Ashram</option>
                    <option>Dharamshala</option>
                  </select>
                </div>
                <button className="btn-primary w-full mt-4">Submit Application</button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer
            className="text-center pt-8 border-t"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <p className="text-caption">
              Design System v1.0 - Matching trust-seva-setu.lovable.app - WCAG AA Compliant
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
