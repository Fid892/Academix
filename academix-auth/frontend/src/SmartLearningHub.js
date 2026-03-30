import React, { useEffect, useState } from "react";
import "./SmartLearningHub.css";
import { useNavigate } from "react-router-dom";
import { Star, Link as LinkIcon, Play, X, Heart } from "lucide-react";

function SmartLearningHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("discover");
  const [interests, setInterests] = useState([]);
  const [department, setDepartment] = useState([]);
  const [trending, setTrending] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Check auth first
      const authRes = await fetch("http://localhost:5000/api/auth/current-user", { credentials: "include" });
      const authData = await authRes.json();
      
      if (!authRes.ok || !authData || !authData._id) {
         alert("Your session has expired or you are not logged in due to a server restart. Please log in again from the home page.");
         navigate("/");
         return;
      }

      const [intRes, deptRes, trendRes, favRes] = await Promise.all([
        fetch("http://localhost:5000/api/recommendations/interests", { credentials: "include" }),
        fetch("http://localhost:5000/api/recommendations/department", { credentials: "include" }),
        fetch("http://localhost:5000/api/recommendations/trending", { credentials: "include" }),
        fetch("http://localhost:5000/api/favorites", { credentials: "include" })
      ]);

      const intData = await intRes.json();
      const deptData = await deptRes.json();
      const trendData = await trendRes.json();
      const favData = await favRes.json();

      setInterests(Array.isArray(intData) ? intData : []);
      setDepartment(Array.isArray(deptData) ? deptData : []);
      setTrending(Array.isArray(trendData) ? trendData : []);
      setFavorites(Array.isArray(favData) ? favData : []);
    } catch (error) {
      console.error("Failed to load recommendations", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (item) => {
    const isSaved = favorites.find(f => f.link === item.link);
    
    if (isSaved) {
      // Remove
      try {
        const res = await fetch(`http://localhost:5000/api/favorites/remove/${isSaved._id}`, {
          method: "DELETE",
          credentials: "include"
        });
        if (res.ok) {
           setFavorites(favorites.filter(f => f._id !== isSaved._id));
        } else {
           const errData = await res.json();
           alert("Error removing favorite: " + (errData.error || errData.message));
        }
      } catch (err) { console.error(err); alert("Network error removing favorite"); }
    } else {
      // Add
      try {
        const res = await fetch("http://localhost:5000/api/favorites/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: item.title,
            link: item.link,
            platform: item.platform,
            icon: item.icon
          })
        });
        if (res.ok) {
           const newFav = await res.json();
           setFavorites([newFav, ...favorites]);
        } else {
           const errData = await res.json();
           alert("Error adding favorite: " + (errData.error || errData.message));
        }
      } catch (err) { console.error(err); alert("Network error adding favorite"); }
    }
  };

  const removeFavorite = async (id) => {
     try {
        const res = await fetch(`http://localhost:5000/api/favorites/remove/${id}`, {
           method: "DELETE",
           credentials: "include"
        });
        if (res.ok) {
           setFavorites(favorites.filter(f => f._id !== id));
        }
     } catch (err) { console.error(err); }
  };

  return (
    <div className="learning-hub-container">
      <div className="dashboard-bg">
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
      </div>

      <div className="student-header animate-fade-in-down">
        <div className="header-left">
          <h2>ACADEMIX <span style={{color: 'var(--accent-student)'}}> HUB</span></h2>
          <span className="sub-title" style={{ color: 'var(--accent-student)', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.1em' }}>SMART LEARNING RECOMMENDER</span>
        </div>
        <div className="header-right">
          <button className="back-button" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        </div>
      </div>

      <div className="hub-content">
        <div className="hub-intro animate-fade-in-up">
          <h1 className="hub-title">Unlock Your Potential</h1>
          <p className="hub-subtitle">Curated study materials purely based on your interactions, queries and department.</p>
        </div>

        <div className="hub-tabs animate-fade-in-up">
           <button className={`hub-tab ${activeTab === "discover" ? "active" : ""}`} onClick={() => setActiveTab("discover")}>
              Discover
           </button>
           <button className={`hub-tab ${activeTab === "favorites" ? "active" : ""}`} onClick={() => setActiveTab("favorites")} style={{ display: 'flex', alignItems: 'center' }}>
              <Star size={18} style={{marginRight: '8px'}} /> Your Favorites
           </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing your academic profile...</p>
          </div>
        ) : (
          <div className="sections-container">
            {activeTab === "discover" && (
               <>
                  <section className="hub-section">
                    <div className="section-header">
                      <h2>Based on Your Interests</h2>
                      <span className="badge-pill">Personalized</span>
                    </div>
                    <p className="section-desc">Recommended topics based on your doubts and study groups.</p>
                    {interests.length > 0 ? (
                      <div className="resource-grid">
                        {interests.map((item, idx) => (
                           <RecommendationCard key={`int-${idx}`} item={item} rank={idx} delay={0.1 * idx} favorites={favorites} onToggle={toggleFavorite} />
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">No specific interests detected yet. Join more groups!</div>
                    )}
                  </section>

                  <section className="hub-section">
                    <div className="section-header">
                      <h2 style={{ borderColor: 'var(--accent-primary)' }}>Based on Your Department</h2>
                      <span className="badge-pill dept-badge">Curriculum Aligned</span>
                    </div>
                    <p className="section-desc">Essential resources relevant to your core branch.</p>
                    {department.length > 0 ? (
                      <div className="resource-grid">
                        {department.map((item, idx) => (
                           <RecommendationCard key={`dept-${idx}`} item={item} rank={idx} delay={0.1 * idx} favorites={favorites} onToggle={toggleFavorite} />
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">Please update your department in your profile.</div>
                    )}
                  </section>

                  <section className="hub-section">
                    <div className="section-header">
                      <h2 style={{ borderColor: '#f59e0b' }}>Trending Across Campus</h2>
                      <span className="badge-pill trending-badge">Hot</span>
                    </div>
                    <p className="section-desc">What other students are finding useful today.</p>
                    <div className="resource-grid">
                      {trending.map((item, idx) => (
                         <RecommendationCard key={`trend-${idx}`} item={item} rank={idx} delay={0.1 * idx} favorites={favorites} onToggle={toggleFavorite} />
                      ))}
                    </div>
                  </section>
               </>
            )}

            {activeTab === "favorites" && (
               <section className="hub-section animate-fade-in-up">
                  <div className="section-header">
                    <h2 style={{ borderColor: '#ec4899', color: '#fff' }}>Saved For Later</h2>
                    <span className="badge-pill fav-badge">Favorites</span>
                  </div>
                  <p className="section-desc">All your bookmarked learning resources in one place.</p>
                  
                  {favorites.length > 0 ? (
                    <div className="resource-grid">
                      {favorites.map((fav, idx) => (
                         <div key={fav._id} className="resource-card fav-card animate-fade-in-up" style={{ animationDelay: `${0.1 * idx}s`, opacity: 0, animationFillMode: 'forwards' }}>
                            <div className="card-platform-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{fav.icon && fav.icon !== "🔗" ? fav.icon : <LinkIcon size={24} />}</div>
                            <div className="card-content">
                               <h3>{fav.title}</h3>
                               <span className="platform-tag">{fav.platform}</span>
                            </div>
                            <div className="fav-actions">
                               <a href={fav.link} target="_blank" rel="noopener noreferrer" className="fav-btn open-btn" style={{ display: 'flex', alignItems: 'center' }}><Play size={14} style={{marginRight: '4px'}} /> Open</a>
                               <button onClick={() => removeFavorite(fav._id)} className="fav-btn remove-btn" style={{ display: 'flex', alignItems: 'center' }}><X size={14} style={{marginRight: '4px'}} /> Remove</button>
                            </div>
                         </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">You haven't saved any resources to your favorites yet.</div>
                  )}
               </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const RecommendationCard = ({ item, rank, delay, favorites, onToggle }) => {
  const isSaved = favorites.find(f => f.link === item.link);

  const handleFavoriteClick = (e) => {
     e.stopPropagation();
     onToggle(item);
  };

  const handleCardClick = () => {
     window.open(item.link, "_blank", "noopener,noreferrer");
  };

  return (
    <div onClick={handleCardClick} className="resource-card animate-fade-in-up" style={{ animationDelay: `${0.3 + delay}s`, opacity: 0, animationFillMode: 'forwards', cursor: 'pointer' }}>
      <div className="card-platform-icon" style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon && item.icon !== "🔗" ? item.icon : <LinkIcon size={24} />}</div>
      <div className="card-content">
        <h3>{item.title}</h3>
        <span className="platform-tag">{item.platform}</span>
      </div>
      <button className={`favorite-btn ${isSaved ? "saved" : ""}`} onClick={handleFavoriteClick} title={isSaved ? "Remove from Favorites" : "Add to Favorites"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         {isSaved ? <Heart size={20} fill="#ec4899" color="#ec4899" /> : <Heart size={20} color="#9ca3af" />}
      </button>
    </div>
  );
};

export default SmartLearningHub;
