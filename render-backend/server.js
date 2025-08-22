const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------
// MIDDLEWARE
// ---------------------------
// Manually set CORS headers to allow requests from any origin.
// This fixes the "Failed to load messages" error without requiring the 'cors' package.
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
// IN-MEMORY DATA STORE
// ---------------------------
// This array will act as our temporary database.
// Data stored here will be lost when the server restarts.
let messages = [];
let messageIdCounter = 0;

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

// Define a POST endpoint to save user data to the in-memory store
app.post('/api/submit', (req, res) => {
    console.log('POST request received at /api/submit');
    const { name, message } = req.body;
    if (!name || !message) {
        return res.status(400).json({ error: "Name and message are required." });
    }

    // Create a new message object with a unique ID and date
    const newMessage = {
        _id: ++messageIdCounter,
        name,
        message,
        date: new Date()
    };
    
    // Save the message to our in-memory array
    messages.push(newMessage);
    console.log('Message saved to in-memory store:', newMessage);

    res.json({ confirmation: `Hello ${name}, your message "${message}" has been received and saved!` });
});

// Define a new GET endpoint to retrieve all messages from the in-memory store
app.get('/api/messages', (req, res) => {
    console.log('GET request received at /api/messages');
    // Return the messages from our array
    res.json(messages);
});

// ---------------------------
// SERVER STARTUP
// ---------------------------
// Add a delay before starting the server to avoid EADDRINUSE errors on Render.
const STARTUP_DELAY = 5000; // 5-second delay

setTimeout(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Swagger UI is available at http://localhost:${PORT}/docs`);
    });
}, STARTUP_DELAY);


