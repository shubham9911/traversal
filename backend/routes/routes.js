/**
 * API Routes for Traversal Core Application
 * 
 * Handles authentication endpoints for user registration and login.
 * This serves as a boilerplate for Node.js backend API endpoints.
 * Uses bcrypt for password hashing and MongoDB for data persistence.
 * 
 * Available endpoints:
 * - POST /api/signup - Register a new user account
 * - PUT /api/login - Authenticate user login
 * 
 * Security features:
 * - Password hashing with bcrypt (salt rounds: 10)
 * - Input validation and error handling
 * - Proper HTTP status codes
 */

const express = require("express");
const router = express.Router();
const User = require("../models/users");
const bcrypt = require("bcrypt");

// Salt rounds for bcrypt password hashing (10 is recommended for good security/performance balance)
const SALT_ROUNDS = 10;

/**
 * User Registration Endpoint
 * 
 * POST /api/signup
 * 
 * Creates a new user account with hashed password.
 * 
 * Request body:
 * - email: User's email address (required, must be unique)
 * - password: User's password (required, will be hashed)
 * 
 * Response:
 * - 201: User created successfully
 * - 400: User creation failed (validation errors, duplicate email)
 */
router.post("/api/signup", async (req, res) => {
  try {
    console.log("📝 New user registration attempt:", { email: req.body?.email });
    
    // Hash the password with bcrypt for security
    const hashedPassword = await bcrypt.hash(req.body?.password, SALT_ROUNDS);
    
    // Create new user instance
    const user = new User({
      email: req.body?.email,
      password: hashedPassword,
    });
    
    // Save user to database
    const result = await user.save();
    console.log("✅ User created successfully:", { id: result._id, email: result.email });
    
    res.status(201).json({
      success: true,
      message: "User account created successfully!",
      userId: result._id
    });
    
  } catch (error) {
    console.error("❌ User registration failed:", error.message);
    
    // Handle specific error types
    if (error.code === 11000) {
      // Duplicate email error
      res.status(400).json({
        success: false,
        message: "Email address is already registered. Please use a different email.",
      });
    } else if (error.name === 'ValidationError') {
      // Validation error
      res.status(400).json({
        success: false,
        message: "Invalid user data. Please check your input and try again.",
      });
    } else {
      // Generic error
      res.status(500).json({
        success: false,
        message: "Server error occurred during registration. Please try again later.",
      });
    }
  }
});

/**
 * User Login Endpoint
 * 
 * PUT /api/login
 * 
 * Authenticates user credentials and provides login access.
 * 
 * Request body:
 * - email: User's email address
 * - password: User's plain text password (will be compared with stored hash)
 * 
 * Response:
 * - 200: Login successful
 * - 401: User not found
 * - 400: Incorrect password
 * - 500: Server error
 */
router.put("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt for email:", email);
    
    // Find user by email
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log("❌ Login failed: User not found for email:", email);
      return res.status(401).json({
        success: false,
        message: "No account found with this email address.",
      });
    }
    
    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      console.log("✅ Login successful for user:", email);
      res.status(200).json({
        success: true,
        message: "Login successful! Welcome to Traversal.",
        userId: user._id
      });
    } else {
      console.log("❌ Login failed: Incorrect password for email:", email);
      res.status(400).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }
    
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error occurred during login. Please try again later.",
    });
  }
});

// Export router for use in main server file
module.exports = router;
