import { useState, useEffect } from "react";
import "./Admin.css";
import { useNavigate } from "react-router-dom";
import ManageGroups from "./ManageGroups";
import ManageUsers from "./ManageUsers";
import SocialActions from "./SocialActions";
import FacultyMessagesPage from "./FacultyMessagesPage";
import { BarChart2, Megaphone, GraduationCap, Clock, Folder, Users, LogOut, Tag, MapPin, Calendar, Plus, MessagesSquare } from "lucide-react";

function Admin() {

  const navigate = useNavigate();

  /* ==============================
     Navigation
  ============================== */

  const [activeSection, setActiveSection] = useState("dashboard");

  /* ==============================
     Dashboard Stats
  ============================== */

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAnnouncements: 0,
    pendingRequests: 0
  });

  /* ==============================
     Existing Announcement States
  ============================== */

  const [officialAnnouncements, setOfficialAnnouncements] = useState([]);
  const [studentApprovedAnnouncements, setStudentApprovedAnnouncements] = useState([]);
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);

  /* ==============================
     Notice Modal State
  ============================== */

  const [showNoticeModal, setShowNoticeModal] = useState(false);

  const [noticeForm, setNoticeForm] = useState({
    title: "",
    description: "",
    venue: "",
    type: "General",
    singleDate: "",
    startDate: "",
    endDate: "",
    includeImage: false,
    image: null,
    target: "student" // Default to student
  });

  const [preview, setPreview] = useState(null);

  /* ==============================
     Initial Load
  ============================== */

  useEffect(() => {
    checkToken();
    loadAll();
  }, []);

  const checkToken = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/current-user", { credentials: "include" });
      if (!res.ok) navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const loadAll = async () => {
    await Promise.all([
      loadStats(),
      loadOfficial(),
      loadStudentApproved(),
      loadPending()
    ]);
  };

  /* ==============================
     Loaders
  ============================== */

  const loadStats = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/dashboard-stats",
        { credentials: "include" }
      );
      const data = await res.json();
      setStats(data || {});
    } catch {}
  };

  const loadOfficial = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/announcements/official?type=admin"
      );
      const data = await res.json();
      setOfficialAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      setOfficialAnnouncements([]);
    }
  };

  const loadStudentApproved = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/announcements/official?type=student"
      );
      const data = await res.json();
      setStudentApprovedAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      setStudentApprovedAnnouncements([]);
    }
  };

  const loadPending = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/announcements/pending",
        { credentials: "include" }
      );
      const data = await res.json();
      setPendingAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      setPendingAnnouncements([]);
    }
  };



  /* ==============================
     Approve / Reject
  ============================== */

  const approve = async (id) => {
    await fetch(
      `http://localhost:5000/api/announcements/${id}/approve`,
      { method: "PATCH", credentials: "include" }
    );
    loadAll();
  };

  const reject = async (id) => {
    await fetch(
      `http://localhost:5000/api/announcements/${id}/reject`,
      { method: "PATCH", credentials: "include" }
    );
    loadAll();
  };

  /* ==============================
     Notice Publish Logic
  ============================== */

  const publishNotice = async () => {

    if (!noticeForm.title || !noticeForm.description) {
      alert("Title and Description required");
      return;
    }

    const form = new FormData();

    form.append("title", noticeForm.title);
    form.append("description", noticeForm.description);
    form.append("venue", noticeForm.venue);
    form.append("eventType", noticeForm.type);

    if (noticeForm.type === "Holiday") {
      form.append("startDate", noticeForm.singleDate);
    } else {
      form.append("startDate", noticeForm.startDate);
      form.append("endDate", noticeForm.endDate);
    }

    form.append("target", noticeForm.target); // Added target field

    if (noticeForm.includeImage && noticeForm.image) {
      form.append("image", noticeForm.image);
    }

    await fetch(
      "http://localhost:5000/api/announcements/create",
      {
        method: "POST",
        credentials: "include",
        body: form
      }
    );

    resetNoticeForm();
    setShowNoticeModal(false);
    loadAll();
  };

  const resetNoticeForm = () => {
    setNoticeForm({
      title: "",
      description: "",
      venue: "",
      type: "General",
      singleDate: "",
      startDate: "",
      endDate: "",
      includeImage: false,
      image: null,
      target: "student"
    });
    setPreview(null);
  };

  /* ==============================
     Logout
  ============================== */

  const handleLogout = () => {
    window.location.href = "http://localhost:5000/api/auth/logout";
  };

  /* ==============================
     UI
  ============================== */

  return (
    <div className="admin-container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>Academix</h2>
        <ul>
          <li
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => setActiveSection("dashboard")}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <BarChart2 size={18} style={{marginRight: '8px'}} /> Dashboard
          </li>

          <li
            className={activeSection === "notice" ? "active" : ""}
            onClick={() => setActiveSection("notice")}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Megaphone size={18} style={{marginRight: '8px'}} /> Official Notice
          </li>

          <li
            className={activeSection === "announcements" ? "active" : ""}
            onClick={() => setActiveSection("announcements")}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <GraduationCap size={18} style={{marginRight: '8px'}} /> Student Posts
          </li>

          <li
            className={activeSection === "pending" ? "active" : ""}
            onClick={() => setActiveSection("pending")}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Clock size={18} style={{marginRight: '8px'}} /> Pending Requests
          </li>

          <li
            className={activeSection === "groups" ? "active" : ""}
            onClick={() => setActiveSection("groups")}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Folder size={18} style={{marginRight: '8px'}} /> Manage Groups
          </li>
          
          <li
            className={activeSection === "management" ? "active" : ""}
            onClick={() => setActiveSection("management")}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Users size={18} style={{marginRight: '8px'}} /> User Management
          </li>

          <li
            className={activeSection === "faculty-messages" ? "active" : ""}
            onClick={() => setActiveSection("faculty-messages")}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <MessagesSquare size={18} style={{marginRight: '8px'}} /> Faculty Messages
          </li>

          <li className="logout-btn" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center' }} onClick={handleLogout}>
            <LogOut size={18} style={{marginRight: '8px'}} /> Logout
          </li>
        </ul>
      </div>

      {/* Main */}
      <div className="main">

        {/* DASHBOARD */}
        {activeSection === "dashboard" && (
          <>
            <div className="topbar">
              <h1>Admin Dashboard</h1>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>{stats.totalStudents || 0}</h3>
                <p>Authorized Students</p>
              </div>

              <div className="stat-card">
                <h3>{stats.totalAnnouncements || 0}</h3>
                <p>Published Notices</p>
              </div>

              <div className="stat-card">
                <h3>{stats.pendingRequests || 0}</h3>
                <p>Awaiting Approval</p>
              </div>
            </div>
          </>
        )}

        {/* NOTICE SECTION */}
        {activeSection === "notice" && (
          <div className="card">
            <h3>Official Notices</h3>

            {officialAnnouncements.map(a => (
                <div key={a._id} className="announcement" style={{ borderLeft: '4px solid var(--accent-student)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0 }}>{a.title}</h4>
                    <span className="status-badge student" style={{ fontSize: '0.7rem' }}>{a.target?.toUpperCase() || 'ALL'}</span>
                  </div>
                  <p style={{ margin: '12px 0' }}>{a.description}</p>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-dim)', alignItems: 'center' }}>
                    {a.eventType && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={16} /> {a.eventType}</span>}
                    {a.venue && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> {a.venue}</span>}
                    {a.startDate && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={16} /> {new Date(a.startDate).toLocaleDateString()}</span>}
                  </div>

                  {a.image && (
                    <img
                      src={`http://localhost:5000/uploads/${a.image}`}
                      alt="notice"
                      style={{ width: "220px", marginTop: "16px", borderRadius: "12px", border: '1px solid var(--border-subtle)' }}
                    />
                  )}
                  {a.postedByRole !== "admin" && a.postedByRole !== "mainAdmin" && (
                    <SocialActions announcementId={a._id} link={null} />
                  )}
                </div>
            ))} 
            {officialAnnouncements.length === 0 && <div className="faculty-empty">No official notices published yet.</div>}
            {/* Floating Add Button */}
            <button
              className="floating-add-btn"
              onClick={() => setShowNoticeModal(true)}
            >
              <Plus size={24} />
            </button>
          </div>
        )}

        {/* STUDENT ANNOUNCEMENTS */}
        {activeSection === "announcements" && (
          <div className="card">
            <h3>Approved Student Announcements</h3>

            {studentApprovedAnnouncements.map(a => (
              <div key={a._id} className="announcement">
                <h4>{a.title}</h4>
                <p>{a.description}</p>
                <p><strong>Venue:</strong> {a.venue}</p>
                <p><strong>Type:</strong> {a.eventType}</p>

                {a.image && (
                  <img
                    src={`http://localhost:5000/uploads/${a.image}`}
                    alt=""
                    style={{ width: "200px", marginTop: "10px" }}
                  />
                )}
                <SocialActions announcementId={a._id} link={null} />
              </div>
            ))}
          </div>
        )}

        {/* PENDING */}
        {activeSection === "pending" && (
          <div className="card">
            <h3>Pending Requests</h3>

            {pendingAnnouncements.map(a => (
              <div key={a._id} className="announcement">
                <h4>{a.title}</h4>
                <p>{a.description}</p>
                <p><strong>Venue:</strong> {a.venue}</p>
                <p><strong>Type:</strong> {a.eventType}</p>

                {a.image && (
                  <img
                    src={`http://localhost:5000/uploads/${a.image}`}
                    alt="Pending Announcement"
                    style={{ width: "200px", marginTop: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}
                  />
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => approve(a._id)}>
                    Approve
                  </button>

                  <button
                    style={{ background: "#444" }}
                    onClick={() => reject(a._id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingAnnouncements.length === 0 && (
              <div className="faculty-empty">No pending requests at the moment.</div>
            )}
          </div>
        )}

        {/* MANAGE GROUPS */}
        {activeSection === "groups" && (
          <ManageGroups />
        )}

        {/* MANAGE USERS */}
        {activeSection === "management" && (
          <ManageUsers />
        )}

        {/* FACULTY MESSAGES */}
        {activeSection === "faculty-messages" && (
          <FacultyMessagesPage />
        )}

        {/* NOTICE MODAL */}
{showNoticeModal && (
  <div className="notice-modal-overlay">
    <div className="notice-modal">

      <div className="notice-header">
        <h2>Create Notice</h2>
        <span
          className="close-btn"
          onClick={() => setShowNoticeModal(false)}
        >
          ✕
        </span>
      </div>

      <div className="notice-body">

        <input
          className="notice-input"
          placeholder="Notice Title"
          value={noticeForm.title}
          onChange={(e) =>
            setNoticeForm({ ...noticeForm, title: e.target.value })
          }
        />

        <textarea
          className="notice-textarea"
          placeholder="Write notice description..."
          value={noticeForm.description}
          onChange={(e) =>
            setNoticeForm({ ...noticeForm, description: e.target.value })
          }
        />

        <div className="row">
          <select
            className="notice-select"
            value={noticeForm.type}
            onChange={(e) =>
              setNoticeForm({ ...noticeForm, type: e.target.value })
            }
          >
            <option value="General">General</option>
            <option value="Event">Event</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Internship">Internship</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Holiday">Holiday</option>
            <option value="Other">Other</option>
          </select>

          <input
            className="notice-input"
            placeholder="Venue"
            value={noticeForm.venue}
            onChange={(e) =>
              setNoticeForm({ ...noticeForm, venue: e.target.value })
            }
          />
        </div>

        <div className="row">
          <label>Target Audience:</label>
          <select
            className="notice-select"
            value={noticeForm.target}
            onChange={(e) =>
              setNoticeForm({ ...noticeForm, target: e.target.value })
            }
          >
            <option value="student">Students Only</option>
            <option value="faculty">Faculty Only</option>
            <option value="all">All Users</option>
          </select>
        </div>

        {/* Holiday Single Date */}
        {noticeForm.type === "Holiday" && (
          <input
            type="date"
            className="notice-input"
            value={noticeForm.singleDate}
            onChange={(e) =>
              setNoticeForm({ ...noticeForm, singleDate: e.target.value })
            }
          />
        )}

        {/* Event Range */}
        {["Workshop","Seminar","Internship","Hackathon","Event"].includes(noticeForm.type) && (
          <div className="row">
            <input
              type="date"
              className="notice-input"
              value={noticeForm.startDate}
              onChange={(e) =>
                setNoticeForm({ ...noticeForm, startDate: e.target.value })
              }
            />
            <input
              type="date"
              className="notice-input"
              value={noticeForm.endDate}
              onChange={(e) =>
                setNoticeForm({ ...noticeForm, endDate: e.target.value })
              }
            />
          </div>
        )}

        <div className="image-toggle">
          <label>
            <input
              type="checkbox"
              checked={noticeForm.includeImage}
              onChange={(e) =>
                setNoticeForm({
                  ...noticeForm,
                  includeImage: e.target.checked
                })
              }
            />
            Include Image
          </label>
        </div>

        {noticeForm.includeImage && (
          <>
            <div className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setNoticeForm({ ...noticeForm, image: file });
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
            </div>

            {preview && (
              <img
                src={preview}
                alt=""
                className="preview-img"
              />
            )}
          </>
        )}

      </div>

      <div className="notice-footer">
        <button
          className="secondary-btn"
          onClick={() => setShowNoticeModal(false)}
        >
          Cancel
        </button>

        <button
          className="primary-btn"
          onClick={publishNotice}
        >
          Publish Notice
        </button>
      </div>

    </div>
  </div>
)}
      </div>
    </div>
  );
}

export default Admin;