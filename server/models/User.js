// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    // Array to store favorite movies
    favoriteMovies: [
        {
            type: Number,
            unique: true
        }
    ],
    // Array to store movies in watchlist
    watchlist: [
        {
            type: Number,
            unique: true
        }
    ],
    // Store user preferences for personalized recommendations
    preferences: {
        genres: [{ type: Number }],
        minRating: { type: Number, default: 0 },
        releaseYearRange: {
            start: { type: Number },
            end: { type: Number }
        },
        watchedMovies: [{ type: Number }]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { // Only hash if password field is new or modified
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);