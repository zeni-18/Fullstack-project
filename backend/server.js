const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://connectx123.netlify.app',
    process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, mobile apps, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Explicitly handle preflight requests for ALL routes
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/ai', require('./routes/ai'));

app.get('/', (req, res) => {
    res.json({ message: 'Blog Platform API' });
});

const multer = require('multer');

app.use((err, req, res, next) => {
    console.error('Error:', err.message);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Max size is 20MB' });
        }
        return res.status(400).json({ message: err.message });
    }

    if (err === 'Error: Images Only!') {
        return res.status(400).json({ message: err });
    }

    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    socket.on('setup', (userId) => {
        socket.join(userId);
        socket.emit('connected');
    });

    socket.on('send_message', ({ recipientId, message }) => {
        socket.to(recipientId).emit('receive_message', message);
    });

    socket.on('message_reaction', ({ recipientId, messageId, reactions }) => {
        socket.to(recipientId).emit('receive_reaction', { messageId, reactions });
    });

    socket.on('disconnect', () => { });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
