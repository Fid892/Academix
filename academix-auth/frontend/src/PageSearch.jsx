import React, { useState, useEffect } from "react";
import { Search, X, Users, CheckCircle, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";

function PageSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        searchPages();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/pages/search?q=${query}`, {
        credentials: "include",
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-container" style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div className="dashboard-bg">
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
        <BackButton />
        
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "white", marginBottom: "12px", letterSpacing: "-0.5px" }}>Search Pages</h1>
          <p style={{ color: "#888", fontSize: "1.1rem" }}>Discover clubs, departments, and societies on campus</p>
        </div>

        <div className="search-bar-wrapper" style={{ position: "relative", marginBottom: "40px" }}>
          <Search size={22} style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", color: "var(--accent-student)", pointerEvents: "none" }} />
          <input 
            type="text" 
            placeholder="Search by name or @username..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ 
              width: "100%", padding: "20px 24px 20px 64px", background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-subtle, rgba(255,255,255,0.05))", borderRadius: "18px", color: "white", fontSize: "1.1rem", outline: "none",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)", backdropFilter: "blur(10px)", transition: "all 0.3s ease"
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--accent-student)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border-subtle)"}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#666", cursor: "pointer" }}>
              <X size={20} />
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          {loading && <div style={{ textAlign: "center", color: "#888", padding: "40px" }}>Searching...</div>}
          
          {!loading && query && results.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <p style={{ color: "#666", fontSize: "1.1rem" }}>No pages found matching "{query}"</p>
            </div>
          )}

          {results.map((page, idx) => (
            <div 
              key={page._id} 
              onClick={() => navigate(`/pages/${page.username}`)}
              className="animate-fade-in-up"
              style={{ 
                animationDelay: `${idx * 0.05}s`,
                display: "flex", alignItems: "center", gap: "20px", padding: "20px",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "20px", cursor: "pointer", transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
              }}
            >
              <div style={{ 
                width: "60px", height: "60px", borderRadius: "18px", background: "linear-gradient(135deg, #333, #111)",
                overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid rgba(255,255,255,0.1)"
              }}>
                {page.profileImage ? (
                  <img src={page.profileImage.startsWith('http') ? page.profileImage : `http://localhost:5000/uploads/${page.profileImage}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Globe size={24} color="#555" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "white" }}>{page.pageName}</h3>
                  {page.isVerified && <CheckCircle size={16} fill="var(--accent-student)" color="black" />}
                </div>
                <p style={{ margin: "2px 0 6px", fontSize: "0.9rem", color: "var(--accent-student)", fontWeight: "600" }}>@{page.username}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#666", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "6px" }}>{page.category}</span>
                  <span style={{ fontSize: "0.8rem", color: "#666", display: "flex", alignItems: "center", gap: "4px" }}><Users size={14} /> {page.followersCount} followers</span>
                </div>
              </div>
              <div style={{ color: "#444" }}>
                <CheckCircle size={24} />
              </div>
            </div>
          ))}

          {!query && (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#444" }}>
              <Search size={48} style={{ marginBottom: "16px", opacity: 0.2 }} />
              <p style={{ fontSize: "1.1rem" }}>Start typing to search for official pages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageSearch;
