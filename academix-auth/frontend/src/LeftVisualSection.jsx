import React from "react";
import { motion } from "framer-motion";
import AnimatedText from "./AnimatedText";
import academicVisual from "./assets/academic_visual.png";

const LeftVisualSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="visual-container"
      style={{ backgroundImage: `url(${academicVisual})` }}
    >
      <div className="visual-overlay"></div>
      <div className="visual-content">
        <AnimatedText />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1, duration: 2 }}
          className="scroll-indicator"
        >
          <div className="mouse"></div>
          <span>Discover the Future of Learning</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LeftVisualSection;
