import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { ArrowLeft, Building2, LayoutDashboard, CreditCard, Settings, Users } from "lucide-react";

function OrganizationDetailsPage() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="min-h-screen bg-base-300 flex flex-col font-sans">
            <Navbar />

            <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
                <div className="mb-8 flex items-center gap-4">
                    <Link to="/organizations" className="btn btn-circle btn-ghost shadow-sm bg-base-100">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black flex items-center gap-2">
                            <Building2 className="size-8 text-primary" />
                            Workspace Configuration
                        </h1>
                        <p className="text-base-content/60 text-sm">Managing organization: {id}</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* SIDEBAR NAVIGATION */}
                    <div className="w-full md:w-64 shrink-0 space-y-2">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`btn w-full justify-start gap-3 border-none shadow-sm ${activeTab === "overview" ? "bg-primary text-primary-content hover:bg-primary/90" : "bg-base-100 text-base-content hover:bg-base-200"}`}
                        >
                            <LayoutDashboard className="size-4" /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("members")}
                            className={`btn w-full justify-start gap-3 border-none shadow-sm ${activeTab === "members" ? "bg-primary text-primary-content hover:bg-primary/90" : "bg-base-100 text-base-content hover:bg-base-200"}`}
                        >
                            <Users className="size-4" /> Team Members
                        </button>
                        <button
                            onClick={() => setActiveTab("billing")}
                            className={`btn w-full justify-start gap-3 border-none shadow-sm ${activeTab === "billing" ? "bg-primary text-primary-content hover:bg-primary/90" : "bg-base-100 text-base-content hover:bg-base-200"}`}
                        >
                            <CreditCard className="size-4" /> Billing & Usage
                        </button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`btn w-full justify-start gap-3 border-none shadow-sm ${activeTab === "settings" ? "bg-primary text-primary-content hover:bg-primary/90" : "bg-base-100 text-base-content hover:bg-base-200"}`}
                        >
                            <Settings className="size-4" /> Settings
                        </button>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1 bg-base-100 rounded-2xl shadow-xl border border-base-300 p-8">
                        {activeTab === "overview" && (
                            <div className="animate-fade-in space-y-6">
                                <h2 className="text-2xl font-bold border-b border-base-200 pb-4">Workspace Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="stat bg-base-200 rounded-xl">
                                        <div className="stat-title">Total Members</div>
                                        <div className="stat-value text-primary">1</div>
                                    </div>
                                    <div className="stat bg-base-200 rounded-xl">
                                        <div className="stat-title">Storage Used</div>
                                        <div className="stat-value text-secondary">0%</div>
                                    </div>
                                    <div className="stat bg-base-200 rounded-xl">
                                        <div className="stat-title">Active Projects</div>
                                        <div className="stat-value text-accent">3</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "members" && (
                            <div className="animate-fade-in space-y-6">
                                <div className="flex items-center justify-between border-b border-base-200 pb-4">
                                    <h2 className="text-2xl font-bold">Team Members</h2>
                                    <button className="btn btn-sm btn-primary">Invite Member</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="table table-zebra">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Role</th>
                                                <th>Joined</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="font-medium">You (Owner)</td>
                                                <td><span className="badge badge-primary badge-sm">Owner</span></td>
                                                <td>Just now</td>
                                                <td>-</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === "billing" && (
                            <div className="animate-fade-in space-y-6">
                                <h2 className="text-2xl font-bold border-b border-base-200 pb-4">Billing & Subscriptions</h2>
                                <div className="alert alert-warning shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <span>You are currently on the free sandbox plan.</span>
                                </div>
                                <Link to="/pricing" className="btn btn-primary btn-outline">View Upgrade Options</Link>
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="animate-fade-in space-y-6">
                                <h2 className="text-2xl font-bold border-b border-base-200 pb-4">Workspace Settings</h2>
                                <div className="form-control w-full max-w-md">
                                    <label className="label">
                                        <span className="label-text font-bold">Workspace Name</span>
                                    </label>
                                    <input type="text" className="input input-bordered" placeholder="Acme Corp" disabled />
                                </div>
                                <button className="btn btn-error btn-outline mt-8">Delete Workspace</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrganizationDetailsPage;
