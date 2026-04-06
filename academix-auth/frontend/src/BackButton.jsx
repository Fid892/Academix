import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BackButton = ({ role, isAbsolute = true }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (role === "faculty") {
      navigate("/faculty-dashboard");
    } else if (role === "admin" || role === "mainAdmin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 255, 255, 0.15)" }}
      whileTap={{ scale: 0.95 }}
      onClick={handleBack}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "white",
        padding: "10px 20px",
        borderRadius: "14px",
        fontSize: "0.95rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: isAbsolute ? "absolute" : "relative",
        top: isAbsolute ? "30px" : "auto",
        left: isAbsolute ? "30px" : "auto",
        zIndex: 100,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
      }}
    >
      <motion.div
        animate={{ x: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        style={{ display: "flex", alignItems: "center" }}
      >
        <ArrowLeft size={18} />
      </motion.div>
      <span>Back to Dashboard</span>
    </motion.button>
  );
};

export default BackButton;
