import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";

function Dashboard() {
    const { user, logout } = useAuth();
    const {
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        loading: workspaceLoading,
    } = useWorkspace();

    return (
        <div style={{ padding: "40px" }}>
            <h1>Dashboard</h1>

            <h2>Welcome, {user?.name || user?.email}</h2>
            <p>Email: {user?.email}</p>

            <hr style={{ margin: "20px 0" }} />

            <h3>Your Workspaces</h3>

            {workspaceLoading ? (
                <p>Loading workspaces...</p>
            ) : workspaces.length === 0 ? (
                <p>No workspaces found</p>
            ) : (
                <div>
                    {workspaces.map((workspace) => (
                        <div
                            key={workspace.id}
                            style={{
                                border: "1px solid #ccc",
                                padding: "10px",
                                marginBottom: "10px",
                                borderRadius: "8px",
                                backgroundColor:
                                    activeWorkspace?.id === workspace.id
                                        ? "#dbeafe"
                                        : "#f9f9f9",
                                cursor: "pointer",
                            }}
                            onClick={() => setActiveWorkspace(workspace)}
                        >
                            <strong>{workspace.name}</strong> — {workspace.role}
                            {activeWorkspace?.id === workspace.id && (
                                <span> (Active)</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <hr style={{ margin: "20px 0" }} />

            <h3>Current Active Workspace</h3>
            {activeWorkspace ? (
                <p>
                    {activeWorkspace.name} ({activeWorkspace.role})
                </p>
            ) : (
                <p>No active workspace selected</p>
            )}

            <br />

            <button onClick={logout}>Logout</button>
        </div>
    );
}

export default Dashboard;