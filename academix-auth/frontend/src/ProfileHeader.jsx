import React from "react";
import FollowButton from "./FollowButton";
import MessageButton from "./MessageButton";

const ProfileHeader = ({ profileUser, currentUser, onEditClick }) => {
  if (!profileUser) return null;

  const isOwnProfile = currentUser && currentUser._id === profileUser._id;

  return (
    <div className="profile-header-new" style={{ textAlign: "center", padding: "40px 20px" }}>
      <div className="profile-image-container" style={{ position: "relative", display: "inline-block", marginBottom: "20px" }}>
        {profileUser.profileImage ? (
          <img 
            src={`http://localhost:5000/uploads/${profileUser.profileImage}`} 
            alt={profileUser.name} 
            style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover", border: "4px solid var(--accent-student)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
          />
        ) : (
          <div style={{ width: "150px", height: "150px", background: "var(--accent-student)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "3rem", fontWeight: "bold", border: "4px solid rgba(255,255,255,0.1)" }}>
            {profileUser.name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="profile-main-info" style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px 0", fontSize: "2rem", color: "#fff" }}>{profileUser.name}</h1>
        <p style={{ margin: "0", color: "var(--accent-student)", fontWeight: "600", fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "1px" }}>
          {profileUser.department} Department
        </p>
        {profileUser.bio && (
          <p style={{ margin: "16px auto", color: "var(--text-muted)", maxWidth: "500px", lineHeight: "1.6" }}>
            {profileUser.bio}
          </p>
        )}
      </div>

      <div className="profile-stats-section" style={{ display: "flex", justifyContent: "center", gap: "40px", marginBottom: "32px" }}>
        <div className="stat-item" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#fff" }}>{profileUser.postsCount || 0}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Posts</div>
        </div>
        <div className="stat-item" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#fff" }}>{profileUser.followersCount || 0}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Followers</div>
        </div>
        <div className="stat-item" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#fff" }}>{profileUser.followingCount || 0}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Following</div>
        </div>
      </div>

      <div className="profile-actions">
        {isOwnProfile ? (
          <button 
            onClick={onEditClick}
            className="primary-btn"
            style={{ padding: "10px 30px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", color: "#fff" }}
          >
            Edit Profile
          </button>
        ) : (
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <FollowButton targetUserId={profileUser._id} currentUserId={currentUser?._id} />
            <MessageButton targetUserId={profileUser._id} currentUserId={currentUser?._id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
