import React, { useState, useEffect } from "react";
import { Trash2, Send, Tag, Clock, User, AlertCircle } from "lucide-react";

const FacultyMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetDepartment: "",
    forwardToStudents: false
  });

  useEffect(() => {
    fetchMessages();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/departments/list", { credentials: "include" });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/faculty-messages", {
        credentials: "include"
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.targetDepartmentId) {
      alert("Please select a department");
      return;
    }

    const selectedDept = departments.find(d => d._id === formData.targetDepartmentId);
    const payload = {
      ...formData,
      targetDepartmentName: selectedDept ? selectedDept.name : ""
    };

    try {
      const res = await fetch("http://localhost:5000/api/admin/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (res.ok) {
        setFormData({ title: "", content: "", targetDepartmentId: "", forwardToStudents: false });
        setShowCreateModal(false);
        fetchMessages();
      }
    } catch (error) {
      console.error("Error creating message:", error);
    }
  };

  const handleDelete = async (id) => {
     if (!window.confirm("Are you sure you want to delete this message?")) return;
 
     try {
       const res = await fetch(`http://localhost:5000/api/faculty-messages/${id}`, {
         method: "DELETE",
         credentials: "include"
       });
 
       if (res.ok) {
         setMessages(messages.filter((m) => m._id !== id));
       }
     } catch (error) {
       console.error("Error deleting message:", error);
     }
   };

  return (
    <div className="card" style={{ position: "relative", minHeight: "400px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h3 style={{ margin: 0 }}>Faculty Messages</h3>
        <button 
          className="primary-btn" 
          onClick={() => setShowCreateModal(true)}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Send size={18} /> Send Message
        </button>
      </div>

      {loading ? (
        <div className="faculty-empty">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="faculty-empty" style={{ textAlign: "center", padding: "64px 0" }}>
          <AlertCircle size={48} style={{ marginBottom: "16px", opacity: 0.3 }} />
          <p>No messages sent to faculty yet.</p>
        </div>
      ) : (
        <div className="messages-grid" style={{ display: "grid", gap: "20px" }}>
          {messages.map((m) => (
            <div key={m._id} className="announcement" style={{ borderLeft: "4px solid var(--accent-faculty, #3b82f6)", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>{m.title}</h4>
                  <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "0.8rem", color: "var(--text-dim)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><User size={14} /> To: {m.targetDepartmentName}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> {new Date(m.createdAt).toLocaleDateString()}</span>
                    <span className="status-badge" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", fontSize: "0.7rem", padding: "2px 8px" }}>
                      {m.forwardToStudents ? "ALLOWS FORWARDING" : "FACULTY ONLY"}
                    </span>
                  </div>
                </div>
                <button 
                   onClick={() => handleDelete(m._id)}
                   style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "8px", transition: "0.2s" }}
                   title="Delete Message"
                 >
                   <Trash2 size={20} />
                 </button>
              </div>
              <p style={{ marginTop: "16px", color: "var(--text-muted)", lineHeight: "1.6" }}>{m.content}</p>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="notice-modal-overlay">
          <div className="notice-modal" style={{ maxWidth: "500px" }}>
            <div className="notice-header">
              <h2>Send Message to Faculty</h2>
              <span className="close-btn" onClick={() => setShowCreateModal(false)}>✕</span>
            </div>
            <form onSubmit={handleCreate} className="notice-body">
              <input 
                className="notice-input"
                placeholder="Message Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea 
                className="notice-textarea"
                placeholder="Write your message here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                style={{ minHeight: "150px" }}
              />
              
              <div style={{ marginTop: "8px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginBottom: "8px", display: "block" }}>Target Department</label>
                <select 
                  className="notice-select"
                  value={formData.targetDepartmentId}
                  onChange={(e) => setFormData({ ...formData, targetDepartmentId: e.target.value })}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.length > 0 ? (
                    departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)
                  ) : (
                    <option disabled>No departments available</option>
                  )}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px" }}>
                <input 
                  type="checkbox" 
                  id="forwardCheck"
                  checked={formData.forwardToStudents}
                  onChange={(e) => setFormData({ ...formData, forwardToStudents: e.target.checked })}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="forwardCheck" style={{ cursor: "pointer", fontSize: "0.9rem" }}>Allow Faculty to Forward this Message to Students</label>
              </div>

              <div className="notice-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Send Message</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyMessagesPage;
