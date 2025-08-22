const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For creating secure tokens

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

// Manually set CORS headers for Express routes to allow requests from any origin.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// Serve the Swagger documentation using the YAML file
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ---------------------------
// MONGO DB CONNECTION AND SETUP
// ---------------------------
// Use an environment variable for the MongoDB connection URI for security.
const MONGODB_URI = process.env.MONGODB_URI;
// Use an environment variable for the JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key'; // Use a default key for development

// Connect to MongoDB
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Successfully connected to MongoDB!'))
        .catch(err => console.error('Could not connect to MongoDB...', err));
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
    userId: { // Link message to a specific user
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
        req.user = decoded; // Add the decoded user payload to the request
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// ---------------------------
// SOCKET.IO CONNECTION HANDLING
// ---------------------------
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// ---------------------------
// API ENDPOINTS
// ---------------------------

// REGISTER route
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken.' });
        }

        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: 'An error occurred during registration.' });
    }
});

// LOGIN route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }

        // Compare the submitted password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }

        // Create and sign a JWT token
        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, username });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});


// Define a POST endpoint to save user data to the database
// We now use the 'auth' middleware to protect this route
app.post('/api/submit', auth, async (req, res) => {
    console.log('POST request received at /api/submit');
    const { message } = req.body;
    const { userId, username } = req.user; // Get user info from the JWT token
    
    if (!message) {
        return res.status(400).json({ error: "Message is required." });
    }

    try {
        // Create a new message document
        const newMessage = new Message({ userId, name: username, message });
        await newMessage.save();
        console.log('Message saved to DB:', newMessage);

        // Emit the new message to all connected clients
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

// Define a new GET endpoint to retrieve all messages from the database
app.get('/api/messages', async (req, res) => {
    console.log('GET request received at /api/messages');
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


// ---------------------------
// SERVER STARTUP
// ---------------------------
const STARTUP_DELAY = 5000;

setTimeout(() => {
    server.listen(PORT, () => {
        console.log(`Server is listening at http://localhost:${PORT}`);
    });
}, STARTUP_DELAY);


