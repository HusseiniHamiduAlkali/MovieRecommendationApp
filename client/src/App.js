// client/src/App.js
import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import MovieDetail from './components/MovieDetail';
import WatchList from './components/WatchList';
import UserPreferences from './components/UserPreferences';
import MovieFilters from './components/MovieFilters';

import './App.css';
import logo from './logo.svg';

// Home Component (Modify to make movies clickable)
function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMovies('/api/movies/popular');
  }, []);

  const fetchMovies = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url);
      setMovies(response.data.results);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to load movies. Please try again later.');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchMovies(`/api/movies/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      fetchMovies('/api/movies/popular');
    }
  };

  if (loading) {
    return <div className="App">Loading movies...</div>;
  }

  if (error) {
    return <div className="App" style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Movie Recommendation App</h1>

        <form onSubmit={handleSearchSubmit} style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search for movies..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px' }}
          />
          <button
            type="submit"
            style={{ padding: '10px 20px', fontSize: '16px', borderRadius: '5px', border: 'none', backgroundColor: '#61dafb', color: '#282c34', cursor: 'pointer' }}
          >
            Search
          </button>
        </form>

        <h2>{searchTerm ? `Search Results for "${searchTerm}"` : 'Popular Movies'}</h2>
        <div className="movie-list" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {movies.length > 0 ? (
            movies.map(movie => (
              // NEW: Wrap each movie item with a Link
              <Link to={`/movie/${movie.id}`} key={movie.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ margin: '10px', textAlign: 'center', cursor: 'pointer', border: '1px solid #444', borderRadius: '8px', padding: '10px', backgroundColor: '#222', transition: 'transform 0.2s' }}>
                  <h3>{movie.title}</h3>
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      style={{ width: '200px', height: '300px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <div style={{ width: '200px', height: '300px', backgroundColor: '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                      No Image
                    </div>
                  )}
                  <p>Release Date: {movie.release_date}</p>
                </div>
              </Link>
            ))
          ) : (
            <p>No movies found. Try a different search or check your internet connection.</p>
          )}
        </div>
      </header>
    </div>
  );
}

// Main App component with Routes (add MovieDetail route)
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    alert('You have been logged out.');
    navigate('/login');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      <nav style={{ padding: '10px', background: '#282c34', color: '#fff', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', padding: '5px' }}>Home</Link>
        {isAuthenticated && (
          <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none', padding: '5px' }}>Dashboard</Link>
        )}
        {isAuthenticated ? (
          <button onClick={handleLogout} style={{
            background: 'none',
            border: '1px solid #fff',
            color: '#fff',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>Logout</button>
        ) : (
          <>
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none', padding: '5px' }}>Register</Link>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none', padding: '5px' }}>Login</Link>
          </>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* NEW: Route for Movie Detail Page */}
        <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>
    </>
  );
}

export default App;