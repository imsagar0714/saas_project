import { useEffect, useState } from "react";
import API from "../api";

function BillingPage() {
    const [currentBilling, setCurrentBilling] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔥 Fetch current billing + plans
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
            console.error("Billing fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBillingData();
    }, []);

    // 🔥 HANDLE UPGRADE (RAZORPAY FLOW)
    const handleUpgrade = async (planId) => {
        try {
            // STEP 1 → create subscription from backend
            const res = await API.post("/billing/subscribe/", {
                plan_id: planId,
                billing_cycle: "monthly",
            });

            const { subscription_id, razorpay_key } = res.data;

            // STEP 2 → Razorpay checkout config
            const options = {
                key: razorpay_key,
                subscription_id: subscription_id,
                name: "My SaaS",
                description: "Subscription Plan",

                handler: function (response) {
                    // 🔥 This runs AFTER successful payment
                    console.log("Payment success:", response);

                    alert("Payment successful!");

                    // 🔥 Refresh UI (important)
                    fetchBillingData();
                },

                theme: {
                    color: "#2563eb",
                },
            };

            // STEP 3 → open Razorpay popup
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Upgrade error:", err);
            alert("Payment failed");
        }
    };

    if (loading) {
        return (
            <div className="text-white text-center mt-20">
                Loading billing data...
            </div>
        );
    }

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Billing</h1>

            {/* 🔥 CURRENT PLAN */}
            <div className="mb-8 p-6 rounded-2xl bg-gray-900 border border-gray-700">
                <h2 className="text-xl font-semibold mb-2">Current Plan</h2>

                {currentBilling ? (
                    <>
                        <p>Plan: <b>{currentBilling.plan?.name}</b></p>
                        <p>Status: {currentBilling.status}</p>
                        <p>Billing: {currentBilling.billing_cycle}</p>

                        <div className="mt-4">
                            <p>Max Projects: {currentBilling.plan?.max_projects}</p>
                            <p>Max Members: {currentBilling.plan?.max_members}</p>
                        </div>
                    </>
                ) : (
                    <p>No active subscription</p>
                )}
            </div>

            {/* 🔥 ALL PLANS */}
            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isCurrent =
                        currentBilling?.plan?.id === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className="p-6 rounded-2xl bg-gray-800 border border-gray-700"
                        >
                            <h2 className="text-2xl font-semibold">
                                {plan.name}
                            </h2>

                            <p className="text-3xl mt-3 font-bold">
                                ₹{plan.price_monthly}
                            </p>

                            <div className="mt-4 text-sm text-gray-300">
                                <p>Projects: {plan.max_projects}</p>
                                <p>Members: {plan.max_members}</p>
                            </div>

                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={isCurrent}
                                className={`mt-6 w-full py-2 rounded-lg ${
                                    isCurrent
                                        ? "bg-gray-600 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-500"
                                }`}
                            >
                                {isCurrent ? "Current Plan" : "Upgrade"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default BillingPage;