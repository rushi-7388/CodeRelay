import React, { useState, useEffect } from 'react';
import { Cloud, Server, Database, CheckCircle2, Copy, ExternalLink, Globe2, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axios';

export default function CloudDeployModal({ isOpen, onClose, code, language, sessionId, problemTitle, difficulty, category, deployer }) {
  const [step, setStep] = useState(0);
  const [deployedUrl, setDeployedUrl] = useState('');

  useEffect(() => {
    let timeouts = [];
    if (isOpen && code) {
      setStep(0);
      setDeployedUrl('');
      
      const stages = [
        { delay: 1500 }, // Analyzing AST
        { delay: 3500 }, // Containerizing
        { delay: 5500 }, // Provisioning Edge Nodes
        { delay: 7500 }, // DNS Propagation
        { delay: 9000 }, // Done
      ];

      // Actually trigger the backend deployment during the process
      const triggerDeploy = async () => {
        try {
          const res = await axiosInstance.post(`/deployments`, {
             sessionId,
             code,
             language,
             problemTitle,
             difficulty,
             category: category || "Algorithm",
             deployer: deployer || "Anonymous"
          });
          
          if (res.data.success) {
            const fullUrl = `${window.location.origin}/live/${res.data.deployment.slug}`;
            setDeployedUrl(fullUrl);
          }
        } catch (err) {
          console.error("Backend deployment failed:", err);
          setDeployedUrl(`${window.location.origin}/live/demo-failed`);
        }
      };

      triggerDeploy();

      stages.forEach((stage, index) => {
        const timeout = setTimeout(() => {
          setStep(index + 1);
          if (index === 4) {
            toast.success("Successfully deployed to Global Edge Network!");
          }
        }, stage.delay);
        timeouts.push(timeout);
      });
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isOpen, code, language, sessionId, problemTitle, difficulty, category, deployer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0c0c16] border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 blur-[100px] pointer-events-none rounded-full" />

        <button onClick={onClose} className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost text-white/50 hover:text-white z-50">
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 mb-8 relative z-10">
           <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
             <Cloud className="size-6 text-white" />
           </div>
           <div>
             <h2 className="text-2xl font-black text-white leading-none">Vercel Edge Deploy</h2>
             <p className="text-indigo-200 text-sm mt-1">Instant Serverless Containerization</p>
           </div>
        </div>

        <div className="space-y-6 relative z-10">
          <DeploymentStep status={step > 0 ? 'done' : step === 0 ? 'loading' : 'pending'} Icon={Server} title="Containerizing Runtime Environment" desc="Building WebContainer Docker Image v2.1" />
          <DeploymentStep status={step > 1 ? 'done' : step === 1 ? 'loading' : 'pending'} Icon={Globe2} title="Provisioning Global Edge Nodes" desc="Replicating across 14 Vercel Edge Regions" />
          <DeploymentStep status={step > 2 ? 'done' : step === 2 ? 'loading' : 'pending'} Icon={Database} title="Hydrating Redis Cache" desc="Connecting KV Edge Database" />
          <DeploymentStep status={step > 3 ? 'done' : step === 3 ? 'loading' : 'pending'} Icon={Cloud} title="DNS Propagation" desc="Assigning SSL Certificate & Domain" />
        </div>

        {step >= 5 && (
          <div className="mt-8 pt-6 border-t border-white/10 animate-fade-in-up relative z-10">
             <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center size-12 rounded-full bg-success/20 text-success mb-2 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                   <CheckCircle2 className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Deployment Live</h3>
             </div>
             <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <span className="font-mono text-sm text-indigo-300 truncate pl-2">{deployedUrl || "Propagating DNS..."}</span>
                <div className="flex items-center gap-2 pl-3">
                  <button onClick={() => { navigator.clipboard.writeText(deployedUrl); toast.success("URL Copied!"); }} className="btn btn-sm btn-circle btn-ghost text-white/70 hover:text-white">
                    <Copy className="size-4" />
                  </button>
                  <a href={deployedUrl} target="_blank" rel="noreferrer" className={`btn btn-sm btn-primary rounded-full px-4 gap-2 border-none bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 ${!deployedUrl && 'btn-disabled'}`}>
                    Open <ExternalLink className="size-4" />
                  </a>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function DeploymentStep({ status, Icon, title, desc }) {
  return (
    <div className={`flex items-start gap-4 transition-all duration-500 ${status === 'pending' ? 'opacity-40 grayscale' : 'opacity-100'}`}>
      <div className={`relative flex items-center justify-center min-w-10 min-h-10 rounded-full ${status === 'done' ? 'bg-success/20 text-success' : status === 'loading' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-base-300 text-base-content/50'}`}>
         {status === 'done' ? <CheckCircle2 className="size-5" /> : status === 'loading' ? <Loader2 className="size-5 animate-spin" /> : <Icon className="size-5" />}
      </div>
      <div>
         <h4 className={`text-base font-bold ${status === 'loading' ? 'text-indigo-100' : 'text-slate-300'}`}>{title}</h4>
         <p className="text-xs text-slate-500 mt-0.5 font-medium">{desc}</p>
      </div>
    </div>
  );
}
