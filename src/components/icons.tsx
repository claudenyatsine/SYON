import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 9l-10-5-10 5 10 5 10-5z" />
      <path d="M2 14l10 5 10-5" />
      <path d="M12 22V14" />
      <path d="M6 16.5V12l6-3 6 3v4.5" />
    </svg>
  ),
};
