import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationDropdown.css";

function NotificationDropdown() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications", { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch("http://localhost:5000/api/notifications/mark-as-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notificationId: id })
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("http://localhost:5000/api/notifications/mark-as-read", {
        method: "POST",
        credentials: "include"
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
    if (n.link) navigate(n.link);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notif-wrapper">
      <button className="notif-trigger" onClick={handleToggle}>
        <span className="notif-icon">🔔</span>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && <button onClick={markAllAsRead} className="mark-all-btn">Clear All</button>}
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n._id} 
                  className={`notif-item ${n.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(n)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="notif-content">
                    <p className="notif-title">{n.title}</p>
                    <p className="notif-msg">{n.message}</p>
                    <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  {!n.isRead && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
