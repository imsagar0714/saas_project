import { createContext, useContext, useEffect, useState } from "react";
import API from "../api";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
    const { user, loading: authLoading } = useAuth();

    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspaceState] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchWorkspaces = async () => {
        try {
            const res = await API.get("/my-workspaces/");
            const data = res.data;
            setWorkspaces(data);

            const savedWorkspaceId = localStorage.getItem("activeWorkspaceId");

            if (savedWorkspaceId) {
                const found = data.find(
                    (workspace) => workspace.id === Number(savedWorkspaceId)
                );

                if (found) {
                    setActiveWorkspaceState(found);
                } else if (data.length > 0) {
                    setActiveWorkspaceState(data[0]);
                    localStorage.setItem("activeWorkspaceId", data[0].id);
                }
            } else if (data.length > 0) {
                setActiveWorkspaceState(data[0]);
                localStorage.setItem("activeWorkspaceId", data[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch workspaces:", error);
            setWorkspaces([]);
            setActiveWorkspaceState(null);
        } finally {
            setLoading(false);
        }
    };

    const setActiveWorkspace = (workspace) => {
        setActiveWorkspaceState(workspace);
        localStorage.setItem("activeWorkspaceId", workspace.id);
    };

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                fetchWorkspaces();
            } else {
                setWorkspaces([]);
                setActiveWorkspaceState(null);
                localStorage.removeItem("activeWorkspaceId");
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    return (
        <WorkspaceContext.Provider
            value={{
                workspaces,
                activeWorkspace,
                setActiveWorkspace,
                loading,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    return useContext(WorkspaceContext);
}