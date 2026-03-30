import React, { useState, useEffect } from "react";
import "./Admin.css";

function ManageGroups() {
  const [departments, setDepartments] = useState([]);
  const [view, setView] = useState("grid"); // 'grid' | 'detail'
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  
  // Modal states
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Forms
  const [deptForm, setDeptForm] = useState({ name: "" });
  const [subjectForm, setSubjectForm] = useState({
    departmentId: "",
    subjectName: "",
    subjectCode: "",
    semester: "1"
  });

  // Department detail state
  const [departmentSubjects, setDepartmentSubjects] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/departments/list", { credentials: "include" });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
      if (view === "detail" && selectedDepartment) {
        const updated = data.find(d => d._id === selectedDepartment._id);
        if (updated) setSelectedDepartment(updated);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const handleAddDepartment = async () => {
    if (!deptForm.name.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/departments/add-department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: deptForm.name }),
      });
      if (res.ok) {
        setShowDeptModal(false);
        setDeptForm({ name: "" });
        fetchDepartments();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to add department");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubject = async () => {
    const { departmentId, subjectName, subjectCode, semester } = subjectForm;
    if (!departmentId || !subjectName || !subjectCode || !semester) {
      alert("All fields are required");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/departments/add-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ departmentId, subjectName, subjectCode, semester }),
      });
      if (res.ok) {
        setShowSubjectModal(false);
        setSubjectForm({ departmentId: "", subjectName: "", subjectCode: "", semester: "1" });
        if (view === "detail" && selectedDepartment?._id === departmentId) {
          fetchDepartmentSubjects(departmentId);
        }
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to add subject. It might be a duplicate.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setIsSaving(false);
    }
  };

  const openDepartmentDetail = (dept) => {
    setSelectedDepartment(dept);
    setView("detail");
    fetchDepartmentSubjects(dept._id);
  };

  const fetchDepartmentSubjects = async (deptId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/departments/${deptId}/subjects`, { credentials: "include" });
      const data = await res.json();
      setDepartmentSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // Ensure we always array 1 to 8 for Semesters
  const semestersArray = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="admin-content" style={{ padding: 0 }}>
      {/* Header */}
      <div className="admin-header-row" style={{ alignItems: 'center' }}>
        {view === "grid" ? (
          <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: 0 }}>Group Management</h2>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="secondary-btn" onClick={() => setView("grid")} style={{ border: 'none', padding: '8px 16px' }}>
              ← Back
            </button>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>{selectedDepartment?.name}</h2>
          </div>
        )}
        
        {view === "grid" && (
          <div style={{ display: 'flex', gap: '16px', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
            <button className="primary-btn" onClick={() => setShowDeptModal(true)}>
              Add Department
            </button>
          </div>
        )}
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
          {departments.map((dept) => (
            <div key={dept._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => openDepartmentDetail(dept)}>
              <div>
                <span className="status-badge student" style={{ fontSize: '0.7rem', marginBottom: '8px', display: 'inline-block' }}>
                  DEPARTMENT
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{dept.name}</h3>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', marginTop: 'auto', textAlign: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>
                  Click to View Subjects →
                </span>
              </div>
            </div>
          ))}

          {departments.length === 0 && (
            <div className="faculty-empty" style={{ gridColumn: '1 / -1', border: '2px dashed var(--border-subtle)', background: 'rgba(255,255,255,0.01)', padding: '60px' }}>
              No departments found. Add a department to begin.
            </div>
          )}
        </div>
      )}

      {/* Detail View */}
      {view === "detail" && (
        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {semestersArray.map(sem => {
            const subjectsForSem = departmentSubjects.filter(s => s.semester === sem);
            return (
              <div key={sem} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '1.2rem' }}>
                    Semester {sem}
                  </h3>
                  <button 
                    className="primary-btn" 
                    style={{ background: 'var(--accent-faculty)', padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => {
                       setSubjectForm({
                         departmentId: selectedDepartment._id,
                         subjectName: "",
                         subjectCode: "",
                         semester: sem.toString()
                       });
                       setShowSubjectModal(true);
                    }}
                  >
                    + Add Subject
                  </button>
                </div>
                
                {subjectsForSem.length === 0 ? (
                  <div style={{ padding: '20px', color: 'var(--text-dim)', fontStyle: 'italic', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                    No subjects added for Semester {sem} yet.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
                        <th style={{ padding: '12px 24px', width: '60%' }}>Subject Name</th>
                        <th style={{ padding: '12px 24px' }}>Subject Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectsForSem.map((sub, index) => (
                        <tr key={sub._id} style={{ borderBottom: index !== subjectsForSem.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                          <td style={{ padding: '16px 24px', fontWeight: '500' }}>{sub.subjectName}</td>
                          <td style={{ padding: '16px 24px', color: 'var(--text-dim)' }}>{sub.subjectCode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Department Modal */}
      {showDeptModal && (
        <div className="notice-modal-overlay">
          <div className="notice-modal" style={{ maxWidth: '500px' }}>
            <div className="notice-header">
              <h2>Add Department</h2>
              <span className="close-btn" onClick={() => setShowDeptModal(false)}>✕</span>
            </div>
            <div className="notice-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>DEPARTMENT NAME</label>
                <input 
                  className="notice-input"
                  placeholder="Type department name (e.g. Mechanical Engineering)"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ name: e.target.value })}
                  autoFocus
                />
              </div>
            </div>
            <div className="notice-footer">
              <button className="secondary-btn" onClick={() => setShowDeptModal(false)} disabled={isSaving} style={{ border: 'none' }}>Cancel</button>
              <button className="primary-btn" onClick={handleAddDepartment} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Department"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="notice-modal-overlay">
          <div className="notice-modal" style={{ maxWidth: '600px' }}>
            <div className="notice-header">
              <h2>Add Subject to Semester {subjectForm.semester}</h2>
              <span className="close-btn" onClick={() => setShowSubjectModal(false)}>✕</span>
            </div>
            <div className="notice-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>SUBJECT NAME</label>
                  <input 
                    className="notice-input"
                    placeholder="e.g. Data Structures"
                    value={subjectForm.subjectName}
                    onChange={(e) => setSubjectForm({ ...subjectForm, subjectName: e.target.value })}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>SUBJECT CODE</label>
                  <input 
                    className="notice-input"
                    placeholder="e.g. CS201"
                    value={subjectForm.subjectCode}
                    onChange={(e) => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })}
                  />
                </div>

              </div>
            </div>
            <div className="notice-footer">
              <button className="secondary-btn" onClick={() => setShowSubjectModal(false)} disabled={isSaving} style={{ border: 'none' }}>Cancel</button>
              <button className="primary-btn" onClick={handleAddSubject} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Subject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageGroups;