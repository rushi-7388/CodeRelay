import React from "react";
import { Activity, Clock3 } from "lucide-react";

function DebuggerPanel({ trace, currentStep, onStepChange }) {
  const currentState = trace && trace[currentStep] ? trace[currentStep].state : null;
  const currentLine = trace && trace[currentStep] ? trace[currentStep].line : null;

  return (
    <div className="h-full bg-base-300 flex flex-col font-sans border-l border-base-200">
      <div className="flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300">
        <div className="flex items-center gap-2">
          <Clock3 className="size-4 text-primary" />
          <span className="font-semibold text-sm">Time-Travel Debugger</span>
          {trace?.length > 0 && (
            <span className="ml-2 badge badge-neutral badge-sm">
              Step {currentStep + 1}/{trace.length} (Line {currentLine})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min={0} 
            max={Math.max(0, (trace?.length || 1) - 1)} 
            value={currentStep} 
            onChange={(e) => onStepChange(parseInt(e.target.value))}
            className="range range-xs range-primary w-32" 
            disabled={!trace || trace.length === 0}
          />
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0 || !trace?.length}
            className="btn btn-xs btn-outline"
          >Prev</button>
          <button
            onClick={() => onStepChange(Math.min((trace?.length || 1) - 1, currentStep + 1))}
            disabled={!trace || currentStep === trace.length - 1 || !trace?.length}
            className="btn btn-xs btn-outline"
          >Next</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-base-100/50">
        {(!trace || trace.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/40">
            <Activity className="size-10 mb-4 opacity-50" />
            <p className="font-medium text-center px-4">Run code with Debug to capture time-travel trace.</p>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="bg-base-200 p-4 rounded-xl shadow-sm border border-base-300">
               <h3 className="text-xs font-bold text-base-content/60 uppercase mb-3 tracking-wider">Local Variables</h3>
               {currentState && Object.keys(currentState).length > 0 ? (
                 <table className="table table-xs w-full">
                   <thead>
                     <tr>
                       <th>Variable</th>
                       <th>Value</th>
                       <th>Type</th>
                     </tr>
                   </thead>
                   <tbody>
                     {Object.entries(currentState).map(([key, value]) => {
                        return (
                          <tr key={key} className="hover">
                            <td className="font-mono text-primary font-semibold">{key}</td>
                            <td className="font-mono">{JSON.stringify(value)}</td>
                            <td className="text-xs opacity-50">{typeof value}</td>
                          </tr>
                        )
                     })}
                   </tbody>
                 </table>
               ) : (
                 <p className="text-sm opacity-50 italic">No variables in scope</p>
               )}
             </div>
             
             {currentState && currentState._error && (
               <div className="alert alert-error shadow-lg">
                 <span>{currentState._error}</span>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DebuggerPanel;
