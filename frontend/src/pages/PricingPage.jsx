import { useState } from "react";
import Navbar from "../components/Navbar";
import { useUser, SignInButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, SparklesIcon, Building2, CreditCard, ArrowRightIcon } from "lucide-react";
import { useOrganizations } from "../hooks/useOrganizations";
import { usePlans, useCheckoutSession } from "../hooks/usePayments";
import toast from "react-hot-toast";

const staticPlans = [
    {
        _id: "starter",
        name: "Starter",
        description: "Perfect for small teams getting started with collaborative coding.",
        price: { monthly: 49, yearly: 39 },
        features: ["Up to 5 Team Members", "100 Live Sessions/mo", "Basic Analytics", "Community Support"],
    },
    {
        _id: "pro",
        name: "Pro",
        isPopular: true,
        description: "Advanced features and capabilities for professional engineering teams.",
        price: { monthly: 149, yearly: 129 },
        features: ["Unlimited Team Members", "Unlimited Live Sessions", "Advanced AI Assistance", "Priority Support", "Custom Classrooms"],
    },
    {
        _id: "enterprise",
        name: "Enterprise",
        description: "Custom solutions for massive scale and complex needs.",
        price: { monthly: 499, yearly: 399 },
        features: ["SSO Integration", "Dedicated Account Manager", "White-labeling", "On-premise deployment support", "SLA Guarantee"],
    },
];

const PublicNavbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-6">
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-7xl mx-auto rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-6 py-3 flex items-center justify-between">
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
                    <Link to="/pricing" className="text-white transition-colors">Pricing</Link>
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
);

