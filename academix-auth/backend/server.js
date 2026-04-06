const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const departmentRoutes = require("./routes/departments");

dotenv.config();
require("./config/passport");

const app = express();

/* =============================
   CORS
============================= */
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

/* =============================
   Middlewares
============================= */
app.use(express.json());

app.use(session({
  secret: "academixsecret",
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/* =============================
   MongoDB Connection
============================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));
console.log("MONGO_URI:", process.env.MONGO_URI);

/* =============================
   Static Upload Folder
============================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =============================
   Routes
============================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/management", require("./routes/adminUserRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/departments", departmentRoutes);
app.use("/api/study-groups", require("./routes/studyGroupRoutes"));
app.use("/api/doubts", require("./routes/doubtRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/faculty-messages", require("./routes/facultyMessageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/follow", require("./routes/followRoutes"));
app.use("/api", require("./routes/messageRoutes"));
app.use("/api/admin-badges", require("./routes/adminBadgeRoutes"));
app.use("/api/announcement-requests", require("./routes/announcementRequestRoutes"));
app.use("/api/conversations", require("./routes/conversationRoutes"));
app.use("/api/messages", require("./routes/dmMessageRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/pages", require("./routes/pageRoutes"));

/* =============================
   Socket.IO Connection
============================= */
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = {};

io.on("connection", (socket) => {
  // When connect
  console.log("a user connected.");
  
  socket.on("addUser", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(onlineUsers));
  });

  socket.on("sendMessage", ({ senderId, receiverId, text, image, messageType, _id, createdAt, fileUrl, fileName }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", {
        _id,
        senderId,
        receiverId,
        text,
        image,
        messageType,
        fileUrl,
        fileName,
        createdAt,
        isSeen: false,
        status: "delivered"
      });
    }
  });

  socket.on("messageDelivered", ({ messageId, senderId }) => {
    const senderSocket = onlineUsers[senderId];
    if (senderSocket) {
       io.to(senderSocket).emit("messageStatusUpdate", {
          messageId,
          status: "delivered"
       });
    }
  });

  socket.on("messagesSeen", ({ conversationId, senderId }) => {
    const senderSocket = onlineUsers[senderId];
    if (senderSocket) {
       io.to(senderSocket).emit("messagesSeenUpdate", {
          conversationId,
          status: "seen"
       });
    }
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", senderId);
    }
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("stopTyping", senderId);
    }
  });

  socket.on("messageUpdated", ({ receiverId, updatedMessage }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("messageUpdated", updatedMessage);
    }
  });

  socket.on("messageDeleted", ({ receiverId, messageId }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("messageDeleted", messageId);
    }
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(onlineUsers));
  });
});

/* =============================
   Jobs
============================= */
const startAnnouncementExpiryJob = require("./jobs/announcementExpiryJob");
startAnnouncementExpiryJob();

/* =============================
   Start Server
============================= */
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
