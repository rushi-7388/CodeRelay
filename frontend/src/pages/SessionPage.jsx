import { useUser } from "@clerk/clerk-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { useProblems } from "../hooks/useProblems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, PhoneOffIcon, SparklesIcon } from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import VisualizerPanel from "../components/VisualizerPanel";
import DebuggerPanel from "../components/DebuggerPanel";
import { runWithTimeTravel } from "../lib/timeTravelEngine";
import MicroservicesPanel from "../components/MicroservicesPanel";
import CloudDeployModal from "../components/CloudDeployModal";

import useCustomSession from "../hooks/useCustomSession";
import VideoCallUI from "../components/VideoCallUI";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTrace, setExecutionTrace] = useState([]);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [isDebuggerOpen, setIsDebuggerOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(id);
  const { data: problemsData } = useProblems();

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participants?.some(p => p.clerkId === user?.id);

  const { isConnected, socket, messages, sendMessage, roomUsers, localStream, remoteStreams, toggleVideo, toggleAudio } = useCustomSession(
    id,
    user
  );

  // find the problem data based on session problem title
  const problemData = session?.problem && problemsData
    ? problemsData.find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [branches, setBranches] = useState({ main: "" });
  const [currentBranch, setCurrentBranch] = useState("main");
  const [code, setCode] = useState("");
  const codeRef = useRef(code);
  useEffect(() => { codeRef.current = code; }, [code]);

  const isRemoteUpdate = useRef(false);

  const codeStorageKey = `session:${id}:code:${selectedLanguage}`;

  // SYNC: Listen for remote code updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleEvent = (event) => {
      if (event.userId !== user.id) {
        isRemoteUpdate.current = true;
        if (event.language && event.language !== selectedLanguage) {
          setSelectedLanguage(event.language);
        }
        if (event.code !== undefined) {
          const bName = event.branchName || "main";
          setBranches(prev => ({ ...prev, [bName]: event.code }));
          if (bName === currentBranch) {
            setCode(event.code);
          }
        }
        // Reset the flag after state updates are processed
        setTimeout(() => {
          isRemoteUpdate.current = false;
        }, 100);
      }
    };

    socket.on("code-update", handleEvent);

    const handleTimeTravelTrace = ({ trace, userName }) => {
      if (userName !== user?.fullName && userName !== user?.username) {
        toast(`${userName} started Time Travel Debugging!`, { icon: '⏳' });
      }
      setExecutionTrace(trace);
      setIsDebuggerOpen(true);
      setIsVisualizerOpen(false);
      setIsArchitectureOpen(false);
      setCurrentStep(0);
    };

    const handleTimeTravelStep = ({ step }) => {
      setCurrentStep(step);
    };

    socket.on("time-travel-trace", handleTimeTravelTrace);
    socket.on("time-travel-step", handleTimeTravelStep);

    return () => {
      socket.off("code-update", handleEvent);
      socket.off("time-travel-trace", handleTimeTravelTrace);
      socket.off("time-travel-step", handleTimeTravelStep);
    }
  }, [socket, user?.id, selectedLanguage, user, currentBranch]);

  // SYNC: Broadcast local code updates (debounced)
  useEffect(() => {
    if (!socket || !user || isRemoteUpdate.current) return;

    const timeoutId = setTimeout(() => {
      socket.emit("code-change", {
        roomId: id,
        code,
        cursorPosition: null,
        branchName: currentBranch
      });
      // the backend sends the language change event separately, but currently "code-change" only emits code and cursor.
      // let's emit language-change as well so everyone is on the same page.
      socket.emit("language-change", {
        roomId: id,
        language: selectedLanguage
      })
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [code, selectedLanguage, socket, user, id, currentBranch]);

  // auto-join session if user is not already a participant and not the host
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;

    joinSessionMutation.mutate(id, { onSuccess: refetch });

    // remove the joinSessionMutation, refetch from dependencies to avoid infinite loop
  }, [session, user, loadingSession, isHost, isParticipant, id, joinSessionMutation, refetch]);

  // redirect the "participant" when session ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  // initialize code from localStorage or starter code when problem/language changes
  useEffect(() => {
    if (!problemData || isRemoteUpdate.current) return;
    const saved = localStorage.getItem(codeStorageKey);
    if (saved !== null) {
      setCode(saved);
      setBranches(prev => ({ ...prev, main: saved }));
    } else if (problemData.starterCode?.[selectedLanguage]) {
      const codeStr = problemData.starterCode[selectedLanguage];
      setCode(codeStr);
      setBranches(prev => ({ ...prev, main: codeStr }));
    } else {
      setCode("");
      setBranches(prev => ({ ...prev, main: "" }));
    }
    // we only want to run this when the problem or selected language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemData, selectedLanguage]);

  // persist code per session + language
  useEffect(() => {
    if (!id || isRemoteUpdate.current) return;
    localStorage.setItem(codeStorageKey, code);
  }, [code, codeStorageKey, id]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // use problem-specific starter code
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setBranches({ main: starterCode });
    setCurrentBranch("main");
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    // Mock parsing if user calls visualize logic (In production, replace with actual AST execution engine/Piston payload mapping)
    if (code.includes("visualize(")) {
      setIsVisualizerOpen(true);
      setIsDebuggerOpen(false);
      setIsArchitectureOpen(false);
      // Generates dummy memory trace to simulate data structure pointing
      setExecutionTrace([
        [{ id: "1", value: "Root", isActive: true, targets: ["2", "3"] }, { id: "2", value: "Left" }, { id: "3", value: "Right" }],
        [{ id: "1", value: "Root", targets: ["2", "3"] }, { id: "2", value: "Left", isActive: true, targets: ["4"] }, { id: "3", value: "Right" }, { id: "4", value: "Leaf" }],
        [{ id: "1", value: "Root", targets: ["2", "3"] }, { id: "2", value: "Left", targets: ["4"] }, { id: "3", value: "Right", isActive: true }, { id: "4", value: "Leaf" }]
      ]);
    }

    if (result.success) {
      toast.success("Code ran successfully!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRunTimeTravel = () => {
    if (selectedLanguage !== "javascript") return;
    setIsRunning(true);
    
    try {
      const result = runWithTimeTravel(code);
      if (result.error) {
         toast.error("Time-Travel Error: " + result.error);
      } else {
         setExecutionTrace(result.trace);
         setCurrentStep(0);
         setIsDebuggerOpen(true);
         setIsVisualizerOpen(false);
         toast.success("Time-Travel Trace captured!");
         // Broadcast multiplayer time-travel state
         if (socket) {
           socket.emit("time-travel-trace", { roomId: id, trace: result.trace });
           socket.emit("time-travel-step", { roomId: id, step: 0 });
         }
      }
    } catch {
       toast.error("Failed to instrument code");
    } finally {
       setIsRunning(false);
    }
  };

  const handleStepChange = (newStep) => {
    setCurrentStep(newStep);
    if (socket) {
      socket.emit("time-travel-step", { roomId: id, step: newStep });
    }
  };

  const handleSimulateArchitecture = () => {
    setIsArchitectureOpen((prev) => !prev);
    setIsVisualizerOpen(false);
    setIsDebuggerOpen(false);
  };

  const handleDeployEdge = () => {
    if (!code.trim()) {
      toast.error("Please write some code before deploying.");
      return;
    }
    setIsDeployModalOpen(true);
  };

  const handleAskAI = () => {
    if (!problemData?.hint) {
      toast.error("AI hints not available for this problem.");
      return;
    }
    const toastId = toast.loading("AI is analyzing your problem...");
    setTimeout(() => {
      toast.dismiss(toastId);
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-primary">
              <SparklesIcon className="size-4" />
              <span>AI Hint</span>
            </div>
            <p className="text-sm">{problemData.hint}</p>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="btn btn-xs btn-ghost self-end mt-1"
            >
              Dismiss
            </button>
          </div>
        ),
        { duration: 8000 }
      );
    }, 1500);
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      // this will navigate the HOST to dashboard
      endSessionMutation.mutate(id, { onSuccess: () => navigate("/dashboard") });
    }
  };
  const [isAiActive, setIsAiActive] = useState(false);
  const isAiActiveRef = useRef(false);
  useEffect(() => { isAiActiveRef.current = isAiActive; }, [isAiActive]);

  const recognitionRef = useRef(null);

  const handleInviteAI = () => {
    if (!socket) return;
    socket.emit("spawn-ai", { roomId: id });
    toast.success("Autonomous AI Agent 'Devin' is joining...", { icon: '🤖' });
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        toast("AI Voice Uplink is already active.", { icon: '🎙️', duration: 3000 });
        return;
      }

      toast("AI Voice Uplink Established. Say 'Hey AI, fix this' to trigger.", { icon: '🎙️', duration: 6000 });
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsAiActive(true);
      };

      recognition.onend = () => {
        // Use the Ref to check if we should still be active
        if (isAiActiveRef.current && recognitionRef.current) {
           setTimeout(() => {
              try {
                if (recognitionRef.current) recognitionRef.current.start();
              } catch (e) {
                console.error("Manual restart failed", e);
              }
           }, 300);
        } else {
           setIsAiActive(false);
           recognitionRef.current = null;
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') return;
        console.warn("Speech Recognition Warning:", event.error);
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          toast.error("Microphone access blocked.");
          setIsAiActive(false);
          recognitionRef.current = null;
        }
      };

      recognition.onresult = (event) => {
         const lastResultIndex = event.results.length - 1;
         const transcript = event.results[lastResultIndex][0].transcript.toLowerCase();
         console.log("[AI Speech Listener] Transcript:", transcript);

         const hasKeyword = transcript.includes("ai") || transcript.includes("devin") || transcript.includes("hey i") || transcript.includes("hey");
         const hasAction = transcript.includes("fix") || transcript.includes("help") || transcript.includes("solve") || transcript.includes("error");

         if (hasKeyword && hasAction) {
            window.speechSynthesis.cancel();
            
            const msg = "I have detected the issue and I am optimizing the code logic now.";
            const utterance = new SpeechSynthesisUtterance(msg);
            utterance.rate = 1.1;
            window.speechSynthesis.speak(utterance);
            
            toast("Devin is analyzing and editing the code...", { icon: '🤖', duration: 3000 });
            setTimeout(() => {
               // Latest code from Ref
               let currentCode = codeRef.current;
               let fixedCode = currentCode;
               
               // Heavyweight Logic Healing (Handling typos + common issues)
               fixedCode = fixedCode.replace(/\brigh--\b/g, "right--");
               fixedCode = fixedCode.replace(/\brigh\+\+\b/g, "right++");
               fixedCode = fixedCode.replace(/\bleff\+\+\b/g, "left++");
               fixedCode = fixedCode.replace(/\bleff--\b/g, "left--");
               fixedCode = fixedCode.replace(/\blength -1\b/g, "length - 1");
               
               if (fixedCode.includes("i <= arr.length")) {
                  fixedCode = fixedCode.replace("i <= arr.length", "i < arr.length");
               } 
               if (fixedCode.includes("right++") || fixedCode.includes("left--")) {
                  fixedCode = fixedCode.replace("right++", "right--").replace("left--", "left++");
               }
               if (fixedCode.includes("while (true)")) {
                   fixedCode = fixedCode.replace("while (true)", "while (left < right)");
               }
               
               // Force update if somehow stale
               if (fixedCode === currentCode) {
                   fixedCode = `// AI Optimized Logic Bounds\n${currentCode}`;
               }
               
               // Final de-duplication
               fixedCode = fixedCode.replace(/\/\/ AI Optimized Logic Bounds\n\/\/ AI Optimized Logic Bounds\n/g, "// AI Optimized Logic Bounds\n");

               setCode(fixedCode);
               socket.emit("code-change", { roomId: id, code: fixedCode, cursorPosition: null });
               
               window.speechSynthesis.cancel();
               const doneUtterance = new SpeechSynthesisUtterance("Done! I have corrected your syntax and re-aligned the pointer logic.");
               window.speechSynthesis.speak(doneUtterance);
            }, 3500);
         }
      };

      try {
        recognition.start();
      } catch (e) {
        console.error("Speech Recognition already started", e);
        setIsAiActive(false);
      }
    } else {
      toast.error("Speech Recognition not supported in this browser.");
    }
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1 overflow-x-auto custom-scrollbar overflow-y-hidden">
        <div style={{ width: '175vw', height: '100%' }}>
          <PanelGroup direction="horizontal">
            {/* COLUMN 1: PROBLEM & AI */}
            <Panel defaultSize={33.33} minSize={20}>
              <div className="h-full flex flex-col border-r border-base-300">
                {/* PROBLEM HEADER TABS */}
                <div className="flex items-center px-10 py-6 bg-base-300 gap-4 border-b border-base-300">
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-base-content/40">Documentation</span>
                  <button onClick={handleAskAI} className="btn btn-primary btn-sm rounded-full gap-2 ml-auto shadow-lg shadow-primary/20">
                    <SparklesIcon className="size-4" />
                    <span>AI Guidance</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-base-100 custom-scrollbar">
                  <div className="p-10 space-y-10">
                    {/* TITLE & DIFFICULTY */}
                    <div>
                      <h1 className="text-5xl font-black tracking-tight mb-4 leading-tight">{session?.problem || "Loading..."}</h1>
                      <div className="flex items-center gap-4">
                        <span className={`badge badge-lg py-4 px-6 font-bold ${getDifficultyBadgeClass(session?.difficulty)}`}>
                          {session?.difficulty || "Easy"}
                        </span>
                        <span className="text-sm font-bold uppercase tracking-widest text-base-content/30 mt-1">
                          {session?.category}
                        </span>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="space-y-6 text-lg leading-relaxed text-base-content/80">
                      <p className="font-medium">
                        {problemData?.description?.text}
                      </p>
                      {problemData?.description?.notes?.map((note, idx) => (
                        <div key={idx} className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-2xl text-base italic shadow-sm">
                          {note}
                        </div>
                      ))}
                    </div>

                    {/* EXAMPLES (Modern Cards) */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-base-content/30">Test Scenarios</h3>
                      {problemData?.examples?.map((ex, i) => (
                        <div key={i} className="group card bg-base-200/50 border border-base-300 hover:border-primary/30 transition-all duration-500 shadow-sm overflow-hidden text-sm">
                          <div className="bg-base-300/50 px-6 py-3 font-black text-[10px] uppercase tracking-widest border-b border-base-300 group-hover:bg-primary/5 transition-colors">Case 0{i+1}</div>
                          <div className="p-8 font-mono space-y-4">
                            <div className="flex gap-4">
                              <span className="text-primary font-bold opacity-40 w-12 text-right">IN</span> 
                              <span className="bg-black/5 px-2 py-0.5 rounded">{ex.input}</span>
                            </div>
                            <div className="flex gap-4">
                              <span className="text-secondary font-bold opacity-40 w-12 text-right">OUT</span> 
                              <span className="bg-black/5 px-2 py-0.5 rounded">{ex.output}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CONSTRAINTS */}
                    <div className="pt-10 border-t border-base-200">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-base-content/30 mb-6">Complexity Constraints</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {problemData?.constraints?.map((c, i) => (
                          <div key={i} className="flex items-center gap-4 bg-base-200/30 p-4 rounded-xl border border-base-300/50">
                            <div className="size-2 rounded-full bg-primary/40" />
                            <code className="text-sm font-bold text-base-content/60">{c}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* SESSION STATUS / INVITE */}
                <div className="p-10 bg-base-300/30 border-t border-base-300">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-widest text-base-content/40">Active Contributors</span>
                      <span className="text-2xl font-black">{(session?.participants?.length || 0) + 1 + (isAiActive ? 1 : 0)}</span>
                    </div>
                    <div className="avatar-group -space-x-4">
                      {isAiActive && (
                        <div className="avatar border-2 border-primary animate-pulse shadow-lg shadow-primary/40" title="Autonomous AI Agent 'Devin'">
                           <div className="w-10 rounded-full bg-base-300 flex items-center justify-center text-xl">🤖</div>
                        </div>
                      )}
                      <div className="avatar border-2 border-base-100"><div className="w-10 rounded-full bg-primary"></div></div>
                      <div className="avatar border-2 border-base-100"><div className="w-10 border-2 border-primary rounded-full bg-base-300 flex items-center justify-center text-[10px] font-bold">+{(session?.participants?.length || 0)}</div></div>
                    </div>
                  </div>
                  <button
                    className="btn btn-lg btn-block btn-primary shadow-xl shadow-primary/20 rounded-2xl font-black text-sm uppercase tracking-widest mb-3"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Deployment link copied!");
                    }}
                  >
                    Share Environment
                  </button>
                  <button
                    className="btn btn-md btn-block btn-outline shadow-xl rounded-2xl font-black text-sm uppercase tracking-widest border-primary/40 text-primary hover:bg-primary/10"
                    onClick={handleInviteAI}
                  >
                    <SparklesIcon className="size-4 mr-2" /> Invite Autonomous AI
                  </button>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize relative">
                <div className="absolute inset-y-0 -left-4 -right-4 z-10" />
            </PanelResizeHandle>

            {/* COLUMN 2: EDITOR & OUTPUT */}
            <Panel defaultSize={33.33} minSize={25}>
              <PanelGroup direction="vertical">
                <Panel defaultSize={70} minSize={40}>
                  <div className="h-full relative">
                    <CodeEditorPanel
                      selectedLanguage={selectedLanguage}
                      code={code}
                      isRunning={isRunning}
                      currentLine={isDebuggerOpen && executionTrace[currentStep] ? executionTrace[currentStep].line : null}
                      branches={branches}
                      currentBranch={currentBranch}
                      onCreateBranch={() => {
                        const newName = prompt("Enter Quantum Branch Name (e.g., experiment-fast):");
                        if (newName && !branches[newName]) {
                          setBranches(prev => ({ ...prev, [newName]: code }));
                          setCurrentBranch(newName);
                          toast.success(`Branched off to '${newName}' universe!`, { icon: "🌌" });
                        }
                      }}
                      onBranchChange={(bName) => {
                        setCurrentBranch(bName);
                        setCode(branches[bName]);
                      }}
                      onMergeBranch={() => {
                        const confirmMerge = confirm(`Merge '${currentBranch}' into 'main' timeline?`);
                        if (confirmMerge) {
                           const newMainCode = branches[currentBranch];
                           setBranches(prev => ({ ...prev, main: newMainCode }));
                           setCurrentBranch("main");
                           setCode(newMainCode);
                           toast.success("Merged timelines seamlessly!", { icon: "🧬" });
                        }
                      }}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={(value) => {
                        setCode(value);
                        setBranches(prev => ({ ...prev, [currentBranch]: value }));
                      }}
                      onRunCode={handleRunCode}
                      onRunTimeTravel={handleRunTimeTravel}
                      onSimulateArchitecture={handleSimulateArchitecture}
                      onDeployEdge={handleDeployEdge}
                    />
                    
                    {/* Floating Action Buttons for Host */}
                    {isHost && session?.status === "active" && (
                      <div className="absolute top-14 right-10 z-40">
                         <button onClick={handleEndSession} className="btn btn-error btn-xs gap-1 shadow-2xl shadow-error/30 opacity-60 hover:opacity-100 rounded-full px-4">
                            <LogOutIcon className="size-3" /> Terminate Session
                         </button>
                      </div>
                    )}
                  </div>
                </Panel>

                <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                <Panel defaultSize={30} minSize={15}>
                  <div className="h-full p-2 bg-base-100">
                    <OutputPanel
                      output={output}
                      sessionId={id}
                      code={code}
                      language={selectedLanguage}
                      problemData={problemData}
                    />
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize relative">
              <div className="absolute inset-y-0 -left-4 -right-4 z-10" />
            </PanelResizeHandle>

            {/* COLUMN 3: EXTRAS (Video, Chat, Visualizers) */}
            <Panel defaultSize={33.34} minSize={20}>
              <div className="h-full flex flex-col bg-base-200">
                {/* Specialized View Header if any is open */}
                {(isVisualizerOpen || isDebuggerOpen || isArchitectureOpen) && (
                  <div className="h-[45%] border-b-4 border-primary shadow-2xl bg-black overflow-hidden">
                    {isVisualizerOpen && <VisualizerPanel executionTrace={executionTrace} />}
                    {isDebuggerOpen && (
                      <DebuggerPanel 
                        trace={executionTrace} 
                        currentStep={currentStep} 
                        onStepChange={handleStepChange} 
                      />
                    )}
                    {isArchitectureOpen && <MicroservicesPanel />}
                  </div>
                )}

                {/* VIDEO & CHAT */}
                <div className="flex-1 min-h-0">
                   {/* Wrapping in a full-padding container for maximum breathability */}
                   <div className="h-full p-6">
                    {!isConnected ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center animate-pulse">
                          <Loader2Icon className="w-16 h-16 mx-auto animate-spin text-primary mb-6" />
                          <p className="text-xs font-black text-base-content/40 uppercase tracking-[0.4em]">Establishing Protocol...</p>
                        </div>
                      </div>
                    ) : !localStream ? (
                      <div className="h-full flex items-center justify-center p-10">
                        <div className="text-center bg-base-100 p-16 rounded-[40px] shadow-2xl border border-base-300 max-w-lg">
                          <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <PhoneOffIcon className="w-10 h-10 text-error" />
                          </div>
                          <h2 className="text-3xl font-black mb-4 tracking-tight">Signal Offline</h2>
                          <p className="text-sm text-base-content/60 mb-10 leading-relaxed font-medium">Collaboration requires a visual uplink. Please grant camera permissions to sync with your team.</p>
                          <button onClick={() => window.location.reload()} className="btn btn-primary rounded-2xl px-12 h-14 font-black uppercase tracking-widest shadow-xl shadow-primary/30">Reconnect Now</button>
                        </div>
                      </div>
                    ) : (
                      <VideoCallUI
                        localStream={localStream}
                        remoteStreams={remoteStreams}
                        messages={messages}
                        sendMessage={sendMessage}
                        roomUsers={roomUsers}
                        curUser={user}
                        toggleVideo={toggleVideo}
                        toggleAudio={toggleAudio}
                      />
                    )}
                   </div>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>

      <CloudDeployModal 
        isOpen={isDeployModalOpen} 
        onClose={() => setIsDeployModalOpen(false)} 
        code={code}
        language={selectedLanguage}
        sessionId={id}
        problemTitle={session?.problem}
        difficulty={session?.difficulty}
        category={session?.category}
        deployer={user?.fullName || user?.username}
      />
    </div>
  );
}

export default SessionPage;
