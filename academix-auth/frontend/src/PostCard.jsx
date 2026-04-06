import React from "react";
import { motion } from "framer-motion";
import { Heart, MessageSquare } from "lucide-react";

const PostCard = ({ post, index, onClick }) => {
  const getStr = (val) => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      if (Array.isArray(val)) return String(val.length);
      const keys = ['name', 'title', 'eventName'];
      for (const key of keys) {
        if (val[key]) return getStr(val[key]);
      }
    }
    return "N/A";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      whileHover={{ y: -5 }}
      onClick={() => onClick(post)}
      className="post-card-premium"
    >
      <div className="post-card-inner">
        {post.image ? (
          <div className="post-media-wrapper">
            <img 
              src={`http://localhost:5000/uploads/${post.image}`} 
              alt={getStr(post.title)} 
              className="post-media-img" 
            />
            <div className="post-grid-overlay">
              <div className="post-quick-info">
                <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{getStr(post.title)}</span>
                <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Heart size={16} fill="white" /> {post.likesCount || 0}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><MessageSquare size={16} fill="white" /> {post.commentsCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="post-text-content">
            <div style={{ fontSize: "0.8rem", color: "var(--accent-student)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px" }}>
              {getStr(post.eventType || "Announcement")}
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "700", color: "white", marginBottom: "8px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {getStr(post.title)}
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>
              {getStr(post.description || post.content)}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard;
