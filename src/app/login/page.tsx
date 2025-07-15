import { LoginForm } from '@/components/auth/login-form';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
         <Link href="/" className="flex flex-col items-center gap-4">
            <Icons.logo className="h-12 w-12 text-primary" />
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground">
              TutorHub
            </h1>
          </Link>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Please sign in to continue.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
