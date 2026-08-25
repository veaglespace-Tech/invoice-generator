import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center text-xl font-bold text-slate-900 py-2">
            <img src="/logo.webp" alt="Veagle Space Technology" className="h-[56px] w-auto object-contain" />
          </div>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Terms of Service</Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Contact</Link>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Invogen. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
