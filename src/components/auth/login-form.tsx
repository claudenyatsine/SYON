'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function LoginForm() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock login logic
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-none shadow-none">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="name@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full font-bold">
            Sign In
          </Button>
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/" className="font-medium text-primary hover:underline" onClick={(e) => {
              // This is a bit of a hack to prevent page navigation
              // A more robust solution would use a global state for the modal
              e.preventDefault();
              // In a real app, you'd trigger the sign-up modal here
              alert("Please close this and click 'Get Started' to sign up.");
            }}>
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </form>
  );
}
