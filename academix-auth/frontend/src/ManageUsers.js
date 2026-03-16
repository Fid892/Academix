import React, { useState, useEffect } from "react";
import "./Admin.css";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    department: "",
    semester: "",
    designation: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/management/users", {
        credentials: "include"
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditMode(true);
      setSelectedUserId(user._id);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "student",
        department: user.department || "",
        semester: user.semester || "",
        designation: user.designation || ""
      });
    } else {
      setEditMode(false);
      setFormData({
        name: "",
        email: "",
        role: "student",
        department: "",
        semester: "",
        designation: ""
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      alert("Please fill name, email and role");
      return;
    }

    const url = editMode 
      ? `http://localhost:5000/api/admin/management/user/${selectedUserId}`
      : "http://localhost:5000/api/admin/management/add-user";
    
    const method = editMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(false);
        fetchUsers();
      } else {
        alert(data.message || "Operation failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/management/user/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="admin-content" style={{ padding: 0 }}>
      <div className="admin-header-row">
        <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: 0 }}>Authorized Users</h2>
        <button className="primary-btn" onClick={() => handleOpenModal()}>
          + Add User
        </button>
      </div>

      <div className="admin-card card" style={{ padding: "12px", background: 'transparent', border: 'none' }}>
        <table className="users-table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 12px" }}>
          <thead>
            <tr style={{ color: "var(--text-dim)", textAlign: "left", fontSize: "0.9rem" }}>
              <th style={{ padding: "12px 24px" }}>User</th>
              <th style={{ padding: "12px 24px" }}>Role</th>
              <th style={{ padding: "12px 24px" }}>Academic Info</th>
              <th style={{ padding: "12px 24px", textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="user-row" style={{ background: "var(--bg-card)", borderRadius: "16px", transition: "var(--transition)" }}>
                <td style={{ padding: "20px 24px" }}>
                  <div style={{ fontWeight: "700", color: "#fff", fontSize: '1.05rem' }}>{user.name || "Access Pending"}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: '0.85rem' }}>{user.email}</div>
                </td>
                <td style={{ padding: "20px 24px" }}>
                  <span className={`status-badge ${user.role}`}>
                    {user.role?.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "20px 24px", color: "var(--text-dim)", fontSize: "0.9rem" }}>
                  {user.role === 'student' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                       <span style={{ color: 'var(--accent-faculty)' }}>{user.department || "General"}</span>
                       <span style={{ opacity: 0.5 }}>•</span>
                       <span>Sem {user.semester || "?"}</span>
                    </div>
                  )}
                  {user.role === 'faculty' && (
                    <div>
                       <div style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>{user.designation || "Faculty"}</div>
                       <div style={{ fontSize: '0.8rem' }}>{user.department || "Academic Dept"}</div>
                    </div>
                  )}
                  {user.role === 'admin' && <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Superuser Privileges</span>}
                </td>
                <td style={{ padding: "20px 24px", textAlign: 'right' }}>
                  <div style={{ display: "flex", gap: "10px", justifyContent: 'flex-end' }}>
                    <button onClick={() => handleOpenModal(user)} className="secondary-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Edit</button>
                    <button onClick={() => handleDelete(user._id)} className="secondary-btn" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="faculty-empty" style={{ marginTop: "40px", border: '2px dashed var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
            No authorized users found. Add some to grant portal access.
          </div>
        )}
      </div>

      {showModal && (
        <div className="notice-modal-overlay">
          <div className="notice-modal" style={{ maxWidth: "500px" }}>
            <div className="notice-header">
              <h2>{editMode ? "Update Permissions" : "Grant Portal Access"}</h2>
              <span className="close-btn" onClick={() => setShowModal(false)}>✕</span>
            </div>
            
            <div className="notice-body">
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: '700', textTransform: 'uppercase' }}>Designated Role</label>
                <select 
                  className="notice-select" 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: '700', textTransform: 'uppercase' }}>Full Identity Name</label>
                <input 
                  className="notice-input" 
                  placeholder="e.g. Dr. John Doe" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: '700', textTransform: 'uppercase' }}>Auth Email (Google)</label>
                <input 
                  className="notice-input" 
                  placeholder="university.id@domain.edu" 
                  value={formData.email}
                  disabled={editMode}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Dynamic Student Fields */}
              {formData.role === "student" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: '8px' }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: '700' }}>DEPT</label>
                    <input 
                      className="notice-input" 
                      placeholder="CSE" 
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: '700' }}>SEM</label>
                    <input 
                      className="notice-input" 
                      placeholder="6" 
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Faculty Fields */}
              {formData.role === "faculty" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: '8px' }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: '700' }}>DEPT</label>
                    <input 
                      className="notice-input" 
                      placeholder="IT" 
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: '700' }}>POSITION</label>
                    <input 
                      className="notice-input" 
                      placeholder="Senior Prof" 
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                </div>
              )}

            </div>

            <div className="notice-footer">
              <button className="secondary-btn" onClick={() => setShowModal(false)} style={{ border: 'none' }}>Discard</button>
              <button className="primary-btn" onClick={handleSubmit} style={{ minWidth: '160px' }}>
                {editMode ? "Confirm Changes" : "Authorize Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
