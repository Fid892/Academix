import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    department: "",
    bio: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch User
      const userRes = await fetch("http://localhost:5000/api/auth/current-user", { credentials: "include" });
      const userData = await userRes.json();
      if (!userData || !userData.name) {
        navigate("/login");
        return;
      }
      setUser(userData);
      setFormData({
        department: userData.department || "",
        bio: userData.bio || ""
      });

      // Fetch Departments
      const deptRes = await fetch("http://localhost:5000/api/departments", { credentials: "include" });
      const deptData = await deptRes.json();
      setDepartments(Array.isArray(deptData) ? deptData : []);
      
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "bio" && value.length > 200) return; // Basic validation
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        navigate("/profile");
      } else {
        const error = await res.json();
        alert(error.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "100px", color: "white" }}>Loading...</div>;

  return (
    <div className="student-container">
       <div className="dashboard-bg">
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
      </div>

      <div className="student-header">
        <button className="back-button" onClick={() => navigate("/profile")}>
          ← Back to Profile
        </button>
      </div>

      <div className="profile-edit-wrapper animate-fade-in" style={{ 
        maxWidth: "600px", 
        margin: "60px auto", 
        background: "rgba(255,255,255,0.03)", 
        padding: "40px", 
        borderRadius: "24px", 
        border: "1px solid var(--border-subtle)",
        backdropFilter: "blur(20px)"
      }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "32px", textAlign: "center", color: "white" }}>Update Your Profile</h1>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div className="form-group">
            <label style={{ display: "block", marginBottom: "10px", color: "var(--text-dim)", fontSize: "0.9rem", fontWeight: "600" }}>
              DEPARTMENT
            </label>
            <select 
              name="department" 
              value={formData.department} 
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-subtle)",
                color: "white",
                fontSize: "1rem",
                outline: "none",
                appearance: "none",
                cursor: "pointer"
              }}
              required
            >
              <option value="" disabled>Select your department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept} style={{ background: "#1a1a1a" }}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: "block", marginBottom: "10px", color: "var(--text-dim)", fontSize: "0.9rem", fontWeight: "600" }}>
              BIO (Max 200 chars)
            </label>
            <textarea 
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write something about yourself..."
              rows={4}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-subtle)",
                color: "white",
                fontSize: "1rem",
                outline: "none",
                resize: "none"
              }}
            />
            <div style={{ textAlign: "right", marginTop: "6px", fontSize: "0.8rem", color: formData.bio.length >= 200 ? "#ef4444" : "var(--text-dim)" }}>
              {formData.bio.length}/200
            </div>
          </div>

          <button 
            type="submit" 
            className="primary-btn" 
            disabled={saving}
            style={{ 
              marginTop: "10px", 
              width: "100%", 
              background: "var(--accent-student)",
              padding: "16px",
              borderRadius: "12px",
              fontSize: "1.05rem",
              boxShadow: "0 8px 24px rgba(239, 68, 68, 0.2)"
            }}
          >
            {saving ? "Saving Updates..." : "Save Changes"}
          </button>
        </form>
      </div>

      <style>{`
        select option {
          padding: 10px;
        }
        .profile-edit-wrapper {
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
};

export default EditProfile;
