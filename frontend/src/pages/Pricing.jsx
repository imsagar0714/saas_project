import React from "react";

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      desc: "Perfect for getting started",
      features: ["1 Project", "2 Members", "Basic Support"],
      highlight: false,
    },
    {
      name: "Pro",
      price: "₹499",
      desc: "Best for growing teams",
      features: ["5 Projects", "5 Members", "Priority Support"],
      highlight: true,
    },
    {
      name: "Business",
      price: "₹999",
      desc: "For serious businesses",
      features: ["20 Projects", "20 Members", "24/7 Support"],
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl text-center font-bold mb-10">
        Pricing Plans
      </h1>

      <div className="flex flex-col md:flex-row gap-6 justify-center">
        {plans.map(function (plan, index) {
          return (
            <div
              key={index}
              className={
                "w-full md:w-1/3 p-6 rounded-xl border " +
                (plan.highlight
                  ? "border-blue-500 bg-gray-900"
                  : "border-gray-700 bg-gray-800")
              }
            >
              <h2 className="text-2xl font-semibold">{plan.name}</h2>
              <p className="text-gray-400 mt-2">{plan.desc}</p>

              <h3 className="text-3xl mt-4 font-bold">{plan.price}</h3>

              <ul className="mt-4">
                {plan.features.map(function (f, i) {
                  return (
                    <li key={i} className="text-gray-300">
                      • {f}
                    </li>
                  );
                })}
              </ul>

              <button
                className={
                  "mt-6 w-full py-2 rounded-lg " +
                  (plan.highlight
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-gray-700 hover:bg-gray-600")
                }
                onClick={function () {
                  alert(plan.name + " selected");
                }}
              >
                Buy Now
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Pricing;