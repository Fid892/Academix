import React, { useState, useEffect } from "react";
import "./Dashboard.css";

function DoubtsPage() {
  const [user, setUser] = useState(null);
  const [doubts, setDoubts] = useState([]);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newDoubt, setNewDoubt] = useState({ title: "", description: "", subject: "", isAnonymous: false });
  const [doubtFile, setDoubtFile] = useState(null);
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
    if (!newDoubt.title || !newDoubt.description) {
        alert("Please fill in the title and description.");
        return;
    }
    const formData = new FormData();
    formData.append("title", newDoubt.title);
    formData.append("description", newDoubt.description);
    formData.append("subject", newDoubt.subject);
    formData.append("isAnonymous", newDoubt.isAnonymous);
    if (doubtFile) formData.append("file", doubtFile);

    const res = await fetch("http://localhost:5000/api/doubts", {
      method: "POST",
      credentials: "include",
      body: formData
    });
    if (res.ok) {
      setShowAskModal(false);
      setNewDoubt({ title: "", description: "", subject: "", isAnonymous: false });
      setDoubtFile(null);
      fetchDoubts();
    } else {
      const errData = await res.json();
      alert(`Error: ${errData.message || "Failed to post doubt"}`);
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
              <h2 style={{ margin: 0 }}>Doubt Detail</h2>
           </div>
        </div>

        <div className="announcement-card" style={{ padding: '40px', borderLeft: '4px solid var(--accent-primary)', marginBottom: '40px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
             <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>{selectedDoubt.title}</h2>
             <span className={`status-badge ${selectedDoubt.status}`} style={{ padding: '8px 16px', borderRadius: '10px' }}>{selectedDoubt.status.toUpperCase()}</span>
          </div>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', marginBottom: '32px' }}>{selectedDoubt.description}</p>
          
          {selectedDoubt.fileUrl && (
            <div style={{ marginBottom: '32px' }}>
              <a href={`http://localhost:5000/uploads/${selectedDoubt.fileUrl}`} target="_blank" rel="noreferrer" className="announcement-link" style={{ display: 'inline-block', width: 'auto', padding: '12px 24px', background: 'rgba(255,255,255,0.05)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                📎 View Attached Evidence (Proof/Image)
              </a>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px 24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', background: selectedDoubt.isAnonymous ? '#374151' : 'var(--accent-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                {selectedDoubt.isAnonymous ? "👤" : selectedDoubt.postedBy?.name?.[0].toUpperCase()}
                </div>
                <div>
                    <p style={{ margin: 0, fontWeight: '700', color: selectedDoubt.isAnonymous ? 'var(--text-dim)' : '#fff' }}>{selectedDoubt.postedBy?.name}</p>
                    <small style={{ color: 'var(--text-dim)' }}>{selectedDoubt.subject} · {new Date(selectedDoubt.createdAt).toLocaleDateString()}</small>
                </div>
            </div>
            {selectedDoubt.isAnonymous && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>Identity Private</span>}
          </div>
        </div>

        <h3 className="faculty-section-title" style={{ marginBottom: '32px', fontSize: '1.4rem' }}>Solutions & Discussions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '60px' }}>
          {replies.map(reply => (
            <div className="announcement-card" key={reply._id} style={reply.isVerified ? { border: "1px solid var(--accent-faculty)", background: "rgba(59, 130, 246, 0.05)", padding: '30px' } : { padding: '30px' }}>
              {reply.isVerified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-faculty)', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.1em' }}>
                  <span style={{ fontSize: '1.4rem' }}>✔</span> Peerless Faculty Expert Solution
                </div>
              )}
              <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', margin: '0 0 20px' }}>{reply.content}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: reply.postedBy?.role === 'faculty' ? 'var(--accent-faculty)' : '#25262b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {reply.postedBy?.name?.[0].toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <small style={{ color: '#fff', fontWeight: '700' }}>{reply.postedBy?.name}</small>
                    <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{reply.postedBy?.role === 'faculty' ? 'Faculty Member' : 'Student'} · {new Date(reply.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
          ))}
          {replies.length === 0 && (
            <div className="faculty-empty" style={{ padding: '60px 20px' }}>Silence is gold, but a solution is platinum. Be the first to enlighten!</div>
          )}
        </div>

        <div className="announcement-card" style={{ padding: '40px', borderStyle: 'dashed', background: 'rgba(255,255,255,0.01)' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: '1.25rem' }}>Post Your Contribution</h3>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={user?.role === "faculty" ? "Provide a verified solution to clear this doubt..." : "Write a helpful reply or suggestion..."}
            style={{ width: "100%", padding: "20px", background: "#111111", color: "white", borderRadius: "16px", border: '1px solid var(--border-subtle)', fontSize: '1rem', resize: 'none', boxSizing: 'border-box', marginBottom: '24px', minHeight: '120px' }}
          />
          <div style={{ textAlign: 'right' }}>
             <button className="primary-btn" style={user?.role === "faculty" ? { background: 'var(--accent-faculty)', padding: '14px 32px' } : { padding: '14px 32px' }} onClick={handleReply}>
                {user?.role === "faculty" ? "Apply Verified Solution ✔" : "Post My Reply"}
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
          <h2 style={{ margin: 0, fontSize: '2rem' }}>Peer Doubt Support</h2>
        </div>
        {user?.role === "student" && (
          <button className="primary-btn" onClick={() => setShowAskModal(true)} style={{ padding: '12px 28px', fontSize: '1rem' }}>
            + Request Clarification
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px', marginTop: '48px' }}>
        {doubts.map(doubt => (
          <div className="announcement-card shadow-hover" key={doubt._id} onClick={() => openDoubt(doubt)} style={{ cursor: "pointer", display: 'flex', flexDirection: 'column', minHeight: '240px' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'flex-start', marginBottom: '16px' }}>
               <span className={`status-badge ${doubt.status}`} style={{ fontSize: '0.7rem', padding: '4px 10px' }}>{doubt.status.toUpperCase()}</span>
               {doubt.isAnonymous && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>👤 Private</span>}
            </div>
            
            <h3 style={{ margin: '0 0 12px', fontSize: '1.3rem', color: '#fff', fontWeight: '800' }}>{doubt.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', flex: 1, lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doubt.description}</p>
            
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', background: doubt.isAnonymous ? '#25262b' : 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                    {doubt.isAnonymous ? "👤" : doubt.postedBy?.name?.[0].toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <small style={{ color: doubt.isAnonymous ? 'var(--text-dim)' : '#fff', fontWeight: '700' }}>{doubt.postedBy?.name}</small>
                    <small style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{doubt.subject}</small>
                  </div>
               </div>
               <small style={{ color: 'var(--text-dim)', fontWeight: '600' }}>{new Date(doubt.createdAt).toLocaleDateString()}</small>
            </div>
          </div>
        ))}
      </div>
      {doubts.length === 0 && (
        <div className="faculty-empty" style={{ marginTop: '100px', fontSize: '1.2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✨</div>
            The board is clear. No active doubts to solve right now!
        </div>
      )}

      {showAskModal && (
        <div className="notice-modal-overlay">
          <div className="notice-modal" style={{ maxWidth: '650px', width: '90%', padding: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Post New Doubt</h2>
                <div onClick={() => setShowAskModal(false)} style={{ cursor: 'pointer', opacity: 0.5 }}>✕</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600' }}>PROBLEM TITLE</label>
                <input 
                    placeholder="Briefly state your academic roadblock..." 
                    value={newDoubt.title} 
                    onChange={(e) => setNewDoubt({ ...newDoubt, title: e.target.value })} 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '12px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600' }}>SUBJECT AREA</label>
                <input 
                    placeholder="e.g. Data Structures, Economics, Thermodynamics..." 
                    value={newDoubt.subject} 
                    onChange={(e) => setNewDoubt({ ...newDoubt, subject: e.target.value })} 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '12px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600' }}>DETAILED DESCRIPTION</label>
                <textarea 
                    placeholder="Describe exactly where you are stuck. Mention any steps you have already taken..." 
                    rows={6} 
                    value={newDoubt.description} 
                    onChange={(e) => setNewDoubt({ ...newDoubt, description: e.target.value })} 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '12px', color: '#fff', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600' }}>🖼️ ATTACH EVIDENCE (IMAGE/PDF)</label>
                <input 
                    type="file"
                    onChange={(e) => setDoubtFile(e.target.files[0])}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '12px', color: 'var(--text-dim)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: '12px' }}>
                <input 
                    type="checkbox" 
                    id="anonymous-check"
                    checked={newDoubt.isAnonymous} 
                    onChange={(e) => setNewDoubt({ ...newDoubt, isAnonymous: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="anonymous-check" style={{ cursor: 'pointer', fontWeight: '600', display: 'flex', flexDirection: 'column' }}>
                    Post Anonymously
                    <small style={{ color: 'var(--text-dim)', fontWeight: '400', fontSize: '0.75rem' }}>Your name will only be visible to faculty members.</small>
                </label>
              </div>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
              <button className="secondary-btn" style={{ flex: 1, padding: '16px' }} onClick={() => setShowAskModal(false)}>Discard</button>
              <button className="primary-btn" style={{ flex: 2, padding: '16px', fontSize: '1rem' }} onClick={handleAskDoubt}>Request Support Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoubtsPage;
