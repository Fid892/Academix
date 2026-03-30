import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FacultyDashboard.css";
import "./Dashboard.css";
import CreateGroupModal from "./CreateGroupModal";
import NotificationDropdown from "./NotificationDropdown";
import SocialActions from "./SocialActions";
import { Megaphone, Users, HelpCircle, ClipboardList, Zap, Calendar, MapPin } from "lucide-react";

function FacultyDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [viewMode, setViewMode] = useState("admin"); // 'admin' or 'peer'
  const [user, setUser] = useState(null);
  const [facultyOfficialAnnouncements, setFacultyOfficialAnnouncements] = useState([]);
  const [myBroadcasts, setMyBroadcasts] = useState([]);
  const [allFacultyBroadcasts, setAllFacultyBroadcasts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    eventType: "Workshop",
    startDate: "",
    endDate: "",
    registrationRequired: false,
    link: "",
    coverImage: null
  });

  useEffect(() => {
    fetchUser();
    loadAnnouncements();
  }, []);

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
      // Admin notices for faculty
      const resOfficial = await fetch("http://localhost:5000/api/announcements/official?type=faculty");
      const dataOfficial = await resOfficial.json();
      setFacultyOfficialAnnouncements(Array.isArray(dataOfficial) ? dataOfficial : []);

      // My own broadcasts
      const resMy = await fetch("http://localhost:5000/api/announcements/my", { credentials: "include" });
      const dataMy = await resMy.json();
      setMyBroadcasts(Array.isArray(dataMy) ? dataMy : []);

      // All faculty broadcasts (the whole faculty feed)
      const resAllFac = await fetch("http://localhost:5000/api/announcements/official?type=facultyPosts");
      const dataAllFac = await resAllFac.json();
      setAllFacultyBroadcasts(Array.isArray(dataAllFac) ? dataAllFac : []);
    } catch { 
      setFacultyOfficialAnnouncements([]);
      setMyBroadcasts([]);
      setAllFacultyBroadcasts([]);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return;
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === "coverImage") { if (formData.coverImage) form.append("image", formData.coverImage); }
      else { form.append(key, formData[key]); }
    });
    const res = await fetch("http://localhost:5000/api/announcements/faculty-post", { method: "POST", credentials: "include", body: form });
    if (res.ok) {
      setShowModal(false);
      setFormData({ title: "", description: "", venue: "", eventType: "Workshop", startDate: "", endDate: "", registrationRequired: false, link: "", coverImage: null });
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
          <NotificationDropdown />
          <button className="logout-btn" onClick={() => { window.location.href = "http://localhost:5000/api/auth/logout"; }}>
            Sign Out
          </button>
        </div>
      </div>

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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px' }}>
             <section>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                   <button 
                     onClick={() => setViewMode('admin')} 
                     className={`tab-btn ${viewMode === 'admin' ? 'active' : ''}`}
                     style={{ background: 'transparent', border: 'none', color: viewMode === 'admin' ? 'var(--accent-faculty)' : 'var(--text-dim)', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}
                   >
                     ADMIN DIRECTIVES
                   </button>
                   <button 
                     onClick={() => setViewMode('peer')} 
                     className={`tab-btn ${viewMode === 'peer' ? 'active' : ''}`}
                     style={{ background: 'transparent', border: 'none', color: viewMode === 'peer' ? 'var(--accent-faculty)' : 'var(--text-dim)', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}
                   >
                     FACULTY FEED
                   </button>
                </div>

                {viewMode === 'admin' ? (
                  <>
                    {facultyOfficialAnnouncements.map(a => <FacultyAnnouncementCard key={a._id} a={a} />)}
                    {facultyOfficialAnnouncements.length === 0 && <div className="faculty-empty">No new directives found.</div>}
                  </>
                ) : (
                  <>
                    {allFacultyBroadcasts.map(a => <FacultyAnnouncementCard key={a._id} a={a} showAuthor />)}
                    {allFacultyBroadcasts.length === 0 && <div className="faculty-empty">No peer broadcasts yet.</div>}
                  </>
                )}

                <h2 className="faculty-section-title" style={{ borderColor: 'var(--accent-primary)', marginTop: '64px' }}>My Recent Broadcasts</h2>
                {myBroadcasts.map(a => <FacultyAnnouncementCard key={a._id} a={a} isMyPost />)}
                {myBroadcasts.length === 0 && <div className="faculty-empty">You haven't posted any broadcasts yet.</div>}
             </section>
             <aside>
                <div className="announcement-card" style={{ borderStyle: 'dashed', textAlign: 'center', padding: '40px', position: 'sticky', top: '20px' }}>
                   <div style={{ marginBottom: '20px', color: 'var(--accent-faculty)' }}><Zap size={48} /></div>
                   <h3 style={{ margin: '0 0 8px' }}>Reach Students Fast</h3>
                   <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Announcements posted here bypass approval and reach students instantly.</p>
                   <button className="primary-btn" style={{ background: 'var(--accent-faculty)', width: '100%' }} onClick={() => setShowModal(true)}>Post Announcement</button>
                   <button className="primary-btn" style={{ background: 'var(--accent-student)', width: '100%', marginTop: '12px' }} onClick={() => setShowGroupModal(true)}>+ Create Group</button>
                </div>
             </aside>
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
             {facultyOfficialAnnouncements.map(a => <FacultyAnnouncementCard key={a._id} a={a} />)}
             {allFacultyBroadcasts.map(a => <FacultyAnnouncementCard key={a._id} a={a} showAuthor />)}
          </div>
        </>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '600px', width: '90%' }}>
            <h2>Broadcast To Students</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input name="title" placeholder="Announcement Title *" value={formData.title} onChange={handleChange} />
              <textarea name="description" placeholder="Write the content for students..." rows={6} value={formData.description} onChange={handleChange} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input name="venue" placeholder="Venue (Optional)" value={formData.venue} onChange={handleChange} />
                 <select name="eventType" value={formData.eventType} onChange={handleChange}>
                  <option>Workshop</option><option>Seminar</option><option>Hackathon</option><option>Internship</option><option>Exam</option><option>General</option>
                </select>
              </div>

              <input name="link" type="url" placeholder="Registration Link / External URL" value={formData.link} onChange={handleChange} />

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>End Date</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                  </div>
               </div>

               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#25262b', padding: '12px', borderRadius: '12px' }}>
                  <input 
                    type="checkbox" 
                    name="registrationRequired" 
                    checked={formData.registrationRequired} 
                    onChange={handleChange} 
                    style={{ width: '20px', height: '20px' }}
                  />
                  <label>Registration Required</label>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                  <input type="file" style={{ padding: '8px' }} onChange={(e) => setFormData({ ...formData, coverImage: e.target.files[0] })} />
                   <button className="primary-btn" style={{ background: 'var(--accent-faculty)' }} onClick={handleSubmit}>Publish Instantly</button>
               </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
               <button className="secondary-btn" onClick={() => setShowModal(false)}>Discard Draft</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FacultyAnnouncementCard = ({ a, isMyPost, showAuthor }) => (
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
    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{a.description}</p>
    
    {(a.startDate || a.venue) && (
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-dim)', alignItems: 'center' }}>
        {a.startDate && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={16} /> {new Date(a.startDate).toLocaleDateString()}</span>}
        {a.venue && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> {a.venue}</span>}
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
