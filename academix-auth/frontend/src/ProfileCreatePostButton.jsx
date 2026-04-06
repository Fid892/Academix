import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const ProfileCreatePostButton = ({ onClick }) => {
  return (
    <motion.button 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="create-post-premium"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        width: "100%",
        padding: "18px",
        borderRadius: "20px",
        color: "white",
        fontWeight: "800",
        fontSize: "1.1rem",
        border: "none",
        cursor: "pointer",
        marginTop: "32px",
        letterSpacing: "0.5px"
      }}
    >
      <motion.div
        whileHover={{ rotate: 90 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <Plus size={24} strokeWidth={3} />
      </motion.div>
      Create New Announcement
    </motion.button>
  );
};

export default ProfileCreatePostButton;
