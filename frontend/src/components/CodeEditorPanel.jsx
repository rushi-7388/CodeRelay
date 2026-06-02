import Editor from "@monaco-editor/react";
import { useRef, useEffect } from "react";
import { Loader2Icon, PlayIcon, Activity, Server, Cloud, PlusIcon, GitMerge, GitBranch } from "lucide-react";
import { LANGUAGE_CONFIG } from "../lib/languages";

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  onRunTimeTravel,
  onSimulateArchitecture,
  onDeployEdge,
  currentLine,
  branches = { main: "" },
  currentBranch = "main",
  onCreateBranch,
  onBranchChange,
  onMergeBranch,
  languages = LANGUAGE_CONFIG
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    
    if (currentLine) {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        [
          {
            range: new monacoRef.current.Range(currentLine, 1, currentLine, 1),
            options: {
              isWholeLine: true,
              className: 'execution-line'
            }
          }
        ]
      );
      editorRef.current.revealLineInCenter(currentLine);
    } else {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [currentLine]);

  return (
    <div className="h-full bg-base-300 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-base-100 border-t border-base-300">
        <div className="flex items-center gap-3">
          <img
            src={languages[selectedLanguage]?.icon || "/javascript.png"}
            alt={languages[selectedLanguage]?.name || "Language"}
            className="size-6 bg-white/10 rounded-sm p-0.5 object-contain"
          />
          <select className="select select-sm" value={selectedLanguage} onChange={onLanguageChange}>
            {Object.entries(languages).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>

          {/* QUANTUM BRANCH SELECTOR */}
          <div className="flex items-center gap-2 border-l border-base-300 pl-4">
             <div className="dropdown">
               <div tabIndex={0} role="button" className={`btn btn-xs hover:bg-primary/20 hover:text-primary gap-1 rounded-full px-3 ${currentBranch !== 'main' ? 'btn-primary bg-primary/20 text-primary border-primary/40' : 'btn-ghost text-base-content/60 border-base-content/20'}`}>
                 <GitBranch className="size-3" />
                 <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Timeline:</span>
                 <span className="font-bold tracking-wider">{currentBranch}</span>
               </div>
               <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow-2xl bg-base-200 rounded-box w-52 border border-base-300 mt-2">
                 {Object.keys(branches).map(b => (
                    <li key={b}>
                      <a className={currentBranch === b ? "active bg-primary font-bold text-primary-content" : "text-sm"} onClick={() => onBranchChange(b)}>
                         {b === "main" ? "🚀 Main Timeline" : `🌌 ${b}`}
                      </a>
                    </li>
                 ))}
                 <div className="divider my-0 py-1 opacity-30"></div>
                 <li>
                   <a onClick={onCreateBranch} className="text-success font-black text-xs uppercase tracking-wider">
                     <PlusIcon className="size-3"/> New Timeline
                   </a>
                 </li>
                 {currentBranch !== "main" && (
                   <li>
                     <a onClick={onMergeBranch} className="text-warning font-black text-xs uppercase tracking-wider mt-1">
                       <GitMerge className="size-3"/> Merge to Main
                     </a>
                   </li>
                 )}
               </ul>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedLanguage === "javascript" && (
            <button className="btn btn-secondary btn-sm gap-2" disabled={isRunning} onClick={onRunTimeTravel}>
              <Loader2Icon className={`size-4 ${isRunning ? 'animate-spin' : 'hidden'}`} />
              <Activity className="size-4" />
              Time-Travel Debug
            </button>
          )}
          <button className="btn btn-info btn-sm gap-2" disabled={isRunning} onClick={onSimulateArchitecture}>
              <Server className="size-4" />
              Simulate 3D Arch
          </button>
          <button className="btn btn-accent btn-sm gap-2 text-white shadow-lg shadow-accent/20" disabled={isRunning} onClick={onDeployEdge}>
              <Cloud className="size-4" />
              Deploy Edge
          </button>
          <button className="btn btn-primary btn-sm gap-2" disabled={isRunning} onClick={onRunCode}>
            {isRunning ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayIcon className="size-4" />
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height={"100%"}
          language={languages[selectedLanguage]?.monacoLang || "javascript"}
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            fontSize: 16,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
}
export default CodeEditorPanel;
