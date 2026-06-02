import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  Building2,
  Globe2,
  Lock,
  Mail,
  Network,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";
import PublicPageShell from "../components/marketing/PublicPageShell";

const pillars = [
  { icon: Lock, title: "SAML SSO & SCIM", desc: "Automate provisioning from Okta, Azure AD, or Google Workspace." },
  { icon: ShieldCheck, title: "VPC & private link", desc: "Isolate execution sandboxes inside your cloud perimeter." },
  { icon: Network, title: "Multi-region LB", desc: "nginx / cloud LB + Relay Balance for automatic failover." },
  { icon: Users, title: "Dedicated TAM", desc: "99.99% SLA, onboarding, and solution architecture support." },
];

const stack = [
  { label: "Browser", icon: Globe2 },
  { label: "CDN + WAF", icon: ShieldCheck },
  { label: "Load balancer", icon: Server },
  { label: "CodeRelay API pool", icon: Building2 },
];

export default function EnterprisePage() {
  return (
    <PublicPageShell backgroundVariant="enterprise">
      <div className="text-center max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-6"
        >
          <ShieldCheck className="size-3.5" />
          Enterprise & regulated teams
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
        >
          Secure, scalable,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            deployment-ready
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-xl text-slate-400 font-medium max-w-2xl mx-auto"
        >
          Run CodeRelay behind your load balancer with SSO, audit logs, and our Relay Balance client for zero-downtime cutovers.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl"
          >
            <p.icon className="size-8 text-blue-400 mb-5" />
            <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-[#0A0A12] p-10 md:p-14 mb-20">
        <h2 className="text-2xl font-black text-white text-center mb-10">Reference architecture</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          {stack.map((node, i) => (
            <div key={node.label} className="flex flex-col items-center gap-3 flex-1">
              <div className="size-16 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center">
                <node.icon className="size-7 text-indigo-300" />
              </div>
              <span className="text-sm font-bold text-slate-300 text-center">{node.label}</span>
              {i < stack.length - 1 && (
                <span className="hidden md:block absolute text-indigo-500">→</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-slate-500 text-sm mt-10 max-w-2xl mx-auto">
          Ship our included <code className="text-indigo-300">docker/nginx</code> config for round-robin upstreams, or point Relay Balance at multiple API URLs from the browser.
        </p>
      </section>

      <section className="max-w-xl mx-auto bg-white/[0.03] border border-white/10 rounded-3xl p-8">
        <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
          <Mail className="size-5 text-indigo-400" /> Talk to sales
        </h2>
        <p className="text-slate-400 text-sm mb-6">We&apos;ll tailor SSO, VPC peering, and load-balancing for your org.</p>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = "mailto:sales@coderelay.dev?subject=Enterprise%20inquiry";
          }}
        >
          <input
            type="email"
            required
            placeholder="Work email"
            className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Company"
            className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="w-full py-4 rounded-full bg-white text-black font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            Request demo <ArrowRightIcon className="size-4" />
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-slate-500">
          Prefer self-serve? <Link to="/pricing" className="text-indigo-300 hover:text-white">Compare plans</Link>
        </p>
      </section>
    </PublicPageShell>
  );
}
