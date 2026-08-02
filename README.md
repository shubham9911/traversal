# Traversal Web Application
![image](https://github.com/user-attachments/assets/b053d9ff-daa5-4b4a-9da3-3c56e8842d3b)

## Overview
Traversal is a comprehensive web application designed for interactive map-based pin management. Users can explore maps, place location pins, add detailed notes about their experiences, and manage their personal travel data through an intuitive dashboard interface.

## Features
- **Interactive Maps:** Powered by HERE Maps API with real-time navigation and geocoding
- **Pin Management:** Click anywhere on the map to create location pins with custom notes
- **Rich Text Editor:** Add detailed notes to pins using a full-featured text editor with formatting options
- **User Authentication:** Secure login and registration system with encrypted passwords
- **Data Persistence:** Automatic saving of pins and notes to local storage and database
- **Responsive Design:** Optimized for desktop and mobile devices
- **Search Functionality:** Find locations with autocomplete search suggestions
- **Dashboard Interface:** Centralized management of all pins and travel data

## Technologies Used
### Frontend
- **Angular 17+** - Modern web framework with TypeScript
- **Angular Material** - Material Design components for consistent UI
- **HERE Maps API** - Interactive mapping and geocoding services
- **NGX Editor** - Rich text editing for pin notes
- **SCSS** - Enhanced CSS with variables and mixins

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Web framework for RESTful API endpoints
- **MongoDB** - NoSQL database for user data storage
- **Mongoose** - MongoDB object modeling for Node.js
- **bcrypt** - Password hashing for security

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB database (local or Atlas)

### Local Development Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/shubham9911/traversal.git
   cd traversal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   - Create a `.env` file in the root directory
   - Add your MongoDB connection string
   - Add HERE Maps API key (get from HERE Developer Portal)

4. **Start the backend server:**
   ```bash
   node server.js
   ```

5. **Start the Angular development server:**
   ```bash
   npm start
   ```

6. **Access the application:**
   Open `http://localhost:4200` in your web browser

## Code Structure & Architecture

### Frontend (Angular)
```
src/app/
├── auth/               # User authentication components
├── dashboard/          # Main dashboard and pin management
├── map/               # HERE Maps integration
├── general/           # Shared/reusable components
└── material.module.ts # Angular Material configuration
```

### Backend (Node.js)
```
backend/
├── models/    # MongoDB data models
├── routes/    # API endpoint definitions
└── server.js  # Main server configuration
```

## API Endpoints
- `POST /api/signup` - User registration
- `PUT /api/login` - User authentication

## Usage Guide
1. **Registration/Login:** Create an account or sign in with existing credentials
2. **Explore the Map:** Use the interactive map to browse locations worldwide
3. **Create Pins:** Click anywhere on the map to create a new location pin
4. **Add Notes:** Use the rich text editor to document your experiences and thoughts
5. **Manage Pins:** View, edit, or delete pins through the dashboard interface
6. **Search Locations:** Use the search bar to quickly find specific places

## Contributing
We welcome contributions to improve Traversal! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper documentation and tests
4. **Commit your changes:** `git commit -m 'Add amazing feature'`
5. **Push to the branch:** `git push origin feature/amazing-feature`
6. **Open a Pull Request** with a detailed description of your changes

### Development Guidelines
- Follow the existing code style and documentation patterns
- Add comprehensive comments for complex logic
- Test your changes thoroughly before submitting
- Update documentation as needed

## Contact & Support
For questions, suggestions, or support:
- **Email:** [kmohan0910@gmail.com](mailto:kmohan0910@gmail.com)
- **Live Demo:** [https://traversal-fcfd8.web.app](https://traversal-fcfd8.web.app)
- **GitHub Issues:** Use the Issues tab for bug reports and feature requests

## License
This project is open source and available under the [MIT License](LICENSE).
