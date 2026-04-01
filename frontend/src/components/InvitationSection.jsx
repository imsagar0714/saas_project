import { useEffect, useState } from "react";
import API from "../api";
import { useWorkspace } from "../context/WorkspaceContext";

function InvitationSection() {
    const { activeWorkspace } = useWorkspace();

    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            const res = await API.get("/invitations/");
            setInvitations(res.data);
        } catch (error) {
            console.error("Failed to fetch invitations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!email.trim()) {
            alert("Email is required");
            return;
        }

        try {
            await API.post("/invitations/", { email, role });
            setEmail("");
            setRole("member");
            fetchInvitations();
        } catch (error) {
            console.error("Failed to invite member:", error);
            alert(error?.response?.data?.detail || "Failed to invite member");
        }
    };

    const handleCancelInvite = async (invitationId) => {
        const confirmCancel = window.confirm("Cancel this invitation?");
        if (!confirmCancel) return;

        try {
            await API.delete(`/invitations/${invitationId}/`);
            fetchInvitations();
        } catch (error) {
            console.error("Failed to cancel invitation:", error);
            alert(error?.response?.data?.detail || "Failed to cancel invitation");
        }
    };

    useEffect(() => {
        if (activeWorkspace) {
            fetchInvitations();
        }
    }, [activeWorkspace]);

    return (
        <div className="space-y-8">
            {/* Invite Form */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <h2 className="mb-4 text-2xl font-bold text-white">Invite Member</h2>

                <div className="grid gap-4 md:grid-cols-3">
                    <input
                        type="email"
                        placeholder="Invite Email"
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
                        onClick={handleInvite}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
                    >
                        Send Invite
                    </button>
                </div>
            </div>

            {/* Invite List */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Pending Invitations</h2>
                    <button
                        onClick={fetchInvitations}
                        className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p className="text-slate-300">Loading invitations...</p>
                ) : invitations.length === 0 ? (
                    <p className="text-slate-400">No pending invitations.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {invitations.map((invite) => (
                            <div
                                key={invite.id}
                                className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-md"
                            >
                                <h3 className="text-lg font-semibold text-white">{invite.email}</h3>
                                <p className="mt-1 text-sm text-slate-300">
                                    Role: {invite.role}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Invited by: {invite.invited_by_email}
                                </p>

                                <button
                                    onClick={() => handleCancelInvite(invite.id)}
                                    className="mt-5 rounded-xl bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500"
                                >
                                    Cancel Invite
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InvitationSection;