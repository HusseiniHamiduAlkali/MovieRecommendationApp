// client/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please log in.');
                setLoading(false);
                return;
            }

            try {
                // Step 1: Fetch favorite movie IDs from your backend
                const favIdsResponse = await axios.get('/api/users/favorites', {
                    headers: {
                        'x-auth-token': token
                    }
                });
                const favoriteMovieIds = favIdsResponse.data;

                // Step 2: Fetch details for each favorite movie ID from TMDB via your backend
                const movieDetailsPromises = favoriteMovieIds.map(async (movieId) => {
                    try {
                        const movieDetailResponse = await axios.get(`/api/movies/${movieId}`);
                        return movieDetailResponse.data; // Return the full movie detail object
                    } catch (detailErr) {
                        console.error(`Error fetching details for movie ID ${movieId}:`, detailErr);
                        // Return null or an error object for this movie if it fails
                        return null;
                    }
                });

                // Wait for all movie detail promises to resolve
                const detailedFavorites = (await Promise.all(movieDetailsPromises)).filter(Boolean); // Filter out any nulls from failed fetches
                setFavorites(detailedFavorites);
                setLoading(false);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                if (err.response && err.response.data && err.response.data.msg) {
                    setError(`Failed to load favorites: ${err.response.data.msg}`);
                } else {
                    setError('Failed to load dashboard data. Please try again later.');
                }
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []); // Empty dependency array means this effect runs once on mount

    if (loading) {
        return <div className="App">Loading your dashboard...</div>;
    }

    if (error) {
        return <div className="App" style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '20px auto', backgroundColor: '#333', color: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
            <h2>Welcome to Your Dashboard!</h2>
            <p>This is where you'll manage your profile, favorite movies, and watchlists.</p>

            <h3 style={{ marginTop: '30px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Your Favorite Movies</h3>
            {favorites.length === 0 ? (
                <p>You haven't added any favorite movies yet. Go to the Home page and add some!</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                    {favorites.map(movie => (
                        <div key={movie.id} style={{
                            margin: '10px',
                            textAlign: 'center',
                            border: '1px solid #444',
                            borderRadius: '8px',
                            padding: '10px',
                            backgroundColor: '#222',
                            width: '200px', // Fixed width for movie cards
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <h4>{movie.title}</h4>
                            {movie.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                    alt={movie.title}
                                    style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '4px' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '250px', backgroundColor: '#333', color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                                    No Image
                                </div>
                            )}
                            <p style={{ fontSize: '0.9em', color: '#bbb' }}>{movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;