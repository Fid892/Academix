import React from "react";

const MessageStatus = ({ status }) => {
  if (!status) return null;

  return (
    <span className="ticks" style={{ marginLeft: "4px", fontSize: "0.7rem", letterSpacing: "-2px" }}>
      {status === "sent" && <span style={{ color: "rgba(233, 237, 239, 0.6)" }}>✔</span>}
      {status === "delivered" && <span style={{ color: "rgba(233, 237, 239, 0.6)" }}>✔✔</span>}
      {status === "seen" && <span style={{ color: "#53bdeb" }}>✔✔</span>}
    </span>
  );
};

export default MessageStatus;
