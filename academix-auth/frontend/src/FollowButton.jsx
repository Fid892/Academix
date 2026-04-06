import React, { useState, useEffect } from "react";

const FollowButton = ({ targetUserId, currentUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollower, setIsFollower] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (targetUserId && currentUserId && targetUserId !== currentUserId) {
      checkFollowStatus();
    } else {
      setLoading(false);
    }
  }, [targetUserId, currentUserId]);

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/follow/status/${targetUserId}`, {
        credentials: "include"
      });
      const data = await res.json();
      setIsFollowing(data.isFollowing);
      setIsFollower(data.isFollower);
    } catch (err) {
      console.error("Error checking follow status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowAction = async (e) => {
    e.stopPropagation();
    if (loading) return;

    // Optimistic UI
    const previousState = isFollowing;
    setIsFollowing(!previousState);

    try {
      const endpoint = previousState 
        ? `http://localhost:5000/api/follow/unfollow/${targetUserId}` 
        : `http://localhost:5000/api/follow/${targetUserId}`;
      
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include"
      });
      
      if (!res.ok) {
        throw new Error("Action failed");
      }
      
      const data = await res.json();
      setIsFollowing(data.isFollowing);
    } catch (err) {
      console.error("Error updating follow status:", err);
      setIsFollowing(previousState); // Revert on error
    }
  };

  if (!targetUserId || !currentUserId || targetUserId === currentUserId) return null;

  return (
    <button 
      onClick={handleFollowAction}
      className={`follow-btn ${isFollowing ? 'following' : ''}`}
      style={{
        padding: "6px 16px",
        borderRadius: "8px",
        fontSize: "0.85rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "none",
        background: isFollowing ? "rgba(255, 255, 255, 0.1)" : "var(--accent-student)",
        color: isFollowing ? "var(--text-muted)" : "white",
        outline: "none"
      }}
    >
      {isFollowing ? "Following" : isFollower ? "Follow Back" : "Follow"}
    </button>
  );
};

export default FollowButton;
