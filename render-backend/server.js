const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Serve the Swagger documentation using the YAML file
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Define the root route
app.get('/', (req, res) => {
    console.log('GET request received at /');
    res.send('Neurogenx API is running successfully!');
});

// Define a simple API endpoint for a message
app.get('/api/message', (req, res) => {
    console.log('GET request received at /api/message');
    res.json({ message: "Hello from the Neurogenx API!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger UI is available at http://localhost:${PORT}/docs`);
});
