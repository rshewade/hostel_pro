import Link from 'next/link';
import { ArrowLeft, CheckCircle, FileText } from 'lucide-react';

export default function ApplicationFormPage() {
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
          <Link href="/apply" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
            <div>
              <h1
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}
              >
                Boys Hostel Application
              </h1>
              <p className="text-caption">Step 4 of 4</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/apply" className="nav-link">Apply Now</Link>
            <Link href="/check-status" className="nav-link">Check Status</Link>
            <Link href="/login" className="nav-link">Login</Link>
          </nav>
        </div>
      </header>

      {/* Progress Header */}
      <section className="px-6 py-4" style={{ backgroundColor: "var(--surface-secondary)" }}>
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: "var(--bg-accent)" }}
                >
                  1
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Select Vertical
                </span>
              </div>
              <div className="h-px w-16" style={{ backgroundColor: "var(--border-primary)" }}></div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: "var(--bg-accent)" }}
                >
                  2
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Contact Details
                </span>
              </div>
              <div className="h-px w-16" style={{ backgroundColor: "var(--border-primary)" }}></div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: "var(--bg-accent)" }}
                >
                  3
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  OTP Verification
                </span>
              </div>
              <div className="h-px w-16" style={{ backgroundColor: "var(--border-primary)" }}></div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: "var(--bg-accent)" }}
                >
                  4
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Application Form
                </span>
              </div>
            </div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <span>Step 4 of 4</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Placeholder */}
      <main className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="card p-12 text-center">
            <div className="mb-8">
              <div
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--color-green-100)" }}
              >
                <CheckCircle className="w-12 h-12" style={{ color: "var(--color-green-600)" }} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                OTP Verified Successfully!
              </h2>
              <p className="text-lg mb-6" style={{ color: "var(--text-secondary)" }}>
                Your identity has been verified. You can now proceed with your application.
              </p>
            </div>

            <div className="card p-6 bg-blue-50 border border-blue-200 mb-8">
              <div className="flex items-start gap-4">
                <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                    Application Form - Coming Soon
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                    The detailed application form is currently under development. This page will include:
                  </p>
                  <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <li className="flex items-center gap-2">
                      • Personal Information (Name, DOB, Address, etc.)
                    </li>
                    <li className="flex items-center gap-2">
                      • Educational Details (Institution, Course, Year)
                    </li>
                    <li className="flex items-center gap-2">
                      • Family Information (Parents, Guardians)
                    </li>
                    <li className="flex items-center gap-2">
                      • Document Uploads (ID, Photos, Certificates)
                    </li>
                    <li className="flex items-center gap-2">
                      • Community Recommendation
                    </li>
                    <li className="flex items-center gap-2">
                      • Declaration and Undertaking
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                <strong>Development Status:</strong> Task 5 (OTP Verification Flow) is complete.
                The application form wizard will be implemented in a subsequent task.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/apply" className="btn-outline">
                  ← Back to Vertical Selection
                </Link>
                <Link href="/" className="btn-primary">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
