import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const TrendingSection = () => {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    fetchTrending();
    // Real-time API polling for trending topics every 30 seconds
    const interval = setInterval(fetchTrending, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/announcements/trending", {
        credentials: "include"
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setTrending(data);
      }
    } catch (err) {
      console.error("Failed to load trending:", err);
    }
  };

  if (trending.length === 0) return null;

  return (
    <div style={{ marginTop: "40px", marginBottom: "40px" }}>
      <h2 style={{ 
        color: "var(--accent-student)", 
        display: "flex", 
        alignItems: "center", 
        gap: "8px", 
        fontSize: "1.5rem", 
        marginBottom: "24px" 
      }}>
        🔥 Trending Now
      </h2>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: "24px" 
      }}>
        {trending.map((a, i) => (
          <div 
            key={a._id} 
            className="dashboard-card" 
            style={{ 
              padding: "20px", 
              background: "rgba(255,255,255,0.02)", 
              border: "1px solid rgba(255, 68, 68, 0.2)",
              animationDelay: `${i * 0.1}s` 
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>{a.title}</h3>
              <span style={{ fontSize: "1.2rem", background: "rgba(239, 68, 68, 0.1)", padding: "4px 8px", borderRadius: "8px" }}>🔥</span>
            </div>
            
            <p style={{ fontSize: "0.9rem", color: "var(--text-dim)", margin: "0 0 16px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {a.description}
            </p>
            
            <div style={{ display: "flex", gap: "16px", color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: "600" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>❤️ {a.likeCount || 0}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>💬 {a.commentCount || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSection;
