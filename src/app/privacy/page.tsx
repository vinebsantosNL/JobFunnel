import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — JobFunnel OS',
  description: 'Privacy Policy for JobFunnel OS and the JobFunnel Chrome Extension.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: April 2, 2026</p>

        <section className="space-y-8 text-slate-700 leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. About JobFunnel OS</h2>
            <p>
              JobFunnel OS (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a job search management platform for
              tech professionals. This Privacy Policy explains how we collect, use, and protect your information
              when you use our web application at{' '}
              <a href="https://job-funnel-lime.vercel.app" className="text-blue-600 underline">
                job-funnel-lime.vercel.app
              </a>{' '}
              and our Chrome browser extension (&quot;JobFunnel Extension&quot;).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Information We Collect</h2>
            <h3 className="font-semibold text-slate-800 mb-1">Web Application</h3>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Email address (used for authentication via magic link)</li>
              <li>Profile information you provide: name, role, years of experience, target countries</li>
              <li>Job application data you enter: company, job title, stage, salary, notes</li>
              <li>Interview stories you create (STAR format content)</li>
              <li>CV file uploads (stored securely in Supabase Storage)</li>
            </ul>
            <h3 className="font-semibold text-slate-800 mb-1">Chrome Extension</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Job posting data scraped from job board pages you visit (LinkedIn, Indeed, StepStone,
                Glassdoor, Xing) — only when you actively click &quot;Save to Pipeline&quot;
              </li>
              <li>
                An authentication token stored locally in your browser&apos;s extension storage
                (<code className="text-sm bg-slate-100 px-1 rounded">chrome.storage.local</code>)
                to connect the extension to your JobFunnel account
              </li>
              <li>A local cache of saved job URLs to detect duplicates</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and operate the JobFunnel service</li>
              <li>To display your job search pipeline, analytics, and insights</li>
              <li>To send transactional emails (magic links, weekly summaries) via Resend</li>
              <li>To calculate funnel conversion metrics for your personal dashboard</li>
            </ul>
            <p className="mt-3">
              We do not sell your data. We do not use your data for advertising.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Data Storage and Security</h2>
            <p>
              All data is stored in Supabase (EU region). Row-Level Security (RLS) ensures your data
              is only accessible by your authenticated account. Authentication tokens are short-lived
              (1-hour access tokens) and never exposed to third parties.
            </p>
            <p className="mt-2">
              Extension data stored in <code className="text-sm bg-slate-100 px-1 rounded">chrome.storage.local</code>{' '}
              stays on your device and is never transmitted to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Chrome Extension Permissions</h2>
            <p className="mb-2">The JobFunnel Chrome Extension requests the following permissions:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>activeTab / tabs</strong> — to read the URL of the current tab and detect supported job boards
              </li>
              <li>
                <strong>storage</strong> — to save your authentication token and saved job cache locally on your device
              </li>
              <li>
                <strong>Host permissions (LinkedIn, Indeed, StepStone, Glassdoor, Xing)</strong> — to
                scrape job details (title, company, location, salary) from job listing pages when you
                request it
              </li>
              <li>
                <strong>Host permission (job-funnel-lime.vercel.app)</strong> — to silently retrieve
                your authentication token from the app when you are logged in
              </li>
            </ul>
            <p className="mt-3">
              The extension only reads job data when you actively open the extension popup on a job page.
              It does not run in the background or track your browsing history.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Third-Party Services</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Supabase</strong> — database and authentication (
                <a href="https://supabase.com/privacy" className="text-blue-600 underline">privacy policy</a>)
              </li>
              <li>
                <strong>Vercel</strong> — hosting and deployment (
                <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 underline">privacy policy</a>)
              </li>
              <li>
                <strong>Resend</strong> — transactional email delivery (
                <a href="https://resend.com/privacy" className="text-blue-600 underline">privacy policy</a>)
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Data Retention and Deletion</h2>
            <p>
              Your data is retained as long as your account is active. You can delete your account and
              all associated data at any time from Settings. Upon deletion, all personal data is permanently
              removed from our database within 30 days.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Your Rights (GDPR)</h2>
            <p className="mb-2">
              As a user based in the European Union, you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
              <li>Data portability — export your data in machine-readable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:privacy@jobfunnel.io" className="text-blue-600 underline">
                privacy@jobfunnel.io
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of significant changes
              via email or an in-app notice. Continued use of JobFunnel after changes take effect
              constitutes acceptance of the updated policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Contact</h2>
            <p>
              Questions about this Privacy Policy?{' '}
              <a href="mailto:privacy@jobfunnel.io" className="text-blue-600 underline">
                privacy@jobfunnel.io
              </a>
            </p>
          </div>

        </section>
      </div>
    </div>
  )
}
