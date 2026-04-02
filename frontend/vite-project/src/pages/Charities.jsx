import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

const CATEGORIES = ["All", "Health", "Education", "Environment", "Sports", "Animals", "Community"];

export default function Charities() {
  const { token, user } = useContext(AuthContext);
  const [charities, setCharities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchCharities(); }, []);

  useEffect(() => {
    let result = charities;
    if (category !== "All") result = result.filter(c => c.cause === category);
    if (search) result = result.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, category, charities]);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/charity`);
      if (res.ok) {
        const data = await res.json();
        const list = data.charities || data || [];
        setCharities(list);
        setFiltered(list);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const selectCharity = async (charityId) => {
    if (!token) return setMsg("Please login to select a charity.");
    setSelecting(charityId);
    setMsg("");
    try {
      const res = await fetch(`${API}/charity/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ charityId }),
      });
      const data = await res.json();
      if (res.ok) setMsg(`✓ ${data.charity?.name || "Charity"} selected successfully!`);
      else setMsg(data.message || "Something went wrong.");
    } catch {
      setMsg("Server error. Please try again.");
    }
    setSelecting(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#070910", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .charity-card { background: #0d0f18; border: 1px solid #1a1d2e; border-radius: 18px; padding: 24px; transition: all 0.25s; cursor: default; }
        .charity-card:hover { border-color: #a78bfa44; transform: translateY(-3px); box-shadow: 0 20px 40px #a78bfa0d; }
        .cat-btn { border: none; cursor: pointer; border-radius: 100px; padding: 7px 16px; font-size: 13px; font-family: inherit; font-weight: 500; transition: all 0.18s; }
        .select-btn { border: none; cursor: pointer; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-family: inherit; font-weight: 600; transition: all 0.18s; }
        .select-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .select-btn:disabled { opacity: 0.5; cursor: default; }
        .search-inp { background: #0d0f18; border: 1px solid #1a1d2e; border-radius: 12px; color: #fff; padding: 13px 18px 13px 42px; font-size: 14px; font-family: inherit; width: 100%; outline: none; transition: border 0.2s; }
        .search-inp:focus { border-color: #a78bfa; }
        .search-inp::placeholder { color: #4b5563; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1d26" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#fff" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4ade80,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⛳</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>GolfCharity</span>
          </a>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="/dashboard" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}>Dashboard</a>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "60px 24px 40px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 500, height: 300, background: "radial-gradient(ellipse, #a78bfa18 0%, transparent 70%)", pointerEvents: "none" }} />
        <span style={{ background: "#1a0a3d", border: "1px solid #a78bfa33", borderRadius: 100, padding: "6px 16px", fontSize: 12, color: "#a78bfa", fontWeight: 600, letterSpacing: 0.5, display: "inline-block", marginBottom: 20 }}>CHARITY DIRECTORY</span>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 52px)", letterSpacing: -2, lineHeight: 1.1, marginBottom: 16 }}>
          Choose Your <span style={{ background: "linear-gradient(135deg,#a78bfa,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Impact</span>
        </h1>
        <p style={{ color: "#6b7280", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
          A minimum of 10% of your subscription goes to charity. Choose the cause you want to support.
        </p>
        {msg && (
          <div style={{ display: "inline-block", marginTop: 20, padding: "10px 24px", borderRadius: 100, background: msg.startsWith("✓") ? "#052e16" : "#1a0a0a", border: `1px solid ${msg.startsWith("✓") ? "#4ade80" : "#ef4444"}44`, color: msg.startsWith("✓") ? "#4ade80" : "#ef4444", fontSize: 14, fontWeight: 500 }}>
            {msg}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Search + Filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 36, alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#4b5563" }}>🔍</span>
            <input className="search-inp" placeholder="Search charities..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} className="cat-btn" onClick={() => setCategory(cat)}
                style={{ background: category === cat ? "linear-gradient(135deg,#a78bfa,#7c3aed)" : "#0d0f18", color: category === cat ? "#fff" : "#6b7280", border: `1px solid ${category === cat ? "transparent" : "#1a1d2e"}` }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p style={{ color: "#4b5563", fontSize: 13, marginBottom: 20 }}>
          {filtered.length} {filtered.length === 1 ? "charity" : "charities"} found
        </p>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#4b5563", padding: 80 }}>Loading charities...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#4b5563", padding: 80 }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p>No charities found. Try a different search.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {filtered.map(charity => {
              const isSelected = user?.selectedCharity === charity._id;
              return (
                <div key={charity._id} className="charity-card" style={{ borderColor: isSelected ? "#a78bfa44" : undefined }}>
                  <div style={{ width: "100%", height: 140, borderRadius: 12, background: "linear-gradient(135deg,#1a0a3d,#0d0f18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, marginBottom: 18, overflow: "hidden", position: "relative" }}>
                    {charity.image ? <img src={charity.image} alt={charity.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} /> : <span>💚</span>}
                    {isSelected && (
                      <div style={{ position: "absolute", top: 10, right: 10, background: "#a78bfa", borderRadius: 100, padding: "3px 10px", fontSize: 11, color: "#fff", fontWeight: 600 }}>✓ Selected</div>
                    )}
                  </div>
                  {(charity.cause || charity.category) && (
                    <span style={{ background: "#1a0a3d", border: "1px solid #a78bfa22", borderRadius: 100, padding: "3px 10px", fontSize: 11, color: "#a78bfa", fontWeight: 500, display: "inline-block", marginBottom: 10 }}>{charity.cause || charity.category}</span>
                  )}
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{charity.name}</h3>
                  <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6, marginBottom: 18, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {charity.description || "This charity supports the community through its mission and programs."}
                  </p>
                  {charity.upcomingEvent && (
                    <div style={{ background: "#13151f", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12 }}>
                      <span style={{ color: "#f59e0b", fontWeight: 600 }}>🗓 Upcoming: </span>
                      <span style={{ color: "#9ca3af" }}>{charity.upcomingEvent}</span>
                    </div>
                  )}
                  <button
                    className="select-btn"
                    onClick={() => selectCharity(charity._id)}
                    disabled={selecting === charity._id || isSelected}
                    style={{ width: "100%", background: isSelected ? "#1a0a3d" : "linear-gradient(135deg,#a78bfa,#7c3aed)", color: isSelected ? "#a78bfa" : "#fff" }}
                  >
                    {selecting === charity._id ? "Selecting..." : isSelected ? "✓ Already Selected" : "Select This Charity"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}