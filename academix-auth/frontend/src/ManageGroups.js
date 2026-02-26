import React, { useState, useEffect } from "react";
import "./Admin.css";

function ManageGroups() {

  const [departments, setDepartments] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const [newDeptName, setNewDeptName] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [newSubject, setNewSubject] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await fetch("http://localhost:5000/api/departments");
    const data = await res.json();
    setDepartments(data || []);
  };

  const handleAddDepartment = async () => {
    if (!newDeptName) return;

    await fetch("http://localhost:5000/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDeptName })
    });

    setNewDeptName("");
    setShowDeptModal(false);
    fetchDepartments();
  };

  const handleAddSubject = async () => {
    if (!selectedDept || !newSubject) return;

    await fetch("http://localhost:5000/api/departments/add-subject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        departmentId: selectedDept,
        subject: newSubject
      })
    });

    setNewSubject("");
    setShowSubjectModal(false);
    fetchDepartments();
  };

  return (
    <div className="admin-content">

      <div className="admin-header-row">
        <h2>Manage Study Groups</h2>
        <button
          className="primary-btn"
          onClick={() => setShowDeptModal(true)}
        >
          Customize Department
        </button>
      </div>

      <div className="admin-card">
        {departments.length === 0 ? (
          <p>No departments created yet</p>
        ) : (
          departments.map(dep => (
            <div key={dep._id} className="department-row">
              <strong>{dep.name}</strong>
              <span>{dep.subjects?.length || 0} subjects</span>
            </div>
          ))
        )}
      </div>

      {/* Add Department Modal */}
      {showDeptModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Add Department</h3>

            <input
              placeholder="Department Name"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
            />

            <div className="modal-actions">
              <button
                className="primary-btn"
                onClick={handleAddDepartment}
              >
                Add Department
              </button>

              <button
                className="secondary-btn"
                onClick={() => setShowDeptModal(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Add Subject</h3>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">Select Department</option>
              {departments.map(dep => (
                <option key={dep._id} value={dep._id}>
                  {dep.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Subject Name"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />

            <div className="modal-actions">
              <button
                className="primary-btn"
                onClick={handleAddSubject}
              >
                Add Subject
              </button>

              <button
                className="secondary-btn"
                onClick={() => setShowSubjectModal(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      <button
        className="floating-add-btn"
        onClick={() => setShowSubjectModal(true)}
      >
        + Add New Subject
      </button>

    </div>
  );
}

export default ManageGroups;