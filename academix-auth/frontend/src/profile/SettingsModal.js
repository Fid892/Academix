import React, { useState } from "react";

function SettingsModal({ user, onClose, onUpdate }) {
  const [settings, setSettings] = useState(user.settings || {
    notifications: { email: true, announcements: true, doubts: true },
    privacy: { showProfile: true, showActivity: true }
  });
  const [loading, setLoading] = useState(false);

  const handleToggle = (category, field) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field]
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/profile/settings/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ settings })
      });

      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        alert("Failed to update settings");
      }
    } catch (error) {
      console.error("Settings update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '500px' }}>
        <h2 style={{ marginBottom: '24px' }}>Settings</h2>

        <div className="settings-section">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--accent-primary)' }}>Notification Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ToggleItem 
              label="Email Notifications" 
              active={settings.notifications.email} 
              onToggle={() => handleToggle('notifications', 'email')} 
            />
            <ToggleItem 
              label="New Announcements" 
              active={settings.notifications.announcements} 
              onToggle={() => handleToggle('notifications', 'announcements')} 
            />
            <ToggleItem 
              label="Doubt Replies" 
              active={settings.notifications.doubts} 
              onToggle={() => handleToggle('notifications', 'doubts')} 
            />
          </div>
        </div>

        <div className="settings-section" style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--accent-primary)' }}>Privacy & Visibility</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ToggleItem 
              label="Public Profile" 
              active={settings.privacy.showProfile} 
              onToggle={() => handleToggle('privacy', 'showProfile')} 
            />
            <ToggleItem 
              label="Show Recent Activity" 
              active={settings.privacy.showActivity} 
              onToggle={() => handleToggle('privacy', 'showActivity')} 
            />
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <button className="secondary-btn" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="primary-btn" style={{ flex: 2, background: 'var(--accent-primary)' }} onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ToggleItem = ({ label, active, onToggle }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px' }}>
    <span style={{ fontWeight: '500' }}>{label}</span>
    <button 
      onClick={onToggle}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        background: active ? 'var(--accent-primary)' : '#333',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        transition: '0.3s'
      }}
    >
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: '3px',
        left: active ? '23px' : '3px',
        transition: '0.3s'
      }} />
    </button>
  </div>
);

export default SettingsModal;
