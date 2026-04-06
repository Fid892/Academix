import React, { useState, useEffect, useRef } from "react";

const EditableMessage = ({ initialText, onSave, onCancel }) => {
  const [text, setText] = useState(initialText);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
       inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
       e.preventDefault();
       if (text.trim() && text !== initialText) {
          onSave(text);
       } else {
          onCancel();
       }
    } else if (e.key === "Escape") {
       onCancel();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "none",
          borderBottom: "2px solid #00a884",
          color: "#fff",
          outline: "none",
          padding: "6px",
          borderRadius: "4px",
          width: "100%",
          fontSize: "0.95rem"
        }}
      />
      <small style={{ color: "rgba(233,237,239,0.7)", fontSize: "0.7rem", alignSelf: "flex-end" }}>
         Press Enter to save, Esc to cancel
      </small>
    </div>
  );
};

export default EditableMessage;
