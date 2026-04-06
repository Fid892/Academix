import React from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users } from "lucide-react";

const FeedCardNavigation = () => {
  const navigate = useNavigate();

  return (
    <>
      <div 
        className="dashboard-card animate-card-6" 
        onClick={() => navigate("/student-feed")}
        style={{ cursor: "pointer" }}
      >
        <div className="plus-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
          <Users size={28} />
        </div>
        <h3>Student Feed</h3>
        <p>View announcements posted by students</p>
      </div>

      <div 
        className="dashboard-card animate-card-7" 
        onClick={() => navigate("/faculty-feed")}
        style={{ cursor: "pointer" }}
      >
        <div className="plus-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white' }}>
          <GraduationCap size={28} />
        </div>
        <h3>Faculty Feed</h3>
        <p>View official announcements from faculty</p>
      </div>
    </>
  );
};

export default FeedCardNavigation;
