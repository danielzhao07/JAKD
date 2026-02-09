import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/utils/constants'

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <img
            src="/jakd-logo.png"
            alt="JAKD"
            className="h-10 drop-shadow-[0_0_10px_#06b6d4aa]"
            style={{ filter: 'invert(1) brightness(2)' }}
          />
        </div>

        <h1 className="text-3xl font-bold text-white italic mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: February 6, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              Welcome to JAKD ("we," "our," or "us"). We respect your privacy and are committed to
              protecting the personal data you share with us. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use the JAKD workout
              tracking application (the "Service").
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-medium text-white mt-4 mb-2">Account Information</h3>
            <p>
              When you create an account, we collect your name, email address, and profile
              information. If you sign in using Google, we receive your name, email, and profile
              picture from Google.
            </p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">Workout Data</h3>
            <p>
              We collect workout data you provide, including exercises, sets, reps, weights,
              routines, and workout history. This data is used to deliver the core functionality of
              the Service.
            </p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">Camera and Video Data</h3>
            <p>
              When you use our AI-powered pose detection feature, your device's camera captures
              video for real-time exercise form analysis. Video is processed locally on your device
              using MediaPipe and is not transmitted to our servers unless you explicitly choose to
              save a recording. Saved recordings are stored securely in your private account storage.
            </p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">Usage Data</h3>
            <p>
              We automatically collect certain information when you use the Service, including
              device type, browser type, and general usage patterns to help us improve the
              experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide, maintain, and improve the Service</li>
              <li>To track and display your workout history, analytics, and progress</li>
              <li>To provide real-time pose detection and form feedback during workouts</li>
              <li>To personalize your experience and workout recommendations</li>
              <li>To communicate with you about the Service, including updates and support</li>
              <li>To detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase, which provides enterprise-grade security
              including encryption at rest and in transit. We implement appropriate technical and
              organizational measures to protect your personal data against unauthorized access,
              alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may
              share information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or respond to lawful requests</li>
              <li>To protect the rights, property, or safety of JAKD, our users, or the public</li>
              <li>
                With service providers who assist in operating the Service (e.g., hosting,
                authentication), bound by confidentiality agreements
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Third-Party Services</h2>
            <p>The Service integrates with the following third-party services:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <span className="text-white font-medium">Google Sign-In:</span> For authentication.
                Subject to{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Google's Privacy Policy
                </a>
              </li>
              <li>
                <span className="text-white font-medium">Supabase:</span> For data storage and
                authentication infrastructure
              </li>
              <li>
                <span className="text-white font-medium">MediaPipe:</span> For on-device pose
                detection (processed locally, no data sent to Google servers)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your workout data</li>
              <li>Withdraw consent for data processing at any time</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact us at the email provided below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to
              provide the Service. If you delete your account, we will delete your personal data
              within 30 days, except where we are required to retain it for legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Children's Privacy</h2>
            <p>
              The Service is not intended for children under the age of 13. We do not knowingly
              collect personal information from children under 13. If we become aware that we have
              collected data from a child under 13, we will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
              Your continued use of the Service after changes constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please
              contact us at:
            </p>
            <p className="mt-2 text-white">
              Email:{' '}
              <a
                href="mailto:daniel.zhao2007@gmail.com"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                daniel.zhao2007@gmail.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-dark-700">
          <p className="text-gray-400 text-sm text-center">
            &copy; {new Date().getFullYear()} JAKD. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
