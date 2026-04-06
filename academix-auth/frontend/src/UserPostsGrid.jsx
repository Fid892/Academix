import React from "react";

const UserPostsGrid = ({ posts, onPostClick }) => {
  if (!posts || posts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)" }}>
        <p>No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="profile-posts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px", marginTop: "24px" }}>
      {posts.map((post) => (
        <div 
          key={post._id} 
          onClick={() => onPostClick(post)}
          style={{ 
            aspectRatio: "1/1", 
            overflow: "hidden", 
            cursor: "pointer", 
            position: "relative",
            background: "rgba(255,255,255,0.05)"
          }}
        >
          {post.image ? (
            <img 
              src={`http://localhost:5000/uploads/${post.image}`} 
              alt={post.title} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", textAlign: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{post.title}</span>
            </div>
          )}
          <div className="grid-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", opacity: 0, transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0}>
             {/* Dynamic overlay icon/text can go here */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserPostsGrid;
