import React from "react";
import { motion } from "framer-motion";
import { Edit2, Megaphone, Users, Heart, MapPin, Briefcase } from "lucide-react";

const ProfileHeader = ({ profileUser, currentUser, onEditClick }) => {
  if (!profileUser) return null;

  const getStr = (val) => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) return String(val.length);
      return val.name || val.title || val.eventName || "N/A";
    }
    return "N/A";
  };

  const isOwnProfile = currentUser && currentUser._id === profileUser._id;
  const userName = getStr(profileUser.name);
  const initials = String(userName).split(" ").map(n => n[0]).join("").toUpperCase();

  const StatItem = ({ count, label, icon, delay }) => {
    const safeCount = (typeof count === 'object' && count !== null) ? (Array.isArray(count) ? count.length : "0") : (count || "0");
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="profile-stat-box"
        style={{ textAlign: "center", minWidth: "100px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ color: "var(--accent-student)", display: "flex", alignItems: "center" }}>{icon}</span>
          <span style={{ fontSize: "1.75rem", fontWeight: "900", color: "#fff", letterSpacing: "-0.02em" }}>{safeCount}</span>
        </div>
        <span style={{ fontSize: "0.85rem", color: "var(--text-dim)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</span>
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="profile-header-new-container"
      style={{ paddingTop: "40px", textAlign: "center" }}
    >
      <div style={{ position: "relative", zIndex: 10 }}>
        {/* Profile Image Section - Pulse Removed */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          style={{ position: "relative", marginBottom: "40px", display: "inline-block" }}
        >
          <div className="profile-img-wrapper" style={{ position: "relative", padding: "10px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {profileUser.profileImage ? (
              <img 
                src={profileUser.profileImage.startsWith('http') ? profileUser.profileImage : `http://localhost:5000/uploads/${profileUser.profileImage}`} 
                alt={userName} 
                style={{ width: "170px", height: "170px", borderRadius: "50%", objectFit: "cover", border: "5px solid #1a1a1e", position: "relative", zIndex: 2 }}
              />
            ) : (
              <div style={{ width: "170px", height: "170px", background: "linear-gradient(135deg, #222, #111)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "3.5rem", fontWeight: "900", border: "5px solid #1a1a1e", position: "relative", zIndex: 2 }}>
                {initials}
              </div>
            )}

            {isOwnProfile && (
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEditClick}
                className="edit-avatar-badge"
                style={{ position: "absolute", bottom: "10px", right: "10px", width: "45px", height: "45px", background: "var(--accent-student)", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #0a0a0c", cursor: "pointer", zIndex: 10, color: "white" }}
              >
                <Edit2 size={20} />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Name Info */}
        <div style={{ marginBottom: "40px" }}>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ margin: "0 0 10px 0", fontSize: "3.5rem", fontWeight: "900", color: "#fff", letterSpacing: "-0.04em", background: "linear-gradient(to bottom, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            {userName}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "var(--accent-student)", fontWeight: "700", fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "2px" }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-student)", boxShadow: "0 0 10px var(--accent-student)" }}></div>
            {getStr(profileUser.department)} Department
          </motion.div>

          {profileUser.bio && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ maxWidth: "600px", margin: "20px auto 0", color: "var(--text-dim)", fontSize: "1.05rem", lineHeight: "1.6" }}
            >
              {profileUser.bio}
            </motion.p>
          )}
        </div>

        {/* Stats Section */}
        <div className="profile-stats-section" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "40px", padding: "30px 0", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
          <StatItem count={profileUser.postsCount || 0} label="Posts" icon={<Megaphone size={20} />} delay={0.5} />
          <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, transparent, var(--border-subtle), transparent)", opacity: 0.5 }}></div>
          <StatItem count={profileUser.followersCount || 0} label="Followers" icon={<Users size={20} />} delay={0.6} />
          <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, transparent, var(--border-subtle), transparent)", opacity: 0.5 }}></div>
          <StatItem count={profileUser.followingCount || 0} label="Following" icon={<Heart size={20} />} delay={0.7} />
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
