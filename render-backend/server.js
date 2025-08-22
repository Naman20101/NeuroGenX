const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const mongoose = require('mongoose');
const http = require('http'); // Import Node.js http module
const { Server } = require('socket.io'); // Import Socket.IO Server

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Create a new HTTP server and pass the Express app to it
const server = http.createServer(app);

// Initialize Socket.IO and attach it to the HTTP server
// The cors configuration allows connections from your Vercel frontend
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust to your Vercel URL for production
        methods: ["GET", "POST"]
    }
});

// Manually set CORS headers for Express routes to allow requests from any origin.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// Serve the Swagger documentation using the YAML file
// This part is unchanged and can be removed if not needed later
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ---------------------------
// MONGO DB CONNECTION AND SETUP
// ---------------------------
// Use an environment variable for the MongoDB connection URI for security.
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Successfully connected to MongoDB!'))
        .catch(err => console.error('Could not connect to MongoDB...', err));
} else {
    console.error('MONGODB_URI is not set. Please add it to your environment variables.');
}

// Define the schema for a Message
const messageSchema = new mongoose.Schema({
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

// Create the Message model from the schema
const Message = mongoose.model('Message', messageSchema);

// ---------------------------
// SOCKET.IO CONNECTION HANDLING
// ---------------------------
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // You can emit initial data here if needed
    // For example: io.emit('message', "A new user has joined the chat.");
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// ---------------------------
// API ENDPOINTS
// ---------------------------

// Define the root route
app.get('/', (req, res) => {
    console.log('GET request received at /');
    res.send('Neurogenx API is running successfully!');
});

// Define a simple GET endpoint for a message
app.get('/api/message', (req, res) => {
    console.log('GET request received at /api/message');
    res.json({ message: "Hello from the Neurogenx API!" });
});

// Define a POST endpoint to save user data to the database
app.post('/api/submit', async (req, res) => {
    console.log('POST request received at /api/submit');
    const { name, message } = req.body;
    if (!name || !message) {
        return res.status(400).json({ error: "Name and message are required." });
    }

    try {
        const newMessage = new Message({ name, message });
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

// **NEW ENDPOINT**: Get a single message by ID
app.get('/api/messages/:id', async (req, res) => {
    console.log('GET request received at /api/messages/:id');
    try {
        const messageId = req.params.id;
        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json(message);
    } catch (err) {
        console.error('Error retrieving message:', err);
        res.status(500).json({ error: 'An error occurred while retrieving the message.' });
    }
});


// ---------------------------
// SERVER STARTUP
// ---------------------------
const STARTUP_DELAY = 5000;

setTimeout(() => {
    server.listen(PORT, () => { // Use the HTTP server to listen
        console.log(`Server is listening at http://localhost:${PORT}`);
        console.log(`Swagger UI is available at http://localhost:${PORT}/docs`);
    });
}, STARTUP_DELAY);


