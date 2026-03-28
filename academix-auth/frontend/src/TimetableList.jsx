import React from 'react';
import TimetableCard from './TimetableCard';

const TimetableList = ({ timetables, onCreateNew, onOpen, onDelete }) => {
  return (
    <div className="sp-dashboard fade-in">
      <div className="sp-dash-header" style={{ marginBottom: '20px' }}>
        <h2>Saved Timetables</h2>
        <button className="sp-primary-btn" onClick={onCreateNew}>+ Create New Timetable</button>
      </div>
      
      {timetables.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          <p style={{ color: '#aaa', fontSize: '1.1rem' }}>No saved timetables yet.</p>
          <p style={{ color: '#666' }}>Click on Create New Timetable to generate your study plan.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {timetables.map(t => (
            <TimetableCard key={t._id} timetable={t} onOpen={onOpen} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TimetableList;
