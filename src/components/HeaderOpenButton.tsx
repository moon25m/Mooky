'use client';
import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function HeaderOpenButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      title="Open in new tab"
    >
      <ExternalLink className="h-4 w-4" />
      <span className="hidden sm:inline">Open in new tab</span>
    </a>
  );
}
