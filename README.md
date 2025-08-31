# Traversal Core - Full Stack Boilerplate

A modern, production-ready boilerplate for building full-stack web applications with Angular 18 frontend and Node.js backend.

## 🚀 Features

### Frontend (Angular 18)
- **Angular 18** - Latest version with modern features
- **Angular Material** - Material Design components for consistent UI
- **Authentication System** - Complete login/register functionality  
- **Responsive Dashboard** - Clean, extensible dashboard template
- **TypeScript** - Type-safe development
- **SCSS** - Enhanced CSS with variables and mixins

### Backend (Node.js)
- **Express.js** - Fast, minimalist web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **User Authentication** - Password hashing with bcrypt
- **CORS Support** - Cross-Origin Resource Sharing enabled
- **Error Handling** - Comprehensive error management
- **Environment Variables** - Secure configuration management

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB database (local installation or Atlas cloud)

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd traversal-core
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/traversal-core
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Server Configuration
PORT=3000

# Add other environment variables as needed
# JWT_SECRET=your-jwt-secret
# API_KEY=your-api-key
```

### 4. Start the backend server
```bash
node server.js
```

### 5. Start the Angular development server
```bash
npm start
```

### 6. Access the application
Open `http://localhost:4200` in your web browser

## 🏗️ Project Structure

```
traversal-core/
├── backend/                 # Node.js backend
│   ├── models/             # MongoDB data models
│   └── routes/             # API endpoint definitions
├── src/                    # Angular frontend
│   └── app/
│       ├── auth/           # Authentication components
│       ├── dashboard/      # Main dashboard
│       ├── general/        # Shared components
│       └── material.module.ts
├── server.js              # Main server file
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🔧 Available Scripts

- `npm start` - Start Angular development server
- `npm run build` - Build the Angular app for production
- `npm test` - Run Angular unit tests
- `node server.js` - Start the backend server

## 🔐 API Endpoints

- `POST /api/signup` - User registration
- `PUT /api/login` - User authentication

## 🎨 Customization

### Adding New Features
1. Create new Angular components in appropriate directories
2. Add new API routes in `backend/routes/`
3. Create database models in `backend/models/`
4. Update the dashboard with new navigation items

### Styling
- Modify `src/app/dashboard/dashboard.component.scss` for dashboard styles
- Update `src/app/material.module.ts` to add new Material components
- Customize the Angular Material theme in `src/styles.scss`

### Backend Extensions
- Add middleware in `server.js`
- Create new route files in `backend/routes/`
- Extend user models in `backend/models/`

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- CORS configuration for cross-origin requests
- Environment variable support for sensitive data
- Input validation and error handling

## 🚀 Production Deployment

### Frontend Build
```bash
npm run build
```

### Environment Variables
Make sure to set production environment variables:
- `MONGODB_URI` - Production database connection
- `NODE_ENV=production`
- Any API keys or secrets

### Database Setup
Ensure your MongoDB database is accessible and properly configured for production use.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Development Guidelines

- Follow Angular and Node.js best practices
- Use TypeScript for type safety
- Add proper error handling
- Write clear, commented code
- Test your changes thoroughly

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For questions, suggestions, or support:
- Create an issue in the GitHub repository
- Check the documentation for common setup issues
- Review the code examples for implementation guidance

---

Built with ❤️ using Angular 18 and Node.js