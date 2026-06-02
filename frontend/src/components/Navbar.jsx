import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, MoonIcon, ShieldCheck, SunIcon, Trophy, Building2, CreditCard } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useUserStats } from "../hooks/useUsers";

const THEMES = ["night", "winter", "dracula"];

function Navbar() {
  const location = useLocation();
  const [themeIndex, setThemeIndex] = useState(0);
  const { data: userStats } = useUserStats();

  useEffect(() => {
    const savedTheme = localStorage.getItem("coderelay_theme");
    const initialTheme = savedTheme && THEMES.includes(savedTheme) ? savedTheme : THEMES[0];
    const index = THEMES.indexOf(initialTheme);
    setThemeIndex(index === -1 ? 0 : index);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const isActive = (path) => location.pathname === path;

  const cycleTheme = () => {
    const nextIndex = (themeIndex + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex];
    setThemeIndex(nextIndex);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("coderelay_theme", nextTheme);
  };

  const currentTheme = THEMES[themeIndex];
  const isDark = currentTheme === "night" || currentTheme === "dracula";

  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link
          to="/"
          className="group flex items-center gap-3 hover:scale-105 transition-transform duration-200"
        >
          <div className="size-10 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg ">
            <img src="/logo.png" alt="logo" className="size-10 rounded-xl" />
          </div>

          <div className="flex flex-col">
            <span className="font-black text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
              CodeRelay
            </span>
            <span className="text-xs text-base-content/60 font-medium -mt-1">
              Collaborative DSA Playground
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* PROBLEMS PAGE LINK */}
          <Link
            to={"/problems"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
              ${isActive("/problems")
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
              `}
          >
            <div className="flex items-center gap-x-2.5">
              <BookOpenIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Problems</span>
            </div>
          </Link>

          {/* DASHBOARD PAGE LINK */}
          {/* DASHBOARD PAGE LINK */}
          <Link
            to={"/dashboard"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
                ${isActive("/dashboard")
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
                `}
          >
            <div className="flex items-center gap-x-2.5">
              <LayoutDashboardIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Dashboard</span>
            </div>
          </Link>

          {/* LEADERBOARD PAGE LINK */}
          <Link
            to={"/leaderboard"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
                ${isActive("/leaderboard")
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
                `}
          >
            <div className="flex items-center gap-x-2.5">
              <Trophy className="size-4" />
              <span className="font-medium hidden sm:inline">Leaderboard</span>
            </div>
          </Link>

          {/* ORGANIZATIONS PAGE LINK */}
          <Link
            to={"/organizations"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
                ${isActive("/organizations")
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
                `}
          >
            <div className="flex items-center gap-x-2.5">
              <Building2 className="size-4" />
              <span className="font-medium hidden sm:inline">Workspaces</span>
            </div>
          </Link>

          {/* PRICING PAGE LINK */}
          <Link
            to={"/pricing"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
                ${isActive("/pricing")
                ? "bg-accent/10 border border-accent/20 text-accent"
                : "hover:bg-accent/5 text-base-content/70 hover:text-accent"
              }
                `}
          >
            <div className="flex items-center gap-x-2.5">
              <CreditCard className="size-4" />
              <span className="font-semibold hidden sm:inline">Upgrade</span>
            </div>
          </Link>

          {/* ADMIN PAGE LINK - Only if admin */}
          {userStats?.profile?.isAdmin && (
            <Link
              to={"/admin"}
              className={`px-4 py-2.5 rounded-lg transition-all duration-200 
                  ${isActive("/admin")
                  ? "bg-error text-error-content"
                  : "hover:bg-error/10 text-error hover:text-error"
                }
                  `}
            >
              <div className="flex items-center gap-x-2.5">
                <ShieldCheck className="size-4" />
                <span className="font-medium hidden sm:inline">Create Problem</span>
              </div>
            </Link>
          )}

          {/* THEME TOGGLE */}
          <button
            type="button"
            aria-label="Toggle theme"
            className="ml-1 px-3 py-2 rounded-lg border border-base-300 hover:border-primary/60 bg-base-100/80 flex items-center gap-2 text-xs"
            onClick={cycleTheme}
          >
            {isDark ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
            <span className="hidden sm:inline capitalize">{currentTheme}</span>
          </button>

          <div className="ml-2 mt-1">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
