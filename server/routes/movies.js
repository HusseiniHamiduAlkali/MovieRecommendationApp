// server/routes/movies.js
/**
 * Movies Router
 * Handles all movie-related routes including:
 * - Popular movies
 * - Movie details
 * - Movie search
 * - Advanced filtering
 * - Personalized recommendations
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth'); // Import auth middleware

// Load environment variables (ensure this is at the top if not already)
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Route to get popular movies
router.get('/popular', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
                page: 1
            },
            timeout: 5000 // 5 second timeout
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching popular movies:', error.message);
        if (error.response) {
            console.error('TMDB API Error Response Data:', error.response.data);
            console.error('TMDB API Error Response Status:', error.response.status);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ msg: 'Server error fetching popular movies' });
        }
    }
});

// Route to search movies
router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ msg: 'Search query (q) is required' });
    }
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                query: query,
                language: 'en-US',
                page: 1
                // You can add include_adult: false if you want to filter out adult content
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error searching movies:', error.message);
        if (error.response) {
            console.error('TMDB API Error Response Data:', error.response.data);
            console.error('TMDB API Error Response Status:', error.response.status);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ msg: 'Server error searching movies' });
        }
    }
});

// NEW: Route to get movie details by ID
router.get('/:id', async (req, res) => {
    const movieId = req.params.id; // Get movie ID from URL parameters
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching movie details for ID ${movieId}:`, error.message);
        if (error.response) {
            console.error('TMDB API Error Response Data:', error.response.data);
            console.error('TMDB API Error Response Status:', error.response.status);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ msg: `Server error fetching details for movie ID ${movieId}` });
        }
    }
});


module.exports = router;