import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

export default function Pricing() {
  const { token, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(null); // 'monthly' | 'yearly'
  const [msg, setMsg] = useState("");

  const plans = [
    {
      id: "monthly",
      label: "Monthly",
      price: "₹999",
      period: "/month",
      features: [
        "Enter up to 5 Stableford scores",
        "Monthly prize draw entry",
        "Choose your charity",
        "10% goes to charity",
        "Winner verification access",
      ],
      accent: "#4ade80",
      popular: false,
    },
    {
      id: "yearly",
      label: "Yearly",
      price: "₹8,999",
      period: "/year",
      save: "Save ₹2,989",
      features: [
        "Everything in Monthly",
        "2 months free",
        "Priority draw entry",
        "Increased charity contribution",
        "Early access to new features",
      ],
      accent: "#a78bfa",
      popular: true,
    },
  ];

  const handleSubscribe = async (plan) => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (user?.subscription?.status === "active") {
      setMsg("Tumhara subscription already active hai!");
      return;
    }

    setLoading(plan);
    setMsg("");

    try {
      // Step 1: Create order
      const res = await fetch(`${API}/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "Order create nahi hua.");
        setLoading(null);
        return;
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "GolfCharity",
        description: `${plan === "monthly" ? "Monthly" : "Yearly"} Subscription`,
        order_id: data.orderId,
        handler: async function (response) {
          // Step 3: Verify payment
          const verifyRes = await fetch(`${API}/payment/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyRes.ok) {
            setMsg("✓ Payment successful! Subscription activate ho gayi.");
            setTimeout(() => (window.location.href = "/dashboard"), 2000);
          } else {
            setMsg(verifyData.message || "Verification fail ho gayi.");
          }
          setLoading(null);
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#4ade80",
        },
        modal: {
          ondismiss: () => {
            setMsg("Payment cancel kar di.");
            setLoading(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMsg("Server se connect nahi ho paya.");
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070910",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .plan-card { background: #0d0f18; border-radius: 20px; padding: 36px 28px; transition: all 0.25s; position: relative; overflow: hidden; }
        .plan-card:hover { transform: translateY(-4px); }
        .feature-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: 14px; color: #9ca3af; border-bottom: 1px solid #1a1d2e; }
        .feature-item:last-child { border-bottom: none; }
        .sub-btn { border: none; cursor: pointer; border-radius: 12px; padding: 14px 28px; font-size: 15px; font-weight: 700; font-family: inherit; width: 100%; transition: all 0.2s; }
        .sub-btn:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.9; }
        .sub-btn:disabled { opacity: 0.5; cursor: default; }
      `}</style>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1a1d26",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          height: 60,
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "#fff",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: "linear-gradient(135deg,#4ade80,#22c55e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
            }}
          >
            ⛳
          </div>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            GolfCharity
          </span>
        </a>
      </div>

      {/* Hero */}
      <div
        style={{ textAlign: "center", padding: "60px 24px 48px", position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 300,
            background: "radial-gradient(ellipse, #4ade8012 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            background: "#052e16",
            border: "1px solid #4ade8033",
            borderRadius: 100,
            padding: "6px 16px",
            fontSize: 12,
            color: "#4ade80",
            fontWeight: 600,
            letterSpacing: 0.5,
            display: "inline-block",
            marginBottom: 20,
          }}
        >
          SIMPLE PRICING
        </span>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 5vw, 48px)",
            letterSpacing: -2,
            marginBottom: 16,
          }}
        >
          Choose Your Plan
        </h1>
        <p style={{ color: "#6b7280", fontSize: 16, maxWidth: 440, margin: "0 auto" }}>
          Subscribe, enter scores, win prizes, and support charity — all in one platform.
        </p>

        {msg && (
          <div
            style={{
              display: "inline-block",
              marginTop: 20,
              padding: "10px 24px",
              borderRadius: 100,
              background: msg.startsWith("✓") ? "#052e16" : "#1a0a0a",
              border: `1px solid ${msg.startsWith("✓") ? "#4ade80" : "#ef4444"}44`,
              color: msg.startsWith("✓") ? "#4ade80" : "#ef4444",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {msg}
          </div>
        )}
      </div>

      {/* Plans */}
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "0 24px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="plan-card"
            style={{
              border: `1px solid ${plan.popular ? plan.accent + "44" : "#1a1d2e"}`,
              boxShadow: plan.popular ? `0 0 40px ${plan.accent}10` : "none",
            }}
          >
            {plan.popular && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "linear-gradient(135deg,#a78bfa,#7c3aed)",
                  borderRadius: 100,
                  padding: "4px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                MOST POPULAR
              </div>
            )}

            <p
              style={{
                color: plan.accent,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              {plan.label.toUpperCase()}
            </p>

            <div
              style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}
            >
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 42,
                  fontWeight: 800,
                }}
              >
                {plan.price}
              </span>
              <span style={{ color: "#6b7280", fontSize: 14 }}>{plan.period}</span>
            </div>

            {plan.save && (
              <span
                style={{
                  background: "#1a0a3d",
                  border: "1px solid #a78bfa33",
                  borderRadius: 100,
                  padding: "3px 10px",
                  fontSize: 12,
                  color: "#a78bfa",
                  fontWeight: 600,
                  display: "inline-block",
                  marginBottom: 20,
                }}
              >
                {plan.save}
              </span>
            )}

            <div style={{ margin: "24px 0" }}>
              {plan.features.map((f) => (
                <div key={f} className="feature-item">
                  <span style={{ color: plan.accent, fontSize: 16 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>

            <button
              className="sub-btn"
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id}
              style={{
                background:
                  plan.id === "yearly"
                    ? "linear-gradient(135deg,#a78bfa,#7c3aed)"
                    : "linear-gradient(135deg,#4ade80,#22c55e)",
                color: plan.id === "yearly" ? "#fff" : "#000",
              }}
            >
              {loading === plan.id
                ? "Processing..."
                : user?.subscription?.status === "active"
                ? "Already Subscribed ✓"
                : `Subscribe ${plan.label}`}
            </button>
          </div>
        ))}
      </div>

      {/* Note */}
      <div style={{ textAlign: "center", paddingBottom: 40 }}>
        <p style={{ color: "#4b5563", fontSize: 13 }}>
          🔒 Secure payment via Razorpay · Cancel anytime · 10% goes to your chosen charity
        </p>
      </div>
    </div>
  );
}