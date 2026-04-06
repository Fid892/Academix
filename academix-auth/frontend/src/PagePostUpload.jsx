import React, { useState } from "react";
import { X, Send, Image as ImageIcon } from "lucide-react";

function PagePostUpload({ isOpen, onClose, pageId, onUploadSuccess }) {
  const [formData, setFormData] = useState({
    imageUrl: "",
    caption: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) return setError("Image URL is required");
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/pages/post/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, pageId }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        onUploadSuccess(data);
        onClose();
        setFormData({ imageUrl: "", caption: "" });
      } else {
        setError(data.message || "Error creating post");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000,
      padding: "20px"
    }}>
      <div className="modal-content animate-fade-in-up" style={{
        background: "var(--card-bg, #1a1c1e)",
        width: "100%", maxWidth: "500px",
        borderRadius: "24px", padding: "32px",
        position: "relative", border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "20px", right: "20px",
          background: "rgba(255,255,255,0.05)", border: "none", color: "#666",
          padding: "8px", borderRadius: "50%", cursor: "pointer"
        }}><X size={20} /></button>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "white", marginBottom: "32px", textAlign: "center" }}>Create New Post</h2>

        {error && <div style={{ 
          background: "rgba(ef, 68, 68, 0.1)", color: "#ef4444", 
          padding: "12px", borderRadius: "12px", marginBottom: "20px",
          fontSize: "0.9rem", textAlign: "center", border: "1px solid rgba(239, 68, 68, 0.2)"
        }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="input-group">
            <label style={{ display: "block", color: "#bbb", marginBottom: "8px", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Image URL</label>
            <div style={{ position: "relative" }}>
              <ImageIcon size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#555" }} />
              <input 
                name="imageUrl" type="text" placeholder="Paste image link..." 
                value={formData.imageUrl} onChange={handleChange} required
                style={{ 
                  width: "100%", padding: "14px 16px 14px 48px", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", color: "white", fontSize: "1rem", outline: "none"
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: "block", color: "#bbb", marginBottom: "8px", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Caption</label>
            <textarea 
              name="caption" placeholder="Write a caption..." 
              value={formData.caption} onChange={handleChange}
              style={{ 
                width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", color: "white", fontSize: "1rem", outline: "none",
                minHeight: "120px", resize: "none"
              }}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            style={{ 
              marginTop: "10px", padding: "16px", background: "var(--accent-student, #3b82f6)",
              color: "white", border: "none", borderRadius: "14px", fontSize: "1rem", fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              transition: "all 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              boxShadow: "0 10px 20px rgba(59, 130, 246, 0.2)"
            }}
          >
            {loading ? "Publishing..." : <><Send size={20} /> Publish Post</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PagePostUpload;
