import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import SocialActions from "./SocialActions";
import FollowButton from "./FollowButton";
import { Share2 } from "lucide-react";
import ShareModal from "./ShareModal";

const AnnouncementCard = ({ a, currentUser }) => {
  const navigate = useNavigate();
  const poster = a.postedBy;
  const isFacultyPost = a.postedByRole === "faculty" || a.postedByRole === "admin" || a.postedByRole === "mainAdmin";
  const [showShareModal, setShowShareModal] = React.useState(false);

  const navigateToProfile = (e) => {
    e.stopPropagation();
    if (poster && poster._id) {
       navigate(`/profile/${poster._id}`);
    }
  };

  const cardStyle = {
    display: "flex", 
    flexDirection: "column", 
    gap: "16px", 
    borderLeft: a.isForwarded ? '4px solid var(--accent-faculty)' : (isFacultyPost ? '4px solid var(--accent-student)' : 'none'),
    padding: "20px",
    borderRadius: "16px",
    background: isFacultyPost ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
    border: isFacultyPost ? "1px solid rgba(var(--accent-student-rgb), 0.2)" : "1px solid var(--border-subtle)",
    boxShadow: isFacultyPost ? "0 4px 20px rgba(0,0,0,0.2)" : "none",
    position: "relative",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    opacity: a.isExpired ? 0.6 : 1,
    filter: a.isExpired ? "grayscale(0.5)" : "none",
    pointerEvents: a.isExpired ? "auto" : "auto", // Allow viewing in profile
  };

  return (
    <div id={`announcement-${a._id}`} className="announcement-card-container" style={{ marginBottom: "24px" }}>
      <div className={`announcement-card ${isFacultyPost ? 'premium-card' : ''}`} style={cardStyle}>
        
        {/* Poster Info Section */}
        {poster && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div onClick={navigateToProfile} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
              {poster.profileImage ? (
                <img 
                  src={poster.profileImage.startsWith('http') ? poster.profileImage : `http://localhost:5000/uploads/${poster.profileImage}`} 
                  alt={poster.name} 
                  style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: isFacultyPost ? "2px solid var(--accent-student)" : "2px solid rgba(255,255,255,0.1)" }}
                />
              ) : (
                <div style={{ width: "44px", height: "44px", background: isFacultyPost ? "var(--accent-student)" : "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.2rem" }}>
                  {poster.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p style={{ margin: 0, fontSize: "1rem", fontWeight: "bold", color: "#fff" }}>
                  {poster.role === "faculty" ? `Prof. ${typeof poster.name === 'object' ? poster.name.name : poster.name}` : (isFacultyPost ? `${typeof poster.name === 'object' ? poster.name.name : poster.name} (Admin)` : (typeof poster.name === 'object' ? poster.name.name : poster.name))}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                   <small style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
                     {typeof poster.department === 'object' ? poster.department.name : poster.department}
                   </small>
                   {isFacultyPost && <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--accent-student)" }}></span>}
                   {isFacultyPost && <small style={{ color: "var(--accent-student)", fontSize: "0.75rem", fontWeight: "bold" }}>Faculty</small>}
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Role Badge (Integrated to avoid overlap) */}
              <div style={{ display: "flex", gap: "8px" }}>
                {a.postedByRole === "admin" || a.postedByRole === "mainAdmin" ? (
                  <span style={{ background: "rgba(59, 130, 246, 0.15)", color: "var(--accent-faculty)", padding: "5px 12px", borderRadius: "20px", fontSize: "0.65rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                    Admin
                  </span>
                ) : a.postedByRole === "faculty" ? (
                  <span style={{ background: "rgba(220, 38, 38, 0.15)", color: "var(--accent-student)", padding: "5px 12px", borderRadius: "20px", fontSize: "0.65rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", border: "1px solid rgba(220, 38, 38, 0.3)" }}>
                    Official
                  </span>
                ) : (
                  <span style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-dim)", padding: "5px 12px", borderRadius: "20px", fontSize: "0.65rem", fontWeight: "800", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.1)" }}>
                    Student
                  </span>
                )}
                {a.isExpired && (
                  <span style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "5px 12px", borderRadius: "20px", fontSize: "0.65rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                    ⚠ Expired
                  </span>
                )}
              </div>

              {/* Follow Button */}
              {poster.role !== "admin" && poster.role !== "mainAdmin" && currentUser && poster._id !== currentUser._id && (
                <FollowButton targetUserId={poster._id} currentUserId={currentUser._id} />
              ) }
            </div>
          </div>
        )}

        <div style={{ marginTop: "8px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "1.4rem", color: "#fff", lineHeight: "1.3" }}>{a.title}</h3>
          {(a.eventType || a.isForwarded) && (
            <span className="status-badge" style={{ background: a.isForwarded ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.05)", color: a.isForwarded ? "var(--accent-faculty)" : "var(--text-muted)", border: "1px solid var(--border-subtle)", fontSize: "0.75rem", padding: "2px 8px" }}>
              {a.isForwarded ? "SHARED BY FACULTY" : a.eventType}
            </span>
          )}
        </div>
        
        <p style={{ margin: 0, fontSize: "1.05rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          {a.description || a.content}
        </p>
        
        {(a.imageUrl || a.image) && (
          <img 
            src={a.imageUrl ? a.imageUrl.startsWith("http") ? a.imageUrl : `http://localhost:5000/${a.imageUrl}` : `http://localhost:5000/uploads/${a.image}`} 
            alt="Announcement" 
            onError={(e) => { e.target.style.display = 'none'; }}
            style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--border-subtle)", marginTop: "8px", maxHeight: "400px", objectFit: "cover" }} 
          />
        )}

        {a.pdf && (
          <div style={{ marginTop: "16px", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px dashed var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#fff", fontWeight: "600" }}>Official Document</p>
                <small style={{ color: "var(--text-dim)" }}>PDF Resource</small>
              </div>
            </div>
            <a 
              href={`http://localhost:5000/uploads/${a.pdf}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="primary-btn"
              style={{ padding: "8px 16px", fontSize: "0.85rem", background: "var(--accent-student)", borderRadius: "8px", textDecoration: "none", color: "white" }}
            >
              View PDF
            </a>
          </div>
        )}
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
          <small style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
             {a.isForwarded && "Originally posted by Administration · "}
             {new Date(a.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </small>
          
        </div>

        {a.postedByRole !== "admin" && a.postedByRole !== "mainAdmin" && !a.isForwarded && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
            <SocialActions announcementId={a._id} link={a.link} />
            <button 
               className="share-btn" 
               onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}
               style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem", transition: "color 0.2s" }}
               onMouseOver={e => e.currentTarget.style.color = "#fff"}
               onMouseOut={e => e.currentTarget.style.color = "var(--text-muted)"}
            >
               <Share2 size={18} /> Share
            </button>
          </div>
        )}

        {(a.postedByRole === "admin" || a.postedByRole === "mainAdmin" || a.isForwarded) && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
            <button 
               className="share-btn" 
               onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}
               style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem", transition: "color 0.2s" }}
               onMouseOver={e => e.currentTarget.style.color = "#fff"}
               onMouseOut={e => e.currentTarget.style.color = "var(--text-muted)"}
            >
               <Share2 size={18} /> Share
            </button>
          </div>
        )}

        {a.isForwarded && a.forwardedBy && (
           <div className="faculty-info-box" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${a.forwardedBy?._id}`); }} style={{ background: "rgba(59, 130, 246, 0.05)", borderColor: "var(--accent-faculty)", padding: "12px", borderRadius: "12px", display: "flex", gap: "12px", alignItems: "center", marginTop: "8px", border: "1px solid", cursor: 'pointer' }}>
              <div style={{ width: "24px", height: "24px", background: "var(--accent-faculty)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.7rem", fontWeight: "bold" }}>
               { (typeof a.forwardedBy.name === 'string' ? a.forwardedBy.name : (a.forwardedBy.name?.name || "A"))[0]?.toUpperCase() }
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Shared by <span style={{ color: "#fff", fontWeight: "bold" }}>Prof. {typeof a.forwardedBy.name === 'object' ? a.forwardedBy.name?.name : a.forwardedBy.name}</span>
              </p>
           </div>
        )}
      </div>

      {showShareModal && (
         <ShareModal announcement={a} currentUser={currentUser} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
};


export default AnnouncementCard;
