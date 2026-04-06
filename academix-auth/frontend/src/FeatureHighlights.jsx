import React from "react";
import { motion } from "framer-motion";
import { Bell, Sparkles, Users, Zap } from "lucide-react";

const features = [
  {
    icon: <Bell size={24} />,
    title: "Verified Announcements",
    description: "No duplicates. No outdated info.",
    color: "#ff4d4d",
  },
  {
    icon: <Sparkles size={24} />,
    title: "Smart Doubt Resolution",
    description: "Ask once. Learn forever.",
    color: "#ff8080",
  },
  {
    icon: <Users size={24} />,
    title: "Collaborative Study Groups",
    description: "Learn together, grow faster.",
    color: "#ff3333",
  },
  {
    icon: <Zap size={24} />,
    title: "Real-Time Academic Updates",
    description: "Never miss what matters.",
    color: "#ff1a1a",
  },
];

const FeatureHighlights = () => {
  return (
    <div className="features-grid">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2, duration: 0.6 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="feature-card glass-card"
        >
          <div className="feature-icon" style={{ color: feature.color }}>
            {feature.icon}
          </div>
          <div className="feature-info">
            <h4>{feature.title}</h4>
            <p>{feature.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FeatureHighlights;
