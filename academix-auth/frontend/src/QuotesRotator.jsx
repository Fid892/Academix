import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  "Learning never exhausts the mind.",
  "Education is the passport to the future.",
  "Knowledge grows when shared.",
  "Small steps today, big success tomorrow.",
];

const QuotesRotator = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="quotes-container">
      <AnimatePresence mode="wait">
        <motion.p
          key={quotes[index]}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 0.7, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1 }}
          className="academic-quote"
        >
          "{quotes[index]}"
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default QuotesRotator;
