import React from "react";
import "./Dashboard.css";
import { Heart } from "lucide-react";

const LikeButton = ({ isLiked, likeCount, toggleLike }) => {
  return (
    <button 
      onClick={toggleLike}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: isLiked ? "#ef4444" : "var(--text-muted)",
        fontSize: "1.1rem",
        fontWeight: "600",
        padding: "8px 12px",
        borderRadius: "8px",
        transition: "var(--transition)",
      }}
      onMouseEnter={(e) => {
        if (!isLiked) Object.assign(e.currentTarget.style, { background: "rgba(255,255,255,0.05)" });
      }}
      onMouseLeave={(e) => {
        if (!isLiked) Object.assign(e.currentTarget.style, { background: "transparent" });
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>{isLiked ? <Heart size={20} fill="#ef4444" color="#ef4444" /> : <Heart size={20} color="currentColor" />}</span>
      <span>{likeCount}</span>
    </button>
  );
};

export default LikeButton;
