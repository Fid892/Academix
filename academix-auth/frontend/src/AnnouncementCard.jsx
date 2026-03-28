import React from "react";
import "./Dashboard.css";
import SocialActions from "./SocialActions";

const AnnouncementCard = ({ a, showFacultyInfo }) => {
  return (
    <div className="announcement-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#fff" }}>{a.title}</h3>
        {a.eventType && (
          <span className="status-badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
            {a.eventType}
          </span>
        )}
      </div>
      
      <p style={{ margin: 0, fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        {a.description}
      </p>
      
      {a.image && (
        <img 
          src={`http://localhost:5000/uploads/${a.image}`} 
          alt="Announcement" 
          style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--border-subtle)", marginTop: "8px" }} 
        />
      )}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <small style={{ color: "var(--text-dim)" }}>{new Date(a.createdAt).toLocaleDateString()}</small>
        </div>
      </div>

      <SocialActions announcementId={a._id} link={a.link} />

      {showFacultyInfo && a.postedBy && (
        <div className="faculty-info-box" style={{ background: "rgba(59, 130, 246, 0.05)", borderColor: "var(--accent-faculty)", padding: "12px", borderRadius: "12px", display: "flex", gap: "12px", alignItems: "center", marginTop: "8px" }}>
          <div style={{ width: "32px", height: "32px", background: "var(--accent-faculty)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>
            {a.postedBy.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "bold", color: "#fff" }}>Prof. {a.postedBy.name}</p>
            <small style={{ color: "var(--text-dim)" }}>{a.postedBy.department} Department</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementCard;
