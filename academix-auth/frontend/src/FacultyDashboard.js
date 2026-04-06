import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FacultyDashboard.css";
import "./Dashboard.css";
import CreateGroupModal from "./CreateGroupModal";
import BroadcastModal from "./BroadcastModal";
import NotificationDropdown from "./NotificationDropdown";
import SocialActions from "./SocialActions";
import { Megaphone, Users, HelpCircle, ClipboardList, Zap, Calendar, MapPin, X, MessageCircle } from "lucide-react";

function FacultyDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [facultyOfficialAnnouncements, setFacultyOfficialAnnouncements] = useState([]);
  const [myBroadcasts, setMyBroadcasts] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
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
    pdfFile: null
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOfficial, setFilteredOfficial] = useState([]);
  const [filteredMyBroadcasts, setFilteredMyBroadcasts] = useState([]);

  useEffect(() => {
    fetchUser();
    loadAnnouncements();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredOfficial(facultyOfficialAnnouncements);
      setFilteredMyBroadcasts(myBroadcasts);
    } else {
      const lowTerm = searchTerm.toLowerCase();
      setFilteredOfficial(facultyOfficialAnnouncements.filter(a => 
        a.title?.toLowerCase().includes(lowTerm) || (a.content || a.description)?.toLowerCase().includes(lowTerm)
      ));
      setFilteredMyBroadcasts(myBroadcasts.filter(a => 
        a.title?.toLowerCase().includes(lowTerm) || (a.content || a.description)?.toLowerCase().includes(lowTerm)
      ));
    }
  }, [searchTerm, facultyOfficialAnnouncements, myBroadcasts]);

  async function fetchUser() {
    try {
      const res = await fetch("http://localhost:5000/api/auth/current-user", { credentials: "include" });
      const data = await res.json();
      if (data && data.name) { setUser(data); }
      else { navigate("/login"); }
    } catch { navigate("/login"); }
  }

  async function loadAnnouncements() {
    try {
      // Feature 2: Admin messages for faculty (Department Targeted)
      const resOfficial = await fetch("http://localhost:5000/api/faculty/messages", { credentials: "include" });
      const dataOfficial = await resOfficial.json();
      const officialArr = Array.isArray(dataOfficial) ? dataOfficial : [];
      setFacultyOfficialAnnouncements(officialArr);
      setFilteredOfficial(officialArr);

      // My own broadcasts
      const resMy = await fetch("http://localhost:5000/api/announcements/my", { credentials: "include" });
      const dataMy = await resMy.json();
      const myArr = Array.isArray(dataMy) ? dataMy : [];
      setMyBroadcasts(myArr);
      setFilteredMyBroadcasts(myArr);
    } catch { 
      setFacultyOfficialAnnouncements([]);
      setMyBroadcasts([]);
      setFilteredOfficial([]);
      setFilteredMyBroadcasts([]);
    }
  }

  const handleForward = async (id) => {
    try {
      const res = await fetch("http://localhost:5000/api/faculty/forward-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalMessageId: id }),
        credentials: "include"
      });
      if (res.ok) {
        alert("Message successfully shared with your students!");
        loadAnnouncements(); // Refresh to disable button
      }
      else alert("Forwarding failed. Check permissions.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return;
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === "coverImage") { 
        if (formData.coverImage) form.append("image", formData.coverImage); 
      }
      else if (key === "pdfFile") {
        if (formData.pdfFile) form.append("pdf", formData.pdfFile);
      }
      else { form.append(key, formData[key]); }
    });

    const res = await fetch("http://localhost:5000/api/announcements/faculty-post", { 
      method: "POST", 
      credentials: "include", 
      body: form 
    });

    if (res.ok) {
      setShowModal(false);
      setFormData({ 
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
        pdfFile: null
      });
      loadAnnouncements();
      alert("Announcement published!");
    }
  };

  if (!user) return null;

  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="faculty-container">
      <div className="faculty-header">
        <div className="header-left">
          <h2>ACADEMIX</h2>
          <span className="sub-title" style={{ color: 'var(--accent-faculty)' }}>FACULTY PORTAL</span>
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

      {/* Broadcast Modal Component */}
      <BroadcastModal 
        showModal={showModal} 
        setShowModal={setShowModal} 
        formData={formData} 
        setFormData={setFormData} 
        handleChange={handleChange} 
        handleSubmit={handleSubmit} 
      />

      {view === "dashboard" && (
        <>
          <div className="faculty-welcome-banner" onClick={() => navigate("/profile")} style={{ cursor: 'pointer' }}>
            <div className="welcome-avatar">{initials}</div>
            <div className="welcome-text">
              <p style={{ color: 'var(--accent-faculty)', fontWeight: 'bold', margin: '0 0 8px', letterSpacing: '0.1em' }}>Welcome Professor,</p>
              <h1>{user.name}</h1>
              <p>{user.department} Department · Faculty Dashboard</p>
            </div>
          </div>

          <div className="faculty-card-grid">
            <div className="faculty-card" onClick={() => setShowModal(true)}>
              <div className="faculty-card-icon"><Megaphone size={28} /></div>
              <h3>Broadcast</h3>
              <p>Post announcements directly to the student body</p>
            </div>

            <div className="faculty-card" onClick={() => navigate("/chat")}>
              <div className="faculty-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><MessageCircle size={28} /></div>
              <h3>Chatbox 💬</h3>
              <p>Message and connect with other users</p>
            </div>

            <div className="faculty-card" onClick={() => navigate("/study-groups")}>
              <div className="faculty-card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}><Users size={28} /></div>
              <h3>Collaborations</h3>
              <p>Manage study groups and course resources</p>
            </div>

            <div className="faculty-card" onClick={() => navigate("/doubts")}>
              <div className="faculty-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><HelpCircle size={28} /></div>
              <h3>Q&A Hub</h3>
              <p>Review and resolve student academic doubts</p>
            </div>

            <div className="faculty-card" onClick={() => setView("announcements")}>
              <div className="faculty-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><ClipboardList size={28} /></div>
              <h3>Admin Intel</h3>
              <p>Official internal notices from administration</p>
            </div>

            {user?.isBadgeAdmin && (
              <div className="faculty-card" onClick={() => navigate("/manage-announcements")}>
                <div className="faculty-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><ClipboardList size={28} /></div>
                <h3>Manage Requests</h3>
                <p>Approve requests for {user.badgeName}</p>
              </div>
            )}
          </div>

          <div className="search-bar-container" style={{ margin: '48px 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '32px' }}>
              <div className="search-bar-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                  <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-faculty)', pointerEvents: 'none' }}>
                      <Megaphone size={22} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search messages, broadcasts, or announcements..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '18px 24px 18px 60px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: '16px',
                      color: 'white',
                      fontSize: '1.1rem',
                      outline: 'none',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-faculty)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm("")}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '8px' }}
                    >
                      <X size={20} />
                    </button>
                  )}
              </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>
             <section>
                 <h2 className="faculty-section-title" style={{ borderColor: 'var(--accent-faculty)', marginBottom: '32px' }}>
                    {searchTerm ? `Search Results in Admin Directives (${filteredOfficial.length})` : 'ADMIN DIRECTIVES'}
                 </h2>
                 {filteredOfficial.map(a => <FacultyAnnouncementCard key={a._id} a={a} onForward={handleForward} />)}
                 {filteredOfficial.length === 0 && (
                    <div className="faculty-empty">
                        {searchTerm ? `No admin directives matching "${searchTerm}"` : 'No new directives found.'}
                    </div>
                 )}


                <h2 className="faculty-section-title" style={{ borderColor: 'var(--accent-primary)', marginTop: '64px' }}>
                    {searchTerm ? `Search Results in My Broadcasts (${filteredMyBroadcasts.length})` : 'My Recent Broadcasts'}
                </h2>
                {filteredMyBroadcasts.map(a => <FacultyAnnouncementCard key={a._id} a={a} isMyPost />)}
                {filteredMyBroadcasts.length === 0 && (
                    <div className="faculty-empty">
                        {searchTerm ? `No broadcasts matching "${searchTerm}"` : "You haven't posted any broadcasts yet."}
                    </div>
                )}
             </section>
          </div>
        </>
      )}

      {/* Group Creation Modal */}
      <CreateGroupModal 
        isOpen={showGroupModal} 
        onClose={() => setShowGroupModal(false)} 
        onCreated={(group) => {
            if (group && group._id) {
               navigate(`/study-groups/${group._id}`);
            } else {
               navigate("/study-groups");
            }
        }} 
      />

      {view === "announcements" && (
        <>
          <div className="back-btn-container">
            <button className="back-button" onClick={() => setView("dashboard")}>← Dashboard</button>
          </div>
          <h2 className="faculty-section-title" style={{ borderColor: 'var(--accent-faculty)' }}>All Official Communications</h2>
          <div style={{ columns: '2', gap: '24px' }}>
             {facultyOfficialAnnouncements.map(a => <FacultyAnnouncementCard key={a._id} a={a} onForward={handleForward} />)}
             {facultyOfficialAnnouncements.length === 0 && <div className="faculty-empty">No new directives found.</div>}
          </div>
        </>
      )}
    </div>
  );
}

