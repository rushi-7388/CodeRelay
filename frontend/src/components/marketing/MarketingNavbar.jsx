import { Link, useLocation } from "react-router-dom";
import { SignInButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";

const links = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/enterprise", label: "Enterprise" },
];

export default function MarketingNavbar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-6">
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-6 py-3 flex items-center justify-between"
      >
        <Link to="/" className="flex items-center gap-3 group">
          <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
            <SparklesIcon className="size-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-white via-indigo-100 to-white/70 bg-clip-text text-transparent tracking-tight">
            CodeRelay
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={pathname === to ? "text-white" : "hover:text-white transition-colors"}
              >
                {label}
              </Link>
            ))}
          </div>

          <SignInButton mode="modal">
            <button
              type="button"
              className="group relative px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </SignInButton>
        </div>
      </motion.div>
    </nav>
  );
}
