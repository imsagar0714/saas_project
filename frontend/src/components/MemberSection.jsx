import { useEffect, useState } from "react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";

function MemberSection() {
    const { activeWorkspace } = useWorkspace();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await API.get("/members/");
            setMembers(res.data);
        } catch (error) {
            console.error("Failed to fetch members:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!email.trim()) {
            alert("Email is required");
            return;
        }

        try {
            await API.post("/members/", { email, role });
            setEmail("");
            setRole("member");
            fetchMembers();
        } catch (error) {
            console.error("Failed to add member:", error);
            alert(error?.response?.data?.detail || "Failed to add member");
        }
    };

    const handleRoleChange = async (membershipId, newRole) => {
        try {
            await API.put(`/members/${membershipId}/`, { role: newRole });
            fetchMembers();
        } catch (error) {
            console.error("Failed to update role:", error);
            alert(error?.response?.data?.detail || "Failed to update role");
        }
    };

    const handleRemoveMember = async (membershipId) => {
        const confirmRemove = window.confirm("Are you sure you want to remove this member?");
        if (!confirmRemove) return;

        try {
            await API.delete(`/members/${membershipId}/`);
            fetchMembers();
        } catch (error) {
            console.error("Failed to remove member:", error);
            alert(error?.response?.data?.detail || "Failed to remove member");
        }
    };

    useEffect(() => {
        if (activeWorkspace) {
            fetchMembers();
        }
    }, [activeWorkspace]);

    return (
        <div className="space-y-8">
            {/* Add Member */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <h2 className="mb-4 text-2xl font-bold text-white">Add Team Member</h2>

                <div className="grid gap-4 md:grid-cols-3">
                    <input
                        type="email"
                        placeholder="User Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-blue-500"
                    />

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button
                        onClick={handleAddMember}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
                    >
                        Add Member
                    </button>
                </div>
            </div>

            {/* Members List */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Workspace Members</h2>
                    <button
                        onClick={fetchMembers}
                        className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p className="text-slate-300">Loading members...</p>
                ) : members.length === 0 ? (
                    <p className="text-slate-400">No members found in this workspace.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-md"
                            >
                                <h3 className="text-xl font-semibold text-white">
                                    {member.user_name || "No Name"}
                                </h3>
                                <p className="mt-1 text-sm text-slate-300">{member.user_email}</p>

                                <div className="mt-4">
                                    <p className="text-sm text-slate-400">Role</p>
                                    <select
                                        value={member.role}
                                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="mt-5 rounded-xl bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500"
                                >
                                    Remove Member
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MemberSection;