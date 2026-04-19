import API from "../api";

function Pricing() {
  const plans = [
    { id: 1, name: "Free", price: 0 },
    { id: 2, name: "Pro", price: 499 },
    { id: 3, name: "Business", price: 999 },
  ];

  const handleSubscribe = async (planId) => {
    try {
      const res = await API.post("/subscribe/", {
        plan_id: planId,
        billing_cycle: "monthly",
      });

      const { subscription_id, razorpay_key } = res.data;

      const options = {
        key: razorpay_key,
        subscription_id: subscription_id,
        name: "My SaaS",
        description: "Subscription",

        handler: function () {
          alert("Payment successful");
        },

        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Payment failed");
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
              ₹{plan.price}
            </h3>

            <button
              className="mt-6 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
              onClick={() => handleSubscribe(plan.id)}
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pricing;