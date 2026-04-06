import React, { useEffect } from "react";
import { X, Megaphone, MapPin, Calendar, Link as LinkIcon, FileText, Image as ImageIcon } from "lucide-react";

const BroadcastModal = ({ showModal, setShowModal, formData, setFormData, handleChange, handleSubmit }) => {
  
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    if (showModal) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [showModal, setShowModal]);

  if (!showModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal-box premium-modal" onClick={(e) => e.stopPropagation()} style={{ padding: '48px', maxWidth: '700px' }}>
        <button 
          onClick={() => setShowModal(false)}
          className="close-modal-btn"
          style={{
            position: "absolute", top: "24px", right: "24px", background: "rgba(255,255,255,0.05)",
            border: "none", color: "#94a3b8", cursor: "pointer", padding: "10px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease"
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
             <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-faculty)', borderRadius: '16px' }}>
                <Megaphone size={32} />
             </div>
             <div>
                <h2 style={{ fontSize: "2rem", margin: 0, fontWeight: "800", letterSpacing: '-0.025em' }}>Broadcast</h2>
                <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>Post official announcements to your department</p>
             </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="pro-input-group">
            <label style={{ color: "var(--accent-student)", fontSize: "0.75rem", fontWeight: "800", marginBottom: "10px", display: "block", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title / Heading</label>
            <input name="title" placeholder="e.g. Mandatory Department Meeting" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: '18px', background: '#1a1b1e', border: '1px solid var(--border-subtle)', borderRadius: '14px', fontSize: '1.05rem' }} />
          </div>

          <div className="pro-input-group">
            <label style={{ color: "var(--accent-student)", fontSize: "0.75rem", fontWeight: "800", marginBottom: "10px", display: "block", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Announcement Content</label>
            <textarea name="description" placeholder="Provide all necessary details for students..." rows={5} value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '18px', background: '#1a1b1e', border: '1px solid var(--border-subtle)', borderRadius: '14px', fontSize: '1rem', lineHeight: '1.6', resize: 'none' }} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="pro-input-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dim)", fontSize: "0.75rem", fontWeight: "700", marginBottom: "10px", textTransform: 'uppercase' }}><MapPin size={14} /> Venue</label>
              <input name="venue" placeholder="e.g. Auditorium A1" value={formData.venue} onChange={handleChange} style={{ width: '100%', padding: '14px', background: '#1a1b1e', border: '1px solid var(--border-subtle)', borderRadius: '12px' }} />
            </div>
            <div className="pro-input-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dim)", fontSize: "0.75rem", fontWeight: "700", marginBottom: "10px", textTransform: 'uppercase' }}>Event Type</label>
              <select name="eventType" value={formData.eventType} onChange={handleChange} style={{ width: '100%', padding: '14px', background: '#1a1b1e', border: '1px solid var(--border-subtle)', borderRadius: '12px', cursor: 'pointer' }}>
                <option>Workshop</option><option>Seminar</option><option>Hackathon</option><option>Internship</option><option>Exam</option><option>General</option>
              </select>
            </div>
          </div>

          <div className="pro-input-group">
            <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dim)", fontSize: "0.75rem", fontWeight: "700", marginBottom: "10px", textTransform: 'uppercase' }}><LinkIcon size={14} /> External Link</label>
            <input name="link" type="url" placeholder="https://registration-link.com" value={formData.link} onChange={handleChange} style={{ width: '100%', padding: '14px', background: '#1a1b1e', border: '1px solid var(--border-subtle)', borderRadius: '12px' }} />
          </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dim)", fontSize: "0.75rem", fontWeight: "700", marginBottom: "10px", textTransform: 'uppercase' }}><Calendar size={14} /> Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={{ width: '100%', padding: '14px', background: '#1a1b1e', border: '1px solid var(--border-subtle)', borderRadius: '12px' }} />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dim)", fontSize: "0.75rem", fontWeight: "700", marginBottom: "10px", textTransform: 'uppercase' }}><Calendar size={14} /> End Date</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} style={{ width: '100%', padding: '14px', background: '#1a1b1e', border: '1px solid var(--border-subtle)', borderRadius: '12px' }} />
              </div>
           </div>

           <div className="pro-input-group">
            <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dim)", fontSize: "0.75rem", fontWeight: "700", marginBottom: "10px", textTransform: 'uppercase' }}><Calendar size={14} /> Expiry Date (Internal)</label>
            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} style={{ width: '100%', padding: '14px', background: '#1a1b1e', border: '1px solid var(--border-subtle)', borderRadius: '12px' }} />
            <small style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>When the post will hide from feeds (Default: End Date or 7 Days)</small>
          </div>

           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '14px 20px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <input type="checkbox" name="registrationRequired" checked={formData.registrationRequired} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-faculty)' }} id="reg-req" />
              <label htmlFor="reg-req" style={{ cursor: 'pointer', userSelect: 'none', fontWeight: '600', fontSize: '0.95rem' }}>Registration Required</label>
           </div>

           <div className="file-section" style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="file-upload-box">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-student)', marginBottom: '10px', textTransform: 'uppercase' }}><ImageIcon size={14} /> Image Cover</label>
                      <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, coverImage: e.target.files[0] })} style={{ fontSize: '0.8rem', width: '100%' }} />
                  </div>
                  <div className="file-upload-box">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-student)', marginBottom: '10px', textTransform: 'uppercase' }}><FileText size={14} /> PDF Document</label>
                      <input type="file" accept="application/pdf" onChange={(e) => setFormData({ ...formData, pdfFile: e.target.files[0] })} style={{ fontSize: '0.8rem', width: '100%' }} />
                  </div>
              </div>
           </div>

           <button 
             className="primary-btn faculty-submit-btn" 
             style={{ 
               background: 'var(--accent-faculty)', width: '100%', padding: '20px', 
               borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800', 
               boxShadow: '0 15px 35px -10px rgba(59, 130, 246, 0.5)', transition: 'all 0.3s ease',
               marginTop: '10px', border: 'none', cursor: 'pointer', color: 'white'
             }} 
             onClick={handleSubmit}
           >
             Publish Announcement Instantly
           </button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastModal;
