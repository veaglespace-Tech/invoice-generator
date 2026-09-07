import Link from 'next/link';
import { Hexagon } from 'lucide-react';
export function Footer() {
  return (
    <footer className="py-4 md:py-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
        Designed & Developed by{' '}
        <a
          href="https://veaglespace.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hover:underline"
        >
          Veagle Space Technology Pvt. Ltd.
        </a>{' '}
        | &copy; 2026 All Rights Reserved.
      </div>
    </footer>
  );
}
