import React, { useEffect, useState } from "react";
import { Users, GraduationCap, ArrowRight } from "lucide-react";

const MyGroupsTab = ({ userId }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, [userId]);

  const fetchGroups = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/study-groups/user/${userId}`, { credentials: "include" });
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)" }}>Loading Groups...</div>;

  return (
    <div className="tab-content-container animate-fade-in">
      {groups.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          {groups.map((g) => (
            <div key={g._id} className="group-summary-card" onClick={() => window.location.href=`/study-groups/${g._id}`} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-subtle)",
              padding: "20px",
              borderRadius: "16px",
              cursor: "pointer",
              transition: "transform 0.2s ease",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "32px", height: "32px", background: "var(--accent-student)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                    <GraduationCap size={16} />
                  </div>
                  <h3 style={{ fontSize: "1.1rem", margin: 0, color: "white" }}>{g.name}</h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-dim)", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Users size={14} />
                    {g.membersCount || 0} Members
                  </div>
                  <span>• {g.subject || "General"}</span>
                </div>
              </div>
              <ArrowRight size={20} style={{ color: "var(--text-dim)" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: "60px", textAlign: "center", color: "var(--text-dim)" }}>
          "No groups joined"
        </div>
      )}
    </div>
  );
};

export default MyGroupsTab;
