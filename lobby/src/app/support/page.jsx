"use client";
import { Mail, MapPin, Phone, MessageSquare, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import API_BASE_URL from '@/config';

export default function ContactPage() {
  // 1. Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    topic: 'General Inquiry',
    message: ''
  });

  // 2. Error & Success State
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // 3. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 4. Validation Logic with Specific Messages
  const validate = () => {
    const newErrors = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (formData.message.trim().length > 5000) {
      newErrors.message = "Message cannot exceed 5000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // 5. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Check validation first
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 1. Save to YOUR Database (for Admin Panel)
      const dbResponse = await fetch(`${API_BASE_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          role: 'guest',
          topic: formData.topic,
          message: formData.message
        })
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to save message to database');
      }

      const notificationResponse = await fetch(`${API_BASE_URL}/support/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!notificationResponse.ok) {
        console.warn("Support email notification failed");
      }

      // Show the green success message
      setIsSubmitted(true);
        
      // Clear the form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        topic: 'General Inquiry',
        message: ''
      });

      // Hide success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting form", error);
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      
      {/* Header */}
      <div className="bg-[#172033] text-white py-16 px-6 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-[Proxima_Nova_Extrabold] tracking-tight mb-4">How can we help?</h1>
          <p className="text-slate-400 text-lg font-[Proxima_Nova_Semibold]">
            We are here for you. Report an issue, find a lost item, or just say hello.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        
        {/* --- LEFT COLUMN: Info & FAQ --- */}
        <div className="space-y-8">
          <section className="grid sm:grid-cols-2 gap-4 font-[Proxima_Nova_Extrabold]">
            <div className="bg-linear-to-br from-[#DCEBFF]/90 to-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#EAF4FF] text-[#2F80ED] rounded-full flex items-center justify-center mb-4">
                <Phone size={24} />
              </div>
              <h3 className="font-bold text-slate-900">Call Us</h3>
              <p className="text-slate-500 text-sm mt-1 mb-3">Mon-Fri from 9am to 6pm</p>
              <a href="tel:+918413096076" className="text-[#2F80ED] font-bold hover:underline">+91 84130 96076</a>
            </div>

            <div className="bg-linear-to-br from-[#FFE4DF]/90 to-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#FFE4DF] text-[#FF6B6B] rounded-full flex items-center justify-center mb-4">
                <Mail size={24} />
              </div>
              <h3 className="font-bold text-slate-900">Email Us</h3>
              <p className="text-slate-500 text-sm mt-1 mb-3">For general inquiries</p>
              <a 
                href="mailto:thelobby500@gmail.com"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#FF6B6B] font-bold hover:underline"
              >
                thelobby500@gmail.com
              </a>
            </div>
          </section>

          <section className="bg-linear-to-br from-gray-100/90 to-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="mt-1 text-slate-400">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900"><span className="font-[Sailors_Slant_Normal] ">THE LOBBY</span> HQ</h3>
              <p className="text-slate-500 mt-1 font-[Proxima_Nova_Semibold] text-sm">
                In Your Neighbourhood,<br />
                Kohima, Nagaland<br />
                797001
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              <FaqItem 
                question="I lost an item in a cab. What do I do?" 
                answer="Please call the driver immediately using the 'Call' button in your history. If they don't answer, contact our support line with your Ride ID." 
              />
              <FaqItem 
                question="How do I become a driver?" 
                answer="Click on 'For Drivers' in the menu, create an account, and upload your vehicle documents. Approval takes 24 hours." 
              />
              <FaqItem 
                question="Are the prices fixed?" 
                answer="The prices shown are estimates based on standard local rates. You can finalize the exact fare with the driver before the ride starts." 
              />
            </div>
          </section>
        </div>

        {/* --- RIGHT COLUMN: Contact Form (IMPROVED) --- */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 h-fit">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare className="text-[#2F80ED]" /> Send a message
          </h2>
          
          {isSubmitted ? (
            <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Request received</h3>
              <p className="text-slate-500">Thank you for reaching out. Your message is saved in the support queue and our team will get back to you within 24 hours.</p>
              <button onClick={() => setIsSubmitted(false)} className="mt-6 text-sm font-bold text-[#2F80ED] hover:underline transition">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Form-level error */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-lg flex items-center gap-2" role="alert">
                  <AlertCircle size={16} /> {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">First Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={`w-full bg-slate-50 border p-3 rounded-xl outline-none transition focus:ring-2 ${
                      errors.firstName 
                        ? 'border-red-500 focus:border-red-500 ring-red-200' 
                        : 'border-slate-200 focus:border-[#58A6FF] ring-[#CFE4FF]'
                    }`}
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Last Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={`w-full bg-slate-50 border p-3 rounded-xl outline-none transition focus:ring-2 ${
                      errors.lastName 
                        ? 'border-red-500 focus:border-red-500 ring-red-200' 
                        : 'border-slate-200 focus:border-[#58A6FF] ring-[#CFE4FF]'
                    }`}
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full bg-slate-50 border p-3 rounded-xl outline-none transition focus:ring-2 ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500 ring-red-200' 
                      : 'border-slate-200 focus:border-[#58A6FF] ring-[#CFE4FF]'
                  }`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic</label>
                <select 
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-[#58A6FF] focus:ring-2 ring-[#CFE4FF] transition text-slate-700"
                >
                  <option>General Inquiry</option>
                  <option>Lost Item</option>
                  <option>Driver Complaint</option>
                  <option>Payment Issue</option>
                  <option>Safety Concern</option>
                  <option>Feedback</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Message <span className="text-red-500">*</span>
                  <span className="float-right text-slate-400 font-normal text-xs">{formData.message.length}/5000</span>
                </label>
                <textarea 
                  rows="5" 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your issue or inquiry..."
                  maxLength="5000"
                  className={`w-full bg-slate-50 border p-3 rounded-xl outline-none transition focus:ring-2 resize-none ${
                    errors.message 
                      ? 'border-red-500 focus:border-red-500 ring-red-200' 
                      : 'border-slate-200 focus:border-[#58A6FF] ring-[#CFE4FF]'
                  }`}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                />
                {errors.message && (
                  <p id="message-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.message}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full cursor-pointer bg-[#FFC857] text-[#1A1205] font-bold py-4 rounded-xl hover:bg-[#F59E0B] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

// Helper Component for FAQ
function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left font-bold text-slate-800 hover:bg-black transition"
        aria-expanded={isOpen}
      >
        {question}
        {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-slate-500 text-sm leading-relaxed border-t border-slate-100 bg-slate-50">
          {answer}
        </div>
      )}
    </div>
  );
}
