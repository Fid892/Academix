import React, { useRef } from "react";
import { format } from "timeago.js";
import MessageStatus from "./MessageStatus";
import AnnouncementShareCard from "./AnnouncementShareCard";
import EditableMessage from "./EditableMessage";

const MessageBubble = ({ message, isOwn, isEditing, onSaveEdit, onCancelEdit, onContextMenu }) => {
  const pressTimer = useRef(null);

  const handleTouchStart = (e) => {
    pressTimer.current = setTimeout(() => {
      // Create a fake event object with clientX/Y from the first touch point.
      const touch = e.touches[0];
      const fakeEvent = {
        preventDefault: () => {},
        clientX: touch.clientX,
        clientY: touch.clientY,
      };
      onContextMenu(fakeEvent);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };
  return (
    <div 
       className={`message-row ${isOwn ? "sent" : "received"}`}
       onContextMenu={onContextMenu}
       onTouchStart={handleTouchStart}
       onTouchEnd={handleTouchEnd}
    >
      <div className="message-bubble" style={{ minWidth: message.messageType === 'announcement' ? "260px" : "80px", fontStyle: message.isDeleted ? 'italic' : 'normal', color: message.isDeleted ? 'rgba(233,237,239,0.7)' : 'inherit' }}>
        {isEditing ? (
           <EditableMessage initialText={message.text} onSave={onSaveEdit} onCancel={onCancelEdit} />
        ) : message.messageType === "announcement" ? (
           <AnnouncementShareCard announcement={message.announcementId} />
        ) : message.messageType === "image" ? (
           <div style={{ marginTop: "4px" }}>
              <img src={message.fileUrl} onClick={() => window.open(message.fileUrl, '_blank')} alt="attachment" style={{ maxWidth: "240px", maxHeight: "240px", borderRadius: "8px", objectFit: "cover", cursor: "pointer", display: "block" }} />
           </div>
        ) : message.messageType === "file" ? (
           <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px", minWidth: "200px", maxWidth: "250px" }}>
              <div style={{ background: "rgba(0,168,132,0.1)", padding: "10px", borderRadius: "8px", color: "#00a884", display: "flex", alignItems: "center", justifyContent: "center" }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                 <p style={{ margin: 0, fontSize: "0.9rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={message.fileName}>{message.fileName}</p>
                 <a href={message.fileUrl} download={message.fileName} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#00a884", textDecoration: "none", fontWeight: "600" }}>Download</a>
              </div>
           </div>
        ) : (
           <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {message.text} 
              {message.edited && !message.isDeleted && <span style={{ fontSize: '0.65rem', color: 'rgba(233,237,239,0.6)' }}>(edited)</span>}
           </p>
        )}
        <span className="time">
           {format(message.createdAt)}
           {isOwn && <MessageStatus status={message.status} />}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
