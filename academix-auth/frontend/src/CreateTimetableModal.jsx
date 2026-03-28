import React, { useState } from 'react';
import './StudyPlanner.css';

const CreateTimetableModal = ({ onClose, onGenerate }) => {
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');

  const handleGenerate = () => {
    if (!planName.trim()) {
      alert('Plan Name is required');
      return;
    }
    onGenerate({ planName, description });
  };

  return (
    <div className="sp-timer-overlay" style={{ zIndex: 1000 }}>
      <div className="sp-timer-card card-animate" style={{ minWidth: '350px', textAlign: 'left', padding: '30px', animation: 'slideIn 0.3s ease-out' }}>
        <h2 style={{ marginTop: '0', marginBottom: '20px', color: '#e0e0e0', fontSize: '1.5rem', textAlign: 'center' }}>Create New Timetable</h2>
        
        <div className="sp-input-group">
          <label>Plan Name <span style={{color: 'red'}}>*</span></label>
          <input 
            type="text" 
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g. Compiler Design Prep"
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div className="sp-input-group">
          <label>Description (Optional)</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 7-day intense prep before midterms..."
            rows={3}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
          <button className="sp-primary-btn" onClick={handleGenerate} style={{ flex: 1 }}>
            Next Step
          </button>
          <button className="sp-secondary-btn" onClick={onClose} style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid #4ade80', color: '#4ade80' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTimetableModal;
