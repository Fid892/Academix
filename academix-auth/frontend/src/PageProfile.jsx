import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Globe, Grid, Camera, Plus, CheckCircle, ChevronLeft, MoreHorizontal, Settings, Share2, Info } from "lucide-react";
import BackButton from "./BackButton";
import PagePostUpload from "./PagePostUpload";

function PageProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchPage();
    fetchCurrentUser();
  }, [username]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/current-user", { credentials: "include" });
      const data = await res.json();
      setCurrentUser(data);
    } catch (err) { console.error("fetchCurrentUser error", err); }
  };

  const fetchPage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/pages/${username}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setPage(data);
        setIsFollowing(data.isFollowing);
        fetchPosts(data._id);
      } else {
        navigate("/dashboard");
      }
    } catch (err) { console.error("fetchPage error", err); }
    finally { setLoading(false); }
  };

  const fetchPosts = async (pageId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/pages/${pageId}/posts`, { credentials: "include" });
      const data = await res.json();
      setPosts(data);
    } catch (err) { console.error("fetchPosts error", err); }
  };

  const handleFollowToggle = async () => {
    const endpoint = isFollowing ? "unfollow" : "follow";
    try {
      const res = await fetch(`http://localhost:5000/api/pages/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: page._id }),
        credentials: "include",
      });
      if (res.ok) {
        setIsFollowing(!isFollowing);
        setPage(prev => ({ 
          ...prev, 
          followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1 
        }));
      }
    } catch (err) { console.error("Follow error", err); }
  };

  if (loading) return <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", color: "white" }}>Loading Page Profile...</div>;
  if (!page) return null;

  const isOwner = currentUser && (currentUser._id === page.ownerId._id || currentUser.role === "admin");

  return (
    <div className="student-container" style={{ minHeight: "100vh", paddingBottom: "100px" }}>
      <div className="dashboard-bg">
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
      </div>

      <div style={{ maxWidth: "935px", margin: "0 auto", position: "relative" }}>
        
        {/* Header Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", marginBottom: "30px" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <BackButton isAbsolute={false} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "white", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                 {page.username} {page.isVerified && <CheckCircle size={18} fill="var(--accent-student)" color="black" />}
              </h2>
           </div>
           <div style={{ display: "flex", gap: "15px" }}>
              {isOwner && <button onClick={() => setShowUploadModal(true)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", padding: "10px", borderRadius: "12px", cursor: "pointer" }}><Plus size={20} /></button>}
              <button style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", padding: "10px", borderRadius: "12px", cursor: "pointer" }}><Share2 size={20} /></button>
           </div>
        </div>

        {/* Profile Info Section */}
        <div style={{ display: "flex", gap: "40px", marginBottom: "44px", alignItems: "flex-start", padding: "0 20px" }}>
           <div style={{ 
              width: "150px", height: "150px", borderRadius: "50%", padding: "4px",
              background: "linear-gradient(45deg, #3b82f6, #6366f1, #3b82f6)",
              position: "relative"
           }}>
              <div style={{ 
                 width: "100%", height: "100%", borderRadius: "50%", background: "#111",
                 border: "4px solid #111", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {page.profileImage ? (
                  <img src={page.profileImage.startsWith('http') ? page.profileImage : `http://localhost:5000/uploads/${page.profileImage}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Globe size={60} color="#222" />
                )}
              </div>
           </div>

           <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
                 <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "white", margin: 0 }}>{page.pageName}</h1>
                 {!isOwner && (
                    <button 
                      onClick={handleFollowToggle}
                      style={{ 
                        padding: "8px 24px", borderRadius: "10px", fontWeight: "700", border: "none", cursor: "pointer",
                        background: isFollowing ? "rgba(255,255,255,0.1)" : "var(--accent-student)",
                        color: isFollowing ? "white" : "white",
                        fontSize: "0.95rem"
                      }}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                 )}
                 {isOwner && (
                    <button style={{ 
                      padding: "8px 16px", borderRadius: "10px", fontWeight: "600", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "8px"
                    }}>
                      <Settings size={18} /> Edit Profile
                    </button>
                 )}
              </div>

              <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
                 <span style={{ color: "white" }}><strong style={{ color: "white" }}>{posts.length}</strong> posts</span>
                 <span style={{ color: "white" }}><strong style={{ color: "white" }}>{page.followersCount}</strong> followers</span>
                 <span style={{ color: "#888", display: "flex", alignItems: "center", gap: "6px" }}><Plus size={16}/> {page.category}</span>
              </div>

              <div style={{ color: "white", lineHeight: "1.5" }}>
                 <p style={{ margin: 0, fontWeight: "600" }}>{page.pageName}</p>
                 <p style={{ margin: "4px 0", color: "#bbb", whiteSpace: "pre-wrap" }}>{page.bio}</p>
                 {page.ownerId && <p style={{ margin: "10px 0 0", fontSize: "0.85rem", color: "#666" }}>Owned by {page.ownerId.name}</p>}
              </div>
           </div>
        </div>

        {/* Action Tabs */}
        <div style={{ 
           borderTop: "1px solid rgba(255,255,255,0.1)",
           display: "flex", justifyContent: "center", gap: "60px"
        }}>
           <div style={{ 
              display: "flex", alignItems: "center", gap: "8px", padding: "12px 0",
              borderTop: "1px solid white", color: "white", fontSize: "0.75rem", fontWeight: "700",
              textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer"
           }}>
              <Grid size={16} /> Posts
           </div>
           {/* Future: Tagged Posts */}
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div style={{ 
             display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px", marginTop: "24px", padding: "0 4px"
          }}>
             {posts.map((post, idx) => (
                <div 
                  key={post._id} 
                  className="animate-fade-in-up"
                  style={{ 
                    aspectRatio: "1/1", background: "rgba(255,255,255,0.03)", borderRadius: "12px", overflow: "hidden",
                    position: "relative", cursor: "pointer", animationDelay: `${idx * 0.05}s`
                  }}
                  onMouseEnter={(e) => {
                     const overlay = e.currentTarget.querySelector('.post-overlay');
                     overlay.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                     const overlay = e.currentTarget.querySelector('.post-overlay');
                     overlay.style.opacity = '0';
                  }}
                >
                   <img src={post.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                   
                   <div className="post-overlay" style={{ 
                      position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex",
                      alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s"
                   }}>
                      <div style={{ padding: "16px", color: "white", textAlign: "center", fontSize: "0.85rem" }}>
                         <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{post.caption}</p>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "100px 0", color: "#444" }}>
             <Camera size={64} style={{ marginBottom: "20px", opacity: 0.2 }} />
             <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#444" }}>No posts yet</h2>
             {isOwner && <p style={{ color: "#333" }}>Start sharing your story with the community</p>}
          </div>
        )}

      </div>

      <PagePostUpload 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        pageId={page._id}
        onUploadSuccess={() => fetchPosts(page._id)}
      />
    </div>
  );
}

export default PageProfile;
