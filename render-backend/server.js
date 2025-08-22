const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Create a new HTTP server and pass the Express app to it
const server = http.createServer(app);

// Initialize Socket.IO and attach it to the HTTP server
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Manually set CORS headers for Express routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.use(express.json());

// Serve the Swagger documentation
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ---------------------------
// MONGO DB CONNECTION
// ---------------------------
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('Successfully connected to MongoDB!');
        })
        .catch(err => {
            console.error('Could not connect to MongoDB...', err);
        });
} else {
    console.error('MONGODB_URI is not set. Please add it to your environment variables.');
}

// ---------------------------
// USER SCHEMA AND MODEL
// ---------------------------
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

// ---------------------------
// MESSAGE SCHEMA AND MODEL
// ---------------------------
const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);

// ---------------------------
// AUTHENTICATION MIDDLEWARE
// ---------------------------
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authentication token missing.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Authentication error: Invalid token.', error);
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// ---------------------------
// SOCKET.IO CONNECTION HANDLING
// ---------------------------

// A map to store active sockets and their usernames
const connectedUsers = new Map();

// Helper function to broadcast the updated user list
const broadcastUserList = () => {
    const users = Array.from(connectedUsers.values());
    io.emit('online_users', users);
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Listen for the 'join' event from the client to get their username
    socket.on('join', (username) => {
        connectedUsers.set(socket.id, username);
        console.log(`User '${username}' joined with socket ID: ${socket.id}`);
        broadcastUserList();
    });

    socket.on('disconnect', () => {
        const username = connectedUsers.get(socket.id);
        connectedUsers.delete(socket.id);
        console.log(`User '${username}' disconnected from socket ID: ${socket.id}`);
        broadcastUserList();
    });
});

// ---------------------------
// API ENDPOINTS
// ---------------------------
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Received registration request for username: ${username}`);
    try {
        if (!username || !password) {
            console.log('Registration failed: Missing username or password.');
            return res.status(400).json({ error: 'Username and password are required.' });
        }
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log(`Registration failed: Username '${username}' already exists.`);
            return res.status(400).json({ error: 'Username already taken.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        console.log(`User '${username}' registered successfully!`);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: 'An error occurred during registration.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Received login request for username: ${username}`);
    try {
        if (!username || !password) {
            console.log('Login failed: Missing username or password.');
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            console.log('Login failed: Invalid username or password.');
            return res.status(400).json({ error: 'Invalid username or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Login failed: Password mismatch.');
            return res.status(400).json({ error: 'Invalid username or password.' });
        }

        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        console.log(`User '${username}' logged in successfully.`);
        res.json({ token, username });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});

app.post('/api/submit', auth, async (req, res) => {
    const { message } = req.body;
    const { userId, username } = req.user;
    
    if (!message) {
        return res.status(400).json({ error: "Message is required." });
    }

    try {
        const newMessage = new Message({ userId, name: username, message });
        await newMessage.save();

        io.emit('new_message', {
            name: newMessage.name,
            message: newMessage.message,
            timestamp: newMessage.date
        });

        res.status(201).json({ message: 'Message submitted successfully!' });
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ error: "An error occurred while saving the message." });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ date: -1 });
        const formattedMessages = messages.map(msg => ({
            name: msg.name,
            message: msg.message,
            timestamp: msg.date,
        }));
        res.json(formattedMessages);
    } catch (err) {
        console.error('Error retrieving messages:', err);
        res.status(500).json({ error: "An error occurred while retrieving messages." });
    }
});

const STARTUP_DELAY = 5000;
setTimeout(() => {
    server.listen(PORT, () => {
        console.log(`Server is listening at http://localhost:${PORT}`);
    });
}, STARTUP_DELAY);

