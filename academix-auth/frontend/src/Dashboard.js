import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [user, setUser] = useState(null);

  const [adminAnnouncements, setAdminAnnouncements] = useState([]);
  const [studentAnnouncements, setStudentAnnouncements] = useState([]);
  const [facultyAnnouncements, setFacultyAnnouncements] = useState([]);
  const [myAnnouncements, setMyAnnouncements] = useState([]);

  const [showModal, setShowModal] = useState(false);
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
    loadAll();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("http://localhost:5000/api/auth/current-user", { credentials: "include" });
      const data = await res.json();
      setUser(data?.name ? data : null);
    } catch { setUser(null); }
  }

  const loadAll = async () => {
    await Promise.all([loadOfficial(), loadStudentApproved(), loadFacultyPosts(), loadMine()]);
  };

  const loadOfficial = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/announcements/official?type=admin");
      const data = await res.json();
      setAdminAnnouncements(Array.isArray(data) ? data : []);
    } catch { setAdminAnnouncements([]); }
  };

  const loadStudentApproved = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/announcements/official?type=student");
      const data = await res.json();
      setStudentAnnouncements(Array.isArray(data) ? data : []);
    } catch { setStudentAnnouncements([]); }
  };

  const loadFacultyPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/announcements/official?type=facultyPosts");
      const data = await res.json();
      setFacultyAnnouncements(Array.isArray(data) ? data : []);
    } catch { setFacultyAnnouncements([]); }
  };

  const loadMine = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/announcements/my", { credentials: "include" });
      const data = await res.json();
      setMyAnnouncements(Array.isArray(data) ? data : []);
    } catch { setMyAnnouncements([]); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return;
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === "coverImage") { if (formData.coverImage) form.append("image", formData.coverImage); }
      else { form.append(key, formData[key]); }
    });
    await fetch("http://localhost:5000/api/announcements/student-request", { method: "POST", credentials: "include", body: form });
    setShowModal(false);
    setFormData({ title: "", description: "", venue: "", eventType: "Workshop", startDate: "", endDate: "", registrationRequired: false, link: "", coverImage: null });
    loadAll();
  };

  return (
    <div className="student-container">
      <div className="student-header">
        <div className="header-left">
          <h2>ACADEMIX</h2>
          <span className="sub-title" style={{ color: 'var(--accent-student)', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.1em' }}>STUDENT PORTAL</span>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={() => { window.location.href = "http://localhost:5000/api/auth/logout"; }}>
            Sign Out
          </button>
        </div>
      </div>

      {view === "dashboard" && (
        <>
          <div style={{ marginBottom: '60px' }}>
            <p style={{ color: 'var(--accent-student)', fontWeight: '600', marginBottom: '8px', fontSize: '1rem' }}>Welcome back,</p>
            <h1 style={{ fontSize: '3.5rem', margin: 0, fontWeight: '800', letterSpacing: '-0.03em' }}>
               {user?.name ? user.name : "Student"}
            </h1>
          </div>

          <div className="card-grid">
            <div className="dashboard-card" onClick={() => setShowModal(true)}>
              <div className="plus-icon">+</div>
              <h3>Create Post</h3>
              <p>Propose a new announcement for approval</p>
            </div>

            <div className="dashboard-card" onClick={() => navigate("/study-groups")}>
               <div className="plus-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>👥</div>
              <h3>Study Groups</h3>
              <p>Discuss, share notes and collaborate</p>
            </div>

            <div className="dashboard-card" onClick={() => navigate("/doubts")}>
               <div className="plus-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>❓</div>
              <h3>Ask Question</h3>
              <p>Get your academic doubts resolved by faculty</p>
            </div>

            <div className="dashboard-card" onClick={() => setView("student")}>
              <div className="plus-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>📢</div>
              <h3>Student Feed</h3>
              <p>View community announcements</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px' }}>
             <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                   <h2 className="faculty-section-title" style={{ borderLeftColor: 'var(--accent-student)', margin: 0 }}>Official Notices</h2>
                </div>
                {adminAnnouncements.map(a => <AnnouncementCard key={a._id} a={a} />)}
                {adminAnnouncements.length === 0 && <div className="faculty-empty">No official notices today.</div>}
             </section>

             <section>
                <h2 className="faculty-section-title" style={{ borderLeftColor: 'var(--accent-faculty)', marginBottom: '32px' }}>Faculty Posting</h2>
                {facultyAnnouncements.map(a => <AnnouncementCard key={a._id} a={a} showFacultyInfo />)}
                {facultyAnnouncements.length === 0 && <div className="faculty-empty">No faculty updates yet.</div>}
             </section>
          </div>
        </>
      )}

      {view === "student" && (
        <>
          <div className="back-btn-container">
            <button className="back-button" onClick={() => setView("dashboard")}>← Dashboard</button>
          </div>
          <h2 className="faculty-section-title" style={{ borderLeftColor: 'var(--accent-student)' }}>Student Community Feed</h2>
          <div style={{ columns: '2', gap: '24px' }}>
             {studentAnnouncements.map(a => <AnnouncementCard key={a._id} a={a} />)}
          </div>
          {studentAnnouncements.length === 0 && <div className="faculty-empty">The community feed is quiet right now.</div>}
        </>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '600px', width: '90%' }}>
            <h2>New Announcement</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input name="title" placeholder="Catchy Title *" value={formData.title} onChange={handleChange} />
              <textarea name="description" placeholder="Provide full details..." rows={5} value={formData.description} onChange={handleChange} />
              <input name="venue" placeholder="Venue / Location" value={formData.venue} onChange={handleChange} />
              <input name="link" type="url" placeholder="Reference Link (External)" value={formData.link} onChange={handleChange} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <select name="eventType" value={formData.eventType} onChange={handleChange}>
                  <option>Workshop</option><option>Seminar</option><option>Hackathon</option><option>Internship</option><option>Exam</option><option>General</option>
                </select>
                <input type="file" style={{ padding: '12px' }} onChange={(e) => setFormData({ ...formData, coverImage: e.target.files[0] })} />
              </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} title="Start Date" />
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} title="End Date" />
               </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Discard</button>
              <button className="primary-btn" style={{ flex: 2, background: 'var(--accent-student)' }} onClick={handleSubmit}>Request Approval</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const AnnouncementCard = ({ a, showFacultyInfo }) => (
  <div className="announcement-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
       <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{a.title}</h3>
       {a.eventType && <span className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>{a.eventType}</span>}
    </div>
    <p style={{ margin: '0 0 20px', fontSize: '1rem' }}>{a.description}</p>
    
    {a.image && <img src={`http://localhost:5000/uploads/${a.image}`} alt="" style={{ width: '100%', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-subtle)' }} />}
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
       {a.link ? <a href={a.link} target="_blank" rel="noreferrer" className="announcement-link">Explore Further</a> : <div></div>}
       <small style={{ color: 'var(--text-dim)' }}>{new Date(a.createdAt).toLocaleDateString()}</small>
    </div>

    {showFacultyInfo && a.postedBy && (
      <div className="faculty-info-box" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'var(--accent-faculty)' }}>
        <div style={{ width: '32px', height: '32px', background: 'var(--accent-faculty)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
           {a.postedBy.name?.[0].toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>Prof. {a.postedBy.name}</p>
          <small>{a.postedBy.department} Department</small>
        </div>
      </div>
    )}
  </div>
);

export default Dashboard;