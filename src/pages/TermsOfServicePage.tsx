import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/utils/constants'

export function TermsOfServicePage() {
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

        <h1 className="text-3xl font-bold text-white italic mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: February 6, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the JAKD workout tracking application (the "Service"), you agree
              to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms,
              please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              JAKD is a fitness and workout tracking application that provides AI-powered rep
              counting through pose detection, workout logging, exercise libraries, progress
              analytics, and routine management. The Service is provided "as is" and is intended for
              personal fitness tracking purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                You must create an account to use the Service. You may register using your email
                address or through Google Sign-In.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your account credentials
                and for all activities that occur under your account.
              </li>
              <li>
                You agree to provide accurate, current, and complete information when creating your
                account.
              </li>
              <li>
                You must notify us immediately of any unauthorized use of your account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Upload malicious code, viruses, or harmful data</li>
              <li>
                Use automated systems (bots, scrapers) to access the Service without permission
              </li>
              <li>Impersonate another person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Camera and Pose Detection</h2>
            <p>
              The Service offers optional camera-based pose detection for exercise form analysis and
              automatic rep counting. By using this feature:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                You grant the Service permission to access your device's camera while the feature is
                active
              </li>
              <li>
                Video processing occurs locally on your device; live video is not transmitted to our
                servers
              </li>
              <li>
                You may optionally save workout recordings, which are stored securely in your
                private account
              </li>
              <li>
                The pose detection feature is provided for informational purposes and should not
                replace professional fitness guidance
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. User Content</h2>
            <p>
              You retain ownership of any content you submit to the Service, including workout data,
              recordings, and profile information. By using the Service, you grant us a limited
              license to store and process your content solely for the purpose of providing the
              Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Health Disclaimer</h2>
            <p>
              JAKD is a fitness tracking tool and does not provide medical advice. The Service,
              including AI-powered pose detection and form feedback, is not a substitute for
              professional medical advice, diagnosis, or treatment. Always consult a qualified
              healthcare professional before starting any exercise program. You use the Service and
              perform exercises at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by JAKD
              and are protected by copyright, trademark, and other intellectual property laws. You
              may not copy, modify, distribute, or create derivative works based on the Service
              without our express written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service at our sole
              discretion, without prior notice, for conduct that we believe violates these Terms or
              is harmful to other users, us, or third parties. Upon termination, your right to use
              the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              10. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, JAKD and its creators shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages, including but
              not limited to loss of data, personal injury, or damages arising from your use of the
              Service. The Service is provided on an "as is" and "as available" basis without
              warranties of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of
              significant changes by posting the updated Terms on this page and updating the "Last
              updated" date. Your continued use of the Service after changes constitutes acceptance
              of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws,
              without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
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
