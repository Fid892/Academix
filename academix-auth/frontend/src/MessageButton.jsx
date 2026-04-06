import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MessageButton = ({ targetUserId, currentUserId }) => {
  const [isMutual, setIsMutual] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMutualFollow = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/follow/check-mutual/${targetUserId}`, {
          credentials: "include"
        });
        const data = await res.json();
        setIsMutual(data.canMessage);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUserId && targetUserId) {
      checkMutualFollow();
    }
  }, [currentUserId, targetUserId]);

  const handleMessageClick = () => {
    navigate(`/chat/${targetUserId}`);
  };

  if (loading) return null;

  return (
    <>
      {isMutual ? (
        <button 
          onClick={handleMessageClick}
          className="primary-btn"
          style={{ background: "#0095f6", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}
        >
          <MessageCircle size={18} /> Message
        </button>
      ) : (
        <button 
          className="primary-btn"
          disabled={!isMutual}
          style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#888", display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", cursor: "not-allowed" }}
        >
          <MessageCircle size={18} /> Follow to Message
        </button>
      )}
    </>
  );
};

export default MessageButton;
