import MarketingBackground from "./MarketingBackground";
import MarketingNavbar from "./MarketingNavbar";
import MarketingFooter from "./MarketingFooter";
import RelayBalanceIndicator from "../RelayBalanceIndicator";

export default function PublicPageShell({ children, backgroundVariant = "purple" }) {
  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden font-sans selection:bg-purple-500/30 selection:text-white text-slate-200">
      <MarketingBackground variant={backgroundVariant} />
      <MarketingNavbar />
      <main className="relative z-10 pt-40 pb-16 px-4 max-w-7xl mx-auto">{children}</main>
      <MarketingFooter />
      <RelayBalanceIndicator />
    </div>
  );
}
