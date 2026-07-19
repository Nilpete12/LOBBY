"use client";

import Link from 'next/link';
import { AlertTriangle, CheckCircle, Eye, Lock, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-linear-to-bl from-[#DCEBFF]/70 to-white pt-30 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12 border-b border-slate-100 pb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-500 text-lg">Last updated: July 16, 2026</p>
          <p className="text-sm text-slate-500 mt-2">
            This Privacy Policy should be read with our{' '}
            <Link href="/terms" className="text-[#2F80ED] underline">Terms of Service</Link>.
          </p>
        </div>

        <div className="prose prose-slate prose-lg text-slate-600">
          <p className="text-lg mb-8 font-medium text-slate-800">
            THE LOBBY is built for direct rider-driver discovery in Kohima and Nagaland. This policy explains what
            personal data we collect, why we collect it, how we protect it, when we share it, and how you can raise
            privacy requests.
          </p>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Eye size={20} /> 1. Personal Data We Collect
            </h3>
            <p className="mb-4 text-sm">
              We collect only data that is reasonably needed to operate, protect, improve, and administer the
              platform. Depending on how you use THE LOBBY, this may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li><strong>Account data:</strong> name, email address, phone number, role, profile photo, login identifiers, and account status.</li>
              <li><strong>Driver profile data:</strong> vehicle model, vehicle photo, number plate, taxi stands, routes, availability, ratings, lead reports, subscription status, and public profile details.</li>
              <li><strong>Driver verification data:</strong> driving licence image, identity or vehicle documents, verification requests, admin decisions, rejection reasons, and related notes.</li>
              <li><strong>Rider activity data:</strong> searches, taxi-stand filters, selected drivers, favourite drivers, instant-book requests, pickup/drop-off details, ride history, and optional ride-completion confirmations.</li>
              <li><strong>Location data:</strong> approximate or precise location when you submit an instant-book request or choose to share live location during an active booking.</li>
              <li><strong>Lead analytics:</strong> profile views, call-button clicks, WhatsApp-button clicks, booking status, driver responses, and aggregated performance statistics.</li>
              <li><strong>Support and complaint data:</strong> messages, report categories, complaint details, attachments, internal notes, status updates, and responses.</li>
              <li><strong>Device and log data:</strong> IP address, browser, device type, operating system, timestamps, error logs, security logs, and app interaction data.</li>
              <li><strong>Payment and subscription data:</strong> driver subscription reminders, payment status, transaction references, and billing records where applicable.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lock size={20} /> 2. Why We Use Personal Data
            </h3>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li>To create accounts and let users sign in securely.</li>
              <li>To show riders relevant driver listings, taxi stands, vehicle details, number plates, and contact options.</li>
              <li>To let riders call, WhatsApp, favourite, report, or request drivers.</li>
              <li>To verify drivers, review documents, prevent fake profiles, and manage platform trust.</li>
              <li>To support instant booking, booking status updates, and optional live-location sharing.</li>
              <li>To provide driver analytics such as profile views, call clicks, WhatsApp clicks, and lead reports.</li>
              <li>To send operational notices, support responses, driver subscription reminders, and safety updates.</li>
              <li>To investigate complaints, safety issues, fraud, abuse, unpaid fees, or violations of our Terms.</li>
              <li>To comply with applicable law, lawful requests, audits, tax, accounting, security, and record-keeping obligations.</li>
              <li>To improve reliability, performance, user experience, search quality, and abuse prevention.</li>
            </ul>
            <div className="shadow p-4 rounded-xl border border-slate-200 mb-4 text-sm bg-slate-50">
              <strong className="text-slate-900">Our commitment:</strong> We do not sell personal data to advertisers.
              We do not record the audio content of direct phone calls unless a future feature clearly says so and
              obtains any consent required by law.
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">3. Legal Basis and Consent</h3>
            <p className="mb-4 text-sm">
              We process personal data where it is needed to provide the platform, where you have given consent,
              where it is necessary for safety, fraud prevention, legal compliance, support, payment or subscription
              administration, or where otherwise permitted under applicable law, including India&apos;s digital personal
              data protection framework.
            </p>
            <p className="mb-4 text-sm">
              You may withdraw consent for optional processing, such as optional location sharing or marketing-style
              communications. Some core processing is necessary to provide the platform; if you withdraw consent for
              required processing, we may be unable to provide certain features or may need to close the account.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">4. What Other Users Can See</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li>Riders may see driver names, profile photos or initials, vehicle photos, vehicle model, number plate, rating, routes, taxi stands, availability, and contact options.</li>
              <li>Drivers may receive rider name, phone number, destination, pickup details, and live location when a rider submits an instant-book request and location sharing is enabled.</li>
              <li>Support reports may include details needed to investigate a complaint, including reported driver or rider information.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">5. Sharing With Service Providers and Authorities</h3>
            <p className="mb-4 text-sm">
              We share personal data only where needed to operate the platform, comply with law, protect users, or
              enforce our Terms. This may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li><strong>Authentication providers</strong> that manage sign-in and account security.</li>
              <li><strong>Database, hosting, storage, and deployment providers</strong> that store platform records and files.</li>
              <li><strong>Email, WhatsApp, SMS, or notification providers</strong> used for operational messages and subscription reminders.</li>
              <li><strong>Map, browser, and location services</strong> used for search, pickup, and live-location features.</li>
              <li><strong>Payment or subscription providers</strong> if platform subscriptions or fees are processed digitally.</li>
              <li><strong>Professional advisers, auditors, insurers, or legal representatives</strong> where reasonably necessary.</li>
              <li><strong>Law enforcement, courts, regulators, or public authorities</strong> when required by law or where necessary for safety, fraud, or legal claims.</li>
            </ul>
            <p className="text-sm">
              We require service providers to use personal data only for the services they provide to us, subject to
              confidentiality, security, and lawful-processing obligations.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Shield size={20} /> 6. Security
            </h3>
            <p className="mb-4 text-sm">
              We use reasonable technical and organisational safeguards, including access controls, HTTPS/TLS in
              transit, least-privilege admin access, logging, credential protection, file access controls, and review
              of sensitive admin actions. No platform can guarantee perfect security, but we work to reduce risk and
              respond quickly to suspected misuse or incidents.
            </p>
            <p className="text-sm mt-4 p-3 rounded-lg border border-slate-200 bg-slate-50">
              Please keep your login secure and report suspected unauthorised access immediately.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">7. Data Retention</h3>
            <p className="mb-4 text-sm">
              We retain personal data only for as long as needed for platform operation, safety, legal compliance,
              accounting, dispute resolution, fraud prevention, and enforcement of our Terms. Typical retention
              periods may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li><strong>Account records:</strong> while the account is active and for a reasonable period after closure.</li>
              <li><strong>Driver verification records:</strong> while the driver is listed and for up to five years after removal, or longer if legally required or needed for disputes.</li>
              <li><strong>Bookings, lead analytics, complaints, and support records:</strong> usually up to three years, unless a longer period is needed for safety, legal, payment, or fraud reasons.</li>
              <li><strong>Live location updates:</strong> kept only as long as reasonably needed for the active booking, safety review, fraud prevention, or dispute handling.</li>
              <li><strong>Aggregated or anonymised analytics:</strong> may be retained indefinitely because they do not reasonably identify a person.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">8. Your Privacy Rights</h3>
            <p className="text-sm mb-4">
              Subject to applicable law and verification of your identity, you may request:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li>access to a summary of personal data we process about you;</li>
              <li>correction or updating of inaccurate or incomplete data;</li>
              <li>deletion of personal data, subject to legal, safety, fraud, accounting, and dispute-retention exceptions;</li>
              <li>withdrawal of consent for optional processing;</li>
              <li>grievance redressal for privacy concerns;</li>
              <li>nomination of another person to exercise rights on your behalf where applicable law allows it.</li>
            </ul>
            <p className="text-sm">
              To make a request, contact us using the details below. We may need to verify your identity before
              acting on a request.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">9. Location Data</h3>
            <p className="text-sm">
              Location sharing is used for search, pickup, live-location updates, and active instant-book requests.
              Your device or browser may ask for permission before sharing precise location. You can disable location
              permissions in your device or browser settings, but some features may stop working or become less accurate.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">10. Cookies and Similar Technologies</h3>
            <p className="text-sm mb-4">
              We may use cookies, local storage, and similar technologies to keep you signed in, remember preferences,
              measure performance, detect abuse, and improve reliability. You can control cookies through your browser,
              but disabling them may affect platform functionality.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">11. Children&apos;s Privacy</h3>
            <p className="text-sm">
              THE LOBBY is not intended for users under 18 to create accounts. We do not knowingly collect account
              data from children. If you believe a child has provided personal data to us, contact us and we will
              take appropriate steps to delete or restrict that data.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">12. Data Transfers</h3>
            <p className="text-sm">
              We primarily operate for users in India, but some service providers may process or store data in India
              or other countries where they operate. When data is transferred or processed outside India, we rely on
              lawful transfer mechanisms, contractual safeguards, and service-provider security commitments as required
              by applicable law.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} /> 13. Breach Notification
            </h3>
            <p className="text-sm">
              If we become aware of a personal data breach, we will investigate, take reasonable mitigation steps,
              and notify affected users, regulators, or other authorities where required by applicable law. Notices
              may include the nature of the incident, affected data categories where known, actions we are taking,
              and steps you can take to protect yourself.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">14. Changes to This Policy</h3>
            <p className="text-sm">
              We may update this Privacy Policy to reflect platform, legal, or operational changes. Material changes
              will be posted with an updated date and, where legally required, additional notice. Continued use of
              THE LOBBY after an update means the updated policy applies.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle size={20} /> 15. Privacy Contact and Grievance Redressal
            </h3>
            <p className="text-sm mb-4">
              For privacy questions, correction or deletion requests, consent withdrawal, grievances, safety reports,
              or data-protection concerns, contact:
            </p>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-sm"><strong>Email:</strong> <a href="mailto:thelobby500@gmail.com" className="text-[#2F80ED] underline">thelobby500@gmail.com</a></p>
              <p className="text-sm mt-2"><strong>Location:</strong> THE LOBBY, Kohima, Nagaland, India</p>
              <p className="text-sm mt-2"><strong>Response target:</strong> We aim to respond within 30 days, subject to verification and applicable law.</p>
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Related Documents</h3>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-sm">
                <Link href="/terms" className="text-[#2F80ED] font-bold underline">Terms of Service</Link>
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Learn about user responsibilities, platform limitations, subscription rules, and dispute handling.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
