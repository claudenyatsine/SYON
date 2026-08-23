import { MetadataRoute } from 'next';

// App Router robots.ts — Next.js serves this as plain text at /robots.txt,
// preventing the "HTML served instead of plain text" SEO parsing failure
// flagged in the PageSpeed report. Delete any static public/robots.txt if present.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/tutor/', '/student/', '/admin/', '/classroom/'],
    },
    sitemap: 'https://lmsmax.vercel.app/sitemap.xml',
  };
}
