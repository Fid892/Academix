import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProfileHeader from "./ProfileHeader";
import UserPostsGrid from "./UserPostsGrid";
import AnnouncementCard from "./AnnouncementCard";
import ProfileTabs from "./ProfileTabs";
import MyDoubtsTab from "./MyDoubtsTab";
import MyGroupsTab from "./MyGroupsTab";
import ProfileCreatePostButton from "./ProfileCreatePostButton";
import AnnouncementModal from "./AnnouncementModal";
import ActivitySection from "./ActivitySection";
import BackButton from "./BackButton";
import "./profile/ProfilePage.css";

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("announcements");
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Extra data for ActivitySection
  const [lastDoubt, setLastDoubt] = useState(null);
  
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

      const [profRes, postsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/users/${idToFetch}`, { credentials: "include" }),
        fetch(`http://localhost:5000/api/users/${idToFetch}/posts`, { credentials: "include" })
      ]);

      const profData = await profRes.json();
      setProfileUser(profData);

      const postsData = await postsRes.json();
      const sortedPosts = Array.isArray(postsData) ? postsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
      setPosts(sortedPosts);

      // Only fetch private data (doubts) if it's the own profile
      if (current && current._id === idToFetch) {
        try {
          const doubtsRes = await fetch(`http://localhost:5000/api/doubts/user/${idToFetch}`, { credentials: "include" });
          const doubtsData = await doubtsRes.json();
          if (Array.isArray(doubtsData) && doubtsData.length > 0) {
            setLastDoubt(doubtsData[0]);
          }
        } catch (err) {
          console.warn("Could not fetch doubts:", err);
        }
      }

    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0a0c" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-student)", borderRadius: "50%" }}
        />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", color: "#fff" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>User Not Found</h2>
        <button onClick={() => navigate("/dashboard")} className="glass-btn primary-btn" style={{ padding: "12px 30px" }}>Back to Dashboard</button>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === profileUser._id;

  return (
    <div className="profile-page-root">
      {/* Background Enhancements */}
      <div className="profile-grid-bg"></div>
      <div className="profile-glow-orb" style={{ top: "-10%", left: "20%" }}></div>
      <div className="profile-glow-orb" style={{ bottom: "10%", right: "10%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)" }}></div>
      
      {/* Back Button Integration */}
      <BackButton role={currentUser?.role} />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px 80px" }}>
        <ProfileHeader 
          profileUser={profileUser} 
          currentUser={currentUser} 
          onEditClick={() => navigate("/profile/edit")}
        />

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
        >
          <ActivitySection 
            profileUser={profileUser}
            recentPost={posts[0]}
            lastDoubt={lastDoubt}
            groupsJoined={Number(profileUser.groupsJoinedCount) || 0}
          />

          {isOwnProfile && <ProfileCreatePostButton onClick={() => setShowModal(true)} />}

          <ProfileTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOwnProfile={isOwnProfile} 
          />

          <div className="tab-pane-content" style={{ marginTop: "48px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "announcements" && (
                  <UserPostsGrid posts={posts} onPostClick={(post) => setSelectedPost(post)} />
                )}

                {isOwnProfile && activeTab === "doubts" && (
                  <MyDoubtsTab userId={profileUser._id} />
                )}

                {isOwnProfile && activeTab === "groups" && (
                  <MyGroupsTab userId={profileUser._id} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
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
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(10px)" }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "800px", width: "100%", background: "#141417", borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 60px rgba(0,0,0,0.8)" }}
            >
               <div style={{ maxH: "80vh", overflowY: "auto" }}>
                 <AnnouncementCard a={selectedPost} currentUser={currentUser} />
               </div>
               <div style={{ textAlign: "center", padding: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "#0f0f12" }}>
                  <button 
                    onClick={() => setSelectedPost(null)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: "1rem", padding: "10px 32px", borderRadius: "12px", fontWeight: "600" }}
                  >
                    Close Preview
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
