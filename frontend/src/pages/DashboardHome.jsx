import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { useNavigate } from "react-router-dom";
function DashboardHome() {
    const { user } = useAuth();
    const { activeWorkspace } = useWorkspace();
    const navigate = useNavigate();
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <p className="text-sm uppercase tracking-widest text-slate-400">Welcome</p>
                <h2 className="mt-2 text-2xl font-bold">{user?.name || user?.email}</h2>
                <p className="mt-2 text-slate-300">
                    You are now inside your multi-tenant SaaS dashboard.
                </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <p className="text-sm uppercase tracking-widest text-slate-400">Workspace</p>
                <h2 className="mt-2 text-2xl font-bold">
                    {activeWorkspace?.name || "No Workspace"}
                </h2>
                <p className="mt-2 text-slate-300">
                    Role: {activeWorkspace?.role || "N/A"}
                </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <p className="text-sm uppercase tracking-widest text-slate-400">Status</p>
                <h2 className="mt-2 text-2xl font-bold">System Active</h2>
                <p className="mt-2 text-slate-300">
                    Auth, workspace context, RBAC, and project system are working.
                </p>
            </div>
            <div className="rounded-2xl border border-blue-500 bg-blue-500/10 p-6 shadow-lg">
                <p className="text-sm uppercase tracking-widest text-blue-400">
                    Upgrade
                </p>
                <h2 className="mt-2 text-2xl font-bold">Upgrade Plan</h2>
                <p className="mt-2 text-slate-300">
                    Unlock more projects and team members.
                </p>

                <button
                    onClick={() => navigate("/pricing")}
                    className="mt-4 w-full rounded-lg bg-blue-600 py-2 hover:bg-blue-500"
                >
                    View Plans
                </button>
            </div>
        </div>
    );
}

export default DashboardHome;