import { Link } from "react-router-dom";

export default function MarketingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 mt-24 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} CodeRelay. Built for teams that ship together.</p>
        <div className="flex gap-6">
          <Link to="/features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <Link to="/enterprise" className="hover:text-white transition-colors">
            Enterprise
          </Link>
        </div>
      </div>
    </footer>
  );
}
