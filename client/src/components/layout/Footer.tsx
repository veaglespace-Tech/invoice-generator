import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-3 md:py-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-3 text-xs md:text-sm text-slate-500 dark:text-slate-400">
          <div className="text-center md:text-left">
            <span>All Rights Reserved &copy; 2026 <a href="https://veaglespace.com/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium hover:underline">Veagle Space Technology Pvt. Ltd.</a></span>
          </div>
          <div className="text-center md:text-right">
            <span>Designed & Developed by <a href="https://veaglespace.com/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium hover:underline">Veagle Space Technology Pvt. Ltd.</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
