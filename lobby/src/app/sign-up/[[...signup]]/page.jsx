import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-full flex items-center justify-center bg-slate-50 pt-30 pb-30">
      <SignUp />
    </div>
  );
}