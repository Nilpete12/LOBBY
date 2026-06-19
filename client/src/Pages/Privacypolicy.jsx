import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-linear-to-bl from-blue-200/70 to-white pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12 border-b border-slate-100 pb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-500 text-lg">Last updated: December 30, 2025</p>
          <p className="text-sm text-slate-500 mt-2">For details about your rights and responsibilities when using our platform, see our <a href="/terms" className="text-blue-600 underline">Terms of Service</a>.</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate prose-lg text-slate-600">
          
          <p className="text-lg mb-8 font-medium text-slate-800">
            At THE LOBBY, we value your trust and are committed to transparency about how we collect, use, and protect your personal data. This policy explains our data practices when you use our platform to find rides in Shillong and across Meghalaya.
          </p>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Eye size={20} /> 1. Information We Collect
            </h3>
            <p className="mb-4">
              We collect information necessary to provide our services and ensure platform safety. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Account Data:</strong> Name, phone number, email address, and profile information provided during registration.</li>
              <li><strong>Driver Verification Data:</strong> Vehicle details, driving license copies, government ID, insurance information, and vehicle registration documents (for verification purposes only).</li>
              <li><strong>Usage Data:</strong> Search history (e.g., "Shillong to Dawki"), trip routes, pickup and drop-off locations, and app interaction patterns to improve our services.</li>
              <li><strong>Communication Data:</strong> Messages, call logs, and support tickets exchanged through our platform.</li>
              <li><strong>Device Information:</strong> Device type, operating system, IP address, and unique device identifiers for security and service optimization.</li>
              <li><strong>Payment Information:</strong> Transaction history and payment method details (processed by third-party payment providers).</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lock size={20} /> 2. How We Use Your Data
            </h3>
            <p className="mb-4">
              Your data is used strictly for operational and safety purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>To verify driver identities and maintain platform safety and integrity.</li>
              <li>To enable direct communication between riders and drivers through our app.</li>
              <li>To process payments and resolve payment disputes.</li>
              <li>To prevent fraud, abuse, and violations of our community guidelines.</li>
              <li>To improve our route suggestions and service recommendations.</li>
              <li>To respond to your inquiries and provide customer support.</li>
              <li>To comply with legal obligations and regulatory requirements.</li>
              <li>To conduct safety investigations and address reported incidents.</li>
            </ul>
            <div className="shadow p-4 rounded-xl border border-blue-100 mb-4 text-sm bg-blue-50">
              <strong className="text-blue-900">Our Commitment:</strong> We do not sell your personal data to third-party advertisers or marketing companies. Your data is not shared with unaffiliated parties except as required by law or as necessary to provide our services.
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Shield size={20} /> 3. Data Security and Protection
            </h3>
            <p className="mb-4">
              We implement industry-standard security measures to protect your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li>End-to-end encryption for sensitive communications and data transmission.</li>
              <li>Secure servers with regular security audits and penetration testing.</li>
              <li>Access controls limiting data access to authorized personnel only.</li>
              <li>Multi-factor authentication (MFA) options for account protection.</li>
            </ul>
            <p className="text-sm mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50">
              <strong>Disclaimer:</strong> While no service is 100% secure, we continuously monitor and improve our security infrastructure. We cannot guarantee complete protection against all potential threats.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">4. Data Sharing and Third Parties</h3>
            <p className="mb-4 text-sm">
              We may share your data with third-party service providers who assist in our operations:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li><strong>Payment Processors:</strong> To process transactions securely.</li>
              <li><strong>Identity Verification Providers:</strong> To verify driver credentials and documents.</li>
              <li><strong>Mapping Services:</strong> To provide route optimization and location services.</li>
              <li><strong>Customer Support Platforms:</strong> To manage inquiries and support tickets.</li>
            </ul>
            <p className="text-sm">
              All third-party providers are contractually obligated to maintain data confidentiality and use your information solely for the purposes we specify. We do not control their systems and are not liable for their practices beyond our contractual obligations.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">5. Data Retention</h3>
            <p className="text-sm">
              We retain your personal data for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li>Provide our services and maintain your account.</li>
              <li>Comply with legal and regulatory obligations.</li>
              <li>Resolve disputes and enforce our agreements.</li>
              <li>Investigate and prevent fraud or safety incidents.</li>
            </ul>
            <p className="text-sm">
              After you delete your account, we may retain certain data in anonymized or aggregated form as required by law. Driver verification documents may be retained for a period mandated by transportation regulations in Meghalaya.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">6. Your Data Rights</h3>
            <p className="text-sm mb-4">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Correction:</strong> Correct inaccurate or incomplete information.</li>
              <li><strong>Right to Deletion:</strong> Request deletion of your account and associated data (subject to legal retention requirements).</li>
              <li><strong>Right to Opt-Out:</strong> Opt out of certain data processing activities, such as marketing communications.</li>
              <li><strong>Right to Data Portability:</strong> Request your data in a portable format.</li>
            </ul>
            <p className="text-sm">
              To exercise any of these rights, contact our Data Protection Officer at the address provided in the Contact section below.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">7. Cookies and Tracking</h3>
            <p className="text-sm">
              Our platform may use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li>Maintain your session and remember your preferences.</li>
              <li>Analyze platform usage and performance.</li>
              <li>Detect and prevent fraudulent activity.</li>
            </ul>
            <p className="text-sm">
              You can control cookie settings through your browser. However, disabling cookies may affect the functionality of certain features. Third-party analytics providers may also collect usage data subject to their privacy policies.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} /> 8. Breach Notification
            </h3>
            <p className="text-sm">
              If we discover a security breach that may affect your personal data, we will follow our incident response procedures and notify affected users and regulators as required by applicable law. Where legally required, we will provide notice without unreasonable delay. Notifications will include information about the breach, the data affected, and steps you should take to protect yourself.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">9. International Data Transfers</h3>
            <p className="text-sm">
              Your data is primarily stored and processed within India. If we transfer data internationally for service provision or backup purposes, we implement appropriate safeguards such as standard contractual clauses or your explicit consent to ensure adequate protection.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">10. Children's Privacy</h3>
            <p className="text-sm">
              THE LOBBY is not intended for users under 18 years of age. We do not knowingly collect personal data from children. If we discover we have collected data from a child, we will delete it promptly. Parents or guardians who believe their child has provided personal data should contact us immediately.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">11. Recordings and Monitoring</h3>
            <p className="text-sm mb-4">
              To ensure safety, prevent fraud, and maintain service quality, we may:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li>Record calls and messages between riders and drivers (where legally permitted).</li>
              <li>Monitor trip data, including routes and duration.</li>
              <li>Log access to accounts and platform activities.</li>
            </ul>
            <p className="text-sm">
              By using THE LOBBY, you consent to such monitoring and recording as permitted by applicable laws in your jurisdiction.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">12. Data Protection Officer and Privacy Inquiries</h3>
            <p className="text-sm mb-4">
              For questions about this privacy policy, data practices, or to exercise your data rights, contact our Data Protection Officer:
            </p>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-sm"><strong>Email:</strong> <a href="mailto:thelobby500@gmail.com" className="text-blue-600 underline">thelobby500@gmail.com</a></p>
              <p className="text-sm mt-2"><strong>Mailing Address:</strong> Data Protection Officer, THE LOBBY, Shillong, Meghalaya, India</p>
              <p className="text-sm mt-2"><strong>Response Time:</strong> We aim to respond to all inquiries within 30 days.</p>
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">13. Changes to This Privacy Policy</h3>
            <p className="text-sm">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. Material changes will be posted with an updated "Last updated" date. Where required by law, we will provide advance notice. Your continued use of THE LOBBY after any changes constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle size={20} /> 14. Legal Basis for Processing (GDPR Compliance)
            </h3>
            <p className="text-sm">
              For users subject to GDPR or similar regulations, we process your personal data based on:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
              <li><strong>Contractual Necessity:</strong> To provide our services and fulfill our agreement with you.</li>
              <li><strong>Legal Obligation:</strong> To comply with laws and regulatory requirements.</li>
              <li><strong>Legitimate Interests:</strong> To prevent fraud, ensure security, and improve our platform.</li>
              <li><strong>Consent:</strong> Where you have explicitly consented to specific processing activities.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">15. Governing Law</h3>
            <p className="text-sm">
              This Privacy Policy is governed by the laws of India, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023. For matters related to data protection in Meghalaya, applicable state regulations will also apply.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Related Documents</h3>
            <p className="text-sm mb-4">
              For information about your rights and responsibilities when using our platform, please review our:
            </p>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm"><a href="/terms" className="text-blue-600 font-bold underline">→ Terms of Service</a></p>
              <p className="text-xs text-slate-600 mt-1">Learn about user responsibilities, service limitations, and dispute resolution procedures.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
