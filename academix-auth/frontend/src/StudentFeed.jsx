import React, { useState, useEffect } from "react";
import AnnouncementCard from "./AnnouncementCard";

const StudentFeed = ({ currentUser }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentAnnouncements = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/announcements/student", {
          credentials: "include"
        });
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching student announcements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="feed-loading" style={{ padding: "20px", textAlign: "center", color: "var(--text-dim)" }}>
        <p>Loading Community Posts...</p>
      </div>
    );
  }

  return (
    <div className="student-feed-section" style={{ marginTop: "60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.5rem", color: "white", margin: 0 }}>👩‍🎓 Student Announcements</h2>
        <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, var(--border-subtle), transparent)" }}></div>
      </div>

      {announcements.length > 0 ? (
        <div className="feed-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          {announcements.map((a, i) => (
            <div key={a._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <AnnouncementCard a={a} currentUser={currentUser} />
            </div>
          ))}
        </div>
      ) : (
        <div className="student-empty" style={{ padding: "40px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px dashed var(--border-subtle)", color: "var(--text-dim)" }}>
          <p>No student posts yet</p>
        </div>
      )}
    </div>
  );
};

export default StudentFeed;
