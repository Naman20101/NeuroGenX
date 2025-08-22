const express = require('express');
const cors = require('cors');
const app = express();

// Use the PORT environment variable provided by Render, or a default for local development.
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins. This is crucial for the frontend to be able to
// make requests from a different domain (Vercel).
app.use(cors());

// Define a simple API endpoint
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the Node.js backend on Render!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
