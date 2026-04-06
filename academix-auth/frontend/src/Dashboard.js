import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";
import AnnouncementCard from "./AnnouncementCard";
import TrendingSection from "./TrendingSection";
import FeedCardNavigation from "./FeedCardNavigation";
import AnnouncementModal from "./AnnouncementModal";
import { Plus, Users, Megaphone, Brain, X, ClipboardList, MessageCircle } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const highlightId = new URLSearchParams(location.search).get("highlight");

  const [view, setView] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [adminAnnouncements, setAdminAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    eventType: "Workshop",
    startDate: "",
    endDate: "",
    expiryDate: "",
    registrationRequired: false,
    link: "",
    coverImage: null,
    targetBadge: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchAdminFeed();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredAnnouncements(adminAnnouncements);
    } else {
      const filtered = adminAnnouncements.filter(a => 
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (a.description || a.content)?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAnnouncements(filtered);
    }
  }, [searchTerm, adminAnnouncements]);

  useEffect(() => {
    if (highlightId && !loading && filteredAnnouncements.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`announcement-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          
          // Original styles to restore
          const origShadow = element.style.boxShadow;
          const origTransform = element.style.transform;
          const origBorder = element.style.border;

          // Apply highlight
          element.style.transition = "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
          element.style.boxShadow = "0 0 30px rgba(59, 130, 246, 0.5)";
          element.style.transform = "scale(1.02)";
          element.style.border = "1px solid var(--accent-faculty)";
          
          setTimeout(() => {
            element.style.boxShadow = origShadow;
            element.style.transform = origTransform;
            element.style.border = origBorder;
          }, 3500); // Keeps highlighted for 3.5 seconds
        } else {
          // Edge case handling
          const messageSpan = document.createElement("div");
          messageSpan.innerText = "Highlighted announcement not found in your main feed.";
          messageSpan.className = "share-toast";
          messageSpan.style.top = "80px";
          document.body.appendChild(messageSpan);
          setTimeout(() => messageSpan.remove(), 3000);
        }
      }, 300); // 300ms delay to ensure DOM layout is complete
    }
  }, [highlightId, loading, filteredAnnouncements]);

  async function fetchUser() {
    try {
      const res = await fetch("http://localhost:5000/api/auth/current-user", { credentials: "include" });
      const data = await res.json();
      setUser(data?.name ? data : null);
    } catch { setUser(null); }
  }

  async function fetchAdminFeed() {
    try {
      const res = await fetch("http://localhost:5000/api/announcements/admin", { credentials: "include" });
      const data = await res.json();
      setAdminAnnouncements(Array.isArray(data) ? data : []);
      setFilteredAnnouncements(Array.isArray(data) ? data : []);
    } catch { setAdminAnnouncements([]); setFilteredAnnouncements([]); }
    finally { setLoading(false); }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return;
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === "coverImage") { if (formData.coverImage) form.append("image", formData.coverImage); }
      else { form.append(key, formData[key]); }
    });

    if (formData.targetBadge) {
      await fetch("http://localhost:5000/api/announcement-requests", { method: "POST", credentials: "include", body: form });
    } else {
      await fetch("http://localhost:5000/api/announcements/student-request", { method: "POST", credentials: "include", body: form });
    }

    setShowModal(false);
    setFormData({ title: "", description: "", venue: "", eventType: "Workshop", startDate: "", endDate: "", expiryDate: "", registrationRequired: false, link: "", coverImage: null, targetBadge: "" });
    fetchAdminFeed();
  };

  return (
    <div className="student-container">
      {/* Background Decorations */}
      <div className="dashboard-bg">
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
      </div>

      <div className="student-header animate-fade-in-down">
        <div className="header-left">
          <h2>ACADEMIX</h2>
          <span className="sub-title" style={{ color: 'var(--accent-student)', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.1em' }}>STUDENT PORTAL</span>
        </div>
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="icon-btn" 
            onClick={() => navigate("/messages")} 
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
            title="Messages"
          >
            <MessageCircle size={24} />
          </button>
          <NotificationDropdown />
          <button className="logout-btn" onClick={() => { window.location.href = "http://localhost:5000/api/auth/logout"; }}>
            Sign Out
          </button>
        </div>
      </div>

      {view === "dashboard" && (
        <>
          <div className="welcome-section animate-fade-in-up">
            <p className="welcome-label">Welcome back,</p>
            <h1 className="welcome-name">
               {user?.name ? user.name : "Student"}
            </h1>
          </div>

          <div className="card-grid">
            <div className="animate-card-1"><ProfileCard user={user} /></div>
            <div className="dashboard-card animate-card-2" onClick={() => setShowModal(true)}>
              <div className="plus-icon"><Plus size={28} /></div>
              <h3>Create Post</h3>
              <p>Propose a new announcement for approval</p>
            </div>

            <div className="dashboard-card animate-card-3" onClick={() => navigate("/chat")}>
               <div className="plus-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}><MessageCircle size={28} /></div>
              <h3>Chatbox 💬</h3>
              <p>Message and connect with other users</p>
            </div>

            <div className="dashboard-card animate-card-4" onClick={() => navigate("/study-groups")}>
               <div className="plus-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white' }}><Users size={28} /></div>
              <h3>Study Groups</h3>
              <p>Discuss, share notes and collaborate</p>
            </div>

            <div className="dashboard-card animate-card-4" onClick={() => navigate("/doubts")}>
               <div className="plus-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}><Megaphone size={28} /></div>
              <h3>Doubt System</h3>
              <p>Resolve your academic questions</p>
            </div>

            <div className="dashboard-card animate-card-5" onClick={() => navigate("/smart-learning-hub")}>
               <div className="plus-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)', color: 'white' }}><Brain size={28} /></div>
              <h3>Smart Learning Hub</h3>
              <p>Personalized resource recommendations</p>
            </div>

            {user?.isBadgeAdmin && (
              <div className="dashboard-card animate-card-6" onClick={() => navigate("/manage-announcements")}>
                <div className="plus-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}><ClipboardList size={28} /></div>
                <h3>Manage Requests</h3>
                <p>Approve requests for {user.badgeName}</p>
              </div>
            )}

            <FeedCardNavigation />
          </div>

          <TrendingSection />

          <div className="main-feed-container" style={{ marginTop: "48px" }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                  <h2 className="faculty-section-title" style={{ borderLeftColor: 'var(--accent-faculty)', margin: 0 }}>Admin Announcements</h2>
                  
                  <div className="search-bar-wrapper" style={{ position: 'relative', width: '350px', maxWidth: '100%' }}>
                     <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }}>
                        <Megaphone size={18} />
                     </div>
                     <input 
                        type="text" 
                        placeholder="Search by title or content..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                           width: '100%', 
                           padding: '12px 16px 12px 48px', 
                           background: 'rgba(255,255,255,0.03)', 
                           border: '1px solid var(--border-subtle)', 
                           borderRadius: '12px',
                           color: 'white',
                           fontSize: '0.95rem',
                           outline: 'none',
                           transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-faculty)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                     />
                     {searchTerm && (
                        <button 
                           onClick={() => setSearchTerm("")}
                           style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                        >
                           <X size={16} />
                        </button>
                     )}
                  </div>
               </div>

               {loading ? (
                 <div style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)" }}>Loading Admin Feed...</div>
               ) : (filteredAnnouncements.length > 0 || searchTerm) ? (
                 <>
                   {filteredAnnouncements.length > 0 ? (
                     <div className="feed-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '32px' }}>
                      {filteredAnnouncements.map((a, i) => (
                        <div key={a._id} className="animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
                          <AnnouncementCard a={a} currentUser={user} />
                        </div>
                      ))}
                     </div>
                   ) : (
                     <div className="faculty-empty" style={{ padding: "60px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px dashed var(--border-subtle)" }}>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>🔍 No results found for "{searchTerm}"</p>
                        <button onClick={() => setSearchTerm("")} style={{ marginTop: '12px', color: 'var(--accent-faculty)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>Clear Search</button>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="faculty-empty" style={{ padding: "60px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px dashed var(--border-subtle)" }}>
                    <p>No announcements available</p>
                 </div>
               )}
          </div>
        </>
      )}

      {/* community view can be removed or kept as a legacy, but I'll simplify it away for the main dashboard feed requirement */}
      {view === "student" && (
         <div style={{ textAlign: "center", padding: "50px" }}>
            <button className="back-button" onClick={() => setView("dashboard")}>← Dashboard</button>
            <p>This view is merged into the Main Feed.</p>
         </div>
      )}

      <AnnouncementModal 
        showModal={showModal} 
        setShowModal={setShowModal} 
        formData={formData} 
        setFormData={setFormData} 
        handleChange={handleChange} 
        handleSubmit={handleSubmit} 
      />
    </div>
  );
}

const ProfileCard = ({ user }) => {
  const navigate = useNavigate();
  if (!user) return null;
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase();
  
  return (
    <div className="profile-card" onClick={() => navigate("/profile")} style={{ cursor: 'pointer' }}>
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <h3>{user.name}</h3>
          <p className="profile-role">{user.role || "Student"}</p>
        </div>
      </div>
      <div className="profile-details">
        <div className="detail-item">
          <span className="detail-label">{user.role === 'faculty' ? 'Department' : 'Department'}</span>
          <span className="detail-value">{user.department || "N/A"}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">{user.role === 'faculty' ? 'Designation' : 'Semester'}</span>
          <span className="detail-value">{user.role === 'faculty' ? user.designation : user.semester || "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;