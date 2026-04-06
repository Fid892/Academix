import React from "react";

const TypingIndicator = () => {
  return (
    <div className="message-row received">
      <div className="message-bubble" style={{ padding: "12px 16px", minWidth: "auto", display: "flex", gap: "4px", alignItems: "center" }}>
         <span className="typing-dot"></span>
         <span className="typing-dot"></span>
         <span className="typing-dot"></span>
      </div>
      <style>{`
         .typing-dot {
            width: 6px;
            height: 6px;
            background-color: #e9edef;
            border-radius: 50%;
            animation: typingFade 1.4s infinite both;
         }
         .typing-dot:nth-child(1) { animation-delay: -0.32s; }
         .typing-dot:nth-child(2) { animation-delay: -0.16s; }
         @keyframes typingFade {
            0%, 80%, 100% { transform: scale(0); opacity: 0; }
            40% { transform: scale(1); opacity: 1; }
         }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
