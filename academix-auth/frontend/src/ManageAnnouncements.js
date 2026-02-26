import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

function ManageAnnouncements() {
  const [pending, setPending] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    const res = await fetch(
      "http://localhost:5000/api/announcements/pending",
      { credentials: "include" }
    );
    const data = await res.json();
    setPending(Array.isArray(data) ? data : []);
  };

  const approveAnnouncement = async (id) => {
    await fetch(
      `http://localhost:5000/api/announcements/${id}/approve`,
      {
        method: "PATCH",
        credentials: "include"
      }
    );

    loadPending();
  };

  return (
    <div className="admin-container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>Academix</h2>

        <ul>
          <li onClick={() => navigate("/admin")}>
            Dashboard
          </li>

          <li className="active">
            Manage Announcements
          </li>
        </ul>
      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <h1>Pending Requests</h1>
        </div>

        <div className="card">
          {pending.length === 0 ? (
            <p>No pending announcements</p>
          ) : (
            pending.map(a => (
              <div key={a._id} className="announcement">
                <h4>{a.title}</h4>
                <p>{a.description}</p>
                <p><strong>Posted by:</strong> {a.postedBy?.name}</p>

                <button onClick={() => approveAnnouncement(a._id)}>
                  Approve
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default ManageAnnouncements;