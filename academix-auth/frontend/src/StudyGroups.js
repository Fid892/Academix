import React, { useState, useEffect } from "react";
import "./Dashboard.css"; // Uses the new design system
import CreateGroupModal from "./CreateGroupModal";

function StudyGroups() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinedGroupIds, setJoinedGroupIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchGroups();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  async function fetchUser() {
    try {
      const res = await fetch("http://localhost:5000/api/auth/current-user", { credentials: "include" });
      const data = await res.json();
      setUser(data);
      if (data && data._id) {
        fetchJoinedGroups(data._id);
      }
    } catch (err) { console.error(err); }
  }

  async function fetchJoinedGroups(userId) {
    try {
      const res = await fetch(`http://localhost:5000/api/profile/user/${userId}/groups`, { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setJoinedGroupIds(new Set(data.map(g => g._id)));
      }
    } catch (err) { console.error(err); }
  }

  async function fetchGroups() {
    try {
      const res = await fetch("http://localhost:5000/api/study-groups");
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch { setGroups([]); }
  }

  const handleJoinSuccess = (groupId) => {
    setJoinedGroupIds(prev => new Set([...prev, groupId]));
  };

  if (selectedGroup) {
    return (
      <GroupDiscussion 
        group={selectedGroup} 
        user={user} 
        isMember={joinedGroupIds.has(selectedGroup._id)}
        onBack={() => setSelectedGroup(null)} 
      />
    );
  }

  return (
    <div className="student-container">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", background: "var(--accent-primary)",
          color: "white", padding: "12px 24px", borderRadius: "12px", zIndex: 1000,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)", animation: "slideIn 0.3s ease-out"
        }}>
          {toast}
        </div>
      )}

      <div className="student-header">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="back-button" style={{ padding: '8px 16px' }} onClick={() => window.history.back()}>
            ← Back
          </button>
          <h2 style={{ margin: 0 }}>Study Groups</h2>
        </div>
        <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
          + Create New Group
        </button>
      </div>

      <div className="card-grid">
        {groups.map((group) => (
          <GroupCard 
            key={group._id} 
            group={group} 
            isJoined={joinedGroupIds.has(group._id)}
            onEnter={() => setSelectedGroup(group)}
            onJoinSuccess={() => {
                handleJoinSuccess(group._id);
                showToast("Joined successfully");
            }}
          />
        ))}
      </div>

      {groups.length === 0 && (
        <div className="faculty-empty" style={{ margin: '40px 0' }}>
          No study groups available yet. Be the first to start one!
        </div>
      )}

      <CreateGroupModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onCreated={() => {
            fetchGroups();
            if (user?._id) fetchJoinedGroups(user._id);
        }} 
      />
    </div>
  );
}

function GroupCard({ group, isJoined, onEnter, onJoinSuccess }) {
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/study-groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ groupId: group._id })
      });
      if (res.ok) {
        onJoinSuccess();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to join group");
      }
    } catch (err) {
      console.error(err);
      alert("Error joining group");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-card" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          {group.groupType === "Processor Discussion Group" ? "⚙️" : "📚"}
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="status-badge student" style={{ fontSize: '9px', display: 'block', marginBottom: '4px' }}>{group.subject}</span>
          {group.semester && <span style={{ fontSize: '10px', opacity: 0.6 }}>Sem {group.semester}</span>}
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>
            {group.membersCount || 0} members
          </div>
        </div>
      </div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{group.name}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '16px', flex: 1 }}>
        {group.description || "Academic discussion and resource sharing."}
      </p>
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: 'auto' }}>
        {isJoined ? (
          <button
            className="primary-btn"
            style={{ width: "100%", padding: '12px', fontSize: '0.9rem', background: 'var(--accent-faculty)' }}
            onClick={onEnter}
          >
            View Group
          </button>
        ) : (
          <button
            className="primary-btn"
            style={{ width: "100%", padding: '12px', fontSize: '0.9rem' }}
            onClick={handleJoin}
            disabled={loading}
          >
            {loading ? "Joining..." : "Join Group"}
          </button>
        )}
      </div>
    </div>
  );
}

