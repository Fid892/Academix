import { useState, useEffect } from "react";
import "./Admin.css";

function Admin() {

  /* =============================
     Navigation
  ============================= */
  const [activeTab, setActiveTab] = useState("dashboard");

  /* =============================
     Users Management
  ============================= */
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [search, setSearch] = useState("");

  /* =============================
     Announcement System
  ============================= */
  const [announcementTab, setAnnouncementTab] = useState("official");
  const [showModal, setShowModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    image: null
  });

  /* =============================
     Initial Load
  ============================= */
  useEffect(() => {
    fetchUsers();
    fetchAnnouncements();
  }, []);

  /* =============================
     Fetch Users
  ============================= */
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/all", {
        credentials: "include"
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  /* =============================
     Fetch Announcements
  ============================= */
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/announcements/all");
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error("Announcement fetch error:", err);
    }
  };

  /* =============================
     Logout
  ============================= */
  const handleLogout = () => {
    window.location.href = "http://localhost:5000/api/auth/logout";
  };

  /* =============================
     Add User
  ============================= */
  const addUser = async () => {
    if (!email) {
      setMessage("Email is required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, role })
      });

      const data = await res.json();
      setMessage(data.message);
      setEmail("");
      fetchUsers();
    } catch (err) {
      console.error("Add user error:", err);
    }
  };

  /* =============================
     Delete User
  ============================= */
  const deleteUser = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/delete/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      setUsers(users.filter(user => user._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /* =============================
     CSV Upload
  ============================= */
  const handleFileUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a CSV file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData
      });

      const data = await res.json();
      setUploadMessage(data.message);
      fetchUsers();
    } catch (err) {
      console.error("CSV upload error:", err);
    }
  };

  /* =============================
     Publish Announcement
  ============================= */
  const publishAnnouncement = async () => {

    if (!newAnnouncement.title || !newAnnouncement.description) {
      alert("Title and Description are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newAnnouncement.title);
      formData.append("description", newAnnouncement.description);
      formData.append("startDate", newAnnouncement.startDate);
      formData.append("endDate", newAnnouncement.endDate);

      if (newAnnouncement.image) {
        formData.append("image", newAnnouncement.image);
      }

      const res = await fetch(
        "http://localhost:5000/api/announcements/create",
        {
          method: "POST",
          credentials: "include",
          body: formData
        }
      );

      const data = await res.json();

      if (res.ok) {
        setShowModal(false);

        setNewAnnouncement({
          title: "",
          description: "",
          startDate: "",
          endDate: "",
          image: null
        });

        fetchAnnouncements();
      } else {
        alert(data.message || "Error posting announcement");
      }

    } catch (err) {
      console.error("Publish error:", err);
    }
  };

  /* =============================
     Pending Controls
  ============================= */
  const approveAnnouncement = (index) => {
    const approved = pendingAnnouncements[index];
    setAnnouncements([...announcements, approved]);
    setPendingAnnouncements(
      pendingAnnouncements.filter((_, i) => i !== index)
    );
  };

  const rejectAnnouncement = (index) => {
    setPendingAnnouncements(
      pendingAnnouncements.filter((_, i) => i !== index)
    );
  };

  /* =============================
     Filtered Users
  ============================= */
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <div className="admin-sidebar">
        <h2 className="brand">Academix</h2>
        <ul>
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </li>

          <li
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            Manage Users
          </li>

          <li
            className={activeTab === "announcements" ? "active" : ""}
            onClick={() => setActiveTab("announcements")}
          >
            Announcements
          </li>

          <li onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="admin-main">

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="card">
            <h2>Admin Overview</h2>
            <p>Welcome to the Academix administration panel.</p>
          </div>
        )}

        {/* Users Module */}
        {activeTab === "users" && (
          <div className="card">
            <h3>Allowed Users</h3>

            <input
              type="text"
              placeholder="Search by email or role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />

            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Announcement Module */}
        {activeTab === "announcements" && (
          <div className="card">

            <div className="announcement-header">
              <h2>Announcements</h2>
              <button onClick={() => setShowModal(true)}>
                Post Announcement
              </button>
            </div>

            <div className="announcement-list">
              {announcements.length === 0 && (
                <p className="empty-text">No announcements yet.</p>
              )}

              {announcements.map((item) => (
                <div key={item._id} className="announcement-card">
                  <h3>{item.title}</h3>

                  {item.image && (
                    <img
                      src={`http://localhost:5000/uploads/${item.image}`}
                      alt="announcement"
                      className="announcement-image"
                    />
                  )}

                  <p>{item.description}</p>

                  <small>
                    {item.startDate && new Date(item.startDate).toLocaleDateString()}
                    {" - "}
                    {item.endDate && new Date(item.endDate).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h2>Create Announcement</h2>

            <input
              type="text"
              placeholder="Title"
              value={newAnnouncement.title}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  title: e.target.value
                })
              }
            />

            <textarea
              placeholder="Description"
              value={newAnnouncement.description}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  description: e.target.value
                })
              }
            />

            <div className="date-row">
              <input
                type="date"
                value={newAnnouncement.startDate}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    startDate: e.target.value
                  })
                }
              />

              <input
                type="date"
                value={newAnnouncement.endDate}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    endDate: e.target.value
                  })
                }
              />
            </div>

            <input
              type="file"
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  image: e.target.files[0]
                })
              }
            />

            <div className="modal-actions">
              <button onClick={publishAnnouncement}>
                Publish
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;
