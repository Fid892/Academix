import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const phrases = [
  "Where Knowledge Connects",
  "Where Doubts Find Answers",
  "Where Learning Becomes Collaborative",
  "One Platform. All Academics.",
];

const HeroText = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-text-container">
      <AnimatePresence mode="wait">
        <motion.h2
          key={phrases[index]}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hero-heading"
        >
          {phrases[index]}
        </motion.h2>
      </AnimatePresence>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="hero-subheading"
      >
        A Unified Platform for Academic Interaction
      </motion.p>
    </div>
  );
};

export default HeroText;
