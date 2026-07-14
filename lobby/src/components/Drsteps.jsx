import Link from 'next/link';

export default function JoinSteps() {
  return (
    <section className="py-24 bg-[#FFF7ED] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-6xl font-[Proxima_Nova_Extrabold] tracking-tight leading-[1.1] text-slate-900 mb-6">
              Simple steps to get started.
            </h2>

            <p className="text-slate-500 font-[Proxima_Nova_Semibold] mb-8 text-lg leading-relaxed">
              We verify every driver to ensure safety. Have your Driving License and Vehicle Registration (RC) ready.
            </p>

            <div className="space-y-8">
              {[
                { num: "01", title: "Create Profile", text: "Sign up with your phone number and basic details." },
                { num: "02", title: "Upload Documents", text: "Submit photos of your DL, RC, and a clean photo of your car." },
                { num: "03", title: "Get Verified", text: "Our team approves your profile within 24 hours." },
                { num: "04", title: "Go Online", text: "Toggle your status to Green and start receiving calls." }
              ].map((step, i) => (
                <div key={i} className="flex gap-6 font-[Proxima_Nova_Extrabold] items-start">
                  <span className="text-3xl font-extrabold text-[#2F80ED] opacity-80">
                    {step.num}
                  </span>

                  <div>
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">
                      {step.title}
                    </h4>

                    <p className="text-slate-500 font-medium text-sm leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: CTA Box */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-4xl p-10 md:p-14 text-center shadow-xl">
            <h3 className="text-2xl font-extrabold tracking-tight mb-4 text-slate-900">
              Ready to hit the road?
            </h3>

            <p className="text-slate-500 font-[Proxima_Nova_Semibold] mb-8">
              Join <span className="font-[Sailors_Slant_Normal] text-[#2F80ED]">THE LOBBY</span> today!
            </p>

            <Link
              href="/sign-up"
              className="block w-full rounded-2xl bg-[#58A6FF] py-4 text-center font-semibold text-slate-950 shadow-lg shadow-[#58A6FF]/20 transition hover:bg-[#2F80ED]"
            >
              Sign Up Now
            </Link>

            <p className="text-xs text-slate-400 mt-4 font-medium">
              Takes less than 5 minutes
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
