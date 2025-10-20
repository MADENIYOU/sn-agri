import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|__.*?__|~.*?~|```[\s\S]*?```|\n)/g);

  return parts.map((part, index) => {
    if (part === '\n') {
      return <br key={index} />;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return <em key={index}>{part.slice(2, -2)}</em>;
    }
    if (part.startsWith('~') && part.endsWith('~')) {
      return <del key={index}>{part.slice(1, -1)}</del>;
    }
    if (part.startsWith('```') && part.endsWith('```')) {
      return <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded my-2" key={index}><code>{part.slice(3, -3)}</code></pre>;
    }
    return part;
  });
}

