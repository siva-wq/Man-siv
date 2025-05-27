const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://192.168.221.249:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "build")));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// In-memory data stores
const users = {};            // { userId: socketId }
const messages = [];         // all messages
const notifications = {};    // { userId: [notification] }

// Upload route
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Get all messages
app.get("/api/messages", (req, res) => {
  res.json(messages);
});

// Post a new message
app.post("/api/messages", (req, res) => {
  const message = req.body;
  messages.push(message);
  res.json(message);
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join", (userId) => {
    users[userId] = socket.id;
    io.emit("getOnlineUsers", users);          // Notify all clients
    socket.broadcast.emit("userConnected", userId);

    // Send any pending notifications
    if (notifications[userId]) {
      socket.emit("notifications", notifications[userId]);
    }
  });

  socket.on("sendMessage", (data) => {
    const receiverSocket = users[data.receiver_id];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", data);
    }

    // Store notification
    if (!notifications[data.receiver_id]) {
      notifications[data.receiver_id] = [];
    }
    notifications[data.receiver_id].push({
      type: 'message',
      from: data.sender_id,
      content: data.message,
      timestamp: new Date()
    });

    messages.push(data);
    socket.emit("messageSent", { status: "sent", messageId: data.id });
  });

  socket.on("messageSeen", ({ messageId, senderId }) => {
    const senderSocket = users[senderId];
    if (senderSocket) {
      io.to(senderSocket).emit("messageSeenUpdate", {
        messageId,
        status: "seen"
      });
    }
  });

  socket.on("disconnect", () => {
    const userId = Object.keys(users).find(key => users[key] === socket.id);
    if (userId) {
      delete users[userId];
      io.emit("userDisconnected", userId);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
