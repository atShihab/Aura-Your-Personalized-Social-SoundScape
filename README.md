# SoundScape - Music Streaming Platform

A modern, full-stack music streaming application built with React, Node.js, and MongoDB. SoundScape provides a comprehensive music streaming experience with real-time features, social interactions, and artist management tools.

## 🎵 Features

### Core Music Features
- **Music Streaming**: High-quality audio streaming with playlist support
- **Playlist Management**: Create, edit, and share custom playlists
- **Search & Discovery**: Advanced search functionality for songs, artists, and albums
- **Music Library**: Personal music library with favorites and listening history

### Social Features
- **Real-time Chat**: Integrated chat system for user communication
- **Friend System**: Add friends and see their listening activity
- **Follow Artists**: Follow your favorite artists and get updates
- **Activity Feed**: See what friends are listening to in real-time

### Artist Tools
- **Artist Dashboard**: Comprehensive dashboard for music management
- **Upload Music**: Upload songs and albums with metadata
- **Analytics**: Track listening statistics and performance metrics
- **Content Management**: Manage your music catalog and profile

### Admin Features
- **Admin Dashboard**: Complete administrative control panel
- **User Management**: Manage users, artists, and content
- **Content Moderation**: Review and approve artist submissions
- **System Analytics**: Platform-wide statistics and insights

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **React Router** for navigation
- **Socket.io Client** for real-time features

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **Cloudinary** for media storage
- **Clerk** for authentication
- **Multer** for file uploads

### Key Libraries
- **Authentication**: Clerk
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.io
- **File Storage**: Cloudinary
- **UI Components**: Radix UI + Tailwind CSS

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Cloudinary account
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Amar_Gaan
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**

   Create `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   ADMIN_EMAIL=your_admin_email
   NODE_ENV=development
   
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

   Create `.env` file in the `frontend` folder:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

4. **Start the application**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
Amar_Gaan/
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── lib/           # Utility libraries
│   │   └── seeds/         # Database seeders
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand state stores
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── types/         # TypeScript type definitions
│   └── package.json
└── README.md
```

## 🎯 Key Features Implementation

### Real-time Features
- **Live Chat**: Socket.io integration for instant messaging
- **Listening Activity**: Real-time updates of what users are playing
- **Online Status**: Live user presence indicators

### Music Management
- **Audio Player**: Custom-built player with controls
- **Playlist System**: Create, edit, and share playlists
- **Search**: Advanced search with filters and suggestions

### User Experience
- **Responsive Design**: Mobile-first responsive layout
- **Dark Theme**: Modern dark theme throughout
- **Smooth Animations**: Framer Motion for fluid interactions

## 🔧 Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed:all` - Seed database with sample data

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Database Seeding
```bash
cd backend
npm run seed:genres    # Seed music genres
npm run seed:albums    # Seed sample albums
npm run seed:songs     # Seed sample songs
npm run seed:all       # Seed everything
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure Cloudinary for media storage
3. Set up Clerk for authentication
4. Deploy to your preferred platform (Heroku, Vercel, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please contact the development team.

---

**SoundScape** - The Future of Music Streaming 🎵