const FacultyAnnouncementCard = ({ a, isMyPost, showAuthor, onForward }) => (
  <div className="announcement-card" style={{ borderLeft: `4px solid ${isMyPost ? 'var(--accent-primary)' : 'var(--accent-faculty)'}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
       <h3 style={{ margin: 0 }}>{a.title}</h3>
       <span className="status-badge resolved" style={{ 
          background: isMyPost ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
          color: isMyPost ? 'var(--accent-primary)' : 'var(--accent-faculty)' 
       }}>
         {isMyPost ? 'MY BROADCAST' : (showAuthor ? 'PEER POST' : 'OFFICIAL')}
       </span>
    </div>
    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{a.content || a.description}</p>
    
    {a.targetDepartmentName && (
      <div style={{ marginTop: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-faculty)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Department: {a.targetDepartmentName}
        </span>
      </div>
    )}

    {(a.startDate || a.venue) && (
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-dim)', alignItems: 'center' }}>
        {a.startDate && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={16} /> {new Date(a.startDate).toLocaleDateString()}</span>}
        {a.venue && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> {a.venue}</span>}
      </div>
    )}

    {/* Feature 2: Conditional & Disabled Share Button */}
    {a.forwardToStudents && !isMyPost && onForward && (
      <div style={{ marginTop: '20px' }}>
        <button 
          className="primary-btn" 
          disabled={a.isSharedWithStudents}
          style={{ 
            width: '100%', 
            background: a.isSharedWithStudents ? '#2c2e33' : 'var(--accent-student)', 
            fontSize: '0.9rem',
            color: a.isSharedWithStudents ? 'var(--text-dim)' : 'white',
            cursor: a.isSharedWithStudents ? 'not-allowed' : 'pointer'
          }}
          onClick={() => onForward(a._id)}
        >
          {a.isSharedWithStudents ? "Shared With Students" : "[ Share with Students ]"}
        </button>
      </div>
    )}

    {a.postedByRole !== "admin" && a.postedByRole !== "mainAdmin" && (
      <SocialActions announcementId={a._id} link={a.link} />
    )}

    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', textAlign: 'right' }}>
       <small style={{ color: 'var(--text-dim)' }}>
         {isMyPost ? 'Published by Me' : (showAuthor ? `Prof. ${a.postedBy?.name}` : 'Administrator')} · {new Date(a.createdAt).toLocaleDateString()}
       </small>
    </div>
  </div>
);

export default FacultyDashboard;
