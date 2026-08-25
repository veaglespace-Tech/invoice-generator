import Link from "next/link";
import { Hexagon, ArrowRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-base-100/80 backdrop-blur-md border-b border-base-200">
      <div className="navbar max-w-7xl mx-auto px-6 md:px-12 h-24">
        <div className="flex-1">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary group cursor-pointer py-2">
            <img src="/logo.webp" alt="Veagle Space Technology" className="h-[76px] w-auto object-contain" />
          </Link>
        </div>
        <div className="flex-none hidden md:flex">
          <ul className="menu menu-horizontal px-1 gap-2 font-medium text-base-content/80">
            <li><Link href="/#features" className="hover:text-primary">Features</Link></li>
            <li><Link href="/#pricing" className="hover:text-primary">Pricing</Link></li>
            <li><Link href="/login" className="hover:text-primary">Sign In</Link></li>
          </ul>
        </div>
        <div className="flex-none ml-4">
          <Link href="/register" className="btn btn-primary rounded-full text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
