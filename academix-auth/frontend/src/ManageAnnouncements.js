import React, { useEffect, useState } from "react";

function ManageAnnouncements() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = () => {
    fetch("http://localhost:5000/api/announcements/pending", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setPending(data));
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
    <div style={{ padding: "30px", background: "#0f0f0f", minHeight: "100vh", color: "white" }}>
      <h2>Pending Announcements</h2>

      {pending.length === 0 ? (
        <p>No pending announcements</p>
      ) : (
        pending.map(a => (
          <div
            key={a._id}
            style={{
              background: "#1c1c1c",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px"
            }}
          >
            <h3>{a.title}</h3>
            <p>{a.description}</p>
            <p><strong>Posted by:</strong> {a.postedBy?.name}</p>

            <button
              style={{
                background: "#ff3b3b",
                border: "none",
                padding: "8px 15px",
                borderRadius: "5px",
                color: "white",
                cursor: "pointer"
              }}
              onClick={() => approveAnnouncement(a._id)}
            >
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ManageAnnouncements;