function GroupDiscussion({ group, user, isMember, onBack }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [noteFile, setNoteFile] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [doubtFile, setDoubtFile] = useState(null);
  const [doubtContent, setDoubtContent] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [replyInputs, setReplyInputs] = useState({}); // { postId: "some text" }
  const [activeTab, setActiveTab] = useState("discussions");

  useEffect(() => { 
    fetchPosts(); 
    fetchFaculties();
  }, []);

  async function fetchFaculties() {
    try {
      const res = await fetch("http://localhost:5000/api/study-groups/faculties/list", { credentials: "include" });
      const data = await res.json();
      setFaculties(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error(err);
      setFaculties([]);
    }
  }

  async function fetchPosts() {
    try {
      const res = await fetch(`http://localhost:5000/api/study-groups/${group._id}/posts`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }

  async function handlePost() {
    if (!newPost.trim()) return;
    const formData = new FormData();
    formData.append("content", newPost);
    formData.append("type", "post");
    await fetch(`http://localhost:5000/api/study-groups/${group._id}/posts`, {
      method: "POST", credentials: "include", body: formData
    });
    setNewPost(""); fetchPosts();
  }

  async function handleUploadNote(category) {
    if (!noteFile && !noteContent) return;
    const formData = new FormData();
    formData.append("file", noteFile);
    formData.append("content", noteContent);
    formData.append("type", "note");
    formData.append("noteCategory", category);
    try {
      const res = await fetch(`http://localhost:5000/api/study-groups/${group._id}/posts`, {
        method: "POST", credentials: "include", body: formData
      });
      if (res.ok) {
        setNoteFile(null); setNoteContent(""); fetchPosts();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message || "Failed to upload note"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Network Error: Could not connect to the server.");
    }
  }

  async function handleAskDoubt() {
    if (!doubtContent.trim()) return;
    const formData = new FormData();
    formData.append("content", doubtContent);
    formData.append("type", "doubt");
    if (doubtFile) formData.append("file", doubtFile);
    if (selectedFaculty) formData.append("mentionedFaculty", selectedFaculty);
    try {
      const res = await fetch(`http://localhost:5000/api/study-groups/${group._id}/posts`, {
        method: "POST", credentials: "include", body: formData
      });
      if (res.ok) {
        setDoubtContent(""); setSelectedFaculty(""); setDoubtFile(null); fetchPosts();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message || "Could not post doubt"}`);
      }
    } catch (error) {
      console.error("Doubt error:", error);
      alert("Network Error: Could not connect to the server.");
    }
  }

  async function handleAddReply(postId) {
    const text = replyInputs[postId];
    if (!text || !text.trim()) return;
    const res = await fetch(`http://localhost:5000/api/study-groups/${group._id}/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text })
    });
    if (res.ok) {
      setReplyInputs({ ...replyInputs, [postId]: "" });
      fetchPosts();
    }
  }

  async function handleDeletePost(postId) {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    const res = await fetch(`http://localhost:5000/api/study-groups/${group._id}/posts/${postId}`, {
      method: "DELETE", credentials: "include"
    });
    if (res.ok) fetchPosts();
    else alert("Failed to delete. You can only delete your own posts.");
  }

  const discussions = posts.filter(p => p.type === "post");
  const studentNotes = posts.filter(p => p.type === "note" && p.noteCategory === "student");
  const facultyNotes = posts.filter(p => p.type === "note" && p.noteCategory === "faculty");
  const doubts = posts.filter(p => p.type === "doubt");

  if (!isMember) {
    return (
      <div className="student-container">
        <div className="student-header">
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button className="back-button" style={{ padding: '8px 16px' }} onClick={onBack}>
              ← Back
            </button>
            <h2 style={{ margin: 0 }}>{group.name}</h2>
          </div>
        </div>
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          height: '60vh', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', 
          border: '1px dashed var(--border-subtle)', margin: '40px 0', textAlign: 'center', padding: '40px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔒</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Access Restricted</h3>
          <p style={{ color: 'var(--text-dim)', maxWidth: '400px', lineHeight: '1.6' }}>
            You must join the group to view discussions, access resources, and participate in doubts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-container">
      <div className="student-header">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="back-button" style={{ padding: '8px 16px' }} onClick={onBack}>
            ← Back
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: 0 }}>{group.name}</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="status-badge student" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>{group.groupType}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>• {group.subject}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-tabs" style={{ marginBottom: '40px' }}>
        <button className={`tab-btn ${activeTab === "discussions" ? "active" : ""}`} onClick={() => setActiveTab("discussions")}>
          💬 Global Chat
        </button>
        <button className={`tab-btn ${activeTab === "notes" ? "active" : ""}`} onClick={() => setActiveTab("notes")}>
          📄 Resources & Doubts
        </button>
      </div>

      {activeTab === "discussions" && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="announcement-card" style={{ padding: '24px', borderStyle: 'dashed', background: 'rgba(255,255,255,0.02)' }}>
            <textarea
              placeholder="What's on your mind? Share with the group..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              style={{ width: "100%", padding: "16px", borderRadius: "12px", background: "#1a1b1e", color: "white", border: "1px solid var(--border-subtle)", fontSize: '1rem', resize: 'none', marginBottom: '16px', boxSizing: 'border-box' }}
              rows={3}
            />
            <div style={{ textAlign: 'right' }}>
              <button className="primary-btn" onClick={handlePost}>Broadcast Message</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
            {discussions.map(post => {
                const isAuthor = user && post.postedBy?._id === user._id;
                return (
                    <div className="announcement-card" key={post._id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--accent-primary)', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {post.postedBy?.name?.[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '1.05rem' }}>{post.postedBy?.name}</p>
                                {isAuthor && <button onClick={() => handleDeletePost(post._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '1.1rem', cursor: 'pointer' }}>🗑️</button>}
                            </div>
                            <p style={{ margin: '0 0 12px', color: 'var(--text-main)', lineHeight: '1.6' }}>{post.content}</p>
                            <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{new Date(post.createdAt).toLocaleString()}</small>
                        </div>
                    </div>
                );
            })}
            {discussions.length === 0 && <div className="faculty-empty">Silence is gold, but sharing is platinum. Start the conversation!</div>}
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
          
          {/* Column 1: Faculty Hub */}
          <div className="notes-column">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--accent-faculty)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🏅</div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Official Resources</h3>
            </div>

            {user?.role === "faculty" && (
              <div className="announcement-card" style={{ borderStyle: 'dashed', borderColor: 'var(--accent-faculty)', background: 'rgba(59, 130, 246, 0.03)', marginBottom: '24px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px', color: 'var(--accent-faculty)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Faculty Publication</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                        type="file"
                        id="faculty-file"
                        style={{ display: 'none' }}
                        onChange={(e) => setNoteFile(e.target.files[0])}
                    />
                    <label htmlFor="faculty-file" style={{ display: 'block', background: '#1a1b1e', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', cursor: 'pointer', textAlign: 'center', fontSize: '0.9rem', color: noteFile ? 'var(--accent-faculty)' : 'var(--text-dim)' }}>
                        {noteFile ? `📄 ${noteFile.name}` : "📂 Choose Course PDF/Image"}
                    </label>
                  </div>
                  <input
                    placeholder="Short description..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    style={{ background: '#1a1b1e', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', color: 'white' }}
                  />
                  <button className="primary-btn" style={{ background: 'var(--accent-faculty)', padding: '12px' }} onClick={() => handleUploadNote("faculty")}>
                    Verify & Upload
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {facultyNotes.map(note => (
                <div className="announcement-card" key={note._id} style={{ borderLeft: '4px solid var(--accent-faculty)', position: 'relative', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: '600', color: '#fff' }}>{note.content || "Course Material"}</p>
                    {user && note.postedBy?._id === user._id && <button onClick={() => handleDeletePost(note._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', opacity: 0.6 }}>✕</button>}
                  </div>
                  {note.fileUrl && (
                    <a href={`http://localhost:5000/uploads/${note.fileUrl}`} target="_blank" rel="noreferrer" className="announcement-link" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-faculty)', display: 'block', textAlign: 'center', fontWeight: 'bold' }}>
                      📥 Download Faculty PDF
                    </a>
                  )}
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Prof. {note.postedBy?.name}</small>
                    <small style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{new Date(note.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
              {facultyNotes.length === 0 && <div className="faculty-empty" style={{ padding: '40px 20px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-subtle)' }}>No official notes yet.</div>}
            </div>
          </div>

          {/* Column 2: Student Ledger */}
          <div className="notes-column">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📄</div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Student Vault</h3>
            </div>

            <div className="announcement-card" style={{ borderStyle: 'dashed', background: 'rgba(255,255,255,0.02)', marginBottom: '24px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)' }}>Share Contribution</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            id="student-file"
                            style={{ display: 'none' }}
                            onChange={(e) => setNoteFile(e.target.files[0])}
                        />
                        <label htmlFor="student-file" style={{ display: 'block', background: '#1a1b1e', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', cursor: 'pointer', textAlign: 'center', fontSize: '0.9rem', color: noteFile ? 'var(--accent-primary)' : 'var(--text-dim)' }}>
                            {noteFile ? `📄 ${noteFile.name}` : "📂 Select Material to Upload"}
                        </label>
                    </div>
                    <input
                        placeholder="Group will see this description..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        style={{ background: '#1a1b1e', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', color: 'white' }}
                    />
                    <button className="primary-btn" style={{ padding: '12px' }} onClick={() => handleUploadNote("student")}>
                        Add to Vault
                    </button>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {studentNotes.map(note => (
                <div className="announcement-card" key={note._id} style={{ position: 'relative', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: '500' }}>{note.content || "Study Material"}</p>
                    {user && note.postedBy?._id === user._id && <button onClick={() => handleDeletePost(note._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', opacity: 0.6 }}>✕</button>}
                  </div>
                  {note.fileUrl && (
                    <a href={`http://localhost:5000/uploads/${note.fileUrl}`} target="_blank" rel="noreferrer" className="announcement-link" style={{ display: 'block', textAlign: 'center', fontWeight: 'bold' }}>
                      📎 View Material
                    </a>
                  )}
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{note.postedBy?.name}</small>
                    <small style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{new Date(note.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
              {studentNotes.length === 0 && <div className="faculty-empty" style={{ padding: '40px 20px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-subtle)' }}>Vault is empty.</div>}
            </div>
          </div>

          {/* Column 3: Doubts Hub */}
          <div className="notes-column">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--accent-student)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>❓</div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Doubts Hub</h3>
            </div>

            <div className="announcement-card" style={{ borderStyle: 'dashed', borderColor: 'var(--accent-student)', background: 'rgba(239, 68, 68, 0.03)', marginBottom: '24px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px', color: 'var(--accent-student)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolve an Issue</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea
                    placeholder="Describe your doubt here for classmates or faculty..."
                    rows={3}
                    value={doubtContent}
                    onChange={(e) => setDoubtContent(e.target.value)}
                    style={{ background: '#1a1b1e', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', color: 'white', resize: 'none', fontSize: '0.95rem' }}
                    />

                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            id="doubt-file-upload"
                            style={{ display: 'none' }}
                            onChange={(e) => setDoubtFile(e.target.files[0])}
                        />
                        <label htmlFor="doubt-file-upload" style={{ display: 'block', background: '#1a1b1e', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-subtle)', cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem', color: doubtFile ? 'var(--accent-student)' : 'var(--text-dim)' }}>
                            {doubtFile ? `📎 ${doubtFile.name}` : "🖼️ Add Proof (Image/PDF)"}
                        </label>
                    </div>
                    
                    <select 
                      value={selectedFaculty} 
                      onChange={(e) => setSelectedFaculty(e.target.value)}
                      style={{ background: '#1a1b1e', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-subtle)', color: 'white', fontSize: '0.85rem' }}
                    >
                      <option value="">Mention a Faculty (Optional)</option>
                      {Array.isArray(faculties) && faculties.map(f => (
                        <option key={f._id} value={f._id}>Prof. {f.name} ({f.department})</option>
                      ))}
                    </select>

                    <button className="primary-btn" style={{ background: 'var(--accent-student)', padding: '12px' }} onClick={handleAskDoubt}>
                        Request Clarification
                    </button>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {doubts.map(doubt => (
                <div className="announcement-card" key={doubt._id} style={{ borderLeft: '4px solid var(--accent-student)', position: 'relative', background: 'rgba(255,255,255,0.01)', padding: '20px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--accent-student)' }}>Doubt by {doubt.postedBy?.name}</p>
                     {user && doubt.postedBy?._id === user._id && <button onClick={() => handleDeletePost(doubt._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', opacity: 0.6 }}>✕</button>}
                   </div>

                   {doubt.mentionedFaculty && (
                     <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-faculty)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <span>🔔 Tagged:</span>
                        <strong>Prof. {doubt.mentionedFaculty.name}</strong>
                     </div>
                   )}

                   <p style={{ margin: '0 0 16px', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.5', fontSize: '1rem' }}>"{doubt.content}"</p>
                   
                   {doubt.fileUrl && (
                    <a href={`http://localhost:5000/uploads/${doubt.fileUrl}`} target="_blank" rel="noreferrer" className="announcement-link" style={{ marginBottom: '16px', display: 'block', textAlign: 'center', borderColor: 'var(--accent-student)', color: 'var(--accent-student)', background: 'rgba(239, 68, 68, 0.05)' }}>
                      🔍 View Supporting Asset
                    </a>
                   )}

                   {/* Replies Section */}
                   <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                      <p style={{ margin: '0 0 12px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Discussion Thread</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {doubt.comments?.map(comment => (
                          <div key={comment._id} style={{ fontSize: '0.85rem', borderLeft: '2px solid var(--border-subtle)', paddingLeft: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                              <strong style={{ color: comment.postedBy?.role === 'faculty' ? 'var(--accent-faculty)' : 'var(--text-main)' }}>
                                {comment.postedBy?.name}
                              </strong>
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{comment.text}</p>
                          </div>
                        ))}
                        {(!doubt.comments || doubt.comments.length === 0) && <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>No replies yet. Be the first to help!</p>}
                      </div>
                   </div>

                   {/* Reply Input */}
                   <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        placeholder="Write a reply..."
                        value={replyInputs[doubt._id] || ""}
                        onChange={(e) => setReplyInputs({ ...replyInputs, [doubt._id]: e.target.value })}
                        style={{ flex: 1, background: '#1a1b1e', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '0.85rem' }}
                      />
                      <button className="primary-btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => handleAddReply(doubt._id)}>Reply</button>
                   </div>

                   <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Posted {new Date(doubt.createdAt).toLocaleDateString()}</span>
                      <span style={{ color: doubt.comments?.length > 0 ? '#10b981' : 'var(--accent-student)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {doubt.comments?.length > 0 ? 'DISCUSSION ACTIVE' : 'AWAITING HELP'}
                      </span>
                   </div>
                </div>
              ))}
              {doubts.length === 0 && <div className="faculty-empty" style={{ padding: '40px 20px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-subtle)' }}>All doubts cleared.</div>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default StudyGroups;