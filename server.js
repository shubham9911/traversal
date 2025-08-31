/**
 * Traversal Core Application Server
 * 
 * This is the main server file for the Traversal Core boilerplate application.
 * It sets up an Express.js server with MongoDB connection, CORS configuration,
 * and handles user authentication routes. This serves as a template for
 * Node.js backend applications with Angular 18 frontend.
 * 
 * Features:
 * - Express.js web server
 * - MongoDB database connection
 * - CORS enabled for cross-origin requests
 * - JSON body parsing middleware
 * - User authentication routes
 * - Error handling for server startup
 */

// Core server dependencies
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Application routes
const routes = require("./backend/routes/routes");

// Create HTTP server instance
const server = http.createServer(app);

/**
 * Database Configuration
 * 
 * Establishes connection to MongoDB database.
 * In a production environment, use environment variables for connection strings.
 * 
 * Example .env file:
 * MONGODB_URI=mongodb://localhost:27017/your-database
 * or
 * MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
 */
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/traversal-core";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB database");
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error.message);
    console.error("💡 Make sure MongoDB is running or check your connection string");
    process.exit(1); // Exit if database connection fails
  });

/**
 * Middleware Configuration
 * 
 * Setting up essential middleware for the Express application:
 * 1. JSON body parser - for handling JSON request bodies
 * 2. CORS headers - for cross-origin resource sharing
 * 3. CORS module - additional CORS support
 * 4. Application routes - API endpoints
 */

// Parse incoming JSON requests (for API calls from Angular frontend)
app.use(bodyParser.json());

// Manual CORS headers setup for fine-grained control
app.use((req, res, next) => {
  // Allow requests from any origin (development setup)
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  // Specify allowed headers for cross-origin requests
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  
  // Specify allowed HTTP methods for the API
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  
  next(); // Continue to next middleware
});

// Enable CORS using the cors module (backup/additional support)
app.use(cors());

// Mount application routes (authentication and other API endpoints)
app.use(routes);

/**
 * Server Configuration and Startup
 * 
 * Configure the server port and start listening for incoming connections.
 * Includes proper error handling for common server startup issues.
 */

// Configure server port (TODO: make configurable via environment variable)
const PORT = process.env.PORT || 3000;
app.set("port", PORT);

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`🚀 Traversal Core server is running on port ${PORT}`);
  console.log(`📍 Access the application at http://localhost:${PORT}`);
});

// Handle successful server startup
server.on("listening", () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`🎯 Server listening on ${bind}`);
});

// Handle server startup errors
server.on("error", onError);

/**
 * Error handler for server startup issues
 * 
 * Handles common server errors like permission issues and port conflicts.
 * Provides clear error messages and exits gracefully when necessary.
 * 
 * @param {Error} error - The error object from server startup
 */
function onError(error) {
  // Only handle listen-related errors, rethrow others
  if (error.syscall !== "listen") {
    throw error;
  }

  const PORT = app.get("port");
  const bind = typeof PORT === "string" ? `Pipe ${PORT}` : `Port ${PORT}`;

  // Handle specific error cases with helpful messages
  switch (error.code) {
    case "EACCES":
      console.error(`❌ ${bind} requires elevated privileges`);
      console.error("💡 Try running with sudo or use a port number above 1024");
      process.exit(1);
      break;
      
    case "EADDRINUSE":
      console.error(`❌ ${bind} is already in use`);
      console.error("💡 Try stopping other servers or use a different port");
      process.exit(1);
      break;
      
    default:
      // For unexpected errors, let them bubble up
      throw error;
  }
}
