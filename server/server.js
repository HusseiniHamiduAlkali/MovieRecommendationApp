// server/server.js
const express = require('express');
const connectDB = require('./config/db'); // Your DB connection
const path = require('path'); // Core Node.js module
const cors = require('cors'); // If you're using CORS explicitly beyond proxy

// Load environment variables
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware (Body Parser)
app.use(express.json()); // This replaces bodyParser.json()

// Enable CORS (if your frontend is on a different origin than backend, which it is for dev)
app.use(cors()); // Make sure cors is installed: npm install cors

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/users', require('./routes/user')); // NEW: Use the user routes

// Serve static assets in production (if you're bundling client with server)
// You can uncomment this later when deploying

if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
}


// Basic route for testing
app.get('/', (req, res) => res.send('Movie Recommendation App Backend API is running!'));

// Start the server
const PORT = process.env.PORT || 5000; // Use port from .env or 5000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));