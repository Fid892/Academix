import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    eventType: "Workshop",
    startDate: "",
    endDate: "",
    registrationRequired: false,
    coverImage: null
  });

  /* =========================
     Initial Load
  ========================= */

  useEffect(() => {
    fetchCurrentUser();
    loadAnnouncements();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/current-user",
        { credentials: "include" }
      );
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  /* =========================
     Load Announcements (OFFICIAL)
  ========================= */

  const loadAnnouncements = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/announcements/all"
      );
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error("Announcement fetch error:", err);
    }
  };

  /* =========================
     Form Handling
  ========================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  /* =========================
     Submit Announcement
  ========================= */

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      alert("Title and Description are required");
      return;
    }

    const form = new FormData();

    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("venue", formData.venue);
    form.append("eventType", formData.eventType);
    form.append("startDate", formData.startDate);
    form.append("endDate", formData.endDate);
    form.append("registrationRequired", formData.registrationRequired);

    if (formData.coverImage) {
      form.append("image", formData.coverImage);
    }

    try {
      let endpoint =
        user?.role === "student"
          ? "student"
          : "create"; // admin direct post

      await fetch(
        `http://localhost:5000/api/announcements/${endpoint}`,
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
        coverImage: null
      });

      loadAnnouncements();

    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  return (
    <div className="app-container">

      {/* Top Header */}
      <div className="top-header">
        <h1 className="logo">Academix</h1>
        <div className="header-icons">
          <span>🔍</span>
          <span>🔔</span>
        </div>
      </div>

      {/* Feed */}
      <div className="feed-container">
        {announcements.length === 0 && (
          <p>No official announcements available.</p>
        )}

        {announcements.map(a => (
          <div key={a._id} className="announcement-card">

            <div className="card-header">
              <div className="avatar">
                {a.postedBy?.name?.charAt(0) || "A"}
              </div>
              <div>
                <h4>{a.postedBy?.name || "Administration"}</h4>
                <small>{a.eventType || "Official Notice"}</small>
              </div>
            </div>

            <h3>{a.title}</h3>
            <p>{a.description}</p>

            {a.image && (
              <img
                src={`http://localhost:5000/uploads/${a.image}`}
                alt="cover"
                style={{
                  width: "100%",
                  marginTop: "10px",
                  borderRadius: "8px"
                }}
              />
            )}

            <small>
              {a.startDate &&
                new Date(a.startDate).toLocaleDateString()}
              {" - "}
              {a.endDate &&
                new Date(a.endDate).toLocaleDateString()}
            </small>

          </div>
        ))}
      </div>

      {/* Floating Button */}
      <button
        className="floating-btn"
        onClick={() => setShowModal(true)}
      >
        +
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box-large">

            <div className="modal-header">
              <h2>New Announcement</h2>
              <span
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </span>
            </div>

            <div className="modal-section">

              <input
                type="text"
                name="title"
                placeholder="Announcement Title"
                value={formData.title}
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder="Write announcement details..."
                value={formData.description}
                onChange={handleChange}
              />

              <input
                type="file"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coverImage: e.target.files[0]
                  })
                }
              />

              <input
                type="text"
                name="venue"
                placeholder="Venue"
                value={formData.venue}
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

            </div>

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
                Publish Announcement
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
