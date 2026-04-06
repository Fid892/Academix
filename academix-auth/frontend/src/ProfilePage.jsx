import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileHeader from "./ProfileHeader";
import UserPostsGrid from "./UserPostsGrid";
import AnnouncementCard from "./AnnouncementCard";
import ProfileTabs from "./ProfileTabs";
import MyDoubtsTab from "./MyDoubtsTab";
import MyGroupsTab from "./MyGroupsTab";
import ProfileCreatePostButton from "./ProfileCreatePostButton";
import AnnouncementModal from "./AnnouncementModal";

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("announcements");
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    eventType: "Workshop",
    startDate: "",
    endDate: "",
    registrationRequired: false,
    link: "",
    coverImage: null
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return;
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === "coverImage") { if (formData.coverImage) form.append("image", formData.coverImage); }
      else { form.append(key, formData[key]); }
    });
    
    await fetch("http://localhost:5000/api/announcements/student-request", { 
      method: "POST", 
      credentials: "include", 
      body: form 
    });
    
    setShowModal(false);
    setFormData({ title: "", description: "", venue: "", eventType: "Workshop", startDate: "", endDate: "", registrationRequired: false, link: "", coverImage: null });
    fetchData(); // Refresh posts
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const curRes = await fetch("http://localhost:5000/api/auth/current-user", { credentials: "include" });
      const curData = await curRes.json();
      const current = curData?.name ? curData : null;
      setCurrentUser(current);

      const idToFetch = userId || current?._id;
      if (!idToFetch) return;

      const profRes = await fetch(`http://localhost:5000/api/users/${idToFetch}`, { credentials: "include" });
      const profData = await profRes.json();
      setProfileUser(profData);

      const postsRes = await fetch(`http://localhost:5000/api/users/${idToFetch}/posts`, { credentials: "include" });
      const postsData = await postsRes.json();
      setPosts(Array.isArray(postsData) ? postsData : []);

    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#fff" }}>
        <p>Loading Profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "#fff" }}>
        <h2>User Not Found</h2>
        <button onClick={() => navigate("/dashboard")} className="secondary-btn">Back to Home</button>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === profileUser._id;

  return (
    <div className="profile-page-root animate-fade-in" style={{ 
      maxWidth: "935px", 
      margin: "0 auto", 
      padding: "40px 20px",
      minHeight: "100vh" 
    }}>
      {/* Background Glow */}
      <div className="profile-bg-glow" style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: -1 }}></div>

      <ProfileHeader 
        profileUser={profileUser} 
        currentUser={currentUser} 
        onEditClick={() => navigate("/profile/edit")}
      />

      {isOwnProfile && <ProfileCreatePostButton onClick={() => setShowModal(true)} />}

      <ProfileTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOwnProfile={isOwnProfile} 
      />

      <div className="tab-pane-content" style={{ marginTop: "40px" }}>
        {activeTab === "announcements" && (
          <>
            {posts.length > 0 ? (
              <UserPostsGrid posts={posts} onPostClick={(post) => setSelectedPost(post)} />
            ) : (
              <div style={{ textAlign: "center", padding: "60px", color: "var(--text-dim)" }}>
                No announcements posted yet
              </div>
            )}
          </>
        )}

        {isOwnProfile && activeTab === "doubts" && (
          <MyDoubtsTab userId={profileUser._id} />
        )}

        {isOwnProfile && activeTab === "groups" && (
          <MyGroupsTab userId={profileUser._id} />
        )}
      </div>

      <AnnouncementModal 
        showModal={showModal} 
        setShowModal={setShowModal} 
        formData={formData} 
        setFormData={setFormData} 
        handleChange={handleChange} 
        handleSubmit={handleSubmit} 
      />

      {/* Grid Click Detail Modal */}
      {selectedPost && (
        <div 
          onClick={() => setSelectedPost(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px", width: "100%", background: "#1a1a1a", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}
          >
             <AnnouncementCard a={selectedPost} currentUser={currentUser} />
             <div style={{ textAlign: "center", padding: "10px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <button 
                  onClick={() => setSelectedPost(null)}
                  style={{ background: "none", border: "none", color: "var(--accent-student)", cursor: "pointer", fontSize: "0.9rem" }}
                >
                  Close
                </button>
             </div>
          </div>
        </div>
      )}
      
      <style>{`
        .profile-page-root {
          padding-top: 60px;
        }
        .tab-pane-content {
          min-height: 400px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
