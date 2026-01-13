import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Global connection state
let isConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;
const CONNECTION_RETRY_DELAY = 5000; // 5 seconds

const connectDB = async (retries = MAX_CONNECTION_ATTEMPTS) => {
    try {
        // Prevent multiple connection attempts
        if (isConnected) {
            console.log("✅ MongoDB is already connected");
            return;
        }

        // Validate environment variables
        const dbUri = process.env.DB_URI;
        if (!dbUri) {
            throw new Error("DB_URI environment variable is not defined");
        }

        // Connection options for better performance and reliability
        const connectionOptions = {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
            bufferCommands: false, // Disable mongoose buffering
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        };

        console.log(`🔄 Attempting to connect to MongoDB (attempt ${connectionAttempts + 1}/${MAX_CONNECTION_ATTEMPTS})...`);

        const connectionInstance = await mongoose.connect(dbUri, connectionOptions);

        isConnected = true;
        connectionAttempts = 0;

        console.log(`✅ MongoDB connected successfully!`);
        console.log(`📍 DB HOST: ${connectionInstance.connection.host}`);
        console.log(`📊 DB NAME: ${connectionInstance.connection.name}`);
        console.log(`🔗 Connection ready state: ${connectionInstance.connection.readyState}`);

        // Set up connection event listeners
        setupConnectionListeners(connectionInstance);

    } catch (error) {
        connectionAttempts++;
        console.error(`❌ MongoDB connection FAILED (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`, error.message);

        if (connectionAttempts < retries) {
            console.log(`⏳ Retrying connection in ${CONNECTION_RETRY_DELAY / 1000} seconds...`);
            setTimeout(() => connectDB(retries - 1), CONNECTION_RETRY_DELAY);
        } else {
            console.error("💥 Maximum connection attempts reached. Exiting application.");
            process.exit(1);
        }
    }
};

// Set up connection event listeners for monitoring
const setupConnectionListeners = (connectionInstance) => {
    mongoose.connection.on('connected', () => {
        console.log('📡 Mongoose connected to MongoDB');
        isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
        isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
        console.log('📴 Mongoose disconnected from MongoDB');
        isConnected = false;
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
        console.log('🛑 Received SIGINT. Closing MongoDB connection gracefully...');
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed. Exiting...');
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('🛑 Received SIGTERM. Closing MongoDB connection gracefully...');
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed. Exiting...');
        process.exit(0);
    });
};

// Health check function for monitoring
const checkConnection = () => {
    return {
        isConnected,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        models: Object.keys(mongoose.models).length
    };
};

// Disconnect function (useful for testing)
const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        isConnected = false;
        console.log('✅ MongoDB disconnected successfully');
    } catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error);
        throw error;
    }
};

export default connectDB;
export { checkConnection, disconnectDB };