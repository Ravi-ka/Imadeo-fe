import React from 'react';
import Link from 'next/link';

const markSizes = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
  xl: 'h-14 w-14',
} as const;

const wordmarkSizes = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-2xl',
} as const;

type LogoProps = {
  href?: string | false;
  showWordmark?: boolean;
  size?: keyof typeof markSizes;
  className?: string;
  wordmarkClassName?: string;
  markClassName?: string;
};

export function Logo({
  href = '/',
  showWordmark = true,
  size = 'md',
  className = '',
  wordmarkClassName = '',
  markClassName = '',
}: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/logo-mark.png"
        alt={showWordmark ? '' : 'Imadeo'}
        className={`${markSizes[size]} object-contain shrink-0 ${markClassName}`}
      />
      {showWordmark && (
        <span
          className={`font-bold tracking-tight text-slate-900 dark:text-white ${wordmarkSizes[size]} ${wordmarkClassName}`}
        >
          <span style={{ fontFamily: "'Russo One', sans-serif" }}>Imadeo.in</span>
     
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}

export function LogoLockup({
  className = 'h-20 w-auto',
  alt = 'Imadeo',
}: {
  className?: string;
  alt?: string;
}) {
  return <img src="/logo.png" alt={alt} className={`object-contain ${className}`} />;
}
