import { Link } from "react-router-dom";
import { SignInButton } from "@clerk/clerk-react";
import { SparklesIcon, ArrowRightIcon, Cpu, VideoIcon, Code2Icon, Trophy, BrainCircuit, Globe2, ShieldCheck, Zap, ZapIcon } from "lucide-react";

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-[#030014] relative overflow-hidden font-sans selection:bg-purple-500/30 selection:text-white text-slate-200">

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/20 blur-[150px]" />
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
                            <Link to="/features" className="text-white transition-colors">Features</Link>
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

            {/* --- CONTENT --- */}
            <div className="relative z-10 pt-48 pb-32 px-4 max-w-7xl mx-auto">
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                        className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent"
                    >
                        Unfair advantages <br /> built right in.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-xl text-slate-400 font-medium"
                    >
                        CodeRelay combines the best of live collaboration, execution engines, and algorithmic visualization into one seamless developer experience.
                    </motion.p>
                </div>

                {/* FEATURE SHOWCASE */}
                <div className="space-y-32">
                    {/* Feature 1 */}
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <div className="size-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <VideoIcon className="size-8 text-indigo-400" />
                            </div>
                            <h2 className="text-4xl font-black text-white">Live Voice & Video Integration</h2>
                            <p className="text-lg text-slate-400 leading-relaxed">Stop relying on external meeting tools. We built WebRTC natively into the editor instance ensuring crystal clear voice and ultra-low latency video while you pair program.</p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-slate-300"><ZapIcon className="size-5 text-indigo-400" /> Automatic noise suppression</li>
                                <li className="flex items-center gap-3 text-slate-300"><ZapIcon className="size-5 text-indigo-400" /> Presenter mode screen sharing</li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="bg-white/[0.03] border border-white/5 p-4 rounded-3xl shadow-2xl relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent blur-3xl z-[-1]"></div>
                                <img src="/hero.png" alt="Video UI" className="rounded-2xl opacity-90 border border-white/10" />
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <div className="size-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                                <Code2Icon className="size-8 text-fuchsia-400" />
                            </div>
                            <h2 className="text-4xl font-black text-white">Visual Memory Execution</h2>
                            <p className="text-lg text-slate-400 leading-relaxed">Our advanced AST engine breaks down your execution graph step by step. See exactly how your arrays, matrices, and trees manipulate in real-time memory.</p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-slate-300"><ZapIcon className="size-5 text-fuchsia-400" /> Deep-tree node inspection</li>
                                <li className="flex items-center gap-3 text-slate-300"><ZapIcon className="size-5 text-fuchsia-400" /> Variable state timelines</li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full flex gap-4">
                            <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl shadow-2xl flex-1 flex flex-col gap-4">
                                <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
                                <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
                                <div className="flex gap-2 mt-4">
                                    <div className="size-12 rounded-full border-2 border-fuchsia-500/50 bg-fuchsia-500/10 animate-pulse"></div>
                                    <div className="size-12 rounded-full border-2 border-purple-500/50 bg-purple-500/10 animate-pulse delay-100"></div>
                                    <div className="size-12 rounded-full border-2 border-indigo-500/50 bg-indigo-500/10 animate-pulse delay-200"></div>
                                </div>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl shadow-2xl flex-1 mt-12 flex items-center justify-center text-6xl shadow-[0_0_50px_rgba(232,121,249,0.15)]">
                                🚀
                            </div>
                        </div>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid md:grid-cols-3 gap-6 pt-16 border-t border-white/10">
                        {[
                            { icon: Globe2, title: "WebContainers", desc: "Run Node.js directly inside your browser without any server setup delays." },
                            { icon: ShieldCheck, title: "Enterprise Grade ACL", desc: "Granular controls over who can read, write, execution, or invite within organizations." },
                            { icon: BrainCircuit, title: "AI Guided Solutions", desc: "Stuck on a tricky DSA problem? Our AI won't give you the answer, but traces the optimal hint." },
                        ].map((feat, idx) => (
                            <div key={idx} className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-colors">
                                <div className="bg-white/5 size-12 flex items-center justify-center rounded-xl mb-6">
                                    <feat.icon className="size-6 text-indigo-300" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                                <p className="text-slate-400">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
