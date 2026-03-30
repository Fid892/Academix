import React, { useState, useEffect } from "react";

function CreateGroupModal({ isOpen, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");

  const [groupType, setGroupType] = useState("Study Group");
  const [departmentId, setDepartmentId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");

  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    fetchDepartments();
  }, [isOpen]);

  useEffect(() => {
    if (departmentId && groupType === "Study Group") {
      fetchSubjects(departmentId);
    } else {
      setSubjects([]);
      setSelectedSemester("");
      setSubjectId("");
    }
  }, [departmentId, groupType]);

  useEffect(() => {
    if (subjectId) {
      checkDuplicate();
    } else {
      setDuplicateError("");
    }
  }, [subjectId, departments, subjects]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/departments/list", { credentials: "include" });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch departments error:", err);
    }
  };

  const fetchSubjects = async (deptId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/departments/${deptId}/subjects`, { credentials: "include" });
      const data = await res.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch subjects error:", err);
    }
  };

  const availableSemesters = [...new Set(subjects.map(s => s.semester))].sort((a,b) => Number(a) - Number(b));
  const filteredSubjects = selectedSemester 
    ? subjects.filter(s => String(s.semester) === String(selectedSemester))
    : subjects;

  const checkDuplicate = async () => {
    if (groupType !== "Study Group" || !departmentId || !subjectId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/study-groups/check-duplicate?departmentId=${departmentId}&subjectId=${subjectId}`);
      const data = await res.json();
      if (data.exists) {
        setDuplicateError("A group for this subject already exists.");
      } else {
        setDuplicateError("");
      }
    } catch (err) {
      console.error("Duplicate check failed", err);
    }
  };

  const handleSubmit = async () => {
    if (!groupName || !departmentId) {
      alert("Please fill required fields (Department and Group Name)");
      return;
    }

    if (groupType === "Study Group" && !subjectId) {
      alert("Please select a valid subject");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          groupType,
          departmentId,
          subjectId: groupType === "Study Group" ? subjectId : null,
          name: groupName,
          description
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Reset states
        setGroupType("Study Group");
        setDepartmentId("");
        setSelectedSemester("");
        setSubjectId("");
        setGroupName("");
        setDescription("");
        
        onCreated(data.group);
        onClose();
      } else {
        alert(data.message || "Failed to create group");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notice-modal-overlay">
      <div className="notice-modal" style={{ maxWidth: '600px', width: '90%' }}>
        <div className="notice-header">
          <h2>Create Group</h2>
          <span className="close-btn" onClick={onClose}>✕</span>
        </div>

        <div className="notice-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>GROUP TYPE</label>
              <select 
                className="notice-select" 
                value={groupType} 
                onChange={(e) => {
                   setGroupType(e.target.value);
                   setSelectedSemester("");
                   setSubjectId("");
                }}
              >
                <option value="Study Group">Study Group</option>
                <option value="Processor Discussion Group">Processor Discussion Group</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: groupType === "Study Group" ? '1fr 1fr 1fr' : '1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>DEPARTMENT</label>
                <select className="notice-select" value={departmentId} onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setSelectedSemester("");
                  setSubjectId("");
                }}>
                  <option value="" disabled>Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              
              {groupType === "Study Group" && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>SEMESTER</label>
                    <select className="notice-select" value={selectedSemester} onChange={(e) => {
                       setSelectedSemester(e.target.value);
                       setSubjectId("");
                       setDuplicateError("");
                    }} disabled={!departmentId}>
                      <option value="" disabled>Select Semester</option>
                      {availableSemesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>SUBJECT</label>
                    <select className="notice-select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!selectedSemester}>
                      <option value="" disabled>Select Subject</option>
                      {filteredSubjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                    </select>
                    {duplicateError && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: 0 }}>{duplicateError}</p>}
                  </div>
                </>
              )}
            </div>

            <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>GROUP DISPLAY NAME</label>
                  <input 
                      className="notice-input" 
                      placeholder="e.g. CSE S5 Compiler Design Prep" 
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                  />
              </div>

              <textarea 
                  className="notice-textarea" 
                  placeholder="Briefly describe the group's objective..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
          </div>

        </div>

        <div className="notice-footer">
          <button className="secondary-btn" onClick={onClose} style={{ border: 'none' }}>Cancel</button>
          <button 
            className="primary-btn" 
            onClick={handleSubmit} 
            disabled={loading || !!duplicateError}
            style={{ minWidth: '150px' }}
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
