const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// Serve the Swagger documentation using the YAML file
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

// Define a new POST endpoint to handle user data
app.post('/api/submit', (req, res) => {
    console.log('POST request received at /api/submit');
    const { name, message } = req.body;
    if (!name || !message) {
        return res.status(400).json({ error: "Name and message are required." });
    }
    res.json({ confirmation: `Hello ${name}, your message "${message}" has been received!` });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger UI is available at http://localhost:${PORT}/docs`);
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger UI is available at http://localhost:${PORT}/docs`);
});
