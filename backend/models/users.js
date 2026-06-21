/**
 * User Model for Traversal Application
 * 
 * Defines the MongoDB schema for user accounts in the Traversal system.
 * Users can register and login to access the map-based pin management features.
 * 
 * Schema includes:
 * - email: Unique identifier for user login
 * - password: Hashed password for authentication (using bcrypt)
 * 
 * Features:
 * - Unique email validation
 * - Mongoose unique validator plugin
 */

const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

/**
 * User Schema Definition
 * 
 * Defines the structure for user documents in MongoDB.
 * All fields are required and email must be unique across all users.
 */
const userSchema = mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true, // Convert to lowercase for consistency
    trim: true // Remove whitespace
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6 // Minimum password length for basic security
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Add unique validation plugin to provide better error messages
userSchema.plugin(uniqueValidator, { 
  message: 'Email {VALUE} is already registered. Please use a different email.' 
});

/**
 * Export the User model
 * 
 * This model can be used to:
 * - Create new user accounts
 * - Find users by email for authentication
 * - Update user information
 * - Delete user accounts
 */
module.exports = mongoose.model("User", userSchema);
