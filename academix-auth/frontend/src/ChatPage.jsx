import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import SearchBar from "./SearchBar";
import ChatInitializer from "./ChatInitializer";
import { MessageCircle } from "lucide-react";
import { SocketProvider } from "./SocketProvider";
import "./Messages.css";

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [user, setUser] = useState(null);
  const [arrivalMessage, setArrivalMessage] = useState(null);

  useEffect(() => {
    const fetchUserAndDetails = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/current-user", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.name) {
          setUser(data);
          fetchConversations(data._id);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    fetchUserAndDetails();
  }, [navigate]);

  const fetchConversations = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/conversations/${userId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setConversations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const updateConversationLastMessage = (convoId, text) => {
    setConversations(prev => prev.map(c => {
      if (c._id === convoId) {
        return { ...c, lastMessage: text, updatedAt: new Date().toISOString() };
      }
      return c;
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
  };

  if (!user) return <div className="chat-layout" style={{justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem'}}>Loading... Chat Page Loaded</div>;

  return (
    <SocketProvider user={user}>
      <div className="chat-layout">
        <div className={`chat-sidebar ${conversationId ? 'hidden' : ''}`}>
          <div className="chat-sidebar-header">
             <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginRight: '12px' }}>
                &larr;
             </button>
             <h2 style={{ fontSize: '1.2rem'}}>{user.name}</h2>
          </div>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #202c33', backgroundColor: '#111b21' }}>
             <SearchBar currentUser={user} />
          </div>
          <ChatList 
             conversations={conversations} 
             user={user} 
             conversationId={conversationId} 
             onSelect={(id) => navigate(`/chat/${id}`)} 
          />
        </div>

        <div className="chat-main">
          {conversationId ? (
            isLoadingConversations ? (
               <div className="chat-main" style={{justifyContent: 'center', alignItems: 'center'}}>Loading...</div>
            ) : !conversations.find(c => c._id === conversationId) ? (
              <ChatInitializer 
                 targetId={conversationId} 
                 currentUser={user} 
                 onSuccess={(convoId) => {
                    fetchConversations(user._id).then(() => {
                       navigate(`/chat/${convoId}`, { replace: true });
                    });
                 }}
              />
            ) : (
              <ChatWindow 
                conversationId={conversationId} 
                user={user} 
                onUpdateLastMessage={updateConversationLastMessage}
              />
            )
          ) : (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">
                <MessageCircle size={40} />
              </div>
              <h2>Your Messages</h2>
              <p>Send private photos and messages to a friend or group.</p>
            </div>
          )}
        </div>
      </div>
    </SocketProvider>
  );
};

export default ChatPage;
