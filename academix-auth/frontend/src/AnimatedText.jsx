import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const phrases = ["Learn Smarter", "Collaborate Better", "Stay Ahead"];

const AnimatedText = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="animated-text-overlay">
      <AnimatePresence mode="wait">
        <motion.h1
          key={phrases[index]}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="hero-animated-phrase"
        >
          {phrases[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedText;
