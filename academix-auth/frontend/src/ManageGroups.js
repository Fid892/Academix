import React, { useState, useEffect } from "react";
import "./Admin.css";

function ManageGroups() {
  const [structures, setStructures] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Modal Form State
  const [formData, setFormData] = useState({
    type: "Study Group",
    university: "KTU",
    scheme: "",
    department: "",
    semester: "",
  });

  // Local subjects list in modal
  const [subjectInput, setSubjectInput] = useState("");
  const [tempSubjects, setTempSubjects] = useState([]);

  // Inline Subject Input for Cards
  const [inlineSubjectIds, setInlineSubjectIds] = useState({}); 

  useEffect(() => {
    fetchStructures();
  }, [searchQuery]);

  const fetchStructures = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/departments?search=${searchQuery}`, {
        credentials: "include"
      });
      const data = await res.json();
      setStructures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      type: "Study Group",
      university: "KTU",
      scheme: "",
      department: "",
      semester: "",
    });
    setTempSubjects([]);
    setSubjectInput("");
    setShowModal(true);
  };

  const addTempSubject = () => {
    if (!subjectInput.trim()) return;
    setTempSubjects([...tempSubjects, subjectInput.trim()]);
    setSubjectInput("");
  };

  const removeTempSubject = (index) => {
    setTempSubjects(tempSubjects.filter((_, i) => i !== index));
  };

  const handleSaveStructure = async () => {
    if (!formData.department || !formData.semester) {
      alert("Department and Semester are required");
      return;
    }

    if (tempSubjects.length === 0) {
      alert("Please add at least one subject to the list before saving");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/departments/add-study-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          subjects: tempSubjects,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchStructures();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to save structure. Ensure you are logged in.");
      }
    } catch (err) {
      alert("Network error. Could not connect to server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddInlineSubject = async (deptId) => {
    const subject = inlineSubjectIds[deptId];
    if (!subject || !subject.trim()) {
      alert("Please enter a subject name first");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/departments/add-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ departmentId: deptId, subject: subject.trim() }),
      });

      if (res.ok) {
        setInlineSubjectIds({ ...inlineSubjectIds, [deptId]: "" });
        fetchStructures();
      } else {
        alert("Failed to add subject. Please try again.");
      }
    } catch (err) {
      console.error("Add subject failed", err);
      alert("Network error.");
    }
  };

  const handleRemoveSubject = async (deptId, subjectName) => {
    if (!window.confirm(`Remove "${subjectName}" from this group?`)) return;
    try {
      const res = await fetch("http://localhost:5000/api/departments/remove-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ departmentId: deptId, subjectName }),
      });
      if (res.ok) fetchStructures();
    } catch (err) {
      console.error("Remove subject failed", err);
    }
  };

  const handleDeleteStructure = async (id) => {
    if (!window.confirm("CRITICAL: Delete this entire academic structure and all its subject associations?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/departments/${id}`, { 
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) fetchStructures();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="admin-content" style={{ padding: 0 }}>
      {/* Header with Search */}
      <div className="admin-header-row" style={{ alignItems: 'center' }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: 0 }}>Study Group Management</h2>
        
        <div style={{ display: 'flex', gap: '16px', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <input 
              type="text" 
              className="notice-input" 
              placeholder="Search Department..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px', marginBottom: 0 }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>
          <button className="primary-btn" onClick={handleOpenModal}>
            + Add Structure
          </button>
        </div>
      </div>

      {/* Grid of structures */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px', marginTop: '32px' }}>
        {structures.map((s) => (
          <div key={s._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="status-badge student" style={{ fontSize: '0.7rem', marginBottom: '8px', display: 'inline-block' }}>
                  {s.type} - {s.university || "GENERAL"}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{s.name}</h3>
                <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.9rem' }}>
                  Scheme: {s.scheme || "N/A"} | Semester: {s.semester || "N/A"}
                </p>
              </div>
              <button 
                onClick={() => handleDeleteStructure(s._id)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}
                title="Delete Structure"
              >
                🗑️
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Subjects ({s.subjects?.length || 0})
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <tbody>
                    {(s.subjects || []).map((sub, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 0', width: '30px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 0' }}>{typeof sub === 'string' ? sub : sub.name}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleRemoveSubject(s._id, typeof sub === 'string' ? sub : sub.name)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Inline Add Subject */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <input 
                  className="notice-input" 
                  placeholder="New subject name..." 
                  style={{ fontSize: '0.85rem', padding: '10px 14px', marginBottom: 0, flex: 1 }}
                  value={inlineSubjectIds[s._id] || ""}
                  onChange={(e) => setInlineSubjectIds({ ...inlineSubjectIds, [s._id]: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInlineSubject(s._id)}
                />
                <button 
                  className="primary-btn" 
                  style={{ padding: '0 16px', fontSize: '0.8rem', height: '40px' }}
                  onClick={() => handleAddInlineSubject(s._id)}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}

        {structures.length === 0 && (
          <div className="faculty-empty" style={{ gridColumn: '1 / -1', border: '2px dashed var(--border-subtle)', background: 'rgba(255,255,255,0.01)', padding: '60px' }}>
            No structures found. Create one to begin.
          </div>
        )}
      </div>

      {/* Main Structural Modal */}
      {showModal && (
        <div className="notice-modal-overlay">
          <div className="notice-modal" style={{ maxWidth: '700px' }}>
            <div className="notice-header">
              <h2>Add Study Group Structure</h2>
              <span className="close-btn" onClick={() => setShowModal(false)}>✕</span>
            </div>

            <div className="notice-body" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-dim)' }}>TYPE</label>
                  <select 
                    className="notice-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Study Group">Study Group</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {formData.type === "Study Group" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-dim)' }}>UNIVERSITY</label>
                    <select 
                      className="notice-select"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    >
                      <option value="KTU">KTU</option>
                      <option value="Autonomous">Autonomous</option>
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-dim)' }}>SCHEME</label>
                  <input 
                    className="notice-input" 
                    placeholder="e.g. 2019" 
                    value={formData.scheme}
                    onChange={(e) => setFormData({ ...formData, scheme: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-dim)' }}>SEMESTER</label>
                  <input 
                    type="number"
                    className="notice-input" 
                    placeholder="1 - 8" 
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '20px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-dim)' }}>DEPARTMENT NAME</label>
                <input 
                  className="notice-input" 
                  placeholder="e.g. Computer Science and Engineering" 
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '1rem' }}>Subject Management</h4>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    className="notice-input" 
                    placeholder="Enter subject name..." 
                    style={{ marginBottom: 0, flex: 1 }}
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTempSubject()}
                  />
                  <button className="primary-btn" onClick={addTempSubject} style={{ height: '54px' }}>Add This</button>
                </div>

                <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '4px', border: '1px solid var(--border-subtle)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-dim)', textAlign: 'left', fontSize: '0.8rem' }}>
                        <th style={{ padding: '12px' }}>#</th>
                        <th style={{ padding: '12px' }}>Subject Name</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tempSubjects.map((s, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                          <td style={{ padding: '12px' }}>{s}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <button 
                              onClick={() => removeTempSubject(idx)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {tempSubjects.length === 0 && (
                        <tr>
                          <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                            Add subjects to see them in the list
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="notice-footer">
              <button 
                className="secondary-btn" 
                onClick={() => setShowModal(false)}
                disabled={isSaving}
                style={{ border: 'none' }}
              >
                Discard
              </button>
              <button 
                className="primary-btn" 
                onClick={handleSaveStructure}
                disabled={isSaving}
                style={{ minWidth: '170px' }}
              >
                {isSaving ? "Saving..." : "Save Structure"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageGroups;