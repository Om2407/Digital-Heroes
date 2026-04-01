import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

const statCard = (label, value, sub, accent) => (
  <div
    key={label}
    style={{
      background: "#0f1117",
      border: `1px solid ${accent}33`,
      borderRadius: 16,
      padding: "28px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: `${accent}18`,
        filter: "blur(20px)",
      }}
    />
    <span style={{ color: "#6b7280", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
      {label}
    </span>
    <span style={{ color: "#fff", fontSize: 28, fontWeight: 700, fontFamily: "'Clash Display', sans-serif" }}>
      {value}
    </span>
    {sub && <span style={{ color: accent, fontSize: 12 }}>{sub}</span>}
  </div>
);

export default function Dashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [scores, setScores] = useState([]);
  const [scoreInput, setScoreInput] = useState("");
  const [scoreDate, setScoreDate] = useState("");
  const [scoreMsg, setScoreMsg] = useState("");
  const [charity, setCharity] = useState(null);
  const [draws, setDraws] = useState([]);
  const [winnings, setWinnings] = useState({ total: 0, status: "—" });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!token) return;
    fetchAll();
  }, [token]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [scoresRes, charityRes, drawsRes] = await Promise.all([
        fetch(`${API}/scores`, { headers }),
        fetch(`${API}/charity/my`, { headers }),
        fetch(`${API}/draw/my`, { headers }),
      ]);
      if (scoresRes.ok) setScores(await scoresRes.json());
      if (charityRes.ok) setCharity(await charityRes.json());
      if (drawsRes.ok) setDraws(await drawsRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const submitScore = async () => {
    if (!scoreInput || !scoreDate) return setScoreMsg("Score aur date dono bharo.");
    const val = parseInt(scoreInput);
    if (val < 1 || val > 45) return setScoreMsg("Score 1–45 ke beech hona chahiye.");
    setScoreMsg("");
    try {
      const res = await fetch(`${API}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ score: val, date: scoreDate }),
      });
      const data = await res.json();
      if (res.ok) {
        setScores(data.scores || []);
        setScoreInput("");
        setScoreDate("");
        setScoreMsg("✓ Score add ho gaya!");
      } else {
        setScoreMsg(data.message || "Error aaya.");
      }
    } catch {
      setScoreMsg("Server se connect nahi ho paya.");
    }
  };

  const tabs = ["overview", "scores", "charity", "draws"];

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0f1117; } ::-webkit-scrollbar-thumb { background: #2a2d3a; border-radius: 3px; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        .tab-btn { background: none; border: none; cursor: pointer; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-family: inherit; transition: all 0.2s; }
        .tab-btn:hover { background: #1a1d26; }
        .score-row:hover { background: #13151f !important; }
        .action-btn { cursor: pointer; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600; font-family: inherit; transition: all 0.18s; }
        .action-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .inp { background: #13151f; border: 1px solid #2a2d3a; border-radius: 10px; color: #fff; padding: 12px 16px; font-size: 14px; font-family: inherit; width: 100%; outline: none; transition: border 0.2s; }
        .inp:focus { border-color: #4ade80; }
      `}</style>

      {/* Topbar */}
      <div style={{ borderBottom: "1px solid #1a1d26", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, background: "#080a0f", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4ade80,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⛳</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>GolfCharity</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#6b7280", fontSize: 14 }}>Hey, {user?.name?.split(" ")[0] || "Player"} 👋</span>
          <button className="action-btn" onClick={logout} style={{ background: "#1a1d26", color: "#ef4444", padding: "8px 16px" }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Subscription Badge */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: -1 }}>Dashboard</h1>
            <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>Apna golf journey track karo</p>
          </div>
          <div style={{ marginLeft: "auto", background: user?.subscription?.status === "active" ? "#052e16" : "#1a1107", border: `1px solid ${user?.subscription?.status === "active" ? "#4ade80" : "#f59e0b"}44`, borderRadius: 100, padding: "6px 16px", fontSize: 12, color: user?.subscription?.status === "active" ? "#4ade80" : "#f59e0b", fontWeight: 600 }}>
            {user?.subscription?.status === "active" ? "✓ Active Subscriber" : "⚠ No Active Plan"}
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 36 }}>
          {statCard("Total Scores", scores.length, "Last 5 retained", "#4ade80")}
          {statCard("Draws Entered", draws.length, "This month", "#60a5fa")}
          {statCard("Total Won", `£${winnings.total}`, winnings.status, "#f59e0b")}
          {statCard("Charity", charity?.name || "Not selected", charity ? "10% contribution" : "Select one", "#a78bfa")}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "#0f1117", padding: 6, borderRadius: 12, width: "fit-content" }}>
          {tabs.map(t => (
            <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{ color: tab === t ? "#fff" : "#6b7280", background: tab === t ? "#1e2130" : "none", fontWeight: tab === t ? 600 : 400, textTransform: "capitalize" }}>
              {t === "overview" ? "📊 Overview" : t === "scores" ? "⛳ Scores" : t === "charity" ? "💚 Charity" : "🎯 Draws"}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#4b5563", padding: 80, fontSize: 14 }}>Loading...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Recent Scores */}
                <div style={{ background: "#0f1117", borderRadius: 16, border: "1px solid #1a1d26", padding: 24 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, marginBottom: 16, color: "#4ade80" }}>Recent Scores</h3>
                  {scores.length === 0 ? <p style={{ color: "#4b5563", fontSize: 14 }}>Koi score nahi hai abhi.</p> : scores.slice(0, 5).map((s, i) => (
                    <div key={i} className="score-row" style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1a1d26", transition: "background 0.15s", borderRadius: 6, padding: "10px 8px" }}>
                      <span style={{ color: "#9ca3af", fontSize: 13 }}>{new Date(s.date).toLocaleDateString("en-GB")}</span>
                      <span style={{ color: "#fff", fontWeight: 600 }}>{s.score} pts</span>
                    </div>
                  ))}
                </div>
                {/* Subscription Info */}
                <div style={{ background: "#0f1117", borderRadius: 16, border: "1px solid #1a1d26", padding: 24 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, marginBottom: 16, color: "#60a5fa" }}>Subscription</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      ["Plan", user?.subscription?.plan || "—"],
                      ["Status", user?.subscription?.status || "inactive"],
                      ["Renewal", user?.subscription?.renewalDate ? new Date(user.subscription.renewalDate).toLocaleDateString("en-GB") : "—"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                        <span style={{ color: "#6b7280" }}>{k}</span>
                        <span style={{ color: "#fff", fontWeight: 500, textTransform: "capitalize" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {user?.subscription?.status !== "active" && (
                    <button className="action-btn" onClick={() => window.location.href = "/pricing"} style={{ background: "linear-gradient(135deg,#4ade80,#22c55e)", color: "#000", width: "100%", marginTop: 20 }}>
                      Subscribe Now
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SCORES TAB */}
            {tab === "scores" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Add Score */}
                <div style={{ background: "#0f1117", borderRadius: 16, border: "1px solid #1a1d26", padding: 24 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, marginBottom: 20, color: "#4ade80" }}>New Score Add Karo</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={{ color: "#6b7280", fontSize: 12, letterSpacing: 0.5, marginBottom: 6, display: "block" }}>STABLEFORD SCORE (1–45)</label>
                      <input className="inp" type="number" min={1} max={45} value={scoreInput} onChange={e => setScoreInput(e.target.value)} placeholder="e.g. 32" />
                    </div>
                    <div>
                      <label style={{ color: "#6b7280", fontSize: 12, letterSpacing: 0.5, marginBottom: 6, display: "block" }}>DATE</label>
                      <input className="inp" type="date" value={scoreDate} onChange={e => setScoreDate(e.target.value)} max={new Date().toISOString().split("T")[0]} />
                    </div>
                    {scoreMsg && <p style={{ fontSize: 13, color: scoreMsg.startsWith("✓") ? "#4ade80" : "#ef4444" }}>{scoreMsg}</p>}
                    <button className="action-btn" onClick={submitScore} style={{ background: "linear-gradient(135deg,#4ade80,#22c55e)", color: "#000", marginTop: 4 }}>Add Score</button>
                  </div>
                  <p style={{ color: "#4b5563", fontSize: 11, marginTop: 12 }}>* Sirf last 5 scores rakhe jate hain. Naya score sabse purana replace karta hai.</p>
                </div>
                {/* Score List */}
                <div style={{ background: "#0f1117", borderRadius: 16, border: "1px solid #1a1d26", padding: 24 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, marginBottom: 20, color: "#4ade80" }}>Tera Score History</h3>
                  {scores.length === 0 ? <p style={{ color: "#4b5563", fontSize: 14 }}>Koi score nahi hai. Pehla score add karo!</p> : scores.map((s, i) => (
                    <div key={i} className="score-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 10px", borderBottom: "1px solid #1a1d26", borderRadius: 8, transition: "background 0.15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#13151f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#4ade80", fontWeight: 700 }}>#{i + 1}</div>
                        <span style={{ color: "#9ca3af", fontSize: 13 }}>{new Date(s.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      </div>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{s.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHARITY TAB */}
            {tab === "charity" && (
              <div style={{ background: "#0f1117", borderRadius: 16, border: "1px solid #1a1d26", padding: 28, maxWidth: 560 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, marginBottom: 20, color: "#a78bfa" }}>Teri Charity</h3>
                {charity ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[["Name", charity.name], ["Category", charity.category || "—"], ["Contribution", `${user?.charityPercentage || 10}% of subscription`]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, borderBottom: "1px solid #1a1d26", paddingBottom: 10 }}>
                        <span style={{ color: "#6b7280" }}>{k}</span>
                        <span style={{ color: "#fff", fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                    <button className="action-btn" onClick={() => window.location.href = "/charities"} style={{ background: "#1a1d26", color: "#a78bfa", marginTop: 8 }}>Charity Change Karo</button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>Koi charity select nahi ki abhi.</p>
                    <button className="action-btn" onClick={() => window.location.href = "/charities"} style={{ background: "linear-gradient(135deg,#a78bfa,#7c3aed)", color: "#fff" }}>Charity Chunno</button>
                  </div>
                )}
              </div>
            )}

            {/* DRAWS TAB */}
            {tab === "draws" && (
              <div style={{ background: "#0f1117", borderRadius: 16, border: "1px solid #1a1d26", padding: 28 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, marginBottom: 20, color: "#f59e0b" }}>Draw History</h3>
                {draws.length === 0 ? (
                  <p style={{ color: "#4b5563", fontSize: 14 }}>Koi draw history nahi hai abhi.</p>
                ) : draws.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #1a1d26" }}>
                    <div>
                      <p style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{d.month || `Draw #${i + 1}`}</p>
                      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{d.matchType || "Participating"}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 14, color: d.won ? "#4ade80" : "#6b7280", fontWeight: 600 }}>{d.won ? `Won £${d.prize}` : "No win"}</p>
                      <p style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{d.status || "completed"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}