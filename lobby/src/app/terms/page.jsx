"use client";
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-linear-to-bl from-blue-200/70 to-white pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12 border-b border-slate-100 pb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Terms of Service</h1>
          <p className="text-slate-500 text-lg">Effective Date: January 1, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate prose-lg text-slate-600">
          
          <p className="text-lg mb-8">
            Welcome to LOBBY. By accessing or using our website and services, you agree to be bound by these terms. If you do not agree, please do not use our platform.
          </p>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText size={20} /> 1. The Service
            </h3>
            <p className="mb-4">
              LOBBY is a <strong>directory service</strong> that connects independent drivers with potential passengers. We are not a transportation carrier.
            </p>
            <div className="shadow p-4 rounded-xl border border-slate-200 mb-4 text-sm">
              <strong>Key Distinction:</strong> We do not employ drivers. The contract for transportation is directly between the Rider and the Driver. LOBBY is not a party to that agreement.
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle size={20} /> 2. User Responsibilities
            </h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>You must be at least 18 years old to create a driver account.</li>
              <li>You agree to provide accurate, current, and complete information during registration.</li>
              <li>Riders agree to pay the fare negotiated directly with the driver.</li>
              <li>Drivers agree to maintain valid vehicle insurance, registration, and licenses required by the State of Meghalaya.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} /> 3. Limitation of Liability
            </h3>
            <p className="mb-4">
              To the fullest extent permitted by law, LOBBY shall not be liable for any indirect, incidental, or consequential damages arising out of the use of the service, including but not limited to damages for loss of profits, goodwill, or personal injury.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">4. Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Service.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-3">5. Jurisdiction</h3>
            <p>
              These Terms shall be governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Shillong, Meghalaya.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}