const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const mongoose = require('mongoose');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Manually set CORS headers to allow requests from any origin.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
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
        // Create a new message document
        const newMessage = new Message({ name, message });
        // Save the document to the database
        await newMessage.save();
        console.log('Message saved to DB:', newMessage);
        res.json({ confirmation: `Hello ${name}, your message "${message}" has been received and saved!` });
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ error: "An error occurred while saving the message." });
    }
});

// Define a new GET endpoint to retrieve all messages from the database
app.get('/api/messages', async (req, res) => {
    console.log('GET request received at /api/messages');
    try {
        // Find all documents in the 'messages' collection and sort by newest first
        const messages = await Message.find().sort({ date: -1 });
        
        // Format the messages to match the frontend's expected format
        const formattedMessages = messages.map(msg => ({
            name: msg.name,
            message: msg.message,
            timestamp: msg.date, // The key change: rename 'date' to 'timestamp'
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
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Swagger UI is available at http://localhost:${PORT}/docs`);
    });
}, STARTUP_DELAY);

