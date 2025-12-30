import { Mail, MapPin, Phone, MessageSquare, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

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

  // 3. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 4. Validation Logic
  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message is too short (min 10 chars)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // 5. Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Simulate API call
      console.log("Form submitted:", formData);
      setIsSubmitted(true);
      setFormData({ firstName: '', lastName: '', email: '', topic: 'General Inquiry', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 text-white py-16 px-6 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">How can we help?</h1>
          <p className="text-slate-400 text-lg">
            We are here for you. Report an issue, find a lost item, or just say hello.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        
        {/* --- LEFT COLUMN: Info & FAQ (Unchanged) --- */}
        <div className="space-y-8">
          <section className="grid sm:grid-cols-2 gap-4">
            <div className="bg-linear-to-br from-blue-100/90 to-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Phone size={24} />
              </div>
              <h3 className="font-bold text-slate-900">Call Us</h3>
              <p className="text-slate-500 text-sm mt-1 mb-3">Mon-Fri from 9am to 6pm</p>
              <a href="tel:+919863000000" className="text-blue-600 font-bold hover:underline">+91 98630 00000</a>
            </div>

            <div className="bg-linear-to-br from-purple-100/90 to-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <Mail size={24} />
              </div>
              <h3 className="font-bold text-slate-900">Email Us</h3>
              <p className="text-slate-500 text-sm mt-1 mb-3">For general inquiries</p>
              <a href="mailto:support@lobby.com" className="text-purple-600 font-bold hover:underline">support@lobby.com</a>
            </div>
          </section>

          <section className="bg-linear-to-br from-gray-100/90 to-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="mt-1 text-slate-400">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">LOBBY HQ</h3>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Laitumkhrah Main Road,<br />
                Near Beat House, Shillong,<br />
                Meghalaya - 793003
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

        {/* --- RIGHT COLUMN: Contact Form (UPDATED) --- */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 h-fit">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare className="text-blue-500" /> Send a message
          </h2>
          
          {isSubmitted ? (
            <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
              <p className="text-slate-500">Thank you for reaching out. Our support team will get back to you within 24 hours.</p>
              <button onClick={() => setIsSubmitted(false)} className="mt-6 text-sm font-bold text-slate-900 hover:underline">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">First Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border p-3 rounded-xl outline-none transition ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`} 
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Last Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border p-3 rounded-xl outline-none transition ${errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`} 
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.lastName}</p>}
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
                  className={`w-full bg-slate-50 border p-3 rounded-xl outline-none transition ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`} 
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.email}</p>}
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic</label>
                <select 
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 transition text-slate-700"
                >
                  <option>General Inquiry</option>
                  <option>Lost Item</option>
                  <option>Driver Complaint</option>
                  <option>Payment Issue</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message <span className="text-red-500">*</span></label>
                <textarea 
                  rows="4" 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border p-3 rounded-xl outline-none transition ${errors.message ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                ></textarea>
                {errors.message && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.message}</p>}
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition shadow-lg">
                Send Message
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

// Helper Component for FAQ (Same as before)
function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left font-bold text-slate-800 hover:bg-slate-50"
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