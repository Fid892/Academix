import React from 'react';
import { Calendar, Trash2, ExternalLink } from 'lucide-react';
import './StudyPlanner.css';

const TimetableCard = ({ timetable, onOpen, onDelete }) => {
  const formattedDate = new Date(timetable.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="sp-card card-animate timetable-card" style={{ marginBottom: '15px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar className="icon-small" size={18} /> {timetable.planName}
          </h3>
          <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#aaa' }}>{timetable.description}</p>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#666', background: '#1a1a2e', padding: '4px 8px', borderRadius: '4px' }}>
          {formattedDate}
        </span>
      </div>
      
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button className="sp-primary-btn" onClick={() => onOpen(timetable)} style={{ flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center' }}>
          <ExternalLink className="icon-small" size={16} /> Open Plan
        </button>
        <button className="sp-danger-btn" onClick={() => onDelete(timetable._id)} style={{ padding: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center' }}>
          <Trash2 className="icon-small" size={16} /> Delete
        </button>
      </div>
    </div>
  );
};

export default TimetableCard;
