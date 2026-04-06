import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import TypingIndicator from "./TypingIndicator";
import MessageContextMenu from "./MessageContextMenu";
import { useSocket } from "./SocketProvider";

const ChatWindow = ({ conversationId, user, onUpdateLastMessage }) => {
  const [messages, setMessages] = useState([]);
  const [friend, setFriend] = useState(null);
  const [isMutual, setIsMutual] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, message: null });
  const [editingMessageId, setEditingMessageId] = useState(null);
  const scrollRef = useRef();
  const navigate = useNavigate();
  const { socket, onlineUsers } = useSocket();
  const isOnline = friend ? onlineUsers.includes(friend._id) : false;

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const convoRes = await fetch(`http://localhost:5000/api/conversations/${user._id}`, {credentials: "include"});
        const csData = await convoRes.json();
        const convo = csData.find(c => c._id === conversationId);
        
        if (convo) {
          const f = convo.participants.find(p => p._id !== user._id);
          setFriend(f);

          const mutualRes = await fetch(`http://localhost:5000/api/follow/check-mutual/${f._id}`, {credentials: "include"});
          const mutualData = await mutualRes.json();
          setIsMutual(mutualData.canMessage);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchChatDetails();
  }, [conversationId, user]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${conversationId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setMessages(data);

          // Mark unseen as seen
          if (friend && socket) {
            const unseenIds = data
              .filter((m) => m.senderId !== user._id && m.status !== "seen")
              .map((m) => m._id);

            if (unseenIds.length > 0) {
               await fetch(`http://localhost:5000/api/messages/seen-conversation/${conversationId}`, {
                 method: "PUT",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ userId: user._id }),
                 credentials: "include"
               });
               socket.emit("messagesSeen", { conversationId, senderId: friend._id });
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      if (conversationId && friend) fetchMessages();
  }, [conversationId, friend, user, socket]);

  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = (data) => {
       if (data.conversationId === conversationId || data.senderId === friend?._id) {
          setMessages((prev) => [...prev, data]);
          onUpdateLastMessage(conversationId, data.text);
          // Mark as seen immediately if we are actively viewing
          socket.emit("messagesSeen", { conversationId, senderId: data.senderId });
       }
    };

    const handleMessageStatusUpdate = ({ messageId, status }) => {
       setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status } : m));
    };

    const handleMessagesSeenUpdate = ({ conversationId: seenConvoId, status }) => {
       if (seenConvoId === conversationId) {
          setMessages(prev => prev.map(m => ({ ...m, status })));
       }
    };

    const handleTyping = (senderId) => {
       if (friend && senderId === friend._id) setIsTyping(true);
    };

    const handleStopTyping = (senderId) => {
       if (friend && senderId === friend._id) setIsTyping(false);
    };

    const handleMessageUpdated = (updatedMessage) => {
       setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
    };

    const handleMessageDeleted = (messageId) => {
       setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true, text: "This message was deleted" } : m));
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageStatusUpdate", handleMessageStatusUpdate);
    socket.on("messagesSeenUpdate", handleMessagesSeenUpdate);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messageUpdated", handleMessageUpdated);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
       socket.off("receiveMessage", handleReceiveMessage);
       socket.off("messageStatusUpdate", handleMessageStatusUpdate);
       socket.off("messagesSeenUpdate", handleMessagesSeenUpdate);
       socket.off("typing", handleTyping);
       socket.off("stopTyping", handleStopTyping);
       socket.off("messageUpdated", handleMessageUpdated);
       socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket, conversationId, friend, onUpdateLastMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (payload) => {
    let messageToSend = {
      senderId: user._id,
      conversationId,
      receiverId: friend?._id,
    };

    if (typeof payload === "string") {
      if (!payload.trim()) return;
      messageToSend.text = payload;
      messageToSend.messageType = "text";
    } else {
      messageToSend = { ...messageToSend, ...payload };
    }

    try {
      const res = await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageToSend),
      });
      const savedMessage = await res.json();
      
      if (socket) {
        socket.emit("sendMessage", {
          _id: savedMessage._id,
          senderId: user._id,
          receiverId: friend?._id,
          text: savedMessage.text,
          messageType: savedMessage.messageType,
          fileUrl: savedMessage.fileUrl,
          fileName: savedMessage.fileName,
          createdAt: savedMessage.createdAt,
          conversationId,
        });
      }

      setMessages([...messages, savedMessage]);
      onUpdateLastMessage(conversationId, savedMessage.messageType === "text" ? savedMessage.text : `Sent a ${savedMessage.messageType}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = (isTypingStatus) => {
     if (!socket || !friend) return;
     if (isTypingStatus) {
        socket.emit("typing", { senderId: user._id, receiverId: friend._id });
     } else {
        socket.emit("stopTyping", { senderId: user._id, receiverId: friend._id });
     }
  };

  const handleEdit = () => {
     setEditingMessageId(menu.message._id);
     setMenu({ visible: false, x: 0, y: 0, message: null });
  };

  const handleCopy = () => {
     navigator.clipboard.writeText(menu.message.text);
     setMenu({ visible: false, x: 0, y: 0, message: null });
  };

  const handleDeleteForMe = async () => {
     try {
        await fetch(`http://localhost:5000/api/messages/delete-for-me/${menu.message._id}`, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ userId: user._id })
        });
        setMessages(prev => prev.filter(m => m._id !== menu.message._id));
     } catch (err) {
        console.error(err);
     }
     setMenu({ visible: false, x: 0, y: 0, message: null });
  };

  const handleUnsend = async () => {
     try {
        const res = await fetch(`http://localhost:5000/api/messages/unsend/${menu.message._id}`, {
           method: "PUT"
        });
        const updatedMessage = await res.json();
        setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
        
        if (socket) {
           socket.emit("messageDeleted", { receiverId: friend._id, messageId: updatedMessage._id });
        }
     } catch (err) {
        console.error(err);
     }
     setMenu({ visible: false, x: 0, y: 0, message: null });
  };

  const saveEdit = async (messageId, newText) => {
     try {
        const res = await fetch(`http://localhost:5000/api/messages/edit/${messageId}`, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ text: newText })
        });
        const updatedMessage = await res.json();
        setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
        
        if (socket) {
           socket.emit("messageUpdated", { receiverId: friend._id, updatedMessage });
        }
     } catch (err) {
        console.error(err);
     }
     setEditingMessageId(null);
  };

  if (!friend) return <div className="chat-main" style={{justifyContent: 'center', alignItems: 'center'}}>Loading...</div>;

  return (
    <>
      <ChatHeader friend={friend} isOnline={isOnline} isTyping={isTyping} />

      <div className="chat-messages">
        {messages.filter(m => !m.deletedFor?.includes(user._id)).map((m, i, arr) => (
          <div ref={i === arr.length - 1 ? scrollRef : null} key={m._id}>
             <MessageBubble 
               message={m} 
               isOwn={m.senderId === user._id}
               isEditing={editingMessageId === m._id}
               onSaveEdit={(newText) => saveEdit(m._id, newText)}
               onCancelEdit={() => setEditingMessageId(null)}
               onContextMenu={(e) => {
                 e.preventDefault();
                 // Adjust position to avoid clipping
                 const x = Math.min(e.clientX, window.innerWidth - 190);
                 const y = Math.min(e.clientY, window.innerHeight - 200);
                 setMenu({ visible: true, x, y, message: m });
               }}
             />
          </div>
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      <MessageContextMenu 
         menu={menu}
         onClose={() => setMenu({ visible: false, x: 0, y: 0, message: null })}
         onEdit={handleEdit}
         onCopy={handleCopy}
         onDeleteForMe={handleDeleteForMe}
         onUnsend={handleUnsend}
         isSender={menu.message?.senderId === user._id}
      />

      {isMutual ? (
        <MessageInput onSend={handleSend} onTyping={handleTyping} />
      ) : (
        <div className="chat-input-container">
           <div className="not-mutual-warning">
              Follow each other to start chatting
           </div>
        </div>
      )}
    </>
  );
};

export default ChatWindow;
