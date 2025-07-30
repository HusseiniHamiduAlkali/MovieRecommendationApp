/**
 * MovieFilters Component
 * Provides advanced filtering options for movies
 * Features:
 * - Genre filtering
 * - Year range selection
 * - Rating range selection
 * - Sort options
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MovieFilters.css';

const MovieFilters = ({ onFilterChange }) => {
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [yearRange, setYearRange] = useState({
        start: 1970,
        end: new Date().getFullYear()
    });
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState('popularity.desc');
    
    // Fetch available genres on component mount
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axios.get('/api/movies/genres');
                setGenres(response.data.genres);
            } catch (err) {
                console.error('Failed to fetch genres:', err);
            }
        };
        fetchGenres();
    }, []);

    // Handle genre selection
    const handleGenreToggle = (genreId) => {
        setSelectedGenres(prev => {
            const newSelection = prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId];
            
            // Notify parent component of filter changes
            applyFilters(newSelection);
            return newSelection;
        });
    };

    // Apply all filters
    const applyFilters = (updatedGenres = selectedGenres) => {
        onFilterChange({
            genres: updatedGenres,
            year: {
                start: yearRange.start,
                end: yearRange.end
            },
            minRating,
            sortBy
        });
    };

    return (
        <div className="movie-filters">
            <div className="filter-section">
                <h3>Genres</h3>
                <div className="genres-grid">
                    {genres.map(genre => (
                        <label key={genre.id} className="genre-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedGenres.includes(genre.id)}
                                onChange={() => handleGenreToggle(genre.id)}
                            />
                            {genre.name}
                        </label>
                    ))}
                </div>
            </div>

            <div className="filter-section">
                <h3>Release Years</h3>
                <div className="year-range">
                    <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={yearRange.start}
                        onChange={(e) => {
                            const newRange = {
                                ...yearRange,
                                start: parseInt(e.target.value)
                            };
                            setYearRange(newRange);
                            applyFilters();
                        }}
                    />
                    <span>to</span>
                    <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={yearRange.end}
                        onChange={(e) => {
                            const newRange = {
                                ...yearRange,
                                end: parseInt(e.target.value)
                            };
                            setYearRange(newRange);
                            applyFilters();
                        }}
                    />
                </div>
            </div>

            <div className="filter-section">
                <h3>Minimum Rating</h3>
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => {
                        setMinRating(parseFloat(e.target.value));
                        applyFilters();
                    }}
                />
                <span>{minRating}</span>
            </div>

            <div className="filter-section">
                <h3>Sort By</h3>
                <select
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        applyFilters();
                    }}
                >
                    <option value="popularity.desc">Most Popular</option>
                    <option value="vote_average.desc">Highest Rated</option>
                    <option value="release_date.desc">Newest First</option>
                    <option value="release_date.asc">Oldest First</option>
                    <option value="revenue.desc">Highest Revenue</option>
                </select>
            </div>
        </div>
    );
};

export default MovieFilters;
