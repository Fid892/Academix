import React from "react";
import PostCard from "./PostCard";

const UserPostsGrid = ({ posts, onPostClick }) => {
  if (!posts || posts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-dim)", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px dashed var(--border-subtle)" }}>
        <p style={{ fontSize: "1.1rem" }}>No announcements posted yet.</p>
      </div>
    );
  }

  return (
    <div className="post-grid-premium">
      {posts.map((post, index) => (
        <PostCard 
          key={post._id} 
          post={post} 
          index={index}
          onClick={onPostClick} 
        />
      ))}
    </div>
  );
};

export default UserPostsGrid;
