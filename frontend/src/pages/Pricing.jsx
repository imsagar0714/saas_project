import { useEffect, useState } from "react";
import API from "../api";

function Pricing() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // ✅ FIXED ROUTE
        const res = await API.get("/billing/plans/");
        setPlans(res.data);
      } catch (err) {
        console.error("Error fetching plans", err);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (plan) => {
    try {
      // ❌ Skip free plan
      if (plan.name.toLowerCase() === "free") {
        alert("Free plan activated (no payment needed)");
        return;
      }

      // ✅ FIXED ROUTE
      const res = await API.post("/billing/subscribe/", {
        plan_id: plan.id,
        billing_cycle: "monthly",
      });

      console.log("SUBSCRIBE RESPONSE:", res.data);

      const { subscription_id, razorpay_key } = res.data;

      const options = {
        key: razorpay_key,
        subscription_id: subscription_id,
        name: "My SaaS",
        description: `${plan.name} Plan Subscription`,

        handler: async function (response) {
          try {
            // ✅ FIXED ROUTE
            await API.post("/billing/verify/", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });

            alert("Payment verified & subscription activated 🚀");
          } catch (err) {
            console.error(err);
            alert("Payment verification failed");
          }
        },

        modal: {
          ondismiss: function () {
            console.log("Payment popup closed");
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("SUBSCRIBE ERROR:", err.response?.data || err);
      alert(JSON.stringify(err.response?.data || "Payment failed"));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl text-center font-bold mb-10">
        Pricing Plans
      </h1>

      <div className="flex flex-col md:flex-row gap-6 justify-center">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="w-full md:w-1/3 p-6 rounded-xl border border-gray-700 bg-gray-800"
          >
            <h2 className="text-2xl font-semibold">{plan.name}</h2>

            <h3 className="text-3xl mt-4 font-bold">
              ₹{plan.price_monthly}
            </h3>

            <button
              className="mt-6 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
              onClick={() => handleSubscribe(plan)}
            >
              {plan.name === "Free" ? "Start Free" : "Buy Now"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pricing;