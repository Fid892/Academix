import React from "react";
import { useNavigate } from "react-router-dom";

const AnnouncementShareCard = ({ announcement }) => {
  const navigate = useNavigate();

  if (!announcement) return <div style={{color: '#999', fontStyle: 'italic'}}>Shared an announcement (unavailable)</div>;

  return (
    <div className="announcement-share-card">
      <h4 style={{ margin: "0 0 8px 0", fontSize: "1rem", color: "#fff", lineHeight: "1.3" }}>
         {announcement.title}
      </h4>
      <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
         {announcement.description || announcement.content}
      </p>
      <button 
         style={{ width: "100%", padding: "8px", background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff", cursor: "pointer", fontWeight: "600", transition: "background 0.2s" }}
         onClick={() => navigate(`/announcement/${announcement._id}`)}
         onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
         onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
      >
        View
      </button>
    </div>
  );
};

export default AnnouncementShareCard;
