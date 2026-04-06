import React, { useState, useEffect } from "react";
import UserListItem from "./UserListItem";
import { X, Search } from "lucide-react";

const ShareModal = ({ announcement, currentUser, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [recentChats, setRecentChats] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/conversations/${currentUser._id}`, { credentials: "include" });
        const data = await res.json();
        const users = data.map(convo => convo.participants.find(p => p._id !== currentUser._id)).filter(Boolean);
        setRecentChats(users);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecentChats();
  }, [currentUser._id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await fetch(`http://localhost:5000/api/users/search?q=${encodeURIComponent(searchTerm)}`);
          const data = await res.json();
          // Filter out currentUser
          setSearchResults(data.filter(u => u._id !== currentUser._id));
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentUser._id]);

  const handleSend = async (targetUserId) => {
    try {
      // Step 1: Ensure conversation exists (ChatInitializer basically calls the exact POST route, but we can do it directly)
      const convoRes = await fetch("http://localhost:5000/api/chat/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: currentUser._id, receiverId: targetUserId }),
        credentials: "include"
      });
      const convoData = await convoRes.json();
      const conversationId = convoData._id;

      // Step 2: Send Message
      const messageToSend = {
        conversationId,
        senderId: currentUser._id,
        receiverId: targetUserId,
        messageType: "announcement",
        announcementId: announcement._id,
        text: "Shared an announcement"
      };

      await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageToSend),
      });

      // Emitting via socket would ideally happen here, but since sender is making the action,
      // and they are not necessarily on the chat page, we just rely on DB update.
      // Next time they open the chat page, it's there. 

    } catch (err) {
      console.error(err);
    }
  };

  const displayUsers = searchTerm.trim().length > 0 ? searchResults : recentChats;

  return (
    <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="share-modal" style={{ background: "#111", width: "90%", maxWidth: "450px", borderRadius: "16px", display: "flex", flexDirection: "column", maxHeight: "80vh", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
        
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, color: "#fff", fontSize: "1.2rem" }}>Share</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", background: "#262626", borderRadius: "8px", padding: "10px 14px" }}>
             <Search size={18} color="#8e8e8e" style={{ marginRight: "10px" }} />
             <input 
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: "#fff", width: "100%", fontSize: "0.95rem" }}
             />
          </div>
        </div>

        {/* User List */}
        <div className="user-list" style={{ flex: 1, overflowY: "auto", padding: "0 10px 20px 20px" }}>
           {isSearching ? (
             <div style={{ textAlign: "center", padding: "20px", color: "var(--text-dim)" }}>Searching...</div>
           ) : displayUsers.length > 0 ? (
             displayUsers.map(user => {
               // If there's NO search term, we are rendering recentChats, so hasChatted is inherently true.
               // If there IS a search term, we must dynamically check if hasChatted by looking inside recentChats state.
               const hasChatted = recentChats.some(rc => rc._id === user._id);
               return (
                 <UserListItem 
                   key={user._id} 
                   targetUser={user} 
                   currentUser={currentUser} 
                   hasChatted={hasChatted} 
                   onSend={handleSend} 
                 />
               );
             })
           ) : (
             <div style={{ textAlign: "center", padding: "20px", color: "var(--text-dim)" }}>
               {searchTerm ? "No users found." : "No recent chats."}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default ShareModal;
