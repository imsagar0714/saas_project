import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";

function DashboardHome() {
    const { user } = useAuth();
    const { activeWorkspace } = useWorkspace();

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
        </div>
    );
}

export default DashboardHome;