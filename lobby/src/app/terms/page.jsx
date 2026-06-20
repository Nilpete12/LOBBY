"use client";
import Link from 'next/link';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-linear-to-bl from-blue-200/70 to-white pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12 border-b border-slate-100 pb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Terms of Service</h1>
          <p className="text-slate-500 text-lg">Effective Date: January 1, 2026</p>
          <p className="text-sm text-slate-500 mt-2">For details about how we collect and use personal data, see our <Link href="/privacypolicy" className="text-blue-600 underline">Privacy Policy</Link>.</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate prose-lg text-slate-600">
          
          <p className="text-lg mb-8">
            Welcome to THE LOBBY. By accessing or using our website and services, you agree to be bound by these terms. If you do not agree, please do not use our platform.
          </p>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText size={20} /> Definitions
            </h3>
            <p className="mb-4">
              For the purposes of these Terms:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li><strong>"Service"</strong> means THE LOBBY website, mobile applications, APIs and related features that facilitate connections between Riders and Drivers.</li>
              <li><strong>"Rider"</strong> means a user who requests transportation through the Service.</li>
              <li><strong>"Driver"</strong> means a user who offers transportation through the Service.</li>
              <li><strong>"Account"</strong> means a user account registered with THE LOBBY.</li>
              <li><strong>"Personal Data"</strong> means information that identifies or can be used to identify an individual.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText size={20} /> 1. The Service
            </h3>
            <p className="mb-4">
             THE LOBBY is a <strong>directory service</strong> that connects independent drivers with potential passengers. We are not a transportation carrier.
            </p>
            <div className="shadow p-4 rounded-xl border border-slate-200 mb-4 text-sm">
              <strong>Key Distinction:</strong> We do not employ drivers. The contract for transportation is directly between the Rider and the Driver. THE LOBBY is not a party to that agreement.
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle size={20} /> 2. User Responsibilities
            </h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>You must be at least 18 years old to create a driver account.</li>
              <li>You agree to provide accurate, current, and complete information during registration and to update that information promptly if it changes.</li>
              <li>Riders agree to pay the fare negotiated directly with the driver unless otherwise processed through our payment system.</li>
              <li>Drivers agree to maintain valid vehicle insurance, registration, and licenses required by their applicable jurisdiction (for example, the State of Nagaland).</li>
              <li>Users must follow all local laws and regulations when using the Service.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} /> 3. Security, Data and Privacy
            </h3>
            <p className="mb-4">
              We take the security and privacy of user data seriously. Our <Link href="/privacypolicy" className="text-blue-600 underline">Privacy Policy</Link> describes what Personal Data we collect, how we use it, how long we retain it, and how users can exercise their rights.
            </p>
            <h4 className="font-semibold">Data Security</h4>
            <p className="mb-4 text-sm">
              We implement reasonable administrative, technical, and physical safeguards designed to protect Personal Data against unauthorized access, disclosure, alteration, or destruction. These measures include access controls, encryption in transit (TLS) and where feasible at rest, logging, and regular security assessments.
            </p>
            <h4 className="font-semibold">Breach Notification</h4>
            <p className="mb-4 text-sm">
              If we learn of a security incident that affects Personal Data, we will follow our incident response procedures and notify affected users and regulators as required by applicable law. Where possible we will provide details about the data involved, steps we are taking, and recommendations to protect yourself.
            </p>
            <h4 className="font-semibold">Account Security</h4>
            <p className="mb-4 text-sm">
              You are responsible for maintaining the confidentiality of your account credentials. We strongly recommend enabling multi-factor authentication (MFA) where available and using a strong, unique password. Notify us immediately if you suspect unauthorized access to your account; we may suspend or lock access to protect users.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">4. Driver Verification, Safety and Insurance</h3>
            <p className="mb-4 text-sm">
              Drivers must provide accurate verification documents and certify that they carry required insurance and licenses. THE LOBBY may perform identity and document verification checks and may suspend or remove Drivers who fail verification or who present safety risks.
            </p>
            <p className="mb-4 text-sm">
             THE LOBBY is not a carrier and does not provide insurance for trips; Drivers are responsible for maintaining insurance as required by law. Riders and Drivers should report safety incidents immediately via our <a href="/support" className="text-blue-600 underline">support</a> channel so we can investigate.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">5. Payments and Disputes</h3>
            <p className="mb-4 text-sm">
              Where THE LOBBY facilitates payments, payments are processed by third-party payment processors and are subject to their terms. We use industry-standard measures to protect payment information, but we do not store full payment card details ourselves unless explicitly stated and in compliance with applicable standards (e.g., PCI-DSS).
            </p>
            <p className="mb-4 text-sm">
              Fare disputes should be reported to support within 30 days of the trip. We may withhold driver payouts while investigating disputes that raise reasonable concerns.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} /> 6. Limitation of Liability
            </h3>
            <p className="mb-4 text-sm">
              To the fullest extent permitted by law, THE LOBBY shall not be liable for any indirect, incidental, special, punitive, exemplary or consequential damages arising out of or related to these Terms or the use of the Service, even if THE LOBBY has been advised of the possibility of such damages.
            </p>
            <p className="mb-4 text-sm">
              Except where prohibited by law, THE LOBBY’s aggregate liability arising out of or related to these Terms will not exceed the total fees actually paid by you to THE LOBBY in the 12 months preceding the claim. Nothing in these Terms limits liability for death or personal injury caused by our negligence or for other liabilities that cannot be excluded or limited by applicable law.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">7. Indemnification</h3>
            <p className="mb-4 text-sm">
              You agree to indemnify and hold harmless THE LOBBY, its affiliates, officers, directors, employees and agents from and against any and all claims, losses, liabilities, expenses (including reasonable attorneys’ fees) and damages arising out of or related to your breach of these Terms, your negligent or intentional acts, or your violation of any law or third-party rights.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">8. Termination and Suspension</h3>
            <p className="mb-4 text-sm">
              We may suspend or terminate your access to the Service for violations of these Terms, for suspicious activity, or for actions we reasonably believe may harm other users or THE LOBBY. Where practicable, we will provide notice and an opportunity to cure; however, for serious or repeated violations we may suspend or terminate immediately. Upon termination, your right to use the Service stops and we may delete or anonymize your data in accordance with our retention policies.
            </p>
            <p className="mb-4 text-sm">
              Termination does not relieve you of obligations incurred prior to termination, including outstanding payment obligations and indemnification obligations.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">9. Prohibited Conduct</h3>
            <p className="mb-4 text-sm">
              Users must not use the Service to harass, defraud, threaten, or engage in any illegal activity. Soliciting off-platform payments to avoid fees, sharing stolen or forged documents, and misrepresenting identity or trip details are prohibited and may result in account termination and referral to law enforcement.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">10. Recordings and Logs</h3>
            <p className="mb-4 text-sm">
              We may record calls, messages, and trip data for quality assurance, safety investigations and fraud detection. By using the Service you consent to such recordings where permitted by law. We retain logs and trip records as described in our <Link href="/privacypolicy" className="text-blue-600 underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">11. Data Retention and Deletion</h3>
            <p className="mb-4 text-sm">
              We retain Personal Data for as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account and data via <a href="/support" className="text-blue-600 underline">support</a>, subject to legal exceptions and our obligation to retain certain information for compliance and fraud prevention.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">12. Third-Party Services</h3>
            <p className="mb-4 text-sm">
              The Service may rely on third-party providers (for example, mapping services, payment processors, and identity verification providers). We do not control these third parties and are not responsible for their actions or omissions. Using the Service may also expose you to third-party terms and privacy practices.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">13. Intellectual Property</h3>
            <p className="mb-4 text-sm">
              All content, branding and software provided by THE LOBBY are owned by or licensed to THE LOBBY. You may not copy, reproduce, or create derivative works except as expressly authorized. By submitting reviews, photos, or other content you grant THE LOBBY a non-exclusive, worldwide, royalty-free license to use that content to provide and promote the Service.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">14. Governing Law and Dispute Resolution</h3>
            <p className="mb-4 text-sm">
              These Terms shall be governed by the laws of India without regard to conflicts of laws principles. Except where local consumer protection law provides otherwise, disputes will be subject to the exclusive jurisdiction of the courts located in Nagaland.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">15. Changes to These Terms</h3>
            <p className="mb-4 text-sm">
              We may modify these Terms from time to time. Material changes will be posted with an updated Effective Date and, where required by law, we will provide notice. Continued use of the Service after a change constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">16. Contact</h3>
            <p className="mb-4 text-sm">
              If you have questions about these Terms, data practices, or want to report a security or safety issue, contact us at <a href="mailto:thelobby500@gmail.com" className="text-blue-600 underline">thelobby500@gmail.com</a> or visit our <a href="/support" className="text-blue-600 underline">support center</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
