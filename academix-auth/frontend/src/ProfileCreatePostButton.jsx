import React from "react";
import { PlusCircle } from "lucide-react";

const ProfileCreatePostButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="profile-create-btn animate-fade-in"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        width: "100%",
        padding: "14px",
        borderRadius: "14px",
        background: "var(--accent-student)", // Custom color or gradient
        color: "white",
        fontWeight: "bold",
        fontSize: "0.95rem",
        border: "none",
        cursor: "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        marginTop: "24px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
      }}
      onMouseOver={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 20px rgba(0,0,0,0.3)"; }}
      onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)"; }}
    >
      <PlusCircle size={20} />
      Create New Post
    </button>
  );
};

export default ProfileCreatePostButton;
