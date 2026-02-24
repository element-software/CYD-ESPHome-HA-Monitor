import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — CYD HAMon Config Generator',
  description: 'Privacy policy for the CYD HAMon Config Generator.',
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
            ← Back to Config Generator
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              This Privacy Policy explains how <strong>CYD HAMon Config Generator</strong>{' '}
              (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the site&rdquo;), operated by Element
              Software, collects, uses, and protects information when you visit{' '}
              <strong>cheapyellowdisplay.co.uk</strong>.
            </p>
            <p className="mt-3">
              We are committed to protecting your privacy and handling any information we hold about
              you in accordance with the UK General Data Protection Regulation (UK GDPR) and the
              Data Protection Act 2018.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p>
              This site collects information in two circumstances:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong>Analytics data (with your consent):</strong> We use Google Analytics to
                collect anonymised usage data such as pages visited, time on site, browser type,
                and approximate geographic region. This data does not identify you personally.
              </li>
              <li>
                <strong>Personal information you provide:</strong> If you submit a contact form or
                otherwise provide personal information (such as your name or email address), that
                information is collected solely to respond to your enquiry.
              </li>
            </ul>
            <p className="mt-3">
              If you decline analytics cookies, no tracking data is collected or transmitted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Analytics data</strong> is used solely to understand how the site is used
                and to improve the user experience. It is never used for advertising, profiling, or
                sold to third parties.
              </li>
              <li>
                <strong>Contact information</strong> is used only to respond to your enquiry and is
                not shared with third parties or used for marketing purposes without your explicit
                consent.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Legal Basis for Processing</h2>
            <p>
              Under UK GDPR, we rely on the following legal bases for processing personal data:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong>Consent</strong> — for analytics cookies. You may withdraw consent at any
                time by clearing your browser&rsquo;s local storage or by declining cookies on your
                next visit.
              </li>
              <li>
                <strong>Legitimate interests</strong> — for contact enquiries, to the extent
                necessary to respond to your message.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies</h2>
            <p>
              This site uses a single first-party cookie preference stored in your browser&rsquo;s
              local storage (<code className="bg-gray-100 px-1 rounded text-sm">cookie_consent</code>)
              to remember your analytics preference.
            </p>
            <p className="mt-3">
              If you accept analytics cookies, Google Analytics sets its own cookies (e.g.{' '}
              <code className="bg-gray-100 px-1 rounded text-sm">_ga</code>,{' '}
              <code className="bg-gray-100 px-1 rounded text-sm">_ga_*</code>) to distinguish users
              and sessions. These cookies are governed by{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Google&rsquo;s Privacy Policy
              </a>
              .
            </p>
            <p className="mt-3">
              You can withdraw your analytics consent at any time by clearing your browser&rsquo;s
              local storage for this site, which will cause the consent banner to reappear on your
              next visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. Analytics
              data is processed by Google LLC under a data processing agreement. Google may
              transfer data outside the UK; for more information, see{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Google&rsquo;s Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
            <p>
              Google Analytics data is retained for 14 months by default, after which it is
              automatically deleted. Any personal information provided via a contact form is
              retained only as long as necessary to address your enquiry and is then securely
              deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Your Rights</h2>
            <p>Under UK GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate personal data</li>
              <li>Request erasure of your personal data</li>
              <li>Object to or restrict processing of your personal data</li>
              <li>Withdraw consent at any time (where processing is based on consent)</li>
              <li>Lodge a complaint with the Information Commissioner&rsquo;s Office (ICO) at{' '}
                <a
                  href="https://ico.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  ico.org.uk
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Third-Party Links</h2>
            <p>
              This site contains links to external websites (e.g. GitHub, element-software.co.uk).
              We are not responsible for the privacy practices of those sites and encourage you to
              review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy or wish to exercise your data
              rights, please contact us at{' '}
              <a
                href="mailto:info@cheapyellowdisplay.co.uk"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                info@cheapyellowdisplay.co.uk
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on
              this page with an updated revision date. We encourage you to review this policy
              periodically.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
