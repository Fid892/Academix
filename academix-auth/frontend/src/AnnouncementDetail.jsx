import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Info, User as UserIcon } from "lucide-react";
import "./Dashboard.css"; // Reuse dashboard styles

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/announcements/${id}`, {
          credentials: "include"
        });
        if (!res.ok) {
          throw new Error("Announcement not found");
        }
        const data = await res.json();
        setAnnouncement(data);
      } catch (err) {
        setError(err.message || "Failed to load announcement");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loader" style={{ width: '50px', height: '50px', border: '5px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-student)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Loading announcement...</p>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="dashboard-container">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px', alignItems: 'center', justifyContent: 'center' }}>
           <h2 style={{ color: '#ef4444' }}>{error || "Announcement not found"}</h2>
           <button onClick={() => navigate(-1)} className="primary-btn" style={{ marginTop: '20px', background: 'var(--accent-student)' }}>
             <ArrowLeft size={16} /> Go Back
           </button>
        </div>
      </div>
    );
  }

  const isFacultyPost = announcement.postedByRole === "faculty" || announcement.postedByRole === "admin" || announcement.postedByRole === "mainAdmin";
  const poster = announcement.postedBy;

  return (
    <div className="dashboard-container student-container">
      <div className="student-header animate-fade-in-down" style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)' }}>
        <div className="header-left">
           <h2>ACADEMIX</h2>
           <span className="sub-title" style={{ color: 'var(--accent-student)', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.1em' }}>ANNOUNCEMENT</span>
        </div>
      </div>

      <div className="dashboard-content" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", 
            color: "#fff", display: "flex", alignItems: "center", gap: "8px", 
            padding: "8px 16px", borderRadius: "12px", cursor: "pointer", 
            fontWeight: "600", marginBottom: "24px", transition: "background 0.2s"
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className={`announcement-card ${isFacultyPost ? 'premium-card' : ''}`} style={{ 
          background: isFacultyPost ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
          border: isFacultyPost ? "1px solid rgba(var(--accent-student-rgb), 0.2)" : "1px solid var(--border-subtle)",
          boxShadow: isFacultyPost ? "0 4px 20px rgba(0,0,0,0.2)" : "none",
          padding: "30px", borderRadius: "20px"
        }}>
          
          {/* Poster Information */}
          {poster && (
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", paddingBottom: "24px", borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {poster.profileImage ? (
                <img 
                  src={`http://localhost:5000/uploads/${poster.profileImage}`} 
                  alt={poster.name} 
                  style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: isFacultyPost ? "2px solid var(--accent-student)" : "2px solid rgba(255,255,255,0.1)" }}
                />
              ) : (
                <div style={{ width: "56px", height: "56px", background: isFacultyPost ? "var(--accent-student)" : "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.5rem" }}>
                  {poster.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#fff" }}>
                  {poster.role === "faculty" ? `Prof. ${poster.name}` : (isFacultyPost ? `${poster.name} (Admin)` : poster.name)}
                </h3>
                <small style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>{poster.department}</small>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <span className="status-badge" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.8rem", padding: "4px 10px", borderRadius: "20px" }}>
                  {new Date(announcement.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          )}

          {/* Core Content */}
          <h1 style={{ fontSize: "2rem", color: "#fff", marginBottom: "16px", lineHeight: 1.3 }}>{announcement.title}</h1>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
             {announcement.eventType && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-student)", background: "rgba(16, 185, 129, 0.1)", padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600" }}>
                   <Info size={16} /> {announcement.eventType}
                </span>
             )}
             {announcement.venue && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#F59E0B", background: "rgba(245, 158, 11, 0.1)", padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600" }}>
                   <MapPin size={16} /> {announcement.venue}
                </span>
             )}
             {announcement.startDate && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#3B82F6", background: "rgba(59, 130, 246, 0.1)", padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600" }}>
                   <Clock size={16} /> {new Date(announcement.startDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
             )}
          </div>

          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "32px", whiteSpace: "pre-wrap" }}>
            {announcement.description || announcement.content}
          </p>

          {/* Media */}
          {(announcement.imageUrl || announcement.image) && (
            <img 
              src={announcement.imageUrl ? announcement.imageUrl.startsWith("http") ? announcement.imageUrl : `http://localhost:5000/${announcement.imageUrl}` : `http://localhost:5000/uploads/${announcement.image}`} 
              alt="Announcement Poster" 
              style={{ width: "100%", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", objectFit: "contain", maxHeight: "600px", background: "#000" }} 
            />
          )}

          {/* Document Attachment */}
          {announcement.pdf && (
            <div style={{ marginTop: "24px", padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px dashed var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "48px", height: "48px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "1rem", color: "#fff", fontWeight: "600" }}>Official Attached Document</p>
                  <small style={{ color: "var(--text-dim)" }}>PDF Resource File</small>
                </div>
              </div>
              <a 
                href={`http://localhost:5000/uploads/${announcement.pdf}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="primary-btn"
                style={{ padding: "10px 20px", fontSize: "0.95rem", background: "var(--accent-student)", borderRadius: "10px", textDecoration: "none", color: "white", fontWeight: "bold" }}
              >
                View PDF File
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
