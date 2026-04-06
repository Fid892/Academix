import React, { useState } from "react";
import { X, Upload, Globe, Shield, Tag, Camera } from "lucide-react";

function CreatePageModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    pageName: "",
    username: "",
    bio: "",
    category: "Club",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("pageName", formData.pageName);
      data.append("username", formData.username);
      data.append("bio", formData.bio);
      data.append("category", formData.category);
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      const res = await fetch("http://localhost:5000/api/pages/create", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      const resData = await res.json();
      if (res.ok) {
        onCreated(resData);
        onClose();
        setFormData({ pageName: "", username: "", bio: "", category: "Club" });
        setProfileImage(null);
        setPreview(null);
      } else {
        setError(resData.message || "Error creating page");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cpm-modal-overlay" style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000,
      padding: "20px"
    }}>
      <div className="cpm-modal-content animate-fade-in-up" style={{
        background: "#111113",
        width: "100%", maxWidth: "520px",
        borderRadius: "28px", padding: "40px",
        position: "relative", border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 40px 100px -20px rgba(0, 0, 0, 0.8)",
        boxSizing: "border-box"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "24px", right: "24px",
          background: "rgba(255,255,255,0.05)", border: "none", color: "#888",
          width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#888"; }}
        ><X size={20} /></button>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
           <div style={{ 
              width: "60px", height: "60px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", color: "white", boxShadow: "0 15px 30px rgba(79, 70, 229, 0.4)"
           }}>
              <Globe size={30} />
           </div>
           <h2 style={{ fontSize: "1.85rem", fontWeight: "900", color: "white", marginBottom: "10px", letterSpacing: "-0.02em" }}>Create Official Page</h2>
           <p style={{ color: "#71717a", fontSize: "1rem", lineHeight: "1.5" }}>Establish your society or club's presence on Academix</p>
        </div>

        {error && <div style={{ 
          background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", 
          padding: "14px", borderRadius: "14px", marginBottom: "24px",
          fontSize: "0.95rem", textAlign: "center", border: "1px solid rgba(239, 68, 68, 0.2)",
          fontWeight: "600"
        }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="cpm-field">
            <label style={{ display: "block", color: "#94a3b8", marginBottom: "10px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>Page Name</label>
            <div style={{ position: "relative" }}>
              <Shield size={18} style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "#52525b", pointerEvents: "none" }} />
              <input 
                name="pageName" type="text" placeholder="e.g. IEEE SJCET SB" 
                value={formData.pageName} onChange={handleChange} required
                autoComplete="off"
                style={{ 
                  width: "100%", padding: "16px 20px 16px 52px", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", color: "white", fontSize: "1rem", outline: "none",
                  boxSizing: "border-box", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)";  e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="cpm-field">
              <label style={{ display: "block", color: "#94a3b8", marginBottom: "10px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>Username</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "#6366f1", fontWeight: "900", pointerEvents: "none" }}>@</span>
                <input 
                  name="username" type="text" placeholder="ieee_sjcet" 
                  value={formData.username} onChange={handleChange} required
                  style={{ 
                    width: "100%", padding: "16px 20px 16px 44px", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", color: "white", fontSize: "1rem", outline: "none",
                    boxSizing: "border-box", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)";  e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <div className="cpm-field">
              <label style={{ display: "block", color: "#94a3b8", marginBottom: "10px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>Category</label>
              <div style={{ position: "relative" }}>
                <Tag size={18} style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "#52525b", pointerEvents: "none" }} />
                <select 
                  name="category" value={formData.category} onChange={handleChange}
                  style={{ 
                    width: "100%", padding: "16px 20px 16px 52px", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", color: "white", fontSize: "1rem", outline: "none",
                    appearance: "none", boxSizing: "border-box", cursor: "pointer", transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                >
                  <option value="Club">Club</option>
                  <option value="IEEE">IEEE</option>
                  <option value="Department">Department</option>
                  <option value="Event">Event</option>
                  <option value="Other">Other</option>
                </select>
                <div style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", color: "#52525b", pointerEvents: "none", fontSize: "0.8rem" }}>▼</div>
              </div>
            </div>
          </div>

          <div className="cpm-field">
            <label style={{ display: "block", color: "#94a3b8", marginBottom: "10px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>Profile Image</label>
            <div 
              style={{ 
                width: "100%", height: "120px", borderRadius: "20px", border: "2px dashed rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.02)", position: "relative", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px",
                overflow: "hidden", transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
              onClick={() => document.getElementById('profileImageUpload').click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <>
                  <Camera size={28} color="#52525b" />
                  <span style={{ fontSize: "0.85rem", color: "#52525b", fontWeight: "600" }}>Upload Profile Image</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                id="profileImageUpload"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className="cpm-field">
            <label style={{ display: "block", color: "#94a3b8", marginBottom: "10px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>Bio / Description</label>
            <textarea 
              name="bio" placeholder="Tell people about your page..." 
              value={formData.bio} onChange={handleChange}
              style={{ 
                width: "100%", padding: "18px 20px", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", color: "white", fontSize: "1rem", outline: "none",
                minHeight: "100px", resize: "none", boxSizing: "border-box"
              }}
              onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)";  e.target.style.background = "rgba(255,255,255,0.04)"; }}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            style={{ 
              marginTop: "8px", padding: "18px", 
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "white", border: "none", borderRadius: "18px", fontSize: "1rem", fontWeight: "800",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", 
              display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
              boxShadow: "0 20px 40px rgba(99, 102, 241, 0.2)"
            }}
            onMouseEnter={(e) => { if(!loading) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 25px 50px rgba(99, 102, 241, 0.3)"; } }}
            onMouseLeave={(e) => { if(!loading) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(99, 102, 241, 0.2)"; } }}
          >
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                Creating...
              </div>
            ) : <><Upload size={22} /> Create Official Page</>}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default CreatePageModal;
