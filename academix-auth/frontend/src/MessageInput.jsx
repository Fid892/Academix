import React, { useState, useRef } from "react";
import { Send, Plus } from "lucide-react";
import AttachmentMenu from "./AttachmentMenu";

const MessageInput = ({ onSend, onTyping }) => {
  const [text, setText] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText("");
      if (onTyping) onTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e) => {
     setText(e.target.value);
     if (onTyping) {
        onTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
           onTyping(false);
        }, 2000);
     }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <form className="chat-input-container" onSubmit={handleSubmit}>
        <button 
           type="button" 
           className="plus-btn" 
           onClick={() => setShowAttachMenu(!showAttachMenu)}
           style={{ background: "transparent", border: "none", color: "#aebac1", cursor: "pointer", marginRight: "10px", display: "flex", alignItems: "center" }}
        >
           <Plus size={24} />
        </button>
        <input
          type="text"
          className="chat-input"
        placeholder="Type a message..."
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        value={text}
      />
        <button type="submit" className="chat-send-btn" disabled={!text.trim()}>
          <Send size={18} />
        </button>
      </form>

      {showAttachMenu && (
         <AttachmentMenu 
            onClose={() => setShowAttachMenu(false)}
            onSendPayload={(payload) => {
               onSend(payload);
               setShowAttachMenu(false);
            }}
         />
      )}
    </div>
  );
};

export default MessageInput;
