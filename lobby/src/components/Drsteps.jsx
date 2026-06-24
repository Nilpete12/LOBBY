import Link from 'next/link';

export default function JoinSteps() {
  return (
    <section className="py-24 bg-[#0B3D2E] text-white border-t border-[#1F6F50]/30">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Simple steps to get started.
            </h2>
            <p className="text-slate-300 font-medium mb-8 text-lg leading-relaxed">
              We verify every driver to ensure safety. Have your Driving License and Vehicle Registration (RC) ready.
            </p>
            <div className="space-y-8">
              {[
                { num: "01", title: "Create Profile", text: "Sign up with your phone number and basic details." },
                { num: "02", title: "Upload Documents", text: "Submit photos of your DL, RC, and a clean photo of your car." },
                { num: "03", title: "Get Verified", text: "Our team approves your profile within 24 hours." },
                { num: "04", title: "Go Online", text: "Toggle your status to Green and start receiving calls." }
              ].map((step, i) => (
                <div key={i} className="flex gap-6">
                  <span className="text-3xl font-extrabold text-[#E9C46A] opacity-50">{step.num}</span>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: CTA Box */}
          <div className="bg-gradient-to-b from-[#D9ED92]/40 to-[#FAFAF9] rounded-3xl p-10 md:p-14 text-center shadow-xl">
             <h3 className="text-2xl font-extrabold tracking-tight mb-4 text-[#0B3D2E]">
               Ready to hit the road?
             </h3>
             <p className="text-[#1F6F50] font-medium mb-8">
               Join over 500+ drivers in Shillong today.
             </p>
             <Link href="/auth" className="w-full block">
               <button className="w-full bg-[#0B3D2E] text-white font-semibold py-4 rounded-xl hover:bg-[#1F6F50] transition shadow-lg">
                 Sign Up Now
               </button>
             </Link>
             <p className="text-xs text-[#0B3D2E] mt-4 font-medium">
               Takes less than 5 minutes
             </p>
          </div>
        </div>

      </div>
    </section>
  );
}
