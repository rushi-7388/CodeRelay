import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import { Terminal, Code2, Globe, Server, CheckCircle2, ChevronRight, Play, Loader2, Share2, Rocket } from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

export default function LivePreview() {
  const { slug } = useParams();
  const [deployment, setDeployment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    async function fetchDeployment() {
      try {
        const res = await axiosInstance.get(`/deployments/${slug}`);
        setDeployment(res.data.deployment);
      } catch {
        toast.error("Deployment not found or has been removed.");
      } finally {
        setLoading(false);
      }
    }
    fetchDeployment();
  }, [slug]);

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      // For now, call our mock execution endpoint
      const res = await axiosInstance.post(`/deployments/${slug}/execute`);
      setOutput(res.data.output);
      toast.success("Execution completed on Edge!");
    } catch {
      toast.error("Execution failed.");
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#020205] flex items-center justify-center">
         <div className="text-center">
            <Loader2 className="size-12 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-indigo-300 font-mono text-sm tracking-widest uppercase">Connecting to Global Edge...</p>
         </div>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="h-screen bg-[#020205] flex items-center justify-center text-white">
        <div className="max-w-md text-center">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">404</h1>
          <p className="text-xl font-bold mb-6">Deployment Offline</p>
          <p className="text-slate-500 mb-8">The requested edge node is no longer replicating or the DNS has expired.</p>
          <Link to="/" className="btn btn-primary rounded-full px-8">Back to CodeRelay</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Premium Navbar */}
      <nav className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
               <Rocket className="size-4 text-white" />
            </div>
            <span className="font-black text-white tracking-tight uppercase text-sm">CodeRelay <span className="text-indigo-500">Live</span></span>
          </Link>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-2">
             <div className="size-2 rounded-full bg-success animate-pulse" />
             <span className="text-[10px] uppercase font-black tracking-widest text-success/80">Edge Global Active</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("URL Copied!"); }}
             className="btn btn-sm btn-ghost gap-2 rounded-full border border-white/5 hover:bg-white/5"
            >
             <Share2 className="size-4" /> <span className="hidden sm:inline">Share</span>
           </button>
           <button onClick={handleRunCode} disabled={isRunning} className="btn btn-sm btn-primary rounded-full px-6 bg-gradient-to-r from-indigo-500 to-fuchsia-500 border-none shadow-lg shadow-indigo-500/20">
              {isRunning ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
              {isRunning ? "Running..." : "Run logic"}
           </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
         {/* Deployment Header */}
         <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">Deployment Success</span>
                 <span className="text-white/20 text-xs">•</span>
                 <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{new Date(deployment.createdAt).toLocaleDateString()}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                {deployment.problemTitle}
              </h1>
              <div className="flex items-center gap-4 text-sm font-medium">
                 <div className="flex items-center gap-2">
                    <span className="text-white/40">Status:</span>
                    <span className="text-success flex items-center gap-1 font-bold"><CheckCircle2 className="size-4" /> Live on Edge</span>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-white/10" />
                 <div className="flex items-center gap-2">
                    <span className="text-white/40">Language:</span>
                    <span className="text-indigo-400 font-bold uppercase">{deployment.language}</span>
                 </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-6 backdrop-blur-sm">
               <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black text-white/30 tracking-widest">Deployer</span>
                  <span className="text-sm font-bold text-white">{deployment.deployer}</span>
               </div>
               <div className="flex flex-col border-l border-white/10 pl-6">
                  <span className="text-[10px] uppercase font-black text-white/30 tracking-widest">Region</span>
                  <span className="text-sm font-bold text-white">Global (14 Nodes)</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor Block */}
            <div className="lg:col-span-2 space-y-4">
               <div className="bg-[#0b0b14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700" />
                  <div className="bg-black/40 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Code2 className="size-4 text-indigo-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-100/60">Source Environment</span>
                     </div>
                     <div className="flex gap-1.5 font-mono text-[10px] text-white/20">
                        <span>v2.1.0-stable</span>
                     </div>
                  </div>
                  <div className="p-2">
                     <Editor
                       height="500px"
                       theme="vs-dark"
                       language={deployment.language === 'javascript' ? 'javascript' : 'cpp'}
                       value={deployment.code}
                       options={{
                          readOnly: true,
                          fontSize: 14,
                          minimap: { enabled: false },
                          padding: { top: 20 },
                          scrollBeyondLastLine: false,
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          backgroundColor: '#0b0b14'
                       }}
                       onMount={() => {
                          // monaco logic is tricky here, skipping theme injection for simplicity
                       }}
                     />
                  </div>
               </div>
            </div>

            {/* Sidebar / Console */}
            <div className="space-y-6">
               <div className="bg-[#0b0b14] border border-white/10 rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                  <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 mb-6">
                     <Terminal className="size-4 text-fuchsia-400" /> Edge Runtime Console
                  </h3>
                  
                  <div className="flex-1 bg-black/50 rounded-2xl p-4 font-mono text-xs border border-white/5 min-h-[300px] overflow-auto custom-scrollbar">
                     {!output ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-30 gap-4">
                           <Server className="size-8" />
                           <p>Runtime Ready.<br />Click "Run logic" to execute.</p>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           <div className="flex items-center gap-2 text-indigo-400/80">
                              <ChevronRight className="size-3" />
                              <span>initializing_runtime...</span>
                           </div>
                           <pre className="text-indigo-100 leading-relaxed whitespace-pre-wrap">
                              {output}
                           </pre>
                        </div>
                     )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                     <div className="flex items-center justify-between text-xs">
                        <span className="text-white/30 uppercase tracking-widest font-black">Memory Usage</span>
                        <span className="text-white/60 font-mono">14.2 MB</span>
                     </div>
                     <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[20%] bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                     </div>
                     <div className="flex items-center justify-between text-xs pt-2">
                        <span className="text-white/30 uppercase tracking-widest font-black">Latency</span>
                        <span className="text-white/60 font-mono">24ms (Avg)</span>
                     </div>
                     <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[12%] bg-fuchsia-500 rounded-full shadow-[0_0_8px_rgba(217,70,239,0.5)]" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-20 border-t border-white/5 py-10 text-center">
         <div className="flex items-center justify-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
             <Rocket className="size-4" />
             <span className="text-xs font-black uppercase tracking-widest">Powered by CodeRelay Edge Cluster</span>
         </div>
      </footer>
    </div>
  );
}
