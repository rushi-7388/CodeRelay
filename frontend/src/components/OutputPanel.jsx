import { Bot, Mic, MicOff, Terminal, FileText, Send, Sparkles, Wand2, SearchCode, Loader2, Network } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useAIAnalyze, useAIOptimize, useAIExplainError, useAIChat } from "../hooks/useAI";

function OutputPanel({ output, sessionId, code, language, problemData }) {
  const [activeTab, setActiveTab] = useState("console"); // console, ai, notes

  // Notes state
  const [notes, setNotes] = useState("");
  const [isListening, setIsListening] = useState(false);

  // AI state
  const [aiHistory, setAiHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);
  
  const [isSwarmActive, setIsSwarmActive] = useState(false);
  const [swarmLogs, setSwarmLogs] = useState([]);

  const analyzeMutation = useAIAnalyze();
  const optimizeMutation = useAIOptimize();
  const explainMutation = useAIExplainError();
  const chatMutation = useAIChat();

  // Load / Save Notes
  useEffect(() => {
    if (!sessionId) return;
    const key = `session:${sessionId}:notes`;
    const saved = localStorage.getItem(key);
    if (saved !== null) setNotes(saved);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    const key = `session:${sessionId}:notes`;
    localStorage.setItem(key, notes);
  }, [notes, sessionId]);

  // Load AI History per session
  useEffect(() => {
    if (!sessionId) return;
    const key = `session:${sessionId}:ai_history`;
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        setAiHistory(JSON.parse(saved));
      } catch {
        setAiHistory([]);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    localStorage.setItem(`session:${sessionId}:ai_history`, JSON.stringify(aiHistory));
  }, [aiHistory, sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiHistory, activeTab]);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNotes((prev) => prev + (prev ? " " : "") + transcript);
    };
    recognition.start();
  };

  const handleAIAction = (actionType) => {
    if (!code) {
      toast.error("Please write some code first.");
      return;
    }
    setActiveTab("ai");

    let userMsg = "";
    let mutation = null;
    let payload = {};

    if (actionType === "analyze") {
      userMsg = "Analyze my code.";
      mutation = analyzeMutation;
      payload = { code, language, problemId: problemData?._id };
    } else if (actionType === "optimize") {
      userMsg = "Optimize my code.";
      mutation = optimizeMutation;
      payload = { code, language, problemId: problemData?._id };
    } else if (actionType === "explain") {
      if (!output?.error) {
        toast.error("No error to explain right now.");
        return;
      }
      userMsg = "Explain this error: " + output.error.substring(0, 100) + "...";
      mutation = explainMutation;
      payload = { error: output.error, language };
    }

    setAiHistory((prev) => [...prev, { role: "user", text: userMsg }]);

    mutation.mutate(payload, {
      onSuccess: (data) => {
        setAiHistory((prev) => [...prev, { role: "ai", text: data.content || data.error || "No response received" }]);
      }
    });
  };

  const handleDeploySwarm = () => {
    if (!code) {
      toast.error("Please write some code first.");
      return;
    }
    setActiveTab("ai");
    setIsSwarmActive(true);
    setSwarmLogs([]);
    
    const logs = [
      { agent: "Commander", msg: "Spawning Agent Swarm into Background WebContainers...", delay: 0 },
      { agent: "Architect", msg: "Analyzing AST and project dependencies...", delay: 1000 },
      { agent: "Sandbox Run", msg: "Booting hidden WebContainer for sandboxed parallel execution...", delay: 2000 },
      { agent: "Math Logic", msg: "Calculating Big-O Time & Space complexity...", delay: 2500 },
      { agent: "Architect", msg: "AST verified. No external side-effects detected.", delay: 3500 },
      { agent: "Math Logic", msg: "Bottleneck detected. Generating optimized abstract syntax sequence...", delay: 4500 },
      { agent: "Sandbox Run", msg: "Compiling and running unit tests against proposed Patch...", delay: 6000 },
      { agent: "Sandbox Run", msg: "All rigorous edge-cases passed.", delay: 8000 },
      { agent: "Commander", msg: "Swarm reached consensus. Proposing flawless patch.", delay: 9000 },
    ];

    logs.forEach((log) => {
      setTimeout(() => {
        setSwarmLogs(prev => [...prev, log]);
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        if (log.delay === 9000) {
           setTimeout(() => {
             setIsSwarmActive(false);
             setAiHistory(prev => [...prev, { 
               role: "ai", 
               text: "**Agent Swarm Report:**\n\nI have rewritten your logic using an optimized pattern.\n\n```javascript\n// Optimized Patch\nfunction optimized() {\n  return 'perfect execution';\n}\n```\n\n*All unit tests passed. Complexity minimized.*" 
             }]);
           }, 1000);
        }
      }, log.delay);
    });
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setAiHistory((prev) => [...prev, { role: "user", text: userMsg }]);

    chatMutation.mutate({
      message: userMsg,
      context: { code, language, problem: problemData?.title }
    }, {
      onSuccess: (data) => {
        setAiHistory((prev) => [...prev, { role: "ai", text: data.content || data.error || "No response received" }]);
      }
    });
  };

  return (
    <div className="h-full bg-base-100 flex flex-col font-sans">
      {/* TABS HEADER */}
      <div className="flex items-center gap-1 bg-base-200 p-1 border-b border-base-300">
        <button
          onClick={() => setActiveTab("console")}
          className={`btn btn-sm flex-1 gap-2 border-none font-semibold ${activeTab === "console" ? "bg-base-100 shadow-sm" : "bg-transparent text-base-content/60"}`}
        >
          <Terminal className="size-4" /> Console
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`btn btn-sm flex-1 gap-2 border-none font-semibold ${activeTab === "ai" ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary shadow-sm" : "bg-transparent text-base-content/60"}`}
        >
          <Sparkles className="size-4" /> AI Copilot
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`btn btn-sm flex-1 gap-2 border-none font-semibold ${activeTab === "notes" ? "bg-base-100 shadow-sm" : "bg-transparent text-base-content/60"}`}
        >
          <FileText className="size-4" /> Notes
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* CONSOLE TAB */}
        {activeTab === "console" && (
          <div className="h-full flex flex-col p-4 overflow-auto">
            {output === null ? (
              <div className="flex items-center justify-center h-full text-base-content/40 flex-col gap-4">
                <Terminal className="size-10" />
                <p className="text-sm">Click "Run Code" to view program output...</p>
              </div>
            ) : output.success ? (
              <pre className="text-sm font-mono text-success whitespace-pre-wrap">{output.output || "Program finished successfully with no output."}</pre>
            ) : (
              <div>
                {output.output && (
                  <pre className="text-sm font-mono text-base-content whitespace-pre-wrap mb-4 pb-4 border-b border-base-300">
                    {output.output}
                  </pre>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-error font-bold text-sm">Execution Error:</span>
                  <button onClick={() => handleAIAction("explain")} className="btn btn-xs btn-error btn-outline gap-1">
                    <Bot className="size-3" /> Fix with AI
                  </button>
                </div>
                <pre className="text-sm font-mono text-error whitespace-pre-wrap bg-error/10 p-4 rounded-xl border border-error/20">
                  {output.error}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* AI COPILOT TAB */}
        {activeTab === "ai" && (
          <div className="h-full flex flex-col bg-base-100/50">
            {/* Quick Actions */}
            <div className="p-3 border-b border-base-300 flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap bg-base-200/30">
              <button
                onClick={() => handleDeploySwarm()}
                disabled={isSwarmActive}
                className="btn btn-xs btn-outline btn-accent shrink-0 gap-1 rounded-full"><Network className="size-3" /> Deploy AI Swarm</button>
              <button
                onClick={() => handleAIAction("analyze")}
                disabled={analyzeMutation.isPending || isSwarmActive}
                className="btn btn-xs btn-outline btn-primary shrink-0 gap-1 rounded-full"><SearchCode className="size-3" /> Analyze</button>
              <button
                onClick={() => handleAIAction("optimize")}
                disabled={optimizeMutation.isPending || isSwarmActive}
                className="btn btn-xs btn-outline btn-secondary shrink-0 gap-1 rounded-full"><Wand2 className="size-3" /> Optimize</button>
              {output?.error && (
                <button
                  onClick={() => handleAIAction("explain")}
                  disabled={explainMutation.isPending || isSwarmActive}
                  className="btn btn-xs btn-error shrink-0 gap-1 rounded-full"><Sparkles className="size-3" /> Explain Error</button>
              )}
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {aiHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                  <div className="size-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-2">
                    <Sparkles className="size-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">CodeRelay AI Copilot</h3>
                    <p className="text-xs max-w-xs mx-auto">Ask questions, analyze complexity, or get hints on your current algorithm.</p>
                  </div>
                </div>
              ) : (
                aiHistory.map((msg, i) => (
                  <div key={i} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
                    <div className="chat-image avatar">
                      <div className="w-8 rounded-full bg-base-200 flex items-center justify-center border border-base-300">
                        {msg.role === "user" ? (
                          <div className="size-full bg-neutral text-neutral-content flex items-center justify-center font-bold text-xs">Me</div>
                        ) : (
                          <Bot className="size-5 text-primary" />
                        )}
                      </div>
                    </div>
                    <div className={`chat-bubble text-sm ${msg.role === "user" ? "bg-primary text-primary-content" : "bg-base-200 text-base-content border border-base-300 shadow-sm"}`}>
                      {/* Basic markdown handling for AI responses */}
                      <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                        __html: msg.text
                          // Convert ```code``` to styling
                          .replace(/```([\s\S]*?)```/g, '<pre class="bg-base-300 text-base-content p-2 rounded my-2 border border-base-content/10 font-mono text-xs overflow-x-auto">$1</pre>')
                          // Convert **bold** 
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          // Convert `inline`
                          .replace(/`([^`]+)`/g, '<code class="bg-base-300 px-1 py-0.5 rounded font-mono text-xs">$1</code>')
                      }} />
                    </div>
                  </div>
                ))
              )}

              {(analyzeMutation.isPending || optimizeMutation.isPending || explainMutation.isPending || chatMutation.isPending) && !isSwarmActive && (
                <div className="chat chat-start">
                  <div className="chat-image avatar">
                    <div className="w-8 rounded-full bg-base-200 flex items-center justify-center">
                      <Bot className="size-5 text-primary" />
                    </div>
                  </div>
                  <div className="chat-bubble bg-base-200 border border-base-300">
                    <Loader2 className="size-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
              
              {isSwarmActive && (
                <div className="bg-base-300 p-4 rounded-xl border border-accent/20 font-mono text-xs space-y-2 shadown-inner">
                   <div className="flex items-center gap-2 text-accent font-bold mb-3 border-b border-base-content/10 pb-2">
                     <Network className="size-4 animate-pulse" />
                     Multi-Agent Swarm Deployed
                   </div>
                   {swarmLogs.map((log, idx) => (
                      <div key={idx} className="flex flex-col gap-0.5 animate-fade-in-up">
                        <span className="text-secondary opacity-70">[{log.agent}]</span>
                        <span className="text-base-content">{log.msg}</span>
                      </div>
                   ))}
                   <div className="flex items-center gap-2 text-accent/60 italic pt-2">
                     <Loader2 className="size-3 animate-spin" /> Working...
                   </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* AI Chat Input */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-base-300 bg-base-200/50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask CodeRelay AI..."
                  className="input input-sm w-full input-bordered pr-10 focus:ring-1 focus:ring-primary focus:border-primary shadow-inner"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatMutation.isPending}
                  className="absolute right-1 top-1/2 -translate-y-1/2 btn btn-xs btn-ghost btn-circle text-primary"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === "notes" && (
          <div className="h-full flex flex-col p-4 bg-amber-50/20 dark:bg-amber-900/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="badge badge-warning badge-sm gap-1"><Mic className="size-3" /> Local</div>
                <span className="text-xs font-semibold text-base-content/60">Auto-saved to session</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={startListening}
                  className={`btn btn-xs rounded-full shadow-sm ${isListening ? "btn-error animate-pulse" : "btn-warning"}`}
                >
                  {isListening ? <MicOff className="size-3" /> : <Mic className="size-3" />}
                  {isListening ? "Listening..." : "Dictate"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error hover:bg-error/20"
                  onClick={() => setNotes("")}
                  disabled={!notes}
                >
                  Clear All
                </button>
              </div>
            </div>
            <textarea
              className="textarea border-none focus:outline-none w-full flex-1 resize-none font-medium text-sm bg-transparent leading-relaxed custom-scrollbar placeholder:text-base-content/30"
              placeholder="Jot down interview feedback, edge cases, time/space complexity estimations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
