import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-full flex items-center justify-center bg-slate-50 pt-30 pb-30">
      <SignIn />
    </div>
  );
}