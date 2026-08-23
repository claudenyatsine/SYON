import type { Metadata } from 'next';
import './globals.css';
import '@/lib/server-polyfill';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { UserProvider } from '@/components/providers/user-context';
import { Inter, Space_Grotesk } from 'next/font/google';

// Self-hosted fonts via next/font — eliminates the Google DNS round-trip and
// renders fonts inline, improving LCP and CLS.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dr Max online school',
  description: 'The future of personalized digital learning.',
};

// NOTE: force-dynamic has been moved to individual route layouts/pages that
// actually need server-side rendering (tutor, student, admin, classroom).
// Login, signup, and the landing page are now statically generated and served
// from Vercel's Edge CDN — zero cold-start latency on first load.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <UserProvider>
            {children}
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
