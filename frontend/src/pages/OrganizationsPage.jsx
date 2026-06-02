import { useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useOrganizations, useCreateOrganization } from "../hooks/useOrganizations";
import { Building2, Plus, ArrowRight, ShieldCheck, Globe, Users2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function OrganizationsPage() {
    const { data: orgData, isLoading } = useOrganizations();
    const createOrgMutation = useCreateOrganization();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newOrg, setNewOrg] = useState({ name: "", description: "", website: "" });

    const organizations = orgData?.organizations || [];

    const handleCreate = (e) => {
        e.preventDefault();
        createOrgMutation.mutate(newOrg, {
            onSuccess: () => {
                setIsModalOpen(false);
                setNewOrg({ name: "", description: "", website: "" });
            },
        });
    };

    return (
        <div className="min-h-screen bg-base-300 flex flex-col font-sans">
            <Navbar />

            <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg shadow-primary/20">
                                <Building2 className="size-8 text-white" />
                            </div>
                            Your Workspaces
                        </h1>
                        <p className="text-base-content/60 text-lg">Manage teams, scale your operations, and upgrade your billing here.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        <Plus className="size-5" />
                        Create Workspace
                    </button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton h-64 w-full rounded-2xl"></div>
                        ))}
                    </div>
                ) : organizations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {organizations.map((org) => (
                            <div
                                key={org._id}
                                className="card bg-base-100 border border-base-300 shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-300 group"
                            >
                                <div className="card-body p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="size-16 rounded-2xl bg-gradient-to-br from-base-200 to-base-300 border border-base-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                            {org.logo ? (
                                                <img src={org.logo} alt={org.name} className="size-full object-cover rounded-2xl" />
                                            ) : (
                                                <span className="text-2xl font-black text-primary uppercase">{org.name.slice(0, 2)}</span>
                                            )}
                                        </div>
                                        {org.subscription?.isActive && (
                                            <div className="badge badge-success gap-1 badge-sm font-semibold uppercase tracking-wider py-2">
                                                <ShieldCheck className="size-3" /> Pro Active
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="card-title text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-base-content to-base-content/70 group-hover:from-primary group-hover:to-secondary mb-1">
                                        {org.name}
                                    </h2>
                                    <p className="text-base-content/60 text-sm line-clamp-2 min-h-10 mb-4">{org.description || "No description provided."}</p>

                                    <div className="flex flex-col gap-2 mb-6 text-sm text-base-content/70">
                                        <div className="flex items-center gap-2">
                                            <Users2 className="size-4 text-primary" />
                                            <span className="font-semibold text-base-content">{org.members?.length || 1} Members</span>
                                        </div>
                                        {org.website && (
                                            <div className="flex items-center gap-2">
                                                <Globe className="size-4 text-secondary" />
                                                <a href={org.website} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors hover:underline truncate">{org.website}</a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-actions mt-auto border-t border-base-300 pt-5 flex items-center justify-between">
                                        <span className="text-xs text-base-content/40 font-medium">Created {formatDistanceToNow(new Date(org.createdAt))} ago</span>
                                        <Link to={`/organizations/${org._id}`} className="btn btn-primary btn-sm btn-outline gap-1 group-hover:bg-primary group-hover:text-primary-content">
                                            Manage <ArrowRight className="size-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-base-100 rounded-3xl border-2 border-dashed border-base-300 shadow-sm">
                        <div className="bg-primary/10 size-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Building2 className="size-12 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">No workspaces yet</h3>
                        <p className="text-base-content/60 max-w-sm mx-auto mb-8 text-lg">
                            Create a workspace to invite your team, manage billing, and track collective progress.
                        </p>
                        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary px-8 shadow-xl shadow-primary/20">
                            Create Your First Workspace
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal modal-open backdrop-blur-sm">
                    <div className="modal-box max-w-lg shadow-2xl border border-base-300">
                        <h3 className="font-black text-2xl mb-8 flex items-center gap-2">
                            <Plus className="size-6 text-primary" />
                            New Workspace
                        </h3>

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="form-control">
                                <label className="label font-bold text-sm"><span className="label-text">Organization Name</span></label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Acme Corp"
                                    className="input input-bordered input-primary w-full focus:ring-2 focus:ring-primary/20"
                                    value={newOrg.name}
                                    onChange={e => setNewOrg({ ...newOrg, name: e.target.value })}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label font-bold text-sm"><span className="label-text">Description (Optional)</span></label>
                                <textarea
                                    placeholder="What does your team do?"
                                    className="textarea textarea-bordered focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    rows="3"
                                    value={newOrg.description}
                                    onChange={e => setNewOrg({ ...newOrg, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="form-control">
                                <label className="label font-bold text-sm"><span className="label-text">Website (Optional)</span></label>
                                <div className="relative">
                                    <Globe className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        className="input input-bordered w-full pl-10 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        value={newOrg.website}
                                        onChange={e => setNewOrg({ ...newOrg, website: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-action mt-8 pt-6 border-t border-base-300">
                                <button type="button" className="btn btn-ghost hover:bg-base-200" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary min-w-[120px]" disabled={createOrgMutation.isPending}>
                                    {createOrgMutation.isPending ? <span className="loading loading-spinner size-5"></span> : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setIsModalOpen(false)}>close</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default OrganizationsPage;
