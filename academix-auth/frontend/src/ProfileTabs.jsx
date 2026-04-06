import React from "react";
import { motion } from "framer-motion";
import { Megaphone, MessageSquare, Users } from "lucide-react";

const ProfileTabs = ({ activeTab, setActiveTab, isOwnProfile }) => {
  const tabs = [
    { id: "announcements", label: "Announcements", icon: <Megaphone size={18} />, private: false },
    { id: "doubts", label: "My Doubts", icon: <MessageSquare size={18} />, private: true },
    { id: "groups", label: "My Groups", icon: <Users size={18} />, private: true }
  ];

  return (
    <div className="profile-tabs-wrapper" style={{ marginTop: "48px", borderBottom: "1px solid var(--border-subtle)", position: "sticky", top: 0, background: "rgba(10, 10, 10, 0.8)", backdropFilter: "blur(20px)", zIndex: 100 }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "60px" }}>
        {tabs.map((tab) => {
          if (tab.private && !isOwnProfile) return null;

          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "20px 0",
                background: "none",
                border: "none",
                color: isActive ? "white" : "var(--text-dim)",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "color 0.3s ease",
                position: "relative"
              }}
            >
              <span style={{ color: isActive ? "var(--accent-student)" : "inherit" }}>{tab.icon}</span>
              {tab.label}
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: "absolute",
                    bottom: "-1px",
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "var(--accent-student)",
                    boxShadow: "0 0 15px var(--accent-student)",
                    borderRadius: "2px"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;
