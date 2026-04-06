import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
import { Check, X } from "lucide-react";

function ManageAnnouncements() {
  const [pending, setPending] = useState([]);
  const [expired, setExpired] = useState([]);
  const [tab, setTab] = useState("pending");
  const [user, setUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("http://localhost:5000/api/auth/current-user", { credentials: "include" });
      const data = await res.json();
      if (data && data.name) { 
        setUser(data); 
        loadPending(data);
        if (data.role === 'admin' || data.role === 'mainAdmin') {
          loadExpired();
        }
      } else { navigate("/login"); }
    } catch { navigate("/login"); }
  }

  const loadPending = async (currentUser) => {
    try {
      if (currentUser?.role === 'admin' || currentUser?.role === 'mainAdmin') {
         const res = await fetch("http://localhost:5000/api/announcements/pending", { credentials: "include" });
         const data = await res.json();
         setPending(Array.isArray(data) ? data : []);
      } else if (currentUser?.isBadgeAdmin) {
         const res = await fetch(`http://localhost:5000/api/announcement-requests/${currentUser.badgeName}`, { credentials: "include" });
         const data = await res.json();
         setPending(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadExpired = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/announcements/expired", { credentials: "include" });
      const data = await res.json();
      setExpired(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (id) => {
    if (user?.role === 'admin' || user?.role === 'mainAdmin') {
      await fetch(`http://localhost:5000/api/announcements/${id}/approve`, { method: "PATCH", credentials: "include" });
    } else if (user?.isBadgeAdmin) {
      await fetch(`http://localhost:5000/api/announcement-requests/approve/${id}`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeName: user.badgeName }),
        credentials: "include" 
      });
    }
    setShowModal(false);
    loadPending(user);
  };

  const handleReject = async (id) => {
    if (user?.role === 'admin' || user?.role === 'mainAdmin') {
      await fetch(`http://localhost:5000/api/announcements/${id}/reject`, { method: "PATCH", credentials: "include" });
    } else if (user?.isBadgeAdmin) {
      await fetch(`http://localhost:5000/api/announcement-requests/reject/${id}`, { method: "PUT", credentials: "include" });
    }
    setShowModal(false);
    loadPending(user);
    if (user.role === 'admin' || user.role === 'mainAdmin') loadExpired();
  };

  const handleRestore = async (id) => {
    await fetch(`http://localhost:5000/api/announcements/${id}/restore`, { 
      method: "PATCH", 
      credentials: "include" 
    });
    loadExpired();
    loadPending(user);
  };

  const handleViewDetails = async (id, isBadgeReq) => {
    try {
      if (isBadgeReq) {
        const res = await fetch(`http://localhost:5000/api/announcement-requests/details/${id}`, { credentials: "include" });
        const data = await res.json();
        setSelectedRequest(data);
      } else {
        const localData = pending.find(p => p._id === id);
        setSelectedRequest({
          ...localData,
          date: localData.startDate,
          registrationDeadline: localData.endDate,
          referenceLink: localData.link,
          imageUrl: localData.image ? `http://localhost:5000/uploads/${localData.image}` : null,
          creatorName: localData.postedBy?.name || 'Unknown',
          creatorRole: localData.postedByRole || 'student',
          department: localData.postedBy?.department || 'General'
        });
      }
      setShowModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!user) return null;

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2>Academix</h2>
        <ul>
          <li onClick={() => navigate((user.role === 'admin' || user.role === 'mainAdmin') ? "/admin" : "/dashboard")}>
            Dashboard
          </li>
          <li className="active">
            Manage Announcements
            {user.isBadgeAdmin && <div style={{ fontSize:'0.8rem', opacity:0.8 }}>({user.badgeName})</div>}
          </li>
        </ul>
      </div>

      <div className="main">
        <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Manage Announcements</h1>
          {(user.role === 'admin' || user.role === 'mainAdmin') && (
            <div style={{ display: 'flex', gap: '20px' }}>
              <button 
                onClick={() => setTab("pending")} 
                style={{ 
                  background: 'transparent', 
                  color: tab === 'pending' ? 'var(--accent-student)' : 'var(--text-dim)', 
                  border: 'none', 
                  borderBottom: tab === 'pending' ? '2px solid var(--accent-student)' : 'none',
                  padding: '10px 0',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Pending ({pending.length})
              </button>
              <button 
                onClick={() => setTab("expired")} 
                style={{ 
                  background: 'transparent', 
                  color: tab === 'expired' ? 'var(--accent-student)' : 'var(--text-dim)', 
                  border: 'none', 
                  borderBottom: tab === 'expired' ? '2px solid var(--accent-student)' : 'none',
                  padding: '10px 0',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Expired ({expired.length})
              </button>
            </div>
          )}
        </div>

        <div className="card" style={{ background: 'transparent', padding: 0 }}>
          {tab === "pending" ? (
            pending.length === 0 ? (
              <div className="faculty-empty" style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px' }}>
                 No pending announcements right now.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {pending.map(a => (
                  <div key={a._id} className="announcement" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px', color: 'white' }}>{a.title}</h3>
                        <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: '0.9rem' }}>{a.description}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span><strong>Posted by:</strong> {a.postedBy?.name || "Unknown"}</span>
                      <span><strong>Role:</strong> {(a.postedByRole || "student").toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button onClick={() => handleViewDetails(a._id, !!a.targetBadge)} style={{ padding: '10px 24px', background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>View Details</button>
                      <button onClick={() => handleApprove(a._id)} style={{ padding: '10px 24px', background: 'var(--accent-student)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                      <button onClick={() => handleReject(a._id)} style={{ padding: '10px 24px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            expired.length === 0 ? (
              <div className="faculty-empty" style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px' }}>
                 No expired announcements.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {expired.map(a => (
                  <div key={a._id} className="announcement" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '16px', opacity: 0.8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px', color: 'white' }}>{a.title} <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>(Expired)</span></h3>
                        <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: '0.9rem' }}>{a.description}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span><strong>Posted by:</strong> {a.postedBy?.name || "Unknown"}</span>
                      <span><strong>Expired on:</strong> {a.expiryDate ? new Date(a.expiryDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button 
                        onClick={() => handleRestore(a._id)}
                        style={{ padding: '10px 24px', background: 'var(--accent-faculty)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                         Restore to Feed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {showModal && selectedRequest && (
        <div className="overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} onClick={(e) => { if (e.target.className === 'overlay') setShowModal(false) }}>
          <div className="modal-details" style={{
              width: '700px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto',
              margin: 'auto', background: '#111', borderRadius: '12px', padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: 'white'
            }}>
            
            <h2 style={{ marginTop: 0, color: 'white', fontSize: '1.5rem', marginBottom: '16px' }}>{selectedRequest.title}</h2>

            {selectedRequest.imageUrl && (
              <img
                src={selectedRequest.imageUrl}
                alt="Poster"
                className="poster"
                style={{ width: '100%', borderRadius: '10px', margin: '15px 0', maxHeight: '400px', objectFit: 'cover' }}
              />
            )}

            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{selectedRequest.description}</p>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginTop: '20px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}><b style={{ color: 'var(--text-dim)' }}>Event Type:</b> <span style={{ color: 'white' }}>{selectedRequest.eventType}</span></p>
              <p style={{ margin: 0, fontSize: '0.9rem' }}><b style={{ color: 'var(--text-dim)' }}>Venue:</b> <span style={{ color: 'white' }}>{selectedRequest.venue || "TBD"}</span></p>
              <p style={{ margin: 0, fontSize: '0.9rem' }}><b style={{ color: 'var(--text-dim)' }}>Date:</b> <span style={{ color: 'white' }}>{selectedRequest.date ? (!isNaN(Date.parse(selectedRequest.date)) ? new Date(selectedRequest.date).toLocaleDateString() : selectedRequest.date) : "Not Provided"}</span></p>
              <p style={{ margin: 0, fontSize: '0.9rem' }}><b style={{ color: 'var(--text-dim)' }}>Deadline:</b> <span style={{ color: 'white' }}>{selectedRequest.registrationDeadline ? (!isNaN(Date.parse(selectedRequest.registrationDeadline)) ? new Date(selectedRequest.registrationDeadline).toLocaleDateString() : selectedRequest.registrationDeadline) : "Not Provided"}</span></p>
            </div>

            {selectedRequest.referenceLink && (
              <div style={{ marginTop: '16px' }}>
                 <a href={selectedRequest.referenceLink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-student)', textDecoration: 'none', fontWeight: 'bold' }}>
                   View Reference Link
                 </a>
              </div>
            )}

            <div className="creator" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><b style={{ color: 'var(--text-dim)' }}>Posted By:</b> <span style={{ color: 'white' }}>{selectedRequest.creatorName}</span></p>
              <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><b style={{ color: 'var(--text-dim)' }}>Role:</b> <span style={{ color: 'white' }}>{selectedRequest.creatorRole}</span></p>
              <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><b style={{ color: 'var(--text-dim)' }}>Department:</b> <span style={{ color: 'white' }}>{selectedRequest.department}</span></p>
            </div>

            <div className="actions" style={{ display: 'flex', gap: '16px', marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
              <button 
                onClick={() => handleApprove(selectedRequest._id)}
                style={{ flex: 1, padding: '12px', background: 'var(--accent-student)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
              >
                Approve
              </button>
              <button 
                onClick={() => handleReject(selectedRequest._id)}
                style={{ flex: 1, padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
              >
                Reject
              </button>
            </div>

            <button 
               onClick={() => setShowModal(false)}
               style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'transparent', color: 'var(--text-dim)', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
               Close
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAnnouncements;