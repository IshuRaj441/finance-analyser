require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
});

// Store connected users
const connectedUsers = new Map();

// JWT verification middleware
const verifyToken = (socket, next) => {
    let token = socket.handshake.auth.token;
    
    // Also check for token in handshake headers (backup)
    if (!token && socket.handshake.headers.authorization) {
        const authHeader = socket.handshake.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    
    if (!token) {
        console.log('No token provided in socket connection');
        return next(new Error('Authentication error: No token provided'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Handle different JWT structures
        socket.userId = decoded.sub || decoded.id || decoded.user_id;
        socket.companyId = decoded.company_id || decoded.companyId;
        
        if (!socket.userId) {
            return next(new Error('Authentication error: Invalid token structure'));
        }
        
        console.log(`Socket authenticated for user ${socket.userId}, company ${socket.companyId}`);
        next();
    } catch (err) {
        console.log('JWT verification failed:', err.message);
        next(new Error('Authentication error: Invalid token'));
    }
};

// Authentication middleware
io.use(verifyToken);

io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected from company ${socket.companyId}`);
    
    // Store user socket mapping
    connectedUsers.set(socket.userId, {
        socketId: socket.id,
        companyId: socket.companyId,
        connectedAt: new Date()
    });

    // Join user to their company room
    socket.join(`company_${socket.companyId}`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle joining specific rooms
    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`User ${socket.userId} joined room: ${room}`);
    });

    // Handle leaving rooms
    socket.on('leave-room', (room) => {
        socket.leave(room);
        console.log(`User ${socket.userId} left room: ${room}`);
    });

    // Handle real-time notifications
    socket.on('notification-read', (notificationId) => {
        // Broadcast to user's other devices
        socket.to(`user_${socket.userId}`).emit('notification-updated', {
            id: notificationId,
            is_read: true
        });
    });

    // Handle typing indicators for chat
    socket.on('typing-start', (data) => {
        socket.to(`user_${data.recipientId}`).emit('user-typing', {
            userId: socket.userId,
            isTyping: true
        });
    });

    socket.on('typing-stop', (data) => {
        socket.to(`user_${data.recipientId}`).emit('user-typing', {
            userId: socket.userId,
            isTyping: false
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        connectedUsers.delete(socket.userId);
        
        // Notify other users in company about disconnect
        socket.to(`company_${socket.companyId}`).emit('-user-disconnected', {
            userId: socket.userId
        });
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.userId}:`, error);
    });
});

// API endpoint to send notifications to specific users
app.post('/notify-user', async (req, res) => {
    try {
        const { userId, notification } = req.body;
        
        if (!userId || !notification) {
            return res.status(400).json({ error: 'userId and notification are required' });
        }

        const userSocket = connectedUsers.get(userId);
        
        if (userSocket) {
            io.to(`user_${userId}`).emit('notification:new', notification);
            
            // Send unread count update
            const unreadCount = await getUnreadCount(userId);
            io.to(`user_${userId}`).emit('notification:count', { unread: unreadCount });
        }

        res.json({ success: true, delivered: !!userSocket });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to send notifications to entire company
app.post('/notify-company', async (req, res) => {
    try {
        const { companyId, notification, excludeUserId } = req.body;
        
        if (!companyId || !notification) {
            return res.status(400).json({ error: 'companyId and notification are required' });
        }

        const room = excludeUserId 
            ? `company_${companyId}` 
            : `company_${companyId}`;
        
        if (excludeUserId) {
            // Send to all users in company except specific user
            io.to(room).except(`user_${excludeUserId}`).emit('notification:new', notification);
        } else {
            io.to(room).emit('notification:new', notification);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error sending company notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to broadcast transaction updates
app.post('/broadcast-transaction', async (req, res) => {
    try {
        const { companyId, transaction, action } = req.body;
        
        if (!companyId || !transaction || !action) {
            return res.status(400).json({ error: 'companyId, transaction, and action are required' });
        }

        io.to(`company_${companyId}`).emit('transaction:updated', {
            action, // created, updated, deleted
            transaction
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error broadcasting transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to broadcast budget updates
app.post('/broadcast-budget', async (req, res) => {
    try {
        const { companyId, budget, action } = req.body;
        
        if (!companyId || !budget || !action) {
            return res.status(400).json({ error: 'companyId, budget, and action are required' });
        }

        io.to(`company_${companyId}`).emit('budget:updated', {
            action,
            budget
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error broadcasting budget:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to get connected users count
app.get('/stats', (req, res) => {
    const stats = {
        totalConnected: connectedUsers.size,
        companyStats: {}
    };

    connectedUsers.forEach((user, userId) => {
        const companyId = user.companyId;
        if (!companyStats[companyId]) {
            companyStats[companyId] = 0;
        }
        companyStats[companyId]++;
    });

    res.json(stats);
});

// Helper function to get unread count from Laravel API
async function getUnreadCount(userId) {
    try {
        const response = await axios.get(`${process.env.LARAVEL_URL || 'http://localhost:8000'}/api/v1/notifications/count`, {
            headers: {
                'Authorization': `Bearer ${process.env.API_TOKEN}`,
                'Accept': 'application/json'
            }
        });
        return response.data.data.unread || 0;
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        connectedUsers: connectedUsers.size
    });
});

const PORT = process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
