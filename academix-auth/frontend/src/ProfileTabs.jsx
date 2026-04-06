import React from "react";
import { Megaphone, MessageSquare, Users } from "lucide-react";

const ProfileTabs = ({ activeTab, setActiveTab, isOwnProfile }) => {
  const tabs = [
    { id: "announcements", label: "Announcements", icon: <Megaphone size={18} />, private: false },
    { id: "doubts", label: "My Doubts", icon: <MessageSquare size={18} />, private: true },
    { id: "groups", label: "My Groups", icon: <Users size={18} />, private: true }
  ];

  return (
    <div className="profile-tabs-wrapper" style={{ marginTop: "32px", borderBottom: "1px solid var(--border-subtle)", position: "sticky", top: 0, background: "rgba(10, 10, 10, 0.8)", backdropFilter: "blur(10px)", zIndex: 10 }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "40px" }}>
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
                gap: "8px",
                padding: "16px 8px",
                background: "none",
                border: "none",
                borderBottom: isActive ? "2px solid var(--accent-student)" : "2px solid transparent",
                color: isActive ? "white" : "var(--text-dim)",
                fontSize: "0.9rem",
                fontWeight: isActive ? "bold" : "normal",
                cursor: "pointer",
                transition: "all 0.3s ease",
                opacity: isActive ? 1 : 0.6
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;
