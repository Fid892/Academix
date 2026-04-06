import React, { useState, useEffect } from "react";

const UserListItem = ({ targetUser, currentUser, hasChatted, onSend }) => {
  const [canSend, setCanSend] = useState(hasChatted);
  const [loading, setLoading] = useState(!hasChatted);
  const [sentStatus, setSentStatus] = useState(false);

  useEffect(() => {
    if (!hasChatted) {
      const checkMutual = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/follow/check-mutual/${targetUser._id}`, {
            credentials: "include"
          });
          const data = await res.json();
          setCanSend(data.canMessage);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      checkMutual();
    }
  }, [hasChatted, targetUser._id]);

  const handleSend = async () => {
    setSentStatus(true);
    await onSend(targetUser._id);
    setTimeout(() => {
       setSentStatus(false);
    }, 2000);
  };

  return (
    <div className="user-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img 
          src={targetUser.profileImage ? `http://localhost:5000/uploads/${targetUser.profileImage}` : `https://ui-avatars.com/api/?name=${targetUser.name}&background=random`} 
          alt="avatar" 
          style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} 
        />
        <div>
          <div style={{ fontWeight: "600", fontSize: "0.95rem", color: "#fff" }}>{targetUser.name}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
             {targetUser.department || targetUser.role}
          </div>
        </div>
      </div>
      
      {loading ? (
        <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Checking...</span>
      ) : canSend ? (
        <button 
          className="send-btn" 
          onClick={handleSend}
          disabled={sentStatus}
          style={{ background: sentStatus ? "transparent" : "#25d366", color: sentStatus ? "#25d366" : "#fff", border: sentStatus ? "1px solid #25d366" : "none", borderRadius: "20px", padding: "6px 16px", cursor: sentStatus ? "default" : "pointer", fontWeight: "bold", fontSize: "0.85rem", transition: "all 0.2s" }}
        >
          {sentStatus ? "Sent" : "Send"}
        </button>
      ) : (
        <button 
          disabled 
          style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "20px", padding: "6px 12px", color: "var(--text-dim)", fontSize: "0.8rem", cursor: "not-allowed" }}
        >
          Follow to send
        </button>
      )}
    </div>
  );
};

export default UserListItem;
