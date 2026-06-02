import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import PublicPageShell from "../components/marketing/PublicPageShell";
import PageLoader from "../components/PageLoader";
import { useUser, SignInButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, SparklesIcon, Building2, CreditCard } from "lucide-react";
import { useOrganizations } from "../hooks/useOrganizations";
import { usePlans, useCheckoutSession } from "../hooks/usePayments";
import toast from "react-hot-toast";

const staticPlans = [
  {
    _id: "starter",
    name: "Starter",
    description: "Small teams starting with collaborative coding.",
    price: { month: 49, year: 39 },
    features: ["Up to 5 members", "100 live sessions/mo", "Basic analytics", "Community support"],
  },
  {
    _id: "pro",
    name: "Pro",
    isPopular: true,
    description: "Professional teams shipping interviews & classrooms daily.",
    price: { month: 149, year: 129 },
    features: ["Unlimited members", "Unlimited sessions", "AI assistance", "Priority support", "Custom classrooms"],
  },
  {
    _id: "enterprise",
    name: "Enterprise",
    description: "SSO, VPC, load balancing, and dedicated success.",
    price: { month: null, year: null },
    features: ["SAML SSO & SCIM", "Relay Balance + multi-region", "White-label", "SLA 99.99%", "Dedicated TAM"],
    cta: "enterprise",
  },
];

function PricingCards({ plans, billingCycle, onSubscribe, checkoutPending, planIdPending }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
      {plans.map((plan) => {
        const isEnterprise = plan.cta === "enterprise" || plan._id === "enterprise";
        const price = plan.price?.[billingCycle];

        return (
          <div
            key={plan._id}
            className={`relative flex flex-col bg-white/[0.02] border backdrop-blur-sm rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-white/[0.04] ${
              plan.isPopular ? "border-indigo-500 border-2 shadow-[0_0_40px_rgba(99,102,241,0.2)]" : "border-white/10"
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                Most Popular
              </div>
            )}
            <h2 className="text-2xl font-black mb-2 text-white">{plan.name}</h2>
            <p className="text-slate-400 text-sm h-10 font-medium leading-relaxed">{plan.description}</p>
            <div className="my-8">
              {isEnterprise ? (
                <span className="text-4xl font-black text-white">Custom</span>
              ) : (
                <>
                  <span className="text-5xl font-black text-white">${price}</span>
                  <span className="text-slate-400 font-medium">
                    {" "}
                    / {billingCycle === "year" ? "mo (billed yearly)" : "mo"}
                  </span>
                </>
              )}
            </div>
            <div className="h-px bg-white/10 w-full mb-8" />
            <ul className="space-y-4 mb-8 flex-1">
              {(plan.features || []).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm font-medium">
                  <CheckCircle2 className="size-5 text-indigo-400 shrink-0" />
                  <span className="text-slate-300">{feature.name || feature}</span>
                </li>
              ))}
            </ul>
            {isEnterprise ? (
              <Link
                to="/enterprise"
                className="w-full py-4 rounded-full font-bold text-[15px] transition-all flex justify-center items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white"
              >
                Contact sales <ChevronRight className="size-4" />
              </Link>
            ) : onSubscribe ? (
              <button
                type="button"
                onClick={() => onSubscribe(plan._id)}
                disabled={checkoutPending && planIdPending === plan._id}
                className={`w-full py-4 rounded-full font-bold text-[15px] transition-all flex justify-center items-center gap-2 disabled:opacity-50 ${
                  plan.isPopular
                    ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                }`}
              >
                {checkoutPending && planIdPending === plan._id ? (
                  <span className="loading loading-spinner size-4" />
                ) : (
                  <CreditCard className="size-4" />
                )}
                {plan.isPopular ? "Upgrade to Pro" : "Select plan"}
                <ChevronRight className="size-4" />
              </button>
            ) : (
              <SignInButton mode="modal">
                <button
                  type="button"
                  className={`w-full py-4 rounded-full font-bold text-[15px] transition-all flex justify-center items-center gap-2 ${
                    plan.isPopular
                      ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg"
                      : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                  }`}
                >
                  <CreditCard className="size-4" /> Get started <ChevronRight className="size-4" />
                </button>
              </SignInButton>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PublicPricing() {
  const [billingCycle, setBillingCycle] = useState("month");

  return (
    <PublicPageShell>
      <div className="flex flex-col items-center">
        <div className="text-center max-w-3xl mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-6"
          >
            <SparklesIcon className="size-4" />
            Transparent pricing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent"
          >
            Scale your engineering team
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-xl text-slate-400 font-medium mt-4"
          >
            Start free with Clerk, upgrade when you need AI, classrooms, and org controls.
          </motion.p>
        </div>

        <div className="mb-12 flex p-1.5 bg-white/5 rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => setBillingCycle("month")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              billingCycle === "month" ? "bg-indigo-500 text-white" : "text-slate-400"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("year")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              billingCycle === "year" ? "bg-indigo-500 text-white" : "text-slate-400"
            }`}
          >
            Yearly <span className="text-[10px] ml-1 opacity-80">-20%</span>
          </button>
        </div>

        <PricingCards plans={staticPlans} billingCycle={billingCycle} />
      </div>
    </PublicPageShell>
  );
}

function AuthPricing() {
  const { data: orgData, isLoading: orgLoading } = useOrganizations();
  const { data: planData } = usePlans();
  const checkoutMutation = useCheckoutSession();
  const [selectedOrg, setSelectedOrg] = useState("");
  const [billingCycle, setBillingCycle] = useState("month");

  const organizations = orgData?.organizations || [];
  const plans = planData?.plans?.length > 0 ? planData.plans : staticPlans;

  const handleSubscribe = (planId) => {
    if (!selectedOrg) {
      toast.error("Select an organization first");
      return;
    }
    checkoutMutation.mutate({ planId, organizationId: selectedOrg, interval: billingCycle });
  };

  return (
    <div className="min-h-screen bg-[#030014] text-slate-200">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
          Upgrade workspace
        </h1>

        <div className="max-w-lg mx-auto mb-12 bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <label className="flex items-center gap-2 text-sm font-bold text-white mb-3">
            <Building2 className="size-4 text-indigo-400" /> Organization
          </label>
          {orgLoading ? (
            <div className="h-12 bg-white/5 animate-pulse rounded-full" />
          ) : (
            <select
              className="w-full h-12 bg-black/40 border border-white/10 rounded-full px-4 text-white"
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
            >
              <option value="">Choose organization…</option>
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mb-12 flex justify-center p-1.5 bg-white/5 rounded-full border border-white/10 w-max mx-auto">
          <button
            type="button"
            onClick={() => setBillingCycle("month")}
            className={`px-6 py-2 rounded-full text-sm font-bold ${billingCycle === "month" ? "bg-indigo-500 text-white" : "text-slate-400"}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("year")}
            className={`px-6 py-2 rounded-full text-sm font-bold ${billingCycle === "year" ? "bg-indigo-500 text-white" : "text-slate-400"}`}
          >
            Yearly
          </button>
        </div>

        <PricingCards
          plans={plans}
          billingCycle={billingCycle}
          onSubscribe={handleSubscribe}
          checkoutPending={checkoutMutation.isPending}
          planIdPending={checkoutMutation.variables?.planId}
        />
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return <PageLoader label="Loading pricing…" />;
  if (!isSignedIn) return <PublicPricing />;
  return <AuthPricing />;
}
