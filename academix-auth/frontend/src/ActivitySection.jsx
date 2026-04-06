import React from "react";
import { motion } from "framer-motion";
import { Clock, MessageSquare, Users, ExternalLink } from "lucide-react";

const ActivitySection = ({ profileUser, recentPost, lastDoubt, groupsJoined }) => {
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

  const activities = [
    {
      title: "Latest Post",
      icon: <Clock size={16} />,
      content: recentPost ? getStr(recentPost.title) : "No recent posts",
      time: recentPost ? new Date(recentPost.createdAt).toLocaleDateString() : "",
      color: "var(--accent-student)"
    },
    {
      title: "Last Doubt Asked",
      icon: <MessageSquare size={16} />,
      content: lastDoubt ? getStr(lastDoubt.title) : "No recent doubts",
      time: lastDoubt ? new Date(lastDoubt.createdAt).toLocaleDateString() : "",
      color: "var(--accent-faculty)"
    },
    {
      title: "Groups Joined",
      icon: <Users size={16} />,
      content: groupsJoined > 0 ? `${groupsJoined} active communities` : "Exploring new groups",
      time: "",
      color: "var(--accent-primary)"
    }
  ];

  return (
    <div className="activity-section" style={{ marginTop: "48px" }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "24px", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
        Recent Insights <span style={{ fontSize: "0.8rem", fontWeight: "normal", color: "var(--text-dim)" }}>/ Activity</span>
      </h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        {activities.map((act, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="activity-card-premium"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ padding: "8px", borderRadius: "10px", background: `rgba(${act.color === "var(--accent-student)" ? "239,68,68" : act.color === "var(--accent-faculty)" ? "59,130,246" : "99,102,241"}, 0.1)`, color: act.color }}>
                {act.icon}
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{act.time}</span>
            </div>
            <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "4px" }}>{act.title}</h4>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: "1rem", color: "white", fontWeight: "600", margin: 0 }}>{act.content}</p>
              <ExternalLink size={14} style={{ color: "var(--text-dim)" }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivitySection;
