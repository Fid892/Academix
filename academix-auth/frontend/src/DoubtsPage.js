import React, { useState, useEffect } from "react";
import "./Dashboard.css";

function DoubtsPage() {
  const [user, setUser] = useState(null);
  const [doubts, setDoubts] = useState([]);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newDoubt, setNewDoubt] = useState({ title: "", description: "", subject: "" });
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchDoubts();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("http://localhost:5000/api/auth/current-user", { credentials: "include" });
      const data = await res.json();
      setUser(data);
    } catch { console.error("Auth error"); }
  }

  async function fetchDoubts() {
    try {
      const res = await fetch("http://localhost:5000/api/doubts", { credentials: "include" });
      const data = await res.json();
      setDoubts(Array.isArray(data) ? data : []);
    } catch { setDoubts([]); }
  }

  async function handleAskDoubt() {
    if (!newDoubt.title || !newDoubt.description) return;
    const res = await fetch("http://localhost:5000/api/doubts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newDoubt)
    });
    if (res.ok) {
      setShowAskModal(false);
      setNewDoubt({ title: "", description: "", subject: "" });
      fetchDoubts();
    }
  }

  async function openDoubt(doubt) {
    setSelectedDoubt(doubt);
    const res = await fetch(`http://localhost:5000/api/doubts/${doubt._id}`, { credentials: "include" });
    const data = await res.json();
    setReplies(data.replies || []);
  }

  async function handleReply() {
    if (!replyText.trim()) return;
    const res = await fetch(`http://localhost:5000/api/doubts/${selectedDoubt._id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: replyText })
    });
    if (res.ok) {
      setReplyText("");
      openDoubt(selectedDoubt);
    }
  }

  if (selectedDoubt) {
    return (
      <div className="student-container">
        <div className="student-header">
           <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button className="back-button" style={{ padding: '8px 16px' }} onClick={() => setSelectedDoubt(null)}>
                ← Back
              </button>
              <h2 style={{ margin: 0 }}>Doubt Resolution</h2>
           </div>
        </div>

        <div className="announcement-card" style={{ padding: '40px', borderLeft: '4px solid var(--accent-primary)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
             <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{selectedDoubt.title}</h2>
             <span className={`status-badge ${selectedDoubt.status}`}>{selectedDoubt.status}</span>
          </div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: '1.7', marginBottom: '24px' }}>{selectedDoubt.description}</p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', background: '#25262b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
              {selectedDoubt.postedBy?.name?.[0].toUpperCase()}
            </div>
            <small style={{ color: 'var(--text-dim)' }}>
              {selectedDoubt.postedBy?.name} · {selectedDoubt.subject} · {new Date(selectedDoubt.createdAt).toLocaleDateString()}
            </small>
          </div>
        </div>

        <h3 className="faculty-section-title" style={{ marginBottom: '24px' }}>Replies & Solutions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '48px' }}>
          {replies.map(reply => (
            <div className="announcement-card" key={reply._id} style={reply.isVerified ? { border: "1px solid var(--accent-faculty)", background: "rgba(59, 130, 246, 0.05)" } : {}}>
              {reply.isVerified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-faculty)', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  <span style={{ fontSize: '1.2rem' }}>✔</span> Verified Faculty Solution
                </div>
              )}
              <p style={{ fontSize: '1rem', lineHeight: '1.6', margin: '0 0 16px' }}>{reply.content}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <small style={{ color: 'var(--text-dim)', fontWeight: '600' }}>{reply.postedBy?.name}</small>
                {reply.postedBy?.role === 'faculty' && <span className="status-badge resolved" style={{ fontSize: '8px', padding: '2px 8px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-faculty)' }}>FACULTY</span>}
              </div>
            </div>
          ))}
          {replies.length === 0 && (
            <div className="faculty-empty">No replies yet. Be the first to help out!</div>
          )}
        </div>

        <div className="announcement-card" style={{ padding: '32px', borderStyle: 'dashed' }}>
          <h3 style={{ margin: '0 0 20px' }}>Join the Discussion</h3>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={user?.role === "faculty" ? "Provide a verified solution..." : "Write a helpful reply..."}
            style={{ width: "100%", padding: "16px", background: "#1a1b1e", color: "white", borderRadius: "12px", border: '1px solid var(--border-subtle)', fontSize: '1rem', resize: 'none', boxSizing: 'border-box', marginBottom: '16px' }}
            rows={4}
          />
          <div style={{ textAlign: 'right' }}>
             <button className="primary-btn" style={user?.role === "faculty" ? { background: 'var(--accent-faculty)' } : {}} onClick={handleReply}>
                {user?.role === "faculty" ? "Post Official Solution ✔" : "Post Reply"}
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-container">
      <div className="student-header">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="back-button" style={{ padding: '8px 16px' }} onClick={() => window.history.back()}>
            ← Back
          </button>
          <h2 style={{ margin: 0 }}>Doubt Solving</h2>
        </div>
        {user?.role === "student" && (
          <button className="primary-btn" onClick={() => setShowAskModal(true)}>
            + Post a New Doubt
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '32px' }}>
        {doubts.map(doubt => (
          <div className="announcement-card" key={doubt._id} onClick={() => openDoubt(doubt)} style={{ cursor: "pointer", transition: 'var(--transition)' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{doubt.title}</h3>
              <span className={`status-badge ${doubt.status}`}>{doubt.status}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doubt.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                    {doubt.postedBy?.name?.[0].toUpperCase()}
                  </div>
                  <small style={{ color: 'var(--text-dim)' }}>By {doubt.postedBy?.name} · {doubt.subject}</small>
               </div>
               <small style={{ color: 'var(--text-dim)' }}>{new Date(doubt.createdAt).toLocaleDateString()}</small>
            </div>
          </div>
        ))}
        {doubts.length === 0 && <div className="faculty-empty">No doubts posted yet. Everything clear, it seems!</div>}
      </div>

      {showAskModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '600px', width: '90%' }}>
            <h2 style={{ marginBottom: '24px' }}>Ask a New Doubt</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input placeholder="Doubt Title (Clear and concise) *" value={newDoubt.title} onChange={(e) => setNewDoubt({ ...newDoubt, title: e.target.value })} />
              <input placeholder="Subject Area (e.g. Calculus)" value={newDoubt.subject} onChange={(e) => setNewDoubt({ ...newDoubt, subject: e.target.value })} />
              <textarea placeholder="Describe your doubt in detail. What have you tried so far? *" rows={6} value={newDoubt.description} onChange={(e) => setNewDoubt({ ...newDoubt, description: e.target.value })} />
            </div>
            <div className="modal-actions" style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setShowAskModal(false)}>Cancel</button>
              <button className="primary-btn" style={{ flex: 2 }} onClick={handleAskDoubt}>Submit My Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoubtsPage;
