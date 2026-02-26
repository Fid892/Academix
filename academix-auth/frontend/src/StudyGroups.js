import React, { useState } from "react";
import "./Dashboard.css";

function StudyGroups() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="study-container">
      <div className="study-header">
        <button
          className="back-btn"
          onClick={() => window.history.back()}
        >
          ← Back to Dashboard
        </button>

        <h2>Study Groups</h2>

        <button
          className="create-btn"
          onClick={() => setShowModal(true)}
        >
          + Create Group
        </button>
      </div>

      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <p>No study groups yet</p>

        <button
          className="create-main-btn"
          onClick={() => setShowModal(true)}
        >
          Create First Study Group
        </button>
      </div>

      {showModal && (
        <CreateGroupModal close={() => setShowModal(false)} />
      )}
    </div>
  );
}

function CreateGroupModal({ close }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name || !subject) {
      alert("Please fill required fields");
      return;
    }

    console.log({
      name,
      subject,
      description,
    });

    close();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Create Study Group</h3>

        <input
          type="text"
          placeholder="Group Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Subject *"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={close}
          >
            Cancel
          </button>

          <button
            className="submit-btn"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudyGroups;