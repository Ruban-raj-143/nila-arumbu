import React from 'react';

interface Props {
  size?: number;
  className?: string;
}

export function Logo({ size = 36, className = '' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      fill="none"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: '11px', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="44" fill="url(#logoBg)" />
      {/* Child head */}
      <circle cx="100" cy="68" r="22" fill="white" fillOpacity="0.95" />
      {/* Body */}
      <path d="M72 130 Q72 108 100 108 Q128 108 128 130 L128 155 Q100 162 72 155 Z" fill="white" fillOpacity="0.95" />
      {/* Arms */}
      <path d="M72 118 Q58 114 55 105 Q53 98 60 96 Q67 95 70 103 L74 112 Z" fill="white" fillOpacity="0.9" />
      <path d="M128 118 Q142 114 145 105 Q147 98 140 96 Q133 95 130 103 L126 112 Z" fill="white" fillOpacity="0.9" />
      {/* Left bud stem */}
      <path d="M54 78 Q38 62 48 44 Q55 30 72 36" stroke="#6ee7b7" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="54" cy="79" r="5" fill="#6ee7b7" />
      <circle cx="71" cy="36" r="4" fill="#a5f3fc" />
      {/* Right bud stem */}
      <path d="M146 78 Q162 62 152 44 Q145 30 128 36" stroke="#34d399" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="146" cy="79" r="5" fill="#34d399" />
      <circle cx="129" cy="36" r="4" fill="#6ee7b7" />
      {/* Star */}
      <path d="M100 40 L102 46 L108 46 L103 50 L105 56 L100 52 L95 56 L97 50 L92 46 L98 46 Z" fill="white" fillOpacity="0.8" />
    </svg>
  );
}
