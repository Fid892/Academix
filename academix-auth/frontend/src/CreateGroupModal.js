import React, { useState, useEffect } from "react";

function CreateGroupModal({ isOpen, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");

  // Step state
  const [groupType, setGroupType] = useState("Study Group");
  const [universityType, setUniversityType] = useState("");
  const [scheme, setScheme] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");

  // Options state
  const [universities, setUniversities] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Fetch options sequentially
  useEffect(() => {
    if (!isOpen) return;
    fetchUniversities();
  }, [isOpen]);

  useEffect(() => {
    if (universityType) fetchSchemes();
    else {
        setSchemes([]);
        // For Processor Discussion Groups, we might want to fetch all departments if no university is selected
        if (groupType === "Processor Discussion Group") fetchAllDepartments();
    }
    setScheme("");
  }, [universityType, groupType]);

  const fetchAllDepartments = async () => {
    try {
        const res = await fetch(`http://localhost:5000/api/departments/list`);
        if (!res.ok) throw new Error("Failed to fetch departments");
        const data = await res.json();
        setDepartments(data);
    } catch (err) {
        console.error("Fetch departments error:", err);
    }
  };

  useEffect(() => {
    if (scheme) fetchDepartments();
    else setDepartments([]);
    setDepartment("");
  }, [scheme]);

  useEffect(() => {
    if (department) fetchSemesters();
    else setSemesters([]);
    setSemester("");
  }, [department]);

  useEffect(() => {
    if (semester) fetchSubjects();
    else setSubjects([]);
    setSubject("");
  }, [semester]);

  // Check for duplicates in real-time
  useEffect(() => {
    if (groupType === "Study Group" && universityType && scheme && department && semester && subject) {
        checkDuplicate();
    } else {
        setDuplicateError("");
    }
  }, [subject]);

  const fetchUniversities = async () => {
    try {
        const res = await fetch(`http://localhost:5000/api/departments/universities?type=${groupType}`);
        if (!res.ok) throw new Error("Failed to fetch universities");
        const data = await res.json();
        setUniversities(data);
    } catch (err) {
        console.error("Fetch universities error:", err);
    }
  };

  const fetchSchemes = async () => {
    try {
        const res = await fetch(`http://localhost:5000/api/departments/schemes?type=${groupType}&university=${universityType}`);
        if (!res.ok) throw new Error("Failed to fetch schemes");
        const data = await res.json();
        setSchemes(data);
    } catch (err) {
        console.error("Fetch schemes error:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
        const res = await fetch(`http://localhost:5000/api/departments/list?type=${groupType}&university=${universityType}&scheme=${scheme}`);
        if (!res.ok) throw new Error("Failed to fetch departments list");
        const data = await res.json();
        setDepartments(data);
    } catch (err) {
        console.error("Fetch departments list error:", err);
    }
  };

  const fetchSemesters = async () => {
    try {
        const res = await fetch(`http://localhost:5000/api/departments/semesters?type=${groupType}&university=${universityType}&scheme=${scheme}&department=${department}`);
        if (!res.ok) throw new Error("Failed to fetch semesters");
        const data = await res.json();
        setSemesters(data);
    } catch (err) {
        console.error("Fetch semesters error:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
        const res = await fetch(`http://localhost:5000/api/departments/subjects-list?type=${groupType}&university=${universityType}&scheme=${scheme}&department=${department}&semester=${semester}`);
        if (!res.ok) throw new Error("Failed to fetch subjects");
        const data = await res.json();
        setSubjects(data);
    } catch (err) {
        console.error("Fetch subjects error:", err);
    }
  };

  const checkDuplicate = async () => {
    if (groupType !== "Study Group") return;
    try {
        const res = await fetch(`http://localhost:5000/api/study-groups/check-duplicate?universityType=${universityType}&scheme=${scheme}&department=${department}&semester=${semester}&subject=${encodeURIComponent(subject)}`);
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
    if (!groupName || !department) {
        alert("Please fill required fields (Department and Group Name)");
        return;
    }

    if (groupType === "Study Group" && (!universityType || !scheme || !semester || !subject)) {
        alert("Please complete the academic structure selection");
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
          universityType,
          scheme,
          department,
          semester,
          subject: groupType === "Study Group" ? subject : `${department} Discussion`,
          name: groupName,
          description
        })
      });

      if (res.ok) {
        onCreated();
        onClose();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create group");
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
          <h2>Add Study Group</h2>
          <span className="close-btn" onClick={onClose}>✕</span>
        </div>

        <div className="notice-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>GROUP TYPE</label>
            <select 
              className="notice-select" 
              value={groupType} 
              onChange={(e) => setGroupType(e.target.value)}
            >
              <option value="Study Group">Study Group</option>
              <option value="Processor Discussion Group">Processor Discussion Group</option>
            </select>
          </div>

          {groupType === "Processor Discussion Group" ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>DEPARTMENT</label>
              <select className="notice-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="">Select Department</option>
                {/* Fallback to simple list if structures are empty */}
                {departments.length > 0 ? departments.map(d => <option key={d} value={d}>{d}</option>) : 
                 universities.length === 0 && <option value="CSE">CSE</option>}
              </select>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>UNIVERSITY</label>
                        <select className="notice-select" value={universityType} onChange={(e) => setUniversityType(e.target.value)}>
                            <option value="">Select University</option>
                            {universities.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>SCHEME</label>
                        <select className="notice-select" value={scheme} onChange={(e) => setScheme(e.target.value)} disabled={!universityType}>
                            <option value="">Select Scheme</option>
                            {schemes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>DEPARTMENT</label>
                        <select className="notice-select" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={!scheme}>
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>SEMESTER</label>
                        <select className="notice-select" value={semester} onChange={(e) => setSemester(e.target.value)} disabled={!department}>
                            <option value="">Select Semester</option>
                            {semesters.map(s => <option key={s} value={s}>S{s}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)' }}>SUBJECT</label>
                    <select className="notice-select" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!semester}>
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {duplicateError && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: 0 }}>{duplicateError}</p>}
                </div>

            </div>
          )}

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
