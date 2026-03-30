import { useEffect, useState } from "react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";

function ProjectSection() {
    const { activeWorkspace } = useWorkspace();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await API.get("/projects/");
            setProjects(res.data);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!name.trim()) {
            alert("Project name is required");
            return;
        }

        try {
            await API.post("/projects/", {
                name,
                description,
            });

            setName("");
            setDescription("");
            fetchProjects();
        } catch (error) {
            console.error("Failed to create project:", error);
            alert(error?.response?.data?.detail || "Failed to create project");
        }
    };

    const handleDeleteProject = async (projectId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this project?");
        if (!confirmDelete) return;

        try {
            await API.delete(`/projects/${projectId}/`);
            fetchProjects();
        } catch (error) {
            console.error("Failed to delete project:", error);
            alert(error?.response?.data?.detail || "Failed to delete project");
        }
    };

    const startEditing = (project) => {
        setEditingProjectId(project.id);
        setEditName(project.name);
        setEditDescription(project.description || "");
    };

    const cancelEditing = () => {
        setEditingProjectId(null);
        setEditName("");
        setEditDescription("");
    };

    const handleUpdateProject = async () => {
        if (!editName.trim()) {
            alert("Project name is required");
            return;
        }

        try {
            await API.put(`/projects/${editingProjectId}/`, {
                name: editName,
                description: editDescription,
            });

            cancelEditing();
            fetchProjects();
        } catch (error) {
            console.error("Failed to update project:", error);
            alert(error?.response?.data?.detail || "Failed to update project");
        }
    };

    useEffect(() => {
        if (activeWorkspace) {
            fetchProjects();
        }
    }, [activeWorkspace]);

    return (
        <div className="mt-8 space-y-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <h2 className="mb-4 text-2xl font-bold text-white">Create New Project</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <input
                        type="text"
                        placeholder="Project Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-blue-500"
                    />

                    <input
                        type="text"
                        placeholder="Project Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-blue-500"
                    />
                </div>

                <button
                    onClick={handleCreateProject}
                    className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
                >
                    Create Project
                </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Projects</h2>
                    <button
                        onClick={fetchProjects}
                        className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p className="text-slate-300">Loading projects...</p>
                ) : projects.length === 0 ? (
                    <p className="text-slate-400">No projects found in this workspace.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-md transition hover:scale-[1.01]"
                            >
                                {editingProjectId === project.id ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-blue-500"
                                        />

                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            rows="4"
                                            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-blue-500"
                                        />

                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleUpdateProject}
                                                className="rounded-xl bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-500"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="rounded-xl bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-600"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                                        <p className="mt-2 min-h-[48px] text-sm text-slate-300">
                                            {project.description || "No description"}
                                        </p>

                                        <div className="mt-4 space-y-1 text-sm text-slate-400">
                                            <p>
                                                <span className="font-medium text-slate-300">Workspace:</span>{" "}
                                                {project.tenant_name}
                                            </p>
                                            <p>
                                                <span className="font-medium text-slate-300">Created By:</span>{" "}
                                                {project.created_by_email}
                                            </p>
                                        </div>

                                        <div className="mt-5 flex gap-3">
                                            <button
                                                onClick={() => startEditing(project)}
                                                className="rounded-xl bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-400"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="rounded-xl bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProjectSection;