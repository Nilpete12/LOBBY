"use client";

import Link from 'next/link';
import { AlertTriangle, CheckCircle, FileText, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-linear-to-bl from-[#DCEBFF]/70 to-white pt-30 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12 border-b border-slate-100 pb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Terms of Service</h1>
          <p className="text-slate-500 text-lg">Effective Date: July 16, 2026</p>
          <p className="text-sm text-slate-500 mt-2">
            These Terms apply to THE LOBBY platform. Our data practices are explained in the{' '}
            <Link href="/privacypolicy" className="text-[#2F80ED] underline">Privacy Policy</Link>.
          </p>
        </div>

        <div className="prose prose-slate prose-lg text-slate-600">
          <p className="text-lg mb-8">
            By accessing or using THE LOBBY, you agree to these Terms. Please read them carefully.
            If you do not agree, do not use the platform.
          </p>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText size={20} /> 1. What THE LOBBY Is
            </h3>
            <p className="mb-4 text-sm">
              THE LOBBY is a technology platform and local driver directory that helps riders discover,
              contact, and request rides from independent local drivers. THE LOBBY is not a taxi operator,
              transport carrier, vehicle owner, employer, agent of drivers, or party to the ride agreement
              between a rider and a driver.
            </p>
            <div className="shadow p-4 rounded-xl border border-slate-200 bg-slate-50 mb-4 text-sm">
              <strong>Important:</strong> Any ride, fare, route, waiting time, cancellation, pickup, drop-off,
              or safety arrangement is agreed directly between the rider and the driver. We may provide tools
              for discovery, verification, lead tracking, support, and admin review, but we do not guarantee
              ride completion, driver availability, travel time, fare, or conduct.
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle size={20} /> 2. Accounts and Eligibility
            </h3>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li>You must provide accurate, current, and complete account information.</li>
              <li>You are responsible for all activity under your account and for keeping your login secure.</li>
              <li>Driver accounts are available only to persons legally allowed to drive commercially or offer rides under applicable laws and local rules.</li>
              <li>Users under 18 may not create an account. A minor may use the service only through a parent or legal guardian where permitted by law.</li>
              <li>We may reject, suspend, restrict, or remove an account if we reasonably believe it creates legal, security, fraud, payment, or safety risk.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck size={20} /> 3. Driver Responsibilities
            </h3>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li>Drivers are independent service providers and are not employees, contractors, partners, or agents of THE LOBBY.</li>
              <li>Drivers must maintain valid driving licences, permits, vehicle registration, insurance, fitness documents, tax documents, number plate details, and any other approvals required by law.</li>
              <li>Drivers must keep profile details accurate, including name, phone number, vehicle model, number plate, taxi stands, availability, documents, and route information.</li>
              <li>Drivers must comply with applicable fare rules, taxi-stand rules, road-safety laws, transport laws, and local association rules.</li>
              <li>Drivers must not submit false documents, use another person&apos;s account, misrepresent availability, overcharge unlawfully, harass riders, or engage in unsafe conduct.</li>
              <li>Drivers are responsible for taxes, insurance claims, accidents, traffic violations, penalties, disputes, and passenger safety during rides they provide.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">4. Rider Responsibilities</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li>Riders must use driver information responsibly and only for ride-related communication.</li>
              <li>Riders should confirm the driver&apos;s name, vehicle, number plate, route, fare, and pickup details before starting a ride.</li>
              <li>Riders must not abuse, threaten, defraud, spam, impersonate, or harass drivers or support staff.</li>
              <li>Riders are responsible for deciding whether to accept a ride from a driver. In emergencies, contact local emergency services first.</li>
              <li>Riders must pay fares, waiting charges, tolls, parking, or other lawful charges agreed directly with the driver.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">5. Verification and Safety</h3>
            <p className="mb-4 text-sm">
              We may review driver-submitted documents, profile details, complaints, lead reports, ride-completion
              confirmations, and other signals to improve platform safety. Verification means only that a document
              or profile passed our review at a point in time. It is not a guarantee of identity, fitness, legality,
              insurance validity, driving skill, conduct, or ride safety.
            </p>
            <p className="mb-4 text-sm">
              We may approve, reject, re-review, suspend, or remove drivers at our discretion where there is a
              safety, legal, document, payment, fraud, or trust concern. Users should report incidents through
              <Link href="/support" className="text-[#2F80ED] underline"> support</Link> as soon as possible.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">6. Search, Calls, WhatsApp and Instant Booking</h3>
            <p className="mb-4 text-sm">
              Search results, taxi-stand filters, driver cards, call buttons, WhatsApp buttons, and instant-book
              requests are discovery and lead-generation tools. A ride is not confirmed until the driver and rider
              directly agree or, where available, the driver accepts an instant-book request.
            </p>
            <p className="mb-4 text-sm">
              THE LOBBY may track lead activity such as profile views, call-button clicks, WhatsApp-button clicks,
              instant-book requests, driver responses, optional ride-completion confirmations, and driver lead
              reports. We do not record the audio content of phone calls unless we introduce such a feature with
              clear notice and any legally required consent.
            </p>
            <p className="mb-4 text-sm">
              Live location features, where enabled, are intended only to help a driver locate a rider during an
              active request. Location sharing may be inaccurate, delayed, unavailable, or interrupted by device,
              browser, network, or permission settings.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">7. Payments, Fares and Subscriptions</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li>Unless the platform clearly states otherwise, rider fares are agreed and paid directly between riders and drivers.</li>
              <li>THE LOBBY is not responsible for cash handling, fare negotiations, refunds, change, missed payments, or payment disputes between riders and drivers.</li>
              <li>Drivers may be required to pay subscription or listing fees to remain visible, verified, boosted, or active on the platform.</li>
              <li>Failure to pay subscription fees may result in reminders, reduced visibility, suspension, or removal from driver listings.</li>
              <li>Any platform fee, subscription, refund, discount, or promotion is subject to the terms displayed at the time and applicable law.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">8. Prohibited Conduct</h3>
            <p className="mb-4 text-sm">You must not:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li>use the platform for illegal, unsafe, fraudulent, abusive, discriminatory, or harmful activity;</li>
              <li>submit forged, misleading, outdated, or third-party documents;</li>
              <li>scrape, copy, sell, or misuse driver or rider contact information;</li>
              <li>interfere with platform security, reverse engineer the service, or overload our systems;</li>
              <li>post false complaints, false ride reports, fake reviews, or misleading profile information;</li>
              <li>use THE LOBBY branding, data, or software without permission.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">9. User Content and Licence</h3>
            <p className="mb-4 text-sm">
              You may submit profile details, photos, documents, reviews, support messages, complaints, and other
              content. You retain ownership of your content, but you grant THE LOBBY a non-exclusive, worldwide,
              royalty-free licence to host, use, display, reproduce, modify, and process it as needed to operate,
              secure, improve, investigate, and promote the platform. You must have the right to submit any content
              you provide.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">10. Privacy and Data</h3>
            <p className="mb-4 text-sm">
              Our <Link href="/privacypolicy" className="text-[#2F80ED] underline">Privacy Policy</Link> explains
              what data we collect, how we use it, when we share it, how long we retain it, and how users can raise
              privacy requests. By using the platform, you agree that we may process data as described there.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">11. Suspension, Removal and Investigations</h3>
            <p className="mb-4 text-sm">
              We may suspend, restrict, remove, de-rank, or refuse service to any user or driver if we reasonably
              believe it is necessary to protect users, comply with law, investigate complaints, prevent fraud,
              enforce these Terms, recover unpaid platform fees, or protect THE LOBBY. We may preserve account,
              booking, support, verification, and analytics records where needed for legal, safety, audit, or dispute
              purposes.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} /> 12. Disclaimers
            </h3>
            <p className="mb-4 text-sm">
              THE LOBBY is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the fullest extent permitted
              by law, we disclaim all warranties, including warranties of accuracy, availability, merchantability,
              fitness for a particular purpose, non-infringement, uninterrupted operation, error-free operation,
              driver availability, ride completion, safety, pricing accuracy, and route accuracy.
            </p>
            <p className="mb-4 text-sm">
              We are not responsible for the acts, omissions, statements, delays, cancellations, pricing, driving,
              documents, vehicles, insurance, or conduct of riders, drivers, taxi stands, payment providers, mapping
              providers, messaging services, or other third parties.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">13. Limitation of Liability</h3>
            <p className="mb-4 text-sm">
              To the fullest extent permitted by law, THE LOBBY and its founders, officers, employees, contractors,
              service providers, and affiliates will not be liable for indirect, incidental, special, consequential,
              exemplary, punitive, or loss-of-profit damages, or for disputes arising from rides arranged directly
              between riders and drivers.
            </p>
            <p className="mb-4 text-sm">
              Except where prohibited by law, our total liability for any claim relating to the platform will not
              exceed the amount you paid directly to THE LOBBY for the service giving rise to the claim during the
              six months before the claim, or INR 1,000, whichever is higher. Nothing in these Terms excludes liability
              that cannot legally be excluded.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">14. Indemnity</h3>
            <p className="mb-4 text-sm">
              You agree to indemnify and hold harmless THE LOBBY and its founders, officers, employees, contractors,
              service providers, and affiliates from claims, losses, liabilities, penalties, damages, costs, and
              expenses arising from your use of the platform, ride arrangements, breach of these Terms, violation of
              law, submitted content, unpaid fees, negligence, fraud, misconduct, or violation of another person&apos;s
              rights.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">15. Intellectual Property</h3>
            <p className="mb-4 text-sm">
              THE LOBBY name, branding, design, software, content, data structure, and platform features are owned
              by or licensed to THE LOBBY. You may not copy, modify, distribute, sell, scrape, or create derivative
              works from the platform except as expressly permitted by us in writing.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">16. Changes to the Platform or Terms</h3>
            <p className="mb-4 text-sm">
              We may update, suspend, remove, or change features at any time. We may also update these Terms by
              posting a new effective date. Where required by law, we will provide additional notice. Continued use
              after changes means you accept the updated Terms.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">17. Governing Law and Disputes</h3>
            <p className="mb-4 text-sm">
              These Terms are governed by the laws of India. The parties will first try to resolve disputes in good
              faith through support. Subject to any mandatory consumer forum rights or other non-waivable rights,
              disputes relating to these Terms or the platform will be subject to the courts at Kohima, Nagaland.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">18. Contact</h3>
            <p className="mb-4 text-sm">
              For support, safety reports, legal notices, subscription questions, or account concerns, contact{' '}
              <a href="mailto:thelobby500@gmail.com" className="text-[#2F80ED] underline">thelobby500@gmail.com</a>{' '}
              or visit the <Link href="/support" className="text-[#2F80ED] underline">support center</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
