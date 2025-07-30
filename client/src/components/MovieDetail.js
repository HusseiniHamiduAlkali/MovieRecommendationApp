// client/src/components/MovieDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

/**
 * MovieDetail Component
 * Displays detailed information about a specific movie
 * Features:
 * - Movie information display
 * - Add/remove from favorites
 * - Add/remove from watchlist
 * - Mark as watched
 * - Show similar movies
 * - Show personalized recommendations
 */
const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [isWatched, setIsWatched] = useState(false);

    // Function to check if user is authenticated (simple check for now)
    const isAuthenticated = () => {
        return !!localStorage.getItem('token');
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch movie details, similar movies, and check user status
                const [movieResponse, similarResponse, userStatusResponse, recommendationsResponse] = await Promise.all([
                    axios.get(`/api/movies/${id}`),
                    axios.get(`/api/movies/${id}/similar`),
                    isAuthenticated() ? axios.get('/api/users/status/' + id) : null,
                    isAuthenticated() ? axios.get('/api/movies/recommendations') : null
                ]);

                setMovie(movieResponse.data);
                setSimilarMovies(similarResponse.data.results.slice(0, 6));
                
                if (userStatusResponse) {
                    const { isFavorite, inWatchlist, watched } = userStatusResponse.data;
                    setIsFavorited(isFavorite);
                    setIsInWatchlist(inWatchlist);
                    setIsWatched(watched);
                }

                if (recommendationsResponse) {
                    setRecommendations(recommendationsResponse.data.results.slice(0, 6));
                }
                
                setLoading(false);

            } catch (err) {
                setError('Error fetching movie details');
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Handle adding/removing from watchlist
    const handleWatchlistClick = async () => {
        if (!isAuthenticated()) {
            setError('Please log in to use watchlist');
            return;
        }

        try {
            if (isInWatchlist) {
                await axios.delete(`/api/users/watchlist/${id}`);
            } else {
                await axios.post('/api/users/watchlist', { movieId: parseInt(id) });
            }
            setIsInWatchlist(!isInWatchlist);
        } catch (err) {
            setError('Failed to update watchlist');
        }
    };

    // Handle marking movie as watched
    const handleMarkAsWatched = async () => {
        if (!isAuthenticated()) {
            setError('Please log in to mark movies as watched');
            return;
        }

        try {
            await axios.post('/api/users/watched', { movieId: parseInt(id) });
            setIsWatched(true);
            // Remove from watchlist if it's there
            if (isInWatchlist) {
                await handleWatchlistClick();
            }
        } catch (err) {
            setError('Failed to mark movie as watched');
        }
    };

    // NEW: Function to handle adding/removing from favorites
    const handleFavoriteToggle = async () => {
        if (!isAuthenticated()) {
            alert('Please log in to favorite movies.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            if (isFavorited) {
                // Implement REMOVE favorite later
                // For now, let's just alert
                alert('Feature to remove from favorites will be implemented soon!');
            } else {
                // Add to favorites
                await axios.post('/api/users/favorites', { movieId: parseInt(id) }, {
                    headers: {
                        'x-auth-token': token
                    }
                });
                setIsFavorited(true);
                alert('Movie added to favorites!');
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            if (err.response && err.response.data && err.response.data.msg) {
                alert(`Error: ${err.response.data.msg}`);
            } else {
                alert('Failed to update favorites. Please try again.');
            }
        }
    };


    if (loading) {
        return <div className="App">Loading movie details...</div>;
    }

    if (error) {
        return <div className="App" style={{ color: 'red' }}>{error}</div>;
    }

    if (!movie) {
        return <div className="App">Movie not found.</div>;
    }

    const formatRuntime = (minutes) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', backgroundColor: '#333', color: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                {movie.poster_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title}
                        style={{ width: '300px', height: '450px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                ) : (
                    <div style={{ width: '300px', height: '450px', backgroundColor: '#555', color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                        No Image Available
                    </div>
                )}
                <div>
                    <h2>{movie.title} ({movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'})</h2>
                    <p><strong>Tagline:</strong> {movie.tagline || 'N/A'}</p>
                    <p><strong>Overview:</strong> {movie.overview}</p>
                    <p><strong>Release Date:</strong> {movie.release_date}</p>
                    <p><strong>Rating:</strong> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} / 10 ({movie.vote_count} votes)</p>
                    <p><strong>Runtime:</strong> {formatRuntime(movie.runtime)}</p>
                    <p><strong>Genres:</strong> {movie.genres && movie.genres.length > 0 ? movie.genres.map(genre => genre.name).join(', ') : 'N/A'}</p>
                    <p><strong>Budget:</strong> {movie.budget ? `$${movie.budget.toLocaleString()}` : 'N/A'}</p>
                    <p><strong>Revenue:</strong> {movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'N/A'}</p>
                    <p><strong>Production Companies:</strong> {movie.production_companies && movie.production_companies.length > 0 ? movie.production_companies.map(company => company.name).join(', ') : 'N/A'}</p>

                    {/* NEW: Favorite Button - only show if authenticated */}
                    {isAuthenticated() && (
                        <button
                            onClick={handleFavoriteToggle}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                fontSize: '16px',
                                borderRadius: '5px',
                                border: 'none',
                                backgroundColor: isFavorited ? '#e74c3c' : '#2ecc71', // Red if favorited, green if not
                                color: '#fff',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                            }}
                        >
                            {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;