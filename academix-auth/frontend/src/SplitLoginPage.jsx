import React, { useEffect } from "react";
import LeftVisualSection from "./LeftVisualSection";
import RightLoginSection from "./RightLoginSection";
import "./Login.css";

const SplitLoginPage = () => {
  useEffect(() => {
    document.title = "Academix | Modern Experience";
  }, []);

  return (
    <div className="split-page-wrapper">
      <LeftVisualSection />
      <RightLoginSection />
    </div>
  );
};

export default SplitLoginPage;
