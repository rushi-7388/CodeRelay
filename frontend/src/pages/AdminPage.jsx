import { useState, useEffect } from "react";
import { useProblems, useCreateProblem, useUpdateProblem, useDeleteProblem } from "../hooks/useProblems";
import { Loader, Plus, Search, Trash2, Save, X, Eye, FileCode, Beaker, CheckCircle, AlertCircle, LayoutList, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Editor from "@monaco-editor/react";
import { PROBLEM_LANGUAGES } from "../lib/languages";

const defaultStarterCode = {};
const defaultExpectedOutput = {};
Object.keys(PROBLEM_LANGUAGES).forEach(lang => {
    defaultStarterCode[lang] = "// Write your code here\n";
    defaultExpectedOutput[lang] = "";
});

const INITIAL_PROBLEM_STATE = {
    id: "",
    title: "",
    difficulty: "Easy",
    category: "",
    description: {
        text: "",
        notes: [],
    },
    examples: [
        { input: "", output: "", explanation: "" }
    ],
    constraints: [],
    starterCode: defaultStarterCode,
    expectedOutput: defaultExpectedOutput,
    hint: ""
};

function AdminPage() {
    const { data: problems, isLoading } = useProblems();
    const createProblem = useCreateProblem();
    const updateProblem = useUpdateProblem();
    const deleteProblem = useDeleteProblem();

    const [selectedProblem, setSelectedProblem] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState(INITIAL_PROBLEM_STATE);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("details"); // details, description, code, tests
    const [selectedLang, setSelectedLang] = useState("javascript");

    useEffect(() => {
        if (selectedProblem) {
            setFormData(JSON.parse(JSON.stringify(selectedProblem)));
            setIsCreating(false);
            setActiveTab("details");
        } else if (isCreating) {
            setFormData(INITIAL_PROBLEM_STATE);
            setActiveTab("details");
        }
    }, [selectedProblem, isCreating]);

    const filteredProblems = problems?.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.id || !formData.title || !formData.description.text) {
            return alert("Please fill in required fields (ID, Title, Description)");
        }

        try {
            if (isCreating) {
                await createProblem.mutateAsync(formData);
                setIsCreating(false);
                setSelectedProblem(null);
            } else {
                await updateProblem.mutateAsync({ id: selectedProblem.id, ...formData });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this problem?")) {
            await deleteProblem.mutateAsync(id);
            if (selectedProblem?.id === id) {
                setSelectedProblem(null);
                setIsCreating(false);
            }
        }
    };

    const handleExampleChange = (index, field, value) => {
        const newExamples = [...formData.examples];
        newExamples[index] = { ...newExamples[index], [field]: value };
        setFormData({ ...formData, examples: newExamples });
    };

    const addExample = () => {
        setFormData({
            ...formData,
            examples: [...formData.examples, { input: "", output: "", explanation: "" }]
        });
    };

    const removeExample = (index) => {
        setFormData({
            ...formData,
            examples: formData.examples.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="min-h-screen bg-base-200 flex flex-col font-sans">
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                {/* SIDEBAR */}
                <div className="w-80 bg-base-100 border-r border-base-300 flex flex-col z-20 shadow-xl">
                    <div className="p-5 border-b border-base-300 bg-base-100/50 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <LayoutList className="size-5 text-primary" />
                                Problems
                            </h2>
                            <span className="badge badge-neutral badge-sm">{filteredProblems.length}</span>
                        </div>

                        <div className="relative mb-4 group">
                            <Search className="absolute left-3 top-3 size-4 text-base-content/40 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search problems..."
                                className="input input-bordered w-full pl-10 bg-base-200 focus:bg-base-100 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn btn-primary w-full gap-2 shadow-lg hover:translate-y-[-1px] transition-transform"
                            onClick={() => { setIsCreating(true); setSelectedProblem(null); setActiveTab("details"); }}
                        >
                            <Plus className="size-4" /> Create New Problem
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-8 text-base-content/40 space-y-2">
                                <Loader className="animate-spin size-8 text-primary" />
                                <span className="text-sm">Loading problems...</span>
                            </div>
                        ) : (
                            filteredProblems.map(problem => (
                                <div
                                    key={problem.id}
                                    onClick={() => { setSelectedProblem(problem); setIsCreating(false); }}
                                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 flex justify-between items-center group border ${selectedProblem?.id === problem.id
                                            ? "bg-primary text-primary-content border-primary shadow-md transform scale-[1.02]"
                                            : "bg-base-100 border-transparent hover:border-base-300 hover:bg-base-200"
                                        }`}
                                >
                                    <div className="min-w-0">
                                        <div className="font-bold truncate">{problem.title}</div>
                                        <div className={`text-xs mt-1 flex items-center gap-2 ${selectedProblem?.id === problem.id ? "text-primary-content/80" : "text-base-content/60"}`}>
                                            <span className={`badge badge-xs ${selectedProblem?.id === problem.id ? "badge-outline opacity-70" : "badge-ghost"}`}>
                                                {problem.difficulty}
                                            </span>
                                            <span className="truncate">{problem.category}</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity ${selectedProblem?.id === problem.id ? "text-primary-content hover:bg-primary-focus" : "text-error hover:bg-error/10"
                                            }`}
                                        onClick={(e) => { e.stopPropagation(); handleDelete(problem.id); }}
                                        title="Delete Problem"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 bg-base-200/50 backdrop-blur-3xl relative flex flex-col min-w-0">
                    {(isCreating || selectedProblem) ? (
                        <>
                            {/* EDITOR HEADER */}
                            <div className="bg-base-100 border-b border-base-300 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                                <div>
                                    <div className="text-sm breadcrumbs text-base-content/50 mb-1">
                                        <ul>
                                            <li>Admin</li>
                                            <li>Editor</li>
                                            <li>{isCreating ? "New Problem" : formData.id}</li>
                                        </ul>
                                    </div>
                                    <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        {isCreating ? "Create New Problem" : `Edit: ${formData.title}`}
                                    </h1>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex bg-base-200 rounded-lg p-1 mr-4">
                                        {[
                                            { id: "details", icon: AlertCircle, label: "Details" },
                                            { id: "description", icon: FileCode, label: "Description" },
                                            { id: "code", icon: FileCode, label: "Code" },
                                            { id: "tests", icon: Beaker, label: "Tests" },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === tab.id
                                                        ? "bg-white shadow text-primary"
                                                        : "text-base-content/60 hover:text-base-content"
                                                    }`}
                                            >
                                                <tab.icon className="size-4" />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        className="btn btn-primary gap-2 px-6 shadow-lg shadow-primary/20"
                                        onClick={handleSave}
                                        disabled={createProblem.isPending || updateProblem.isPending}
                                    >
                                        {(createProblem.isPending || updateProblem.isPending) ? (
                                            <Loader className="size-4 animate-spin" />
                                        ) : (
                                            <Save className="size-4" />
                                        )}
                                        {isCreating ? "Publish Problem" : "Save Changes"}
                                    </button>
                                </div>
                            </div>

                            {/* SCROLLABLE FORM AREA */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="max-w-5xl mx-auto space-y-8 pb-20">

                                    {/* SECTION 1: DETAILS */}
                                    <div className={`${activeTab === "details" ? "block" : "hidden"} space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="card bg-base-100 shadow-xl border border-base-200">
                                                <div className="card-body">
                                                    <h3 className="card-title text-sm opacity-60 uppercase tracking-wider mb-4">Core Identity</h3>
                                                    <div className="space-y-4">
                                                        <div className="form-control">
                                                            <label className="label font-medium">
                                                                <span className="label-text">Problem ID (Slug)</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="input input-bordered focus:input-primary transition-all font-mono text-sm"
                                                                value={formData.id}
                                                                onChange={e => setFormData({ ...formData, id: e.target.value })}
                                                                disabled={!isCreating}
                                                                placeholder="e.g. two-sum-problem"
                                                            />
                                                            <div className="label">
                                                                <span className="label-text-alt opacity-50">Unique identifier for URL. Cannot be changed after creation.</span>
                                                            </div>
                                                        </div>
                                                        <div className="form-control">
                                                            <label className="label font-medium">Display Title</label>
                                                            <input
                                                                type="text"
                                                                className="input input-bordered focus:input-primary transition-all text-lg font-semibold"
                                                                value={formData.title}
                                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                                placeholder="e.g. Two Sum"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card bg-base-100 shadow-xl border border-base-200">
                                                <div className="card-body">
                                                    <h3 className="card-title text-sm opacity-60 uppercase tracking-wider mb-4">Classification</h3>
                                                    <div className="space-y-4">
                                                        <div className="form-control">
                                                            <label className="label font-medium">Difficulty Level</label>
                                                            <div className="join w-full">
                                                                {["Easy", "Medium", "Hard"].map(level => (
                                                                    <button
                                                                        key={level}
                                                                        type="button"
                                                                        className={`join-item btn flex-1 ${formData.difficulty === level ? (
                                                                            level === "Easy" ? "btn-success text-white" :
                                                                                level === "Medium" ? "btn-warning text-white" : "btn-error text-white"
                                                                        ) : "btn-outline border-base-300"}`}
                                                                        onClick={() => setFormData({ ...formData, difficulty: level })}
                                                                    >
                                                                        {level}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="form-control">
                                                            <label className="label font-medium">Category / Tags</label>
                                                            <input
                                                                type="text"
                                                                className="input input-bordered focus:input-primary transition-all"
                                                                value={formData.category}
                                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                                placeholder="e.g. Arrays, Dynamic Programming"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 2: DESCRIPTION */}
                                    <div className={`${activeTab === "description" ? "block" : "hidden"} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                        <div className="card bg-base-100 shadow-xl border border-base-200 h-[calc(100vh-250px)]">
                                            <div className="card-body p-0 flex flex-col h-full">
                                                <div className="p-4 border-b border-base-200 bg-base-50 rounded-t-xl flex justify-between items-center">
                                                    <span className="font-bold text-sm uppercase tracking-wide opacity-70">Problem Description (Markdown)</span>
                                                    <button className="btn btn-ghost btn-xs gap-1">
                                                        <Eye className="size-3" /> Preview
                                                    </button>
                                                </div>
                                                <textarea
                                                    className="textarea textarea-ghost flex-1 resize-none p-6 text-base leading-relaxed font-mono focus:bg-base-50/50 transition-colors focus:outline-none"
                                                    value={formData.description.text}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        description: { ...formData.description, text: e.target.value }
                                                    })}
                                                    placeholder="# Problem Description&#10;&#10;Write detailed requirements here..."
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 3: STARTER CODE */}
                                    <div className={`${activeTab === "code" ? "block" : "hidden"} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                        <div className="card bg-[#1e1e1e] shadow-xl border border-base-300 overflow-hidden h-[calc(100vh-250px)]">
                                            <div className="p-3 bg-[#2d2d2d] border-b border-[#3e3e3e] flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                                    </div>
                                                    <select 
                                                        className="select select-xs select-ghost text-white/80 font-mono focus:bg-[#3e3e3e]"
                                                        value={selectedLang} 
                                                        onChange={(e) => setSelectedLang(e.target.value)}
                                                    >
                                                        {Object.entries(PROBLEM_LANGUAGES).map(([key, lang]) => (
                                                            <option key={key} value={key}>{lang.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <span className="text-xs text-white/40">{PROBLEM_LANGUAGES[selectedLang]?.name || "Unknown"} Code Environment</span>
                                            </div>
                                            <div className="flex-1 h-full relative">
                                                <Editor
                                                    height="100%"
                                                    language={PROBLEM_LANGUAGES[selectedLang]?.monacoLang || "javascript"}
                                                    theme="vs-dark"
                                                    value={formData.starterCode[selectedLang] || ""}
                                                    onChange={(value) => setFormData({
                                                        ...formData,
                                                        starterCode: { ...formData.starterCode, [selectedLang]: value || "" }
                                                    })}
                                                    options={{
                                                        minimap: { enabled: false },
                                                        fontSize: 14,
                                                        lineNumbers: "on",
                                                        scrollBeyondLastLine: false,
                                                        automaticLayout: true,
                                                        padding: { top: 16 }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 4: TEST CASES */}
                                    <div className={`${activeTab === "tests" ? "block" : "hidden"} space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-bold">Test Cases & Examples</h3>
                                                <p className="text-sm opacity-60">Define input/output pairs. The expected output is used to evaluate all languages via standard output matching.</p>
                                            </div>
                                            <button
                                                className="btn btn-secondary btn-sm gap-2"
                                                onClick={addExample}
                                                type="button"
                                            >
                                                <Plus className="size-4" /> Add Test Case
                                            </button>
                                        </div>

                                        <div className="grid gap-6">
                                            {formData.examples.map((ex, idx) => (
                                                <div key={idx} className="card bg-base-100 shadow-lg border border-base-200 group transition-all hover:shadow-xl hover:border-primary/20">
                                                    <div className="card-body p-6">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="badge badge-primary badge-lg h-8 w-8 rounded-full p-0 flex items-center justify-center font-bold text-white">
                                                                    {idx + 1}
                                                                </span>
                                                                <span className="font-medium opacity-80">Test Case #{idx + 1}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="btn btn-ghost btn-sm text-error opacity-50 hover:opacity-100 transition-opacity"
                                                                onClick={() => removeExample(idx)}
                                                            >
                                                                <Trash2 className="size-4" /> Remove
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            <div className="form-control">
                                                                <label className="label text-xs uppercase font-bold text-primary">Input</label>
                                                                <textarea
                                                                    className="textarea textarea-bordered font-mono text-sm h-24 focus:textarea-primary transition-all bg-base-50"
                                                                    value={ex.input}
                                                                    onChange={e => handleExampleChange(idx, "input", e.target.value)}
                                                                    placeholder='e.g. [2, 7, 11, 15], 9'
                                                                />
                                                            </div>
                                                            <div className="form-control">
                                                                <label className="label text-xs uppercase font-bold text-secondary flex justify-between">
                                                                    <span>Expected Output</span>
                                                                    <span className="text-xs opacity-50 font-mono normal-case">Configured globally</span>
                                                                </label>
                                                                <textarea
                                                                    className="textarea textarea-bordered font-mono text-sm h-24 focus:textarea-secondary transition-all bg-base-50"
                                                                    value={ex.output}
                                                                    onChange={e => handleExampleChange(idx, "output", e.target.value)}
                                                                    placeholder='e.g. [0, 1]'
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="form-control">
                                                            <label className="label text-xs uppercase font-bold opacity-60">Explanation (Optional)</label>
                                                            <input
                                                                type="text"
                                                                className="input input-bordered input-sm"
                                                                value={ex.explanation}
                                                                onChange={e => handleExampleChange(idx, "explanation", e.target.value)}
                                                                placeholder="Briefly explain why this output is correct..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {formData.examples.length === 0 && (
                                                <div className="text-center py-12 bg-base-100 rounded-xl border border-dashed border-base-300">
                                                    <Beaker className="size-12 mx-auto text-base-content/20 mb-3" />
                                                    <p className="opacity-50">No test cases defined yet.</p>
                                                    <button onClick={addExample} className="btn btn-link btn-sm">Add your first test case</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-base-content/30 select-none p-10 text-center">
                            <div className="w-24 h-24 rounded-full bg-base-100 flex items-center justify-center mb-6 shadow-xl animate-pulse ring-4 ring-base-200">
                                <FileCode className="size-10 text-primary/50" />
                            </div>
                            <h2 className="text-2xl font-bold text-base-content/70 mb-2">Problem Editor</h2>
                            <p className="max-w-md mx-auto text-base-content/50 leading-relaxed">
                                Select a problem from the sidebar to edit it, or create a new one to challenge the community.
                            </p>
                            <button
                                className="btn btn-primary mt-6 gap-2"
                                onClick={() => { setIsCreating(true); setSelectedProblem(null); setActiveTab("details"); }}
                            >
                                <Plus className="size-4" /> Create New Problem
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminPage;
