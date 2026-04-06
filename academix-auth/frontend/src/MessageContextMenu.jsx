import React, { useEffect, useRef } from "react";

const MessageContextMenu = ({ menu, onClose, onEdit, onCopy, onDeleteForMe, onUnsend, isSender }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onClose]);

  if (!menu.visible) return null;

  return (
    <div ref={menuRef} className="context-menu" style={{ position: "fixed", top: menu.y, left: menu.x, background: "#202c33", borderRadius: "8px", width: "180px", padding: "6px 0", zIndex: 999, boxShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>
      {isSender && menu.message.messageType === "text" && !menu.message.isDeleted && <p onClick={onEdit}>Edit</p>}
      {!menu.message.isDeleted && menu.message.messageType === "text" && <p onClick={onCopy}>Copy</p>}
      <p onClick={onDeleteForMe}>Delete for me</p>
      {isSender && !menu.message.isDeleted && <p onClick={onUnsend}>Unsend</p>}
      <style>{`
        .context-menu p {
           padding: 10px 14px;
           color: #e9edef;
           cursor: pointer;
           font-size: 14px;
           margin: 0;
        }
        .context-menu p:hover {
           background: #2a3942;
        }
      `}</style>
    </div>
  );
};

export default MessageContextMenu;
