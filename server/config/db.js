// server/config/db.js
const mongoose = require('mongoose');

// Load environment variables (ensure dotenv is installed and configured in server.js)
require('dotenv').config();

const connectDB = async () => {
    try {
        // Check if MONGO_URI is defined
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in the .env file.');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,      // Deprecated but still common, ensures compatibility
            useUnifiedTopology: true,   // Deprecated but still common, new server discovery and monitoring engine
            // useCreateIndex: true,    // Deprecated in Mongoose 6, not needed
            // useFindAndModify: false  // Deprecated in Mongoose 6, not needed
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;