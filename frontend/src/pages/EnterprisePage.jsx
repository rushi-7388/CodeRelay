import { Link } from "react-router-dom";
import { SignInButton } from "@clerk/clerk-react";
import { SparklesIcon, ArrowRightIcon, ShieldCheck, Lock, Building2, Users, Briefcase, Zap, CheckCircle2, Globe2 } from "lucide-react";

export default function EnterprisePage() {
    return (
        <div className="min-h-screen bg-[#030014] relative overflow-hidden font-sans selection:bg-purple-500/30 selection:text-white text-slate-200">

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[30%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px]" />
                <div className="absolute bottom-[-30%] left-[-10%] w-[80%] h-[80%] rounded-full bg-indigo-600/10 blur-[150px]" />
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
                            <Link to="/enterprise" className="text-white transition-colors">Enterprise</Link>
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

            {/* --- HERO CONTENT --- */}
            <div className="relative z-10 pt-48 pb-32 px-4 max-w-7xl mx-auto">
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-8 hover:bg-blue-500/20 transition-colors backdrop-blur-md cursor-default"
                    >
                        <ShieldCheck className="size-3.5 fill-current" />
                        <span>Built for Security & Scale</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-8 text-white leading-tight"
                    >
                        Secure, Scalable, <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Enterprise Ready.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-10"
                    >
                        Deploy CodeRelay across your entire organization with SSO, dedicated support, and advanced compliance frameworks built perfectly inside your VPC.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex justify-center gap-4"
                    >
                        <button className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">Contact Sales</button>
                        <button className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-bold text-lg backdrop-blur-sm transition-all focus:ring-2 focus:ring-white">View Documentation</button>
                    </motion.div>
                </div>

                {/* --- VALUE PROPS --- */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
                    {[
                        { icon: Lock, title: "SAML SSO & SCIM", desc: "Automate user lifecycle management across your directory." },
                        { icon: Globe2, title: "Global CDN", desc: "Access code sessions from anywhere with sub-50ms latency." },
                        { icon: Briefcase, title: "Custom MSA", desc: "Execute custom terms and agreements tailored to your legal department." },
                        { icon: Users, title: "Dedicated SLA", desc: "99.99% uptime guaranteed with assigned technical account managers." }
                    ].map((prop, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 + (idx * 0.1) }}
                            className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.05] transition-colors"
                        >
                            <prop.icon className="size-8 text-blue-400 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-2">{prop.title}</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">{prop.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* --- ARCHITECTURE DIAGRAM (Mock) --- */}
                <div className="mt-32 max-w-5xl mx-auto rounded-[3rem] p-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 shadow-2xl relative">
                    <div className="absolute inset-0 blur-3xl bg-blue-500/10"></div>
                    <div className="bg-[#0A0A0A] rounded-[2.9rem] p-12 relative overflow-hidden flex flex-col items-center">
                        <h2 className="text-3xl font-black text-white text-center mb-12">How we protect your code</h2>

                        <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-between opacity-80">
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-20 rounded-full border-2 border-slate-700 bg-slate-900 flex items-center justify-center shadow-lg"><Globe2 className="size-8 text-slate-400" /></div>
                                <span className="font-bold text-sm">Public Web</span>
                            </div>
                            <Zap className="size-6 text-blue-500 hidden md:block" />
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-24 rounded-2xl border-2 border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]"><ShieldCheck className="size-10 text-indigo-400" /></div>
                                <span className="font-bold text-sm">Cloudflare WAF (DDoS Shield)</span>
                            </div>
                            <Zap className="size-6 text-purple-500 hidden md:block" />
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-48 h-24 rounded-2xl border-2 border-purple-500/30 bg-purple-500/10 flex flex-col items-center justify-center p-4">
                                    <span className="font-bold flex items-center gap-2"><Lock className="size-4" /> VPC Private Subnet</span>
                                    <span className="text-xs text-slate-400 mt-1 text-center">AES-256 Encryption at Rest</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
