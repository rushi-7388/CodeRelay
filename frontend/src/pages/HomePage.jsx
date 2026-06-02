import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  CheckCircle2,
  Code2Icon,
  Cpu,
  Globe2,
  SparklesIcon,
  Terminal,
  Trophy,
  UsersIcon,
  VideoIcon,
  ZapIcon,
  Play,
  ArrowUpRight,
} from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function HomePage() {
  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden font-sans selection:bg-purple-500/30 selection:text-white text-slate-200">

      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/20 blur-[150px]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />

        {/* PREMIUM GRID PATTERN */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-7xl mx-auto rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-6 py-3 flex items-center justify-between"
        >
          {/* LOGO */}
          <Link to={"/"} className="flex items-center gap-3 group">
            <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <SparklesIcon className="size-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-white via-indigo-100 to-white/70 bg-clip-text text-transparent tracking-tight">
              CodeRelay
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <Link to="/features" className="hover:text-white transition-colors">Features</Link>
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/enterprise" className="hover:text-white transition-colors">Enterprise</Link>
            </div>

            <SignInButton mode="modal">
              <button className="group relative px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-fuchsia-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </SignInButton>
          </div>
        </motion.div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative z-10 pt-40 pb-20 lg:pt-52 lg:pb-32 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-8 hover:bg-indigo-500/20 transition-colors backdrop-blur-md cursor-pointer"
          >
            <ZapIcon className="size-3.5 fill-current" />
            <span>CodeRelay 2.0 is now live</span>
            <span className="w-px h-3 bg-indigo-500/30 mx-1"></span>
            <span className="flex items-center gap-1 hover:text-indigo-200">Read Announcement <ArrowUpRight className="size-3" /></span>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tighter max-w-5xl"
          >
            The Operating System for <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Engineering Teams.
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-slate-400 mt-8 max-w-3xl font-medium leading-relaxed"
          >
            Build, debug, and ship software faster with integrated <strong className="text-white font-semibold">Live Videos</strong>, <strong className="text-white font-semibold">WebContainers</strong>, and <strong className="text-white font-semibold">Real-time Visualization</strong>.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-12"
          >
            <SignInButton mode="modal">
              <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 w-full sm:w-auto justify-center">
                Start Coding for Free
                <Terminal className="size-5" />
              </button>
            </SignInButton>

            <button className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-bold text-lg backdrop-blur-sm transition-all flex items-center gap-3 w-full sm:w-auto justify-center group hover:scale-105 active:scale-95">
              <Play className="size-5 fill-current text-slate-300 group-hover:text-white transition-colors" />
              Watch Demo
            </button>
          </motion.div>

          {/* DASHBOARD PREVIEW IMAGE */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-20 relative w-full max-w-6xl mx-auto perspective-[2000px]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent z-10 h-full w-full pointer-events-none" />
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-30" />

            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-2xl transform rotate-x-[5deg] scale-95 origin-bottom transition-transform duration-700 hover:rotate-x-0 hover:scale-100">
              {/* Browser Mockup Header */}
              <div className="h-10 border-b border-white/10 bg-[#111] flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="mx-auto bg-white/5 rounded-md text-[10px] text-slate-400 font-mono px-24 py-1 border border-white/5 flex items-center gap-2">
                  <Globe2 className="size-3" /> app.coderelay.io/session/next-gen
                </div>
              </div>
              {/* Image contents */}
              <img src="/hero.png" alt="SaaS Dashboard Preview" className="w-full h-auto opacity-90" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- LOGO CLOUD --- */}
      <div className="relative z-10 border-y border-white/5 bg-white/[0.02] py-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <p className="text-center text-sm font-semibold tracking-widest uppercase mb-8 text-slate-500">Trusted By Forward-Thinking Teams</p>
          <div className="flex justify-center items-center flex-wrap gap-x-16 gap-y-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {["META", "GOOGLE", "AMAZON", "NETFLIX", "STRIPE"].map(logo => (
              <h2 key={logo} className="text-3xl font-black text-white cursor-pointer hover:text-indigo-400 transition-colors">{logo}</h2>
            ))}
          </div>
        </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <div className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              A Complete Ecosystem.
            </h2>
            <p className="text-xl text-slate-400 font-medium">
              We built the platform we always wished we had. No more context switching.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: VideoIcon,
                title: "Crystal Clear Voice & Video",
                desc: "Low-latency WebRTC streams directly integrated. No more dropping Zoom links in chat.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Cpu,
                title: "Cloud WebContainers",
                desc: "Spin up full-stack Node.js environments instantly in your browser, running at native speeds.",
                color: "from-fuchsia-500 to-pink-500"
              },
              {
                icon: UsersIcon,
                title: "Multiplayer Cursor Sync",
                desc: "See exact selections and cursors in real-time, backed by enterprise-grade sockets.",
                color: "from-amber-400 to-orange-500"
              },
              {
                icon: Code2Icon,
                title: "AST Data Visualizer",
                desc: "Watch your Arrays, Trees, and Graphs manipulate visually in real-time memory rendering.",
                color: "from-green-400 to-emerald-500"
              },
              {
                icon: Trophy,
                title: "Global Organizations",
                desc: "Manage massive scale developer events, manage billing, and track organization health.",
                color: "from-purple-500 to-indigo-500"
              },
              {
                icon: SparklesIcon,
                title: "AI Code Analysis",
                desc: "Highlight confusing code and let our AI break it down completely with intelligent tracing.",
                color: "from-rose-400 to-red-500"
              }
            ].map((feature, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={idx}
                className="group p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full`} />

                <div className={`size-12 rounded-xl bg-gradient-to-br ${feature.color} p-[1px] mb-6 inline-block shadow-lg`}>
                  <div className="w-full h-full bg-[#0A0A0A] rounded-[11px] flex items-center justify-center">
                    <feature.icon className="size-6 text-white opacity-80" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3 text-slate-100">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 bg-black py-12 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-indigo-500" />
            <span className="font-bold text-slate-300">CodeRelay</span>
          </div>
          <p>&copy; {new Date().getFullYear()} CodeRelay Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
