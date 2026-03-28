import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const CommentSection = ({ announcementId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
    // Real-time API polling for new comments every 15 seconds
    const interval = setInterval(fetchComments, 15000);
    return () => clearInterval(interval);
  }, [announcementId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/announcements/${announcementId}/comments`, {
        credentials: "include"
      });
      const data = await res.json();
      if (Array.isArray(data)) setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await fetch("http://localhost:5000/api/announcements/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ announcementId, content: newComment })
      });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: "20px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
      <h4 style={{ marginBottom: "12px", color: "var(--text-main)", fontSize: "1.1rem" }}>
        Comments ({comments.length})
      </h4>
      <div 
        style={{
          maxHeight: "200px",
          overflowY: "auto",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          paddingRight: "8px"
        }}
      >
        {comments.map((c) => (
          <div key={c._id} style={{
            background: "rgba(255,255,255,0.03)",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <strong style={{ fontSize: "0.9rem", color: "var(--accent-primary)" }}>
                {c.userName} <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", fontWeight: "normal" }}>({c.role})</span>
              </strong>
              <small style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
                {new Date(c.createdAt).toLocaleDateString()}
              </small>
            </div>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)" }}>{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && <p style={{ color: "var(--text-dim)", fontStyle: "italic", fontSize: "0.9rem" }}>No comments yet. Be the first!</p>}
      </div>
      
      <div style={{ display: "flex", gap: "10px" }}>
        <input 
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          onKeyDown={(e) => e.key === "Enter" && submitComment()}
          style={{
            flex: 1,
            background: "#25262b",
            border: "1px solid var(--border-subtle)",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "0.95rem",
            outline: "none"
          }}
        />
        <button 
          onClick={submitComment}
          disabled={loading || !newComment.trim()}
          style={{
            background: "var(--accent-student)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0 16px",
            cursor: loading || !newComment.trim() ? "not-allowed" : "pointer",
            fontWeight: "bold",
            opacity: loading || !newComment.trim() ? 0.6 : 1
          }}
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
