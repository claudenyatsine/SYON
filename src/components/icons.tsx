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
  panelLeft: (props: SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      {...props}
    >
      <path d="M20.5 9.75H8.25a.75.75 0 0 1 0-1.5h12.25a.75.75 0 0 1 0 1.5Z"/>
      <path d="M22.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
      <path d="M20.5 14.25H3.75a.75.75 0 0 1 0-1.5h16.75a.75.75 0 0 1 0 1.5Z"/>
      <path d="M15.75 18.75H3.75a.75.75 0 0 1 0-1.5h12a.75.75 0 0 1 0 1.5Z"/>
    </svg>
  ),
  closeX: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm3.707 7.707a1 1 0 0 0-1.414-1.414L12 10.586l-2.293-2.293a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293Z"
        clipRule="evenodd"
      />
    </svg>
  ),
};
