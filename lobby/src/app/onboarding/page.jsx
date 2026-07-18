"use client";
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useReverification, useUser } from '@clerk/nextjs';
import {
  AlertCircle,
  ArrowRight,
  Car,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react';

function contactVerified(contact = {}) {
  return contact?.verification?.status === 'verified' || contact?.verified === true;
}

function contactValue(contact = {}, field) {
  return String(contact?.[field] || '').trim();
}

function primaryEmail(user) {
  const emails = user?.emailAddresses || [];
  return emails.find((email) => email.id === user?.primaryEmailAddressId) || emails[0] || null;
}

function primaryPhone(user) {
  const phones = user?.phoneNumbers || [];
  return phones.find((phone) => phone.id === user?.primaryPhoneNumberId) || phones[0] || null;
}

function verifiedEmail(user) {
  const emails = user?.emailAddresses || [];
  return [primaryEmail(user), ...emails].filter(Boolean).find(contactVerified) || null;
}

function verifiedPhone(user) {
  const phones = user?.phoneNumbers || [];
  return [primaryPhone(user), ...phones].filter(Boolean).find(contactVerified) || null;
}

function normalizePhoneForClerk(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';

  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return digits ? `+${digits}` : '';
}

function clerkErrorMessage(error, fallback) {
  return (
    error?.errors?.[0]?.longMessage ||
    error?.errors?.[0]?.message ||
    error?.message ||
    fallback
  );
}

function cleanOtp(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 8);
}

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workingStep, setWorkingStep] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState(null);
  const [pendingPhone, setPendingPhone] = useState(null);
  const [localVerified, setLocalVerified] = useState({ email: false, phone: false });

  const createEmailAddress = useReverification((nextEmail) =>
    user?.createEmailAddress({ email: nextEmail })
  );
  const createPhoneNumber = useReverification((nextPhone) =>
    user?.createPhoneNumber({ phoneNumber: nextPhone })
  );

  const currentEmail = contactValue(primaryEmail(user), 'emailAddress');
  const currentPhone = contactValue(primaryPhone(user), 'phoneNumber');
  const verifiedEmailAddress = contactValue(verifiedEmail(user), 'emailAddress');
  const verifiedPhoneNumber = contactValue(verifiedPhone(user), 'phoneNumber');
  const emailDone = Boolean(verifiedEmailAddress || localVerified.email);
  const phoneDone = Boolean(verifiedPhoneNumber || localVerified.phone);
  const riderContactComplete = emailDone && phoneDone;
  const canComplete = role === 'driver' || (role === 'rider' && riderContactComplete);

  const contactProgress = useMemo(() => {
    if (role !== 'rider') return 0;
    return [emailDone, phoneDone].filter(Boolean).length;
  }, [emailDone, phoneDone, role]);

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role) {
      router.replace('/');
    } else if (isLoaded && !user) {
      router.replace('/sign-in');
    }
  }, [isLoaded, user, router]);

  const findEmail = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return (user?.emailAddresses || []).find(
      (item) => contactValue(item, 'emailAddress').toLowerCase() === normalized
    );
  };

  const findPhone = (value) => {
    const normalized = normalizePhoneForClerk(value);
    return (user?.phoneNumbers || []).find(
      (item) => contactValue(item, 'phoneNumber') === normalized
    );
  };

  const startEmailVerification = async () => {
    const nextEmail = (email.trim() || currentEmail).toLowerCase();
    setError('');
    setNotice('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setError('Enter a valid email address before requesting an OTP.');
      return;
    }

    setWorkingStep('email-send');
    try {
      let emailAddress = findEmail(nextEmail);

      if (contactVerified(emailAddress)) {
        setLocalVerified((current) => ({ ...current, email: true }));
        setNotice('Email is already verified.');
        return;
      }

      if (!emailAddress) {
        const created = await createEmailAddress(nextEmail);
        await user.reload();
        emailAddress = findEmail(nextEmail) || created;
      }

      await emailAddress?.prepareVerification({ strategy: 'email_code' });
      setPendingEmail(emailAddress);
      setEmailCode('');
      setNotice(`Email OTP sent to ${nextEmail}.`);
    } catch (error) {
      console.error('Email OTP failed:', error);
      setError(clerkErrorMessage(error, 'Could not send the email OTP. Please try again.'));
    } finally {
      setWorkingStep('');
    }
  };

  const verifyEmailCode = async () => {
    const code = cleanOtp(emailCode);
    setError('');
    setNotice('');

    if (!pendingEmail || code.length < 4) {
      setError('Enter the email OTP code first.');
      return;
    }

    setWorkingStep('email-verify');
    try {
      const result = await pendingEmail.attemptVerification({ code });
      if (result?.verification?.status !== 'verified') {
        throw new Error('Email verification is still incomplete.');
      }

      await user.reload();
      setLocalVerified((current) => ({ ...current, email: true }));
      setPendingEmail(null);
      setEmailCode('');
      setNotice('Email verified.');
    } catch (error) {
      console.error('Email verification failed:', error);
      setError(clerkErrorMessage(error, 'That email OTP did not work. Please check the code and try again.'));
    } finally {
      setWorkingStep('');
    }
  };

  const startPhoneVerification = async () => {
    const nextPhone = normalizePhoneForClerk(phone || currentPhone);
    setError('');
    setNotice('');

    if (!nextPhone || nextPhone.length < 8) {
      setError('Enter a valid phone number. Use +91 for India if needed.');
      return;
    }

    setWorkingStep('phone-send');
    try {
      let phoneNumber = findPhone(nextPhone);

      if (contactVerified(phoneNumber)) {
        setLocalVerified((current) => ({ ...current, phone: true }));
        setNotice('Phone number is already verified.');
        return;
      }

      if (!phoneNumber) {
        const created = await createPhoneNumber(nextPhone);
        await user.reload();
        phoneNumber = findPhone(nextPhone) || created;
      }

      await phoneNumber?.prepareVerification();
      setPendingPhone(phoneNumber);
      setPhoneCode('');
      setNotice(`Phone OTP sent to ${nextPhone}.`);
    } catch (error) {
      console.error('Phone OTP failed:', error);
      setError(clerkErrorMessage(error, 'Could not send the phone OTP. Check that phone sign-up/SMS is enabled in Clerk.'));
    } finally {
      setWorkingStep('');
    }
  };

  const verifyPhoneCode = async () => {
    const code = cleanOtp(phoneCode);
    setError('');
    setNotice('');

    if (!pendingPhone || code.length < 4) {
      setError('Enter the phone OTP code first.');
      return;
    }

    setWorkingStep('phone-verify');
    try {
      const result = await pendingPhone.attemptVerification({ code });
      if (result?.verification?.status !== 'verified') {
        throw new Error('Phone verification is still incomplete.');
      }

      await user.reload();
      setLocalVerified((current) => ({ ...current, phone: true }));
      setPendingPhone(null);
      setPhoneCode('');
      setNotice('Phone number verified.');
    } catch (error) {
      console.error('Phone verification failed:', error);
      setError(clerkErrorMessage(error, 'That phone OTP did not work. Please check the code and try again.'));
    } finally {
      setWorkingStep('');
    }
  };

  const handleContinue = async () => {
    if (!role || !canComplete) return;
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Something went wrong. Please try again.');
      }

      await user?.reload().catch((reloadError) => {
        console.warn('Clerk user reload failed after onboarding:', reloadError);
      });

      if (role === 'driver') router.replace('/drive/dashboard');
      else router.replace('/account');
    } catch (error) {
      console.error(error);
      setError(error.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#2F80ED]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:flex sm:items-center sm:justify-center sm:p-6">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-100 bg-white p-5 shadow-lg sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#2F80ED]">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome to THE LOBBY</h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-slate-500">
            Choose your account type. Riders must verify email and phone before the profile is activated.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <RoleCard
            icon={User}
            label="Rider"
            selected={role === 'rider'}
            onClick={() => setRole('rider')}
          />
          <RoleCard
            icon={Car}
            label="Driver"
            selected={role === 'driver'}
            onClick={() => setRole('driver')}
          />
        </div>

        {role === 'rider' && (
          <section className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Rider profile verification</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">{contactProgress} of 2 verified</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${riderContactComplete ? 'bg-green-50 text-green-700' : 'bg-white text-slate-500'}`}>
                {riderContactComplete ? 'Ready' : 'Required'}
              </span>
            </div>

            <div className="space-y-3">
              <ContactVerificationCard
                icon={Mail}
                title="Email address"
                verified={emailDone}
                currentValue={verifiedEmailAddress || currentEmail}
                inputValue={email}
                inputType="email"
                placeholder={currentEmail || 'you@example.com'}
                codeValue={emailCode}
                hasPendingCode={Boolean(pendingEmail)}
                isSending={workingStep === 'email-send'}
                isVerifying={workingStep === 'email-verify'}
                onInputChange={setEmail}
                onCodeChange={(value) => setEmailCode(cleanOtp(value))}
                onSend={startEmailVerification}
                onVerify={verifyEmailCode}
              />

              <ContactVerificationCard
                icon={Phone}
                title="Phone number"
                verified={phoneDone}
                currentValue={verifiedPhoneNumber || currentPhone}
                inputValue={phone}
                inputType="tel"
                placeholder={currentPhone || '+91 98765 43210'}
                codeValue={phoneCode}
                hasPendingCode={Boolean(pendingPhone)}
                isSending={workingStep === 'phone-send'}
                isVerifying={workingStep === 'phone-verify'}
                onInputChange={setPhone}
                onCodeChange={(value) => setPhoneCode(cleanOtp(value))}
                onSend={startPhoneVerification}
                onVerify={verifyPhoneCode}
                helper="Use E.164 format. Indian 10-digit numbers are saved as +91 automatically."
              />
            </div>
          </section>
        )}

        {role === 'driver' && (
          <div className="mb-6 rounded-3xl border border-[#CFE4FF] bg-[#EAF4FF] p-4 text-sm font-semibold leading-relaxed text-[#2F80ED]">
            Drivers can add phone, vehicle details, documents, and taxi stands from the driver dashboard after setup.
          </div>
        )}

        {notice && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-green-100 bg-green-50 p-3 text-sm font-bold text-green-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!role || !canComplete || loading || Boolean(workingStep)}
          className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Setup'}
          {!loading && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}

function RoleCard({ icon: Icon, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 text-center transition ${
        selected
          ? 'scale-[1.02] border-[#58A6FF] bg-[#EAF4FF] text-[#2F80ED] shadow-md'
          : 'border-slate-200 text-slate-400 hover:border-slate-300'
      }`}
    >
      <Icon size={30} />
      <span className="font-black">{label}</span>
    </button>
  );
}

function ContactVerificationCard({
  icon: Icon,
  title,
  verified,
  currentValue,
  inputValue,
  inputType,
  placeholder,
  codeValue,
  hasPendingCode,
  isSending,
  isVerifying,
  onInputChange,
  onCodeChange,
  onSend,
  onVerify,
  helper,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${verified ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {verified ? <CheckCircle2 size={20} /> : <Icon size={20} />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-slate-950">{title}</h3>
            <p className="truncate text-xs font-semibold text-slate-500">
              {verified ? currentValue || 'Verified' : currentValue || 'OTP verification required'}
            </p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${verified ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {verified ? 'Verified' : 'Unverified'}
        </span>
      </div>

      {!verified && (
        <div className="space-y-2">
          <input
            type={inputType}
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={placeholder}
            autoComplete={inputType === 'email' ? 'email' : 'tel'}
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-[#58A6FF] focus:bg-white"
          />

          <button
            type="button"
            onClick={onSend}
            disabled={isSending || isVerifying}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#FFC857] px-4 text-sm font-black text-[#1A1205] transition hover:bg-[#F59E0B] disabled:cursor-wait disabled:opacity-60"
          >
            {isSending ? <Loader2 size={17} className="animate-spin" /> : <RefreshCw size={17} />}
            {hasPendingCode ? 'Resend OTP' : 'Send OTP'}
          </button>

          {hasPendingCode && (
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                value={codeValue}
                onChange={(event) => onCodeChange(event.target.value)}
                inputMode="numeric"
                placeholder="Enter OTP"
                className="min-h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-sm font-black tracking-[0.25em] text-slate-950 outline-none transition focus:border-[#58A6FF] focus:bg-white"
              />
              <button
                type="button"
                onClick={onVerify}
                disabled={isVerifying || codeValue.length < 4}
                className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isVerifying ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
                Verify
              </button>
            </div>
          )}

          {helper && <p className="text-xs font-semibold leading-relaxed text-slate-400">{helper}</p>}
        </div>
      )}
    </div>
  );
}
