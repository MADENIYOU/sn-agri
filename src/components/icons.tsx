import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
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
      <path d="M12 22c-5 0-9-4.5-9-10S5 2 12 2s9 4.5 9 10c0 2.5-1 4.8-2.7 6.5" />
      <path d="M12 18c-3.5 0-6.4-2.3-7.4-5.5" />
      <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 2.2 1.4 4.1 3.5 4.8" />
      <path d="M17.5 13.3a4.5 4.5 0 0 0 4.3-5.1 4.5 4.5 0 0 0-4.8-4" />
    </svg>
  );
}
