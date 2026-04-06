import React, { useEffect, useState } from "react";

const AnnouncementModal = ({ showModal, setShowModal, formData, setFormData, handleChange, handleSubmit }) => {
  const [adminBadges, setAdminBadges] = useState([]);

  useEffect(() => {
    if (showModal) {
      fetch("http://localhost:5000/api/admin-badges")
        .then(res => res.json())
        .then(data => setAdminBadges(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    }
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal-box" style={{ maxWidth: '600px', width: '90%' }}>
        <h2>New Announcement</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input name="title" placeholder="Catchy Title *" value={formData.title} onChange={handleChange} />
          <textarea name="description" placeholder="Provide full details..." rows={5} value={formData.description} onChange={handleChange} />
          <input name="venue" placeholder="Venue / Location" value={formData.venue} onChange={handleChange} />
          <input name="link" type="url" placeholder="Reference Link (External)" value={formData.link} onChange={handleChange} />
          
          <select name="targetBadge" value={formData.targetBadge || ""} onChange={handleChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
            <option value="">Direct Post (Default Admin Approval)</option>
            {adminBadges.map(b => (
              <option key={b._id} value={b.badgeName}>{b.badgeName} (Targeted Request)</option>
            ))}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <select name="eventType" value={formData.eventType} onChange={handleChange}>
              <option>Workshop</option><option>Seminar</option><option>Hackathon</option><option>Internship</option><option>Exam</option><option>General</option>
            </select>
            <input type="file" style={{ padding: '12px' }} onChange={(e) => setFormData({ ...formData, coverImage: e.target.files[0] })} />
          </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} title="Start Date" />
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} title="End Date" />
           </div>
           
           <div className="pro-input-group">
            <label style={{ color: "var(--accent-student)", fontSize: "0.75rem", fontWeight: "800", marginBottom: "10px", display: "block", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Set Expiry Date (Optional)</label>
            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white' }} />
            <small style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Default: End Date or 7 Days</small>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Discard</button>
          <button className="primary-btn" style={{ flex: 2, background: 'var(--accent-student)' }} onClick={handleSubmit}>Request Approval</button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
