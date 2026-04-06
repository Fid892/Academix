import React from "react";
import { format } from "timeago.js";

const ChatList = ({ conversations, user, onSelect, conversationId }) => {
  return (
    <div className="messages-list">
      {conversations.map((c) => {
        const friend = c.participants.find((m) => m._id !== user._id);
        if (!friend) return null;
        
        const isActive = c._id === conversationId;
        
        return (
          <div
            key={c._id}
            className={`chat-list-item ${isActive ? "active" : ""}`}
            onClick={() => onSelect(c._id)}
          >
            <img
              src={friend.profileImage ? `http://localhost:5000/uploads/${friend.profileImage}` : `https://ui-avatars.com/api/?name=${friend.name}&background=random`}
              alt="avatar"
              className="chat-avatar"
            />
            <div className="chat-info">
              <div className="chat-name">{friend.name}</div>
              <div className="chat-preview">
                <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {c.lastMessage || "Started a conversation"}
                </span>
                <span className="chat-time">· {format(c.updatedAt, 'short')}</span>
              </div>
            </div>
          </div>
        );
      })}
      {conversations.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px", color: "#888", fontSize: "0.9rem", padding: "0 20px" }}>
          No conversations yet. Starting chatting from someone's profile!
        </div>
      )}
    </div>
  );
};

export default ChatList;
