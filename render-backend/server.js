const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors()); // Enables CORS for all routes
app.use(express.json()); // Parses incoming JSON payloads

// A simple GET route for the root URL
// This will resolve the "Cannot GET /" error
app.get('/', (req, res) => {
  res.send('Neurogenx API is running successfully!');
});

// A route to handle message requests
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
