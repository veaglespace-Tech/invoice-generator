import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="hidden md:block"></div>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Terms of Service</Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Contact</Link>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-right">
            All Rights Reserved. &copy; {new Date().getFullYear()} <Link href="https://veaglespace.com/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Veagle Space Technology Pvt. Ltd.</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
