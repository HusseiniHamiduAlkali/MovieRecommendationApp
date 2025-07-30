// client/src/components/MovieDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false); // NEW: State to track if movie is favorited

    // Function to check if user is authenticated (simple check for now)
    const isAuthenticated = () => {
        return !!localStorage.getItem('token');
    };

    useEffect(() => {
        const fetchMovieDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`/api/movies/${id}`);
                setMovie(response.data);
                setLoading(false);

                // NEW: After fetching movie details, check if it's already a favorite
                if (isAuthenticated()) {
                    const token = localStorage.getItem('token');
                    try {
                        const favoritesResponse = await axios.get('/api/users/favorites', {
                            headers: {
                                'x-auth-token': token
                            }
                        });
                        // Check if the current movie ID is in the user's favorites list
                        setIsFavorited(favoritesResponse.data.includes(parseInt(id)));
                    } catch (favErr) {
                        console.error('Error fetching favorites:', favErr);
                        // Handle error, e.g., token expired, or server error
                        // For simplicity, we just won't show it as favorited
                    }
                }

            } catch (err) {
                console.error(`Error fetching movie details for ID ${id}:`, err);
                setError('Failed to load movie details. Please try again later.');
                setLoading(false);
            }
        };

        if (id) {
            fetchMovieDetail();
        }
    }, [id]); // Re-run effect if the ID in the URL changes

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