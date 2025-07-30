/**
 * WatchList Component
 * Displays and manages user's movie watchlist
 * Features:
 * - Display all movies in watchlist
 * - Remove movies from watchlist
 * - Mark movies as watched
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './WatchList.css';

const WatchList = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch watchlist on component mount
    useEffect(() => {
        fetchWatchlist();
    }, []);

    // Fetch user's watchlist from the server
    const fetchWatchlist = async () => {
        try {
            const response = await axios.get('/api/users/watchlist');
            // Fetch movie details for each movie ID in the watchlist
            const moviePromises = response.data.map(movieId =>
                axios.get(`/api/movies/${movieId}`)
            );
            const movieDetails = await Promise.all(moviePromises);
            setWatchlist(movieDetails.map(res => res.data));
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch watchlist');
            setLoading(false);
        }
    };

    // Remove movie from watchlist
    const removeFromWatchlist = async (movieId) => {
        try {
            await axios.delete(`/api/users/watchlist/${movieId}`);
            setWatchlist(watchlist.filter(movie => movie.id !== movieId));
        } catch (err) {
            setError('Failed to remove movie from watchlist');
        }
    };

    // Mark movie as watched
    const markAsWatched = async (movieId) => {
        try {
            await axios.post('/api/users/watched', { movieId });
            await removeFromWatchlist(movieId);
        } catch (err) {
            setError('Failed to mark movie as watched');
        }
    };

    if (loading) return <div>Loading watchlist...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="watchlist-container">
            <h2>My Watchlist</h2>
            {watchlist.length === 0 ? (
                <p>Your watchlist is empty</p>
            ) : (
                <div className="watchlist-grid">
                    {watchlist.map(movie => (
                        <div key={movie.id} className="watchlist-item">
                            <img
                                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                alt={movie.title}
                            />
                            <h3>{movie.title}</h3>
                            <div className="watchlist-actions">
                                <Link to={`/movie/${movie.id}`}>View Details</Link>
                                <button onClick={() => markAsWatched(movie.id)}>
                                    Mark as Watched
                                </button>
                                <button onClick={() => removeFromWatchlist(movie.id)}>
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatchList;
