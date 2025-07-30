/**
 * UserPreferences Component
 * Allows users to set their movie preferences for personalized recommendations
 * Features:
 * - Select favorite genres
 * - Set minimum rating threshold
 * - Set release year range
 * - View watched movies history
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserPreferences.css';

const UserPreferences = () => {
    const [preferences, setPreferences] = useState({
        genres: [],
        minRating: 0,
        releaseYearRange: {
            start: 1970,
            end: new Date().getFullYear()
        }
    });
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    // Fetch user preferences and available genres on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch available genres from TMDB
                const genresResponse = await axios.get('/api/movies/genres');
                setGenres(genresResponse.data.genres);

                // Fetch user preferences
                const preferencesResponse = await axios.get('/api/users/preferences');
                setPreferences(preferencesResponse.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load preferences');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/api/users/preferences', preferences);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError('Failed to save preferences');
        }
    };

    // Handle genre selection
    const handleGenreChange = (genreId) => {
        const newGenres = preferences.genres.includes(genreId)
            ? preferences.genres.filter(id => id !== genreId)
            : [...preferences.genres, genreId];
        
        setPreferences({ ...preferences, genres: newGenres });
    };

    if (loading) return <div>Loading preferences...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="preferences-container">
            <h2>Movie Preferences</h2>
            <form onSubmit={handleSubmit}>
                <div className="preference-section">
                    <h3>Favorite Genres</h3>
                    <div className="genres-grid">
                        {genres.map(genre => (
                            <label key={genre.id} className="genre-checkbox">
                                <input
                                    type="checkbox"
                                    checked={preferences.genres.includes(genre.id)}
                                    onChange={() => handleGenreChange(genre.id)}
                                />
                                {genre.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="preference-section">
                    <h3>Minimum Rating</h3>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={preferences.minRating}
                        onChange={(e) => setPreferences({
                            ...preferences,
                            minRating: parseFloat(e.target.value)
                        })}
                    />
                    <span>{preferences.minRating}</span>
                </div>

                <div className="preference-section">
                    <h3>Release Years</h3>
                    <div className="year-range">
                        <input
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            value={preferences.releaseYearRange.start}
                            onChange={(e) => setPreferences({
                                ...preferences,
                                releaseYearRange: {
                                    ...preferences.releaseYearRange,
                                    start: parseInt(e.target.value)
                                }
                            })}
                        />
                        <span>to</span>
                        <input
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            value={preferences.releaseYearRange.end}
                            onChange={(e) => setPreferences({
                                ...preferences,
                                releaseYearRange: {
                                    ...preferences.releaseYearRange,
                                    end: parseInt(e.target.value)
                                }
                            })}
                        />
                    </div>
                </div>

                <button type="submit" className="save-preferences">
                    Save Preferences
                </button>
                {saved && <div className="saved-message">Preferences saved!</div>}
            </form>
        </div>
    );
};

export default UserPreferences;
