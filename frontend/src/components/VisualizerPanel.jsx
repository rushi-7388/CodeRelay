import React, { useEffect, useState } from "react";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Sparkles, Activity } from "lucide-react";

// A beautiful custom node for Data Structures
const CustomNode = ({ data }) => {
    return (
        <div className={`px-4 py-2 shadow-xl rounded-xl border-2 ${data.isActive ? 'border-primary bg-primary/20 scale-110' : 'border-base-300 bg-base-100'} transition-all duration-300`}>
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-base-content/50 mb-1">{data.label}</span>
                <div className="font-mono text-lg font-black bg-base-200 px-3 py-1 rounded-lg">
                    {data.value}
                </div>
                {data.pointer && (
                    <span className="mt-1 text-xs badge badge-secondary badge-sm">{data.pointer}</span>
                )}
            </div>
        </div>
    );
};

const nodeTypes = {
    customNode: CustomNode,
};

function VisualizerPanel({ executionTrace }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [currentStep, setCurrentStep] = useState(0);

    // When trace updates, we re-parse
    useEffect(() => {
        if (!executionTrace || executionTrace.length === 0) {
            setNodes([]);
            setEdges([]);
            setCurrentStep(0);
            return;
        }

        const currentState = executionTrace[currentStep];
        if (currentState) {
            // transform state into ReactFlow nodes/edges
            // Example payload from code: [{ id: '1', value: 10, label: 'Node', targets: ['2'] }]

            const newNodes = currentState.map((item, idx) => ({
                id: item.id,
                type: 'customNode',
                position: item.position || { x: idx * 150 + 50, y: 150 },
                data: {
                    label: item.label || `Node ${item.id}`,
                    value: item.value,
                    pointer: item.pointer,
                    isActive: item.isActive
                }
            }));

            const newEdges = [];
            currentState.forEach(item => {
                if (item.targets) {
                    item.targets.forEach(targetId => {
                        newEdges.push({
                            id: `e${item.id}-${targetId}`,
                            source: item.id,
                            target: targetId,
                            animated: true,
                            style: { stroke: '#8b5cf6', strokeWidth: 2 },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: '#8b5cf6',
                            },
                        });
                    });
                }
            });

            setNodes(newNodes);
            setEdges(newEdges);
        }
    }, [executionTrace, currentStep, setNodes, setEdges]);

    // Autoplay function
    useEffect(() => {
        if (executionTrace && executionTrace.length > 0 && currentStep < executionTrace.length - 1) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [executionTrace, currentStep]);

    return (
        <div className="h-full bg-base-300 flex flex-col font-sans border-l border-base-200">
            <div className="flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300">
                <div className="flex items-center gap-2">
                    <Activity className="size-4 text-primary" />
                    <span className="font-semibold text-sm">Memory Graph (AST Visualizer)</span>
                    {executionTrace?.length > 0 && (
                        <span className="ml-2 badge badge-neutral badge-sm">Step {currentStep + 1}/{executionTrace.length}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                        className="btn btn-xs btn-outline"
                    >Prev</button>
                    <button
                        onClick={() => setCurrentStep(Math.min((executionTrace?.length || 1) - 1, currentStep + 1))}
                        disabled={!executionTrace || currentStep === executionTrace.length - 1}
                        className="btn btn-xs btn-outline"
                    >Next</button>
                </div>
            </div>

            <div className="flex-1 relative bg-base-100/50">
                {(!executionTrace || executionTrace.length === 0) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-base-content/40 z-10 pointer-events-none">
                        <Sparkles className="size-10 mb-4 opacity-50" />
                        <p className="font-medium">Call <code>visualize(dataStructure)</code> to render AST.</p>
                    </div>
                )}
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-right"
                >
                    <Background color="#8b5cf6" gap={16} size={1} opacity={0.1} />
                    <Controls />
                    <MiniMap
                        nodeColor="#8b5cf6"
                        maskColor="rgba(0,0,0, 0.1)"
                        className="bg-base-200 border border-base-300 rounded-lg shadow-xl"
                    />
                </ReactFlow>
            </div>
        </div>
    );
}

export default VisualizerPanel;
