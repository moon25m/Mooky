import React from 'react';
export type SectionProps = { children?: React.ReactNode; className?: string };

// A full-height section aligned with the visual viewport height on mobile.
export default function Section({ children, className = '' }: SectionProps) {
  return <section className={`min-h-[100svh] flex items-center ${className}`}>{children}</section>;
}
