import React, { useState, useEffect } from "react";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";

const SocialActions = ({ announcementId, link }) => {
  const [stats, setStats] = useState({ likeCount: 0, commentCount: 0, isLiked: false });
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    fetchStats();
    // Real-time API polling every 15 seconds
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [announcementId]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/announcements/${announcementId}/stats`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setStats({
          likeCount: data.likeCount || 0,
          commentCount: data.commentCount || 0,
          isLiked: data.isLiked || false
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLike = async () => {
    try {
      const optimisticIsLiked = !stats.isLiked;
      const optimisticLikeCount = stats.isLiked ? stats.likeCount - 1 : stats.likeCount + 1;
      
      setStats(prev => ({
        ...prev,
        isLiked: optimisticIsLiked,
        likeCount: optimisticLikeCount
      }));

      const res = await fetch("http://localhost:5000/api/announcements/like", {
        method: optimisticIsLiked ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ announcementId })
      });

      if (!res.ok) fetchStats();
    } catch (err) {
      console.error(err);
      fetchStats();
    }
  };

  return (
    <div style={{ marginTop: "16px", paddingTop: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showComments ? "16px" : "0" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <LikeButton isLiked={stats.isLiked} likeCount={stats.likeCount} toggleLike={toggleLike} />
          
          <button 
            onClick={() => setShowComments(!showComments)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-muted)",
              fontSize: "1.1rem",
              fontWeight: "600",
              padding: "8px 12px",
              borderRadius: "8px",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: "rgba(255,255,255,0.05)" })}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: "transparent" })}
          >
            <span>💬</span> <span>{stats.commentCount}</span>
          </button>
        </div>
        {link && (
          <a href={link} target="_blank" rel="noreferrer" className="announcement-link" style={{ margin: 0 }}>
            Explore Further
          </a>
        )}
      </div>

      {showComments && <CommentSection announcementId={announcementId} />}
    </div>
  );
};

export default SocialActions;
