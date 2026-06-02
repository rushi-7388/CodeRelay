import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  BrainCircuit,
  Code2Icon,
  Globe2,
  Layers,
  ShieldCheck,
  Sparkles,
  Trophy,
  VideoIcon,
  Zap,
} from "lucide-react";
import PublicPageShell from "../components/marketing/PublicPageShell";

const highlights = [
  {
    icon: VideoIcon,
    title: "Live voice & video",
    desc: "Crystal-clear WebRTC built into every session—no Zoom tab juggling.",
    iconClass: "text-indigo-400",
    boxClass: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: Code2Icon,
    title: "Monaco + sync",
    desc: "Multi-cursor editing, language intelligence, and instant session sync.",
    iconClass: "text-fuchsia-400",
    boxClass: "bg-fuchsia-500/10 border-fuchsia-500/20",
  },
  {
    icon: BrainCircuit,
    title: "Anthropic-first AI",
    desc: "Hints, reviews, and explanations that teach—not leak full solutions.",
    iconClass: "text-purple-400",
    boxClass: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Layers,
    title: "Relay Balance™",
    desc: "Client picks the healthiest API node by live latency—feels instant worldwide.",
    iconClass: "text-blue-400",
    boxClass: "bg-blue-500/10 border-blue-500/20",
  },
];

const grid = [
  { icon: Globe2, title: "Browser execution", desc: "Run and debug without waiting on cold server sandboxes." },
  { icon: ShieldCheck, title: "Org-grade ACL", desc: "Roles, classrooms, and audit-friendly access controls." },
  { icon: Trophy, title: "Contests & leaderboards", desc: "Host hiring loops, bootcamps, and team battles." },
  { icon: Sparkles, title: "Smart sessions", desc: "Invite links, history, and one-click rejoin." },
];

export default function FeaturesPage() {
  return (
    <PublicPageShell>
      <div className="text-center max-w-4xl mx-auto mb-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-4"
        >
          Platform capabilities
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent"
        >
          Everything teams need to code together
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-400 font-medium"
        >
          Interviews, classrooms, and pair programming—one workspace with video, AI, and performance built in.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-24">
        {highlights.map((item, i) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.05] transition-colors"
          >
            <div className={`size-14 rounded-2xl border flex items-center justify-center mb-5 ${item.boxClass}`}>
              <item.icon className={`size-7 ${item.iconClass}`} />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">{item.title}</h2>
            <p className="text-slate-400 leading-relaxed">{item.desc}</p>
          </motion.article>
        ))}
      </div>

      <section className="mb-24 rounded-[2rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/5 p-10 md:p-14">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-indigo-300 text-sm font-bold mb-4">
              <Zap className="size-4" /> Relay Balance™
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Load-aware routing, built in</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              CodeRelay probes your API pool on startup and routes traffic to the fastest healthy node. Combined with nginx or cloud load balancers, you get sub-second failover without custom DevOps glue.
            </p>
            <Link
              to="/enterprise"
              className="inline-flex items-center gap-2 text-white font-bold hover:gap-3 transition-all"
            >
              See enterprise architecture <ArrowRightIcon className="size-4" />
            </Link>
          </div>
          <div className="flex-1 w-full grid grid-cols-3 gap-3 text-center text-xs font-bold">
            {["US-East", "EU-West", "APAC"].map((region, i) => (
              <div
                key={region}
                className={`rounded-2xl border p-4 ${i === 0 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-slate-400"}`}
              >
                <p className="mb-2">{region}</p>
                <p className="text-2xl font-black text-white">{i === 0 ? "24ms" : i === 1 ? "89ms" : "112ms"}</p>
                <p className="mt-1 opacity-70">{i === 0 ? "ACTIVE" : "STANDBY"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-white/10">
        {grid.map((feat) => (
          <div key={feat.title} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
            <feat.icon className="size-6 text-indigo-300 mb-4" />
            <h3 className="font-bold text-white mb-2">{feat.title}</h3>
            <p className="text-sm text-slate-400">{feat.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-20">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-transform"
        >
          View pricing <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </PublicPageShell>
  );
}
