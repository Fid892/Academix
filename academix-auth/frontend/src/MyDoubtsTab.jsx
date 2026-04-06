import React, { useEffect, useState } from "react";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";

const MyDoubtsTab = ({ userId }) => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoubts();
  }, [userId]);

  const fetchDoubts = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/doubts/user/${userId}`, { credentials: "include" });
      const data = await res.json();
      setDoubts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)" }}>Loading Doubts...</div>;

  return (
    <div className="tab-content-container animate-fade-in">
      {doubts.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          {doubts.map((d) => (
            <div key={d._id} className="doubt-summary-card" onClick={() => window.location.href=`/doubts/${d._id}`} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-subtle)",
              padding: "20px",
              borderRadius: "16px",
              cursor: "pointer",
              transition: "transform 0.2s ease"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "8px", color: "var(--text-muted)" }}>
                  {d.subject || "General"}
                </span>
                <span style={{ 
                  fontSize: "0.75rem", 
                  color: d.status === "resolved" ? "#10b981" : "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: "bold"
                }}>
                  {d.status === "resolved" ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {d.status === "resolved" ? "SOLVED" : "PENDING"}
                </span>
              </div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", color: "white" }}>{d.title}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-dim)", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MessageSquare size={14} />
                  {d.replyCount || 0} Replies
                </div>
                <span>• {new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: "60px", textAlign: "center", color: "var(--text-dim)" }}>
          "No doubts posted yet"
        </div>
      )}
    </div>
  );
};

export default MyDoubtsTab;
