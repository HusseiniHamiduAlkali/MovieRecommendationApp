// server/routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const auth = require('../middleware/auth'); // Import your authentication middleware

// @route   POST /api/users/favorites
// @desc    Add a movie to user's favorites
// @access  Private (requires authentication)
router.post('/favorites', auth, async (req, res) => {
    const { movieId } = req.body; // Expect movieId in the request body

    // Basic validation
    if (!movieId) {
        return res.status(400).json({ msg: 'Movie ID is required.' });
    }

    try {
        // Find the user by their ID (attached by the auth middleware)
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Check if the movie is already in favorites
        if (user.favoriteMovies.includes(movieId)) {
            return res.status(400).json({ msg: 'Movie is already in your favorites.' });
        }

        // Add the movie ID to the favoriteMovies array
        user.favoriteMovies.push(movieId);
        await user.save(); // Save the updated user document

        res.json({ msg: 'Movie added to favorites successfully!', favorites: user.favoriteMovies });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/users/favorites
// @desc    Get all favorite movies for the logged-in user
// @access  Private
router.get('/favorites', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // You can optionally fetch details for these movie IDs from TMDB here
        // For now, let's just return the IDs
        res.json(user.favoriteMovies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;