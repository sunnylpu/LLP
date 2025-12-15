# Language Learning Platform - MERN Stack Application

A full-stack language learning platform built with MongoDB, Express, React, and Node.js.

## Features

- User authentication (Register/Login)
- Course management
- Interactive lessons with audio support
- Text-to-Speech with clickable word translations (LibreTranslate via backend proxy)
- Vocabulary learning with progress tracking
- User dashboard with progress analytics
- Modern, responsive UI

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- CSS3 with modern styling

## Project Structure

```
LLP/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # API utilities
│   │   ├── styles/        # CSS files
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── config/                 # Configuration files
│   └── db.js              # MongoDB connection
├── models/                # Mongoose models
│   ├── User.js
│   ├── Course.js
│   ├── Lesson.js
│   └── Vocabulary.js
├── routes/                # API routes
│   ├── auth.js
│   ├── courses.js
│   ├── lessons.js
│   └── vocabulary.js
├── middleware/            # Middleware functions
│   └── auth.js           # JWT authentication
├── server.js             # Express server
├── package.json          # Backend dependencies
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the root directory:
```bash
cd LLP
```

2. Install backend dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/language-learning
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend server will run on `http://localhost:5001`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install frontend dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory (optional):
```env
REACT_APP_API_URL=http://localhost:5001/api
```

4. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create a course (Protected)

### Lessons
- `GET /api/lessons` - Get all lessons (optional: ?courseId=)
- `GET /api/lessons/:id` - Get single lesson
- `POST /api/lessons` - Create a lesson (Protected)

### Vocabulary
- `GET /api/vocabulary` - Get vocabulary words (optional filters: language, unit, difficulty)
- `GET /api/vocabulary/:id` - Get single vocabulary word
- `POST /api/vocabulary` - Create vocabulary word (Protected)
- `PUT /api/vocabulary/:id` - Update vocabulary word (Protected)

### Translation
- `POST /api/translate` - Proxy to LibreTranslate (body: `{ word, sourceLang, targetLang }`)

## Usage

1. Start MongoDB (if using local MongoDB):
```bash
mongod
```

2. Start the backend server:
```bash
npm start
```

3. Start the frontend (in a new terminal):
```bash
cd client
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Default Routes

- `/` - Home/Landing page
- `/login` - Login page
- `/dashboard` - User dashboard (requires authentication)

## Development

- Backend uses nodemon for auto-reload during development
- Frontend uses React's hot-reload feature
- CORS is enabled for development

## Notes

- Make sure MongoDB is running before starting the backend
- Update the JWT_SECRET in production
- Configure CORS settings for production deployment
- The application uses JWT tokens stored in localStorage for authentication
- Translation uses LibreTranslate through the backend proxy (`/api/translate`) to avoid browser CORS issues; ensure the backend can reach https://libretranslate.de

## License

ISC

