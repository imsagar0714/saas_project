import { useEffect, useState } from "react";
import API from "../api";

function BillingPage() {
    const [currentBilling, setCurrentBilling] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBillingData = async () => {
        try {
            setLoading(true);

            const [currentRes, plansRes] = await Promise.all([
                API.get("/billing/current/"),
                API.get("/billing/plans/"),
            ]);

            setCurrentBilling(currentRes.data);
            setPlans(plansRes.data);
        } catch (error) {
            console.error("Failed to fetch billing data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBillingData();
    }, []);

    if (loading) {
        return <p className="text-slate-300">Loading billing info...</p>;
    }

    return (
        <div className="space-y-8">
            {/* Current Plan */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <h2 className="mb-4 text-2xl font-bold text-white">Current Subscription</h2>

                {currentBilling ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl bg-slate-900/80 p-5">
                            <p className="text-sm text-slate-400">Workspace</p>
                            <h3 className="mt-2 text-xl font-semibold text-white">
                                {currentBilling.tenant_name}
                            </h3>
                        </div>

                        <div className="rounded-2xl bg-slate-900/80 p-5">
                            <p className="text-sm text-slate-400">Current Plan</p>
                            <h3 className="mt-2 text-xl font-semibold text-white">
                                {currentBilling.plan?.name}
                            </h3>
                        </div>

                        <div className="rounded-2xl bg-slate-900/80 p-5">
                            <p className="text-sm text-slate-400">Status</p>
                            <h3 className="mt-2 text-xl font-semibold text-white capitalize">
                                {currentBilling.status}
                            </h3>
                        </div>

                        <div className="rounded-2xl bg-slate-900/80 p-5">
                            <p className="text-sm text-slate-400">Billing Cycle</p>
                            <h3 className="mt-2 text-xl font-semibold text-white capitalize">
                                {currentBilling.billing_cycle}
                            </h3>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-400">No billing data found.</p>
                )}
            </div>

            {/* Limits */}
            {currentBilling?.plan && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                    <h2 className="mb-4 text-2xl font-bold text-white">Current Plan Limits</h2>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl bg-slate-900/80 p-5">
                            <p className="text-sm text-slate-400">Max Members</p>
                            <h3 className="mt-2 text-xl font-semibold text-white">
                                {currentBilling.plan.max_members}
                            </h3>
                        </div>

                        <div className="rounded-2xl bg-slate-900/80 p-5">
                            <p className="text-sm text-slate-400">Max Projects</p>
                            <h3 className="mt-2 text-xl font-semibold text-white">
                                {currentBilling.plan.max_projects}
                            </h3>
                        </div>

                        <div className="rounded-2xl bg-slate-900/80 p-5">
                            <p className="text-sm text-slate-400">Invitations</p>
                            <h3 className="mt-2 text-xl font-semibold text-white">
                                {currentBilling.plan.can_invite ? "Enabled" : "Disabled"}
                            </h3>
                        </div>

                        <div className="rounded-2xl bg-slate-900/80 p-5">
                            <p className="text-sm text-slate-400">Priority Support</p>
                            <h3 className="mt-2 text-xl font-semibold text-white">
                                {currentBilling.plan.has_priority_support ? "Enabled" : "Disabled"}
                            </h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Plans */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <h2 className="mb-6 text-2xl font-bold text-white">Available Plans</h2>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {plans.map((plan) => {
                        const isCurrent = currentBilling?.plan?.id === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`rounded-2xl border p-6 shadow-md ${
                                    isCurrent
                                        ? "border-blue-500 bg-blue-950/40"
                                        : "border-white/10 bg-slate-900/80"
                                }`}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                                    {isCurrent && (
                                        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                                            Current
                                        </span>
                                    )}
                                </div>

                                <p className="text-slate-300">
                                    ₹{plan.price_monthly}/month
                                </p>
                                <p className="mb-4 text-sm text-slate-400">
                                    ₹{plan.price_yearly}/year
                                </p>

                                <ul className="space-y-2 text-sm text-slate-300">
                                    <li>👥 Max Members: {plan.max_members}</li>
                                    <li>📁 Max Projects: {plan.max_projects}</li>
                                    <li>✉️ Invite Members: {plan.can_invite ? "Yes" : "No"}</li>
                                    <li>⚡ Priority Support: {plan.has_priority_support ? "Yes" : "No"}</li>
                                </ul>

                                <button
                                    className={`mt-6 w-full rounded-2xl px-4 py-3 font-semibold text-white transition ${
                                        isCurrent
                                            ? "bg-slate-700 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-500"
                                    }`}
                                    disabled={isCurrent}
                                >
                                    {isCurrent ? "Current Plan" : "Upgrade (Coming Soon)"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default BillingPage;