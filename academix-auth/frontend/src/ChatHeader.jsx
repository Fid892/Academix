import React from "react";
import { ChevronLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatHeader = ({ friend, isOnline, isTyping }) => {
  const navigate = useNavigate();

  return (
    <div className="chat-header">
      <button className="back-btn d-md-none" onClick={() => navigate('/chat')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginRight: '16px', display: window.innerWidth > 768 ? 'none' : 'block' }}>
         <ChevronLeft size={28} />
      </button>
      <img
        src={friend.profileImage ? `http://localhost:5000/uploads/${friend.profileImage}` : `https://ui-avatars.com/api/?name=${friend.name}&background=random`}
        alt="avatar"
        className="chat-avatar"
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
         <div style={{ fontWeight: "600", fontSize: "1rem" }}>{friend.name}</div>
         <div style={{ fontSize: "0.8rem", color: isTyping ? '#00a884' : 'rgba(233, 237, 239, 0.6)'}}>
            {isTyping ? "Typing..." : (isOnline ? "Online" : "Last seen recently")}
         </div>
      </div>
      <button style={{ background: 'transparent', border: 'none', color: '#e9edef', cursor: 'pointer' }} onClick={() => navigate(`/profile/${friend._id}`)}>
         <Info size={24} />
      </button>
    </div>
  );
};

export default ChatHeader;
