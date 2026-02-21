require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS for frontend
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to models/controllers via app.locals
app.locals.io = io;

// Also expose globally for Mongoose hooks (which don't have access to req)
global._io = io;

app.use(cors());
app.use(express.json());

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', businessRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
