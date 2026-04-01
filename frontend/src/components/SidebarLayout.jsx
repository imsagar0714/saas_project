import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";

function SidebarLayout() {
    const { user, logout } = useAuth();
    const {
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        loading: workspaceLoading,
    } = useWorkspace();

    const navItemClass = ({ isActive }) =>
        `block rounded-xl px-4 py-3 text-sm font-medium transition ${
            isActive
                ? "bg-blue-600 text-white shadow"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside className="w-72 border-r border-white/10 bg-slate-900/80 p-6 backdrop-blur">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight">SaaS App</h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Multi-tenant workspace platform
                        </p>
                    </div>

                    {/* User */}
                    <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-widest text-slate-400">Logged in as</p>
                        <h2 className="mt-2 text-lg font-semibold">{user?.name || "No Name"}</h2>
                        <p className="text-sm text-slate-300">{user?.email}</p>
                    </div>

                    {/* Workspace Selector */}
                    <div className="mb-8">
                        <p className="mb-3 text-xs uppercase tracking-widest text-slate-400">
                            Active Workspace
                        </p>

                        {workspaceLoading ? (
                            <p className="text-sm text-slate-400">Loading workspaces...</p>
                        ) : (
                            <select
                                value={activeWorkspace?.id || ""}
                                onChange={(e) => {
                                    const selected = workspaces.find(
                                        (w) => w.id === Number(e.target.value)
                                    );
                                    if (selected) setActiveWorkspace(selected);
                                }}
                                className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                            >
                                {workspaces.map((workspace) => (
                                    <option key={workspace.id} value={workspace.id}>
                                        {workspace.name} ({workspace.role})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-2">
                        <NavLink to="/dashboard" end className={navItemClass}>
                            Dashboard Home
                        </NavLink>

                        <NavLink to="/dashboard/projects" className={navItemClass}>
                            Projects
                        </NavLink>

                        <NavLink to="/dashboard/members" className={navItemClass}>
                            Members
                        </NavLink>
                        <NavLink to="/dashboard/billing" className={navItemClass}>
                            Billing
                        </NavLink>
                    </nav>

                    {/* Logout */}
                    <div className="mt-10">
                        <button
                            onClick={logout}
                            className="w-full rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-500"
                        >
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 px-8 py-8">
                    {/* Top header */}
                    <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                        <h2 className="text-3xl font-bold">
                            {activeWorkspace ? activeWorkspace.name : "No Workspace Selected"}
                        </h2>
                        <p className="mt-2 text-slate-300">
                            {activeWorkspace
                                ? `Current role: ${activeWorkspace.role}`
                                : "Select a workspace to continue"}
                        </p>
                    </div>

                    {/* Nested route content */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default SidebarLayout;