function PublicPricing() {
    const [billingCycle, setBillingCycle] = useState("month");

    return (
        <div className="min-h-screen bg-[#030014] relative overflow-hidden font-sans selection:bg-purple-500/30 selection:text-white text-slate-200">
            <PublicNavbar />

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/20 blur-[150px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
            </div>

            <div className="relative z-10 pt-48 pb-32 px-4 max-w-7xl mx-auto flex flex-col items-center">

                {/* HEADER SECTION */}
                <div className="text-center max-w-3xl mb-16 space-y-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-6">
                        <SparklesIcon className="size-4" />
                        <span className="uppercase tracking-wider">Transparent Pricing</span>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl md:text-7xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent leading-[1.1] pb-2">
                        Scale your engineering <br /> without limits.
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl text-slate-400 font-medium pt-4">
                        Choose a plan that fits your workflow. Experience code collaboration without the friction.
                    </motion.p>
                </div>

                {/* TOGGLE */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mb-16 flex items-center justify-center p-1.5 bg-white/5 rounded-full w-max mx-auto shadow-inner border border-white/10">
                    <button onClick={() => setBillingCycle("month")} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === "month" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25" : "text-slate-400 hover:text-white"}`}>Monthly Billing</button>
                    <button onClick={() => setBillingCycle("year")} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${billingCycle === "year" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25" : "text-slate-400 hover:text-white"}`}>Annually <span className={`${billingCycle === "year" ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-300"} text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider`}>Save 20%</span></button>
                </motion.div>

                {/* PRICING CARDS */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    {staticPlans.map((plan) => (
                        <div key={plan._id} className={`relative flex flex-col bg-white/[0.02] border backdrop-blur-sm rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-white/[0.04] ${plan.isPopular ? "border-indigo-500 border-2 shadow-[0_0_40px_rgba(99,102,241,0.2)]" : "border-white/10"}`}>
                            {plan.isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Most Popular</div>}
                            <h2 className="text-2xl font-black mb-2 text-white">{plan.name}</h2>
                            <p className="text-slate-400 text-sm h-10 font-medium leading-relaxed">{plan.description}</p>
                            <div className="my-8">
                                <span className="text-5xl font-black text-white">${plan.price?.[billingCycle] || (billingCycle === 'month' ? 49 : 39)}</span>
                                <span className="text-slate-400 font-medium"> / {billingCycle === "year" ? "mo (billed yearly)" : "mo"}</span>
                            </div>
                            <div className="h-px bg-white/10 w-full mb-8"></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm font-medium"><CheckCircle2 className="size-5 text-indigo-400 shrink-0" /><span className="text-slate-300">{feature.name || feature}</span></li>
                                ))}
                            </ul>
                            <SignInButton mode="modal">
                                <button className={`w-full py-4 rounded-full font-bold text-[15px] transition-all flex justify-center items-center gap-2 ${plan.isPopular ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-95" : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"}`}>
                                    <CreditCard className="size-4" /> Get Started <ChevronRight className="size-4" />
                                </button>
                            </SignInButton>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

function AuthPricing() {
    const { data: orgData, isLoading: orgLoading } = useOrganizations();
    const { data: planData } = usePlans();
    const checkoutMutation = useCheckoutSession();

    const [selectedOrg, setSelectedOrg] = useState("");
    const [billingCycle, setBillingCycle] = useState("month");

    const organizations = orgData?.organizations || [];
    const plans = (planData?.plans && planData.plans.length > 0) ? planData.plans : staticPlans;

    const handleSubscribe = (planId) => {
        if (!selectedOrg) {
            toast.error("Please select an organization first to upgrade!");
            return;
        }
        checkoutMutation.mutate({ planId, organizationId: selectedOrg, interval: billingCycle });
    };

    return (
        <div className="min-h-screen bg-[#030014] flex flex-col font-sans selection:bg-purple-500/30 selection:text-white text-slate-200 relative overflow-hidden">
            <Navbar />

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[150px]" />
            </div>

            <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-16 flex flex-col items-center relative z-10">
                {/* HEADER SECTION */}
                <div className="text-center max-w-3xl mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-4">
                        <SparklesIcon className="size-4" />
                        <span className="uppercase tracking-wider">Upgrade Workspace</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent leading-[1.1] pb-2">
                        Scale your Engineering Team
                    </h1>
                </div>

                {/* ORG & TOGGLE CONTROLS */}
                <div className="w-full max-w-lg mx-auto mb-16 space-y-8">
                    <div className="bg-white/[0.03] p-6 border border-white/10 rounded-2xl shadow-xl relative overflow-hidden group">
                        <label className="block text-sm font-bold text-white mb-3 flex flex-row items-center gap-2">
                            <Building2 className="size-4 text-indigo-400" /> Target Organization
                        </label>
                        {orgLoading ? (
                            <div className="h-12 w-full bg-white/5 animate-pulse rounded-full"></div>
                        ) : organizations.length > 0 ? (
                            <select
                                className="w-full h-12 bg-[#0A0A0A] border border-white/10 text-white rounded-full px-4 text-[15px] focus:outline-none focus:border-indigo-500 appearance-none"
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                            >
                                <option value="" disabled>Choose an organization to upgrade...</option>
                                {organizations.map((org) => (
                                    <option key={org._id} value={org._id}>{org.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm p-4 rounded-xl flex items-center gap-3">
                                You do not have any organizations yet. Create one first from the dashboard!
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center p-1.5 bg-white/5 rounded-full w-max mx-auto shadow-inner border border-white/10">
                        <button onClick={() => setBillingCycle("month")} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === "month" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25" : "text-slate-400 hover:text-white"}`}>Monthly Billing</button>
                        <button onClick={() => setBillingCycle("year")} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${billingCycle === "year" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25" : "text-slate-400 hover:text-white"}`}>Annually</button>
                    </div>
                </div>

                {/* PRICING CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    {plans.map((plan) => (
                        <div key={plan._id} className={`relative flex flex-col bg-white/[0.02] border backdrop-blur-sm rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-white/[0.04] ${plan.isPopular ? "border-indigo-500 border-2 shadow-[0_0_40px_rgba(99,102,241,0.2)]" : "border-white/10"}`}>
                            {plan.isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Most Popular</div>}
                            <h2 className="text-2xl font-black mb-2 text-white">{plan.name}</h2>
                            <p className="text-slate-400 text-sm h-10 font-medium leading-relaxed">{plan.description}</p>
                            <div className="my-8">
                                <span className="text-5xl font-black text-white">${plan.price?.[billingCycle] || (billingCycle === 'month' ? 49 : 39)}</span>
                                <span className="text-slate-400 font-medium"> / {billingCycle === "year" ? "mo (billed yearly)" : "mo"}</span>
                            </div>
                            <div className="h-px bg-white/10 w-full mb-8"></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {(plan.features || staticPlans[1].features).map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm font-medium"><CheckCircle2 className="size-5 text-indigo-400 shrink-0" /><span className="text-slate-300">{feature.name || feature}</span></li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleSubscribe(plan._id)}
                                disabled={checkoutMutation.isPending}
                                className={`w-full py-4 rounded-full font-bold text-[15px] transition-all flex justify-center items-center gap-2 disabled:opacity-50 ${plan.isPopular ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-95" : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"}`}
                            >
                                {checkoutMutation.isPending && checkoutMutation.variables?.planId === plan._id ? (
                                    <span className="loading loading-spinner size-4"></span>
                                ) : <CreditCard className="size-4" />}
                                {plan.isPopular ? "Upgrade to Pro" : "Select Plan"} <ChevronRight className="size-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function PricingPage() {
    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded) return null;

    if (!isSignedIn) {
        return <PublicPricing />;
    }

    return <AuthPricing />;
}
