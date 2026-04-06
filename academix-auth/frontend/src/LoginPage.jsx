import React, { useEffect } from "react";
import AnimatedBackground from "./AnimatedBackground";
import HeroText from "./HeroText";
import LoginCard from "./LoginCard";
import FeatureHighlights from "./FeatureHighlights";
import QuotesRotator from "./QuotesRotator";
import { motion } from "framer-motion";
import "./Login.css";

const LoginPage = () => {
  useEffect(() => {
    document.title = "Academix | Where Knowledge Connects";
  }, []);

  return (
    <div className="modern-login-page">
      <AnimatedBackground />
      
      <main className="hero-section">
        <div className="hero-main-content">
          <HeroText />
          
          <div className="login-wrapper">
            <LoginCard />
          </div>

          <div className="visual-divider">
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="line"
            />
          </div>

          <FeatureHighlights />
          
          <div className="footer-content">
            <QuotesRotator />
          </div>
        </div>
      </main>

      {/* Subtle bottom glow */}
      <div className="bottom-glow-overlay"></div>
    </div>
  );
};

export default LoginPage;
