import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {

  const [view, setView] = useState("dashboard");

  const [adminAnnouncements, setAdminAnnouncements] = useState([]);
  const [studentAnnouncements, setStudentAnnouncements] = useState([]);
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
    link: "",                // ✅ ADDED LINK FIELD
    coverImage: null
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([
      loadOfficial(),
      loadStudentApproved(),
      loadMine()
    ]);
  };

  const loadOfficial = async () => {
    const res = await fetch(
      "http://localhost:5000/api/announcements/official?type=admin"
    );
    const data = await res.json();
    setAdminAnnouncements(Array.isArray(data) ? data : []);
  };

  const loadStudentApproved = async () => {
    const res = await fetch(
      "http://localhost:5000/api/announcements/official?type=student"
    );
    const data = await res.json();
    setStudentAnnouncements(Array.isArray(data) ? data : []);
  };

  const loadMine = async () => {
    const res = await fetch(
      "http://localhost:5000/api/announcements/my",
      { credentials: "include" }
    );
    const data = await res.json();
    setMyAnnouncements(Array.isArray(data) ? data : []);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      alert("Title and Description are required");
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === "coverImage") {
        if (formData.coverImage) {
          form.append("image", formData.coverImage);
        }
      } else {
        form.append(key, formData[key]);
      }
    });

    await fetch(
      "http://localhost:5000/api/announcements/student-request",
      {
        method: "POST",
        credentials: "include",
        body: form
      }
    );

    setShowModal(false);
    setFormData({
      title: "",
      description: "",
      venue: "",
      eventType: "Workshop",
      startDate: "",
      endDate: "",
      registrationRequired: false,
      link: "",               // ✅ RESET LINK
      coverImage: null
    });

    loadAll();
  };

  return (
    <div className="student-container">

      <div className="student-header">
        <div className="header-left">
          <h2>ACADEMIX</h2>
          <span className="sub-title">Student Portal</span>
        </div>

        <div className="header-right">
          <button
            className="logout-btn"
            onClick={() => {
              window.location.href = "http://localhost:5000/api/auth/logout";
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {view === "dashboard" && (
        <>
          <h1 className="welcome-title">Welcome Back!</h1>

          <div className="card-grid">

            <div className="dashboard-card" onClick={() => setShowModal(true)}>
              <div className="plus-icon">+</div>
              <h3>Create Announcement</h3>
              <p>Post a new announcement</p>
            </div>

            <div
              className="dashboard-card"
              onClick={() => setView("student")}
            >
              <h3>Student Announcements</h3>
              <p>View approved posts</p>
            </div>

            <div
              className="dashboard-card"
              onClick={() => setView("mine")}
            >
              <h3>My Announcements</h3>
              <p>View your posts</p>
            </div>

            <div
              className="dashboard-card"
              onClick={() => setView("study")}
            >
              <h3>Study Groups</h3>
              <p>Join and collaborate in subject-wise groups</p>
            </div>

          </div>

          <h2 className="section-title">Recent Announcements</h2>

          {adminAnnouncements.map(a => (
            <AnnouncementCard key={a._id} a={a} />
          ))}
        </>
      )}

      {/* STUDENT APPROVED VIEW */}
      {view === "student" && (
        <>
          <button
            className="back-button"
            onClick={() => setView("dashboard")}
          >
            <span className="back-arrow">←</span>
            Back to Dashboard
          </button>

          <h2>Student Announcements</h2>

          {studentAnnouncements.map(a => (
            <AnnouncementCard key={a._id} a={a} />
          ))}
        </>
      )}

      {/* MY ANNOUNCEMENTS VIEW */}
      {view === "mine" && (
        <>
          <button
            className="back-button"
            onClick={() => setView("dashboard")}
          >
            <span className="back-arrow">←</span>
            Back to Dashboard
          </button>

          <h2>My Announcements</h2>

          {myAnnouncements.length === 0 ? (
            <div className="empty-box">
              <p>You haven't created any announcements yet</p>
              <button onClick={() => setShowModal(true)}>
                Create Your First Announcement
              </button>
            </div>
          ) : (
            myAnnouncements.map(a => (
              <AnnouncementCard key={a._id} a={a} />
            ))
          )}
        </>
      )}

      {/* STUDY GROUP VIEW */}
      {view === "study" && (
        <>
          <button
            className="back-button"
            onClick={() => setView("dashboard")}
          >
            <span className="back-arrow">←</span>
            Back to Dashboard
          </button>

          <h2>Study Groups</h2>

          <div className="empty-box">
            <p>No study groups yet</p>
            <button>
              Create First Study Group
            </button>
          </div>
        </>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h2>Create Announcement</h2>

            <input
              name="title"
              placeholder="Enter announcement title"
              value={formData.title}
              onChange={handleChange}
            />

            <textarea
              name="description"
              placeholder="Enter announcement description"
              value={formData.description}
              onChange={handleChange}
            />

            <input
              name="venue"
              placeholder="Venue"
              value={formData.venue}
              onChange={handleChange}
            />

            {/* ✅ NEW LINK INPUT */}
            <input
              name="link"
              type="url"
              placeholder="Reference / Registration Link (optional)"
              value={formData.link}
              onChange={handleChange}
            />

            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
            >
              <option>Workshop</option>
              <option>Seminar</option>
              <option>Hackathon</option>
              <option>Internship</option>
              <option>Exam</option>
              <option>General</option>
            </select>

            <div className="date-row">
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>

            <div className="toggle-row">
              <label>Registration Required</label>
              <input
                type="checkbox"
                name="registrationRequired"
                checked={formData.registrationRequired}
                onChange={handleChange}
              />
            </div>

            <input
              type="file"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  coverImage: e.target.files[0]
                })
              }
            />

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="primary-btn"
                onClick={handleSubmit}
              >
                Submit for Approval
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

/* REUSABLE CARD */
const AnnouncementCard = ({ a }) => (
  <div className="announcement-card">
    <h3>{a.title}</h3>
    <p>{a.description}</p>

    {a.venue && <p><strong>Venue:</strong> {a.venue}</p>}
    {a.eventType && <p><strong>Type:</strong> {a.eventType}</p>}

    {/* ✅ DISPLAY LINK IF EXISTS */}
    {a.link && (
      <p>
        <strong>Link:</strong>{" "}
        <a
          href={a.link}
          target="_blank"
          rel="noopener noreferrer"
          className="announcement-link"
        >
          Visit
        </a>
      </p>
    )}

    {a.image && (
      <img
        src={`http://localhost:5000/uploads/${a.image}`}
        alt=""
      />
    )}

    {a.startDate && (
      <small>
        {new Date(a.startDate).toLocaleDateString()}
        {a.endDate && " - " + new Date(a.endDate).toLocaleDateString()}
      </small>
    )}
  </div>
);

export default Dashboard;