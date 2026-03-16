import React, { useState } from "react";

function EditProfileModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    department: user.department || "",
    semester: user.semester || "",
    designation: user.designation || "",
    university: user.university || "",
    scheme: user.scheme || "",
    registerNumber: user.registerNumber || "",
    interests: user.interests?.join(", ") || "",
    profileImage: null
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, profileImage: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("bio", formData.bio);
    data.append("department", formData.department);
    data.append("semester", formData.semester);
    data.append("designation", formData.designation);
    data.append("university", formData.university);
    data.append("scheme", formData.scheme);
    data.append("registerNumber", formData.registerNumber);
    data.append("interests", formData.interests);
    if (formData.profileImage) {
      data.append("profileImage", formData.profileImage);
    }

    try {
      const res = await fetch("http://localhost:5000/api/profile/update", {
        method: "PUT",
        credentials: "include",
        body: data
      });

      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '650px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '24px' }}>Edit Detailed Profile</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={2} placeholder="Tell us about yourself..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Department</label>
              <input name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science" />
            </div>
            {user.role === 'student' ? (
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Semester</label>
                <input name="semester" value={formData.semester} onChange={handleChange} placeholder="e.g. 4" />
              </div>
            ) : (
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Designation</label>
                <input name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Assistant Professor" />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>University</label>
              <input name="university" value={formData.university} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Year / Scheme</label>
              <input name="scheme" value={formData.scheme} onChange={handleChange} placeholder="e.g. 2019" />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Register Number</label>
            <input name="registerNumber" value={formData.registerNumber} onChange={handleChange} />
          </div>

          <div className="form-group" title="Separate interests with commas">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Academic Interests (comma separated)</label>
            <input name="interests" value={formData.interests} onChange={handleChange} placeholder="AI, Machine Learning, Web Dev..." />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Profile Image</label>
            <input type="file" onChange={handleFileChange} accept="image/*" style={{ padding: '12px' }} />
          </div>

          <div className="modal-actions" style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
            <button type="button" className="secondary-btn" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn" style={{ flex: 2, background: 'var(--accent-primary)' }} disabled={loading}>
              {loading ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
