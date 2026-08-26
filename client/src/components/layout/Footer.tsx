import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-3 md:py-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            <Link href="/privacy-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</Link>
          </div>
          <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 text-center md:text-right">
            &copy; {new Date().getFullYear()} <Link href="https://veaglespace.com/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Veagle Space Technology Pvt. Ltd.</Link> All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
