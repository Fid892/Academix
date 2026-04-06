import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import "./Messages.css";

const SearchBar = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Debouncing logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() === "") {
        setResults([]);
        setShowDropdown(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:5000/api/users/search?q=${searchTerm}`, {
          credentials: "include"
        });
        const data = await res.json();
        // Remove current user from results
        const filteredData = data.filter(u => u._id !== currentUser._id);
        setResults(filteredData);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentUser._id]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (userId) => {
    setShowDropdown(false);
    setSearchTerm("");
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="chat-search-container" ref={searchRef}>
      <div className="chat-search-input-wrapper">
        <Search className="chat-search-icon" size={18} />
        <input
          type="text"
          className="chat-search-input"
          placeholder="Search students or faculty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => { if (searchTerm) setShowDropdown(true); }}
        />
        {isSearching && <span className="chat-search-spinner" />}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="chat-search-dropdown">
          {results.map((r) => (
            <div key={r._id} className="chat-search-result-item" onClick={() => handleResultClick(r._id)}>
              <img 
                src={r.profileImage ? `http://localhost:5000/uploads/${r.profileImage}` : `https://ui-avatars.com/api/?name=${r.name}&background=random`} 
                alt="profile" 
                className="chat-search-result-pic" 
              />
              <div className="chat-search-result-info">
                <h4>{r.name}</h4>
                <p>{r.role.charAt(0).toUpperCase() + r.role.slice(1)} • {r.department}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {showDropdown && results.length === 0 && !isSearching && searchTerm && (
        <div className="chat-search-dropdown">
          <div className="chat-search-result-item" style={{ justifyContent: 'center', color: '#999' }}>
            No users found
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
