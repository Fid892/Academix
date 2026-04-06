import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import EditProfileModal from "./EditProfileModal";
import SettingsModal from "./SettingsModal";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../NotificationDropdown";

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [groups, setGroups] = useState([]);
  const [doubts, setDoubts] = useState({ doubtsAsked: [], doubtsAnswered: [] });
  const [posts, setPosts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("asked");

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [userRes, statsRes, groupsRes, doubtsRes, postsRes, timelineRes] = await Promise.all([
        fetch("http://localhost:5000/api/profile", { credentials: "include" }),
        fetch("http://localhost:5000/api/profile/activity-summary", { credentials: "include" }),
        fetch("http://localhost:5000/api/profile/groups", { credentials: "include" }),
        fetch("http://localhost:5000/api/profile/doubts", { credentials: "include" }),
        fetch("http://localhost:5000/api/profile/posts", { credentials: "include" }),
        fetch("http://localhost:5000/api/profile/timeline", { credentials: "include" }),
      ]);

      const userData = await userRes.json();
      const statsData = await statsRes.json();
      const groupsData = await groupsRes.json();
      const doubtsData = await doubtsRes.json();
      const postsData = await postsRes.json();
      const timelineData = await timelineRes.json();

      setUser(userData);
      setStats(statsData);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setDoubts(doubtsData && doubtsData.doubtsAsked ? doubtsData : { doubtsAsked: [], doubtsAnswered: [] });
      setPosts(Array.isArray(postsData) ? postsData : []);
      setTimeline(Array.isArray(timelineData) ? timelineData : []);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen">Enhancing your profile...</div>;

  return (
    <div className="profile-container">
      <div className="back-btn-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-button" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        <NotificationDropdown />
      </div>

      <ProfileHeader user={user} openEdit={() => setShowEditModal(true)} />
      
      <ProfileStats stats={stats} />

      <div className="profile-content-grid">
        <div className="profile-left-col">
          <section className="content-section">
            <h2 className="section-h">Academic Information</h2>
            <AcademicInfo user={user} />
          </section>

          <section className="content-section">
            <h2 className="section-h">Activity Hub</h2>
            <div className="p-tabs">
              <div className={`p-tab ${activeTab === "asked" ? "active" : ""}`} onClick={() => setActiveTab("asked")}>Doubts Asked</div>
              <div className={`p-tab ${activeTab === "answered" ? "active" : ""}`} onClick={() => setActiveTab("answered")}>Doubts Answered</div>
              <div className={`p-tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>My Posts</div>
            </div>

            <div className="tab-content">
              {activeTab === "asked" && doubts?.doubtsAsked?.map(d => <ActivityCard key={d._id} item={d} type="doubt" />)}
              {activeTab === "answered" && doubts?.doubtsAnswered?.map(d => <ActivityCard key={d._id} item={d} type="reply" />)}
              {activeTab === "posts" && posts?.map(p => <ActivityCard key={p._id} item={p} type="announcement" />)}
              
              {activeTab === "asked" && doubts?.doubtsAsked?.length === 0 && <p className="empty-text">No doubts asked yet.</p>}
              {activeTab === "answered" && doubts?.doubtsAnswered?.length === 0 && <p className="empty-text">No doubts answered yet.</p>}
              {activeTab === "posts" && posts?.length === 0 && <p className="empty-text">No announcements posted yet.</p>}
            </div>
          </section>

          <section className="content-section">
            <h2 className="section-h">My Study Groups</h2>
            <div className="groups-grid-simple">
              {Array.isArray(groups) && groups.map(g => (
                <div key={g._id} className="user-activity-card" onClick={() => navigate("/study-groups")}>
                  <div className="activity-info">
                    <h4>{g.name}</h4>
                    <div className="activity-meta">
                      <span>{g.subject}</span>
                      <span>•</span>
                      <span>{g.members?.length || 0} Members</span>
                      <span>•</span>
                      <span style={{ color: 'var(--accent-primary)' }}>{g.createdBy?._id === user._id ? "Creator" : "Member"}</span>
                    </div>
                  </div>
                  <div className="arrow-icon">→</div>
                </div>
              ))}
              {(!groups || groups.length === 0) && <p className="empty-text">You haven't joined any groups yet.</p>}
            </div>
          </section>
        </div>

        <div className="profile-right-col">
          <section className="content-section">
            <h2 className="section-h">Timeline</h2>
            <div className="timeline">
              {timeline.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <p className="timeline-text">{item.text}</p>
                    <span className="timeline-date">{new Date(item.date).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && <p className="empty-text">No recent activity.</p>}
            </div>
          </section>

          <section className="content-section">
            <h2 className="section-h">Settings</h2>
            <div className="academic-card" style={{ padding: '20px' }}>
              <div className="settings-link" onClick={() => setShowSettingsModal(true)}>
                🔔 Notification Preferences
              </div>
              <div className="settings-link" onClick={() => setShowSettingsModal(true)} style={{ marginTop: '16px' }}>
                🔒 Profile Visibility
              </div>
              <div className="settings-link logout" onClick={() => window.location.href = "http://localhost:5000/api/auth/logout"} style={{ marginTop: '16px', color: '#ef4444' }}>
                👋 Sign Out
              </div>
            </div>
          </section>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal 
          user={user} 
          onClose={() => setShowEditModal(false)} 
          onUpdate={fetchProfileData} 
        />
      )}

      {showSettingsModal && (
        <SettingsModal 
          user={user} 
          onClose={() => setShowSettingsModal(false)} 
          onUpdate={fetchProfileData} 
        />
      )}
    </div>
  );
}

const ProfileHeader = ({ user, openEdit }) => {
  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase();
  const profileImgUrl = user?.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000/uploads/${user.profileImage}`) : null;

  return (
    <div className="profile-header-section">
      <div className="profile-image-container">
        {profileImgUrl ? (
          <img src={profileImgUrl} alt={user.name} className="profile-img-large" />
        ) : (
          <div className="profile-img-large">{initials}</div>
        )}
        <div className="edit-img-badge" onClick={openEdit}>✏️</div>
      </div>
      
      <div className="profile-main-info">
        <h1>{user?.name}</h1>
        <div className="profile-badges">
          <span className="p-role-badge">{user?.role}</span>
          <span className="p-dept-badge">{user?.department}</span>
          {user?.semester && <span className="p-dept-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Sem {user.semester}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <p className="profile-bio">{user?.bio || "No bio added yet. Tell us about yourself!"}</p>
          <span onClick={openEdit} style={{ cursor: 'pointer', fontSize: '1rem', opacity: 0.6 }} title="Edit Bio">✏️</span>
        </div>
        <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
          {user?.createdAt ? `Joined ${new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}` : "Member since ..."}
        </p>
      </div>

      <div className="header-actions">
        <button className="edit-profile-btn" onClick={openEdit}>Edit Profile</button>
      </div>
    </div>
  );
};

const ProfileStats = ({ stats }) => (
  <div className="stats-grid">
    <div className="stat-card">
      <span className="stat-value">{stats?.doubtsPosted || 0}</span>
      <span className="stat-label">Doubts Asked</span>
    </div>
    <div className="stat-card">
      <span className="stat-value">{stats?.doubtsSolved || 0}</span>
      <span className="stat-label">Doubts Solved</span>
    </div>
    <div className="stat-card">
      <span className="stat-value">{stats?.groupsJoined || 0}</span>
      <span className="stat-label">Groups Joined</span>
    </div>
    <div className="stat-card">
      <span className="stat-value">{stats?.postsCreated || 0}</span>
      <span className="stat-label">Group Posts</span>
    </div>
    <div className="stat-card">
      <span className="stat-value">{stats?.announcementsPosted || 0}</span>
      <span className="stat-label">Announcements</span>
    </div>
  </div>
);

const AcademicInfo = ({ user }) => (
  <div className="academic-card">
    <div className="academic-grid">
      <div className="info-item">
        <label>Department</label>
        <span>{user?.department || "N/A"}</span>
      </div>
      {user?.role === "student" ? (
        <>
          <div className="info-item">
            <label>Semester</label>
            <span>{user?.semester || "N/A"}</span>
          </div>
          <div className="info-item">
            <label>University / Scheme</label>
            <span>{user?.university || "KTU"} {user?.scheme ? `/ ${user.scheme}` : ""}</span>
          </div>
          <div className="info-item">
            <label>Register Number</label>
            <span>{user?.registerNumber || "Not Provided"}</span>
          </div>
        </>
      ) : (
        <div className="info-item">
          <label>Designation</label>
          <span>{user?.designation || "Faculty"}</span>
        </div>
      )}
      <div className="info-item">
        <label>Email ID</label>
        <span>{user?.email}</span>
      </div>
      <div className="info-item" style={{ gridColumn: 'span 2' }}>
        <label>Academic Interests</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          {user?.interests?.length > 0 ? user.interests.map((int, i) => (
            <span key={i} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
              {int}
            </span>
          )) : <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontStyle: 'italic' }}>No interests added yet.</span>}
        </div>
      </div>
    </div>
  </div>
);

const ActivityCard = ({ item, type }) => {
  const date = new Date(item.createdAt).toLocaleDateString();
  return (
    <div className="user-activity-card">
      <div className="activity-info">
        <h4>{item.title}</h4>
        <div className="activity-meta">
          <span>{item.subject || item.eventType || "General"}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
      </div>
      {type === "doubt" && (
        <span className={`status-tag ${item.status}`}>
          {item.status}
        </span>
      )}
    </div>
  );
};

export default ProfilePage;
