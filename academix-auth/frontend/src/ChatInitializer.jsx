import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChatInitializer = ({ targetId, currentUser, onSuccess }) => {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const initializeChat = async () => {
      try {
        // Step 1: Check if conversation exists
        const checkRes = await fetch(`http://localhost:5000/api/chat/conversation/${targetId}`, {
          credentials: "include"
        });
        
        if (checkRes.ok) {
           const convo = await checkRes.json();
           if (isMounted) onSuccess(convo._id);
           return;
        }

        // Step 2: If not exists -> create new conversation
        const createRes = await fetch("http://localhost:5000/api/chat/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            senderId: currentUser._id,
            receiverId: targetId
          })
        });

        if (createRes.ok) {
           const newConvo = await createRes.json();
           if (isMounted) onSuccess(newConvo._id);
        } else {
           // Fallback if targetId is actually an invalid conversation id
           console.error("Failed to create conversation");
           if (isMounted) navigate("/chat", { replace: true });
        }
      } catch (err) {
        console.error("Error initializing chat", err);
        if (isMounted) navigate("/chat", { replace: true });
      }
    };
    
    if (targetId && currentUser) {
       initializeChat();
    }

    return () => { isMounted = false; };
  }, [targetId, currentUser, navigate]);

  return (
    <div className="chat-main" style={{ justifyContent: 'center', alignItems: 'center' }}>
       <div className="chat-empty-state">
          <div className="chat-search-spinner" style={{ width: '40px', height: '40px', marginBottom: '16px' }}></div>
          <p>Opening chat...</p>
       </div>
    </div>
  );
};

export default ChatInitializer;
