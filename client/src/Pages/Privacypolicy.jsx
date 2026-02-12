import { Shield, Lock, Eye } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-linear-to-bl from-blue-200/70 to-white pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12 border-b border-slate-100 pb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-500 text-lg">Last updated: December 30, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate prose-lg text-slate-600">
          
          <p className="lead text-xl text-slate-800 font-medium mb-8">
            At THE LOBBY, we value your trust. This policy explains how we handle your personal data when you use our platform to find rides in Shillong and across Meghalaya.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye size={24} className="text-blue-600" /> Information We Collect
            </h2>
            <p className="mb-4">
              We collect information to facilitate direct connections between riders and drivers. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Account Data:</strong> Name, phone number, and email address provided during sign-up.</li>
              <li><strong>Driver Data:</strong> Vehicle details, driving license copies, and government ID (for verification purposes only).</li>
              <li><strong>Usage Data:</strong> Search history (e.g., "Shillong to Dawki") to improve our route suggestions.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock size={24} className="text-blue-600" /> How We Use Your Data
            </h2>
            <p className="mb-4">
              Your data is used strictly for operational purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To verify driver identities and ensure platform safety.</li>
              <li>To allow riders to call drivers directly via the app.</li>
              <li>To prevent fraud and abuse of our community guidelines.</li>
            </ul>
            <p className="mt-4 p-4 rounded-xl text-blue-800 text-sm font-bold border border-blue-100">
              Note: We do not sell your personal data to third-party advertisers.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield size={24} className="text-blue-600" /> Data Security
            </h2>
            <p>
              We implement industry-standard encryption to protect your data. While no service is 100% secure, we regularly audit our systems to prevent unauthorized access.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
            <p>
              If you have questions about this policy, please contact our Data Protection Officer at <a href="mailto:privacy@lobby.com" className="text-blue-600 font-bold hover:underline">privacy@lobby.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}