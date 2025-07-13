# URL Shortener

A full-stack URL shortening service built with Node.js without using any frameworks, featuring user authentication, session management, and a modern web interface. Users can shorten long URLs, manage their shortened links, and track their usage.

## Features

- **URL Shortening**: Convert long URLs into short, shareable links
- **User Authentication**: Register and login functionality with JWT tokens
- **User Dashboard**: View and manage all your shortened URLs
- **Session Persistence**: Stay logged in across browser sessions
- **Modern UI**: Clean, responsive interface with tabbed navigation
- **Copy to Clipboard**: One-click copying of shortened URLs
- **URL Validation**: Client-side and server-side URL format validation
- **Anonymous Usage**: Create short URLs without registration
- **Secure**: Password hashing with bcrypt and JWT token authentication

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **SQLite3**: Database for storing URLs and user data
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcrypt**: Password hashing
- **dotenv**: Environment variable management

### Frontend
- **Vanilla JavaScript**: Client-side functionality
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **Session Storage**: Client-side token persistence

## 📁 Project Structure

```
url-shortner/
├── README.md                 # Project documentation
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
│
├── app.js                  # Main server entry point
├── router.js               # Request routing and static file serving
├── auth.js                 # Authentication logic (login/register)
├── shortener.js            # URL shortening and user URLs logic
│
├── db/                     # Database files
│   ├── init.js            # Database initialization script
│   ├── urls.db            # SQLite database file
│   ├── urls.json          # Legacy JSON storage (unused)
│   └── view.js            # Database viewing utility
│
└── public/                 # Frontend files
    ├── index.html         # Main HTML page with tabbed interface
    ├── script.js          # Client-side JavaScript
    └── styles.css         # CSS styling and responsive design
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pranav1326/url-shortner.git
   cd url-shortner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file and add your configuration:
   ```env
   SECRET_KEY=your-secret-key-here
   PORT=3000
   ```

4. **Initialize Database**
   ```bash
   node db/init.js
   ```

5. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Architecture & How It Works

### Database Schema

The application uses SQLite with two main tables:

**Users Table:**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**URLs Table:**
```sql
CREATE TABLE urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Authentication Flow

1. **Registration/Login**: Users provide email and password
2. **Password Hashing**: Passwords are hashed using bcrypt
3. **JWT Token**: Server generates a JWT token containing user ID and email
4. **Session Storage**: Frontend stores token in sessionStorage
5. **Request Authentication**: Token sent in Authorization header for protected routes

### URL Shortening Process

1. **Input Validation**: Client validates URL format
2. **Authentication Check**: Server checks for valid JWT token (optional)
3. **Code Generation**: Server generates unique 10-character code
4. **Database Storage**: URL and code stored with optional user association
5. **Response**: Server returns the shortened URL

### Request Routing

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/` | Serve main HTML page | No |
| GET | `/script.js` | Serve JavaScript file | No |
| GET | `/styles.css` | Serve CSS file | No |
| POST | `/register` | User registration | No |
| POST | `/login` | User login | No |
| POST | `/shorten` | Create short URL | Optional |
| GET | `/user-urls` | Get user's URLs | Required |
| GET | `/r/:code` | Redirect to original URL | No |

### Frontend Architecture

The frontend uses a **tabbed interface** with four main sections:

1. **Shorten URL Tab**: Main functionality for creating short URLs
2. **My URLs Tab**: Dashboard showing user's shortened URLs (requires login)
3. **Login Tab**: User authentication
4. **Register Tab**: New user registration

### Session Management

- **Token Storage**: JWT tokens stored in sessionStorage (cleared when browser closes)
- **Auto-Loading**: Tokens automatically loaded on page refresh
- **Header Injection**: Tokens included in Authorization header for API requests
- **Logout Functionality**: Tokens cleared from storage on logout

## User Interface Features

### Interactive Features
- **One-Click Copy**: Copy shortened URLs to clipboard
- **Auto-Redirect**: Automatic tab switching after login/registration
- **Form Validation**: Real-time validation with helpful error messages
- **Loading States**: Visual feedback during API requests

## Security Features

- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **JWT Authentication**: Stateless token-based authentication
- **Input Validation**: Both client-side and server-side validation
- **SQL Injection Prevention**: Parameterized queries with SQLite
- **CORS Considerations**: Proper header management
- **Session Security**: Tokens in sessionStorage (not localStorage)

## API Endpoints

### Authentication Endpoints

**POST /register**
```json
Request: { "email": "user@example.com", "password": "password123" }
Response: { "token": "jwt-token-here" }
```

**POST /login**
```json
Request: { "email": "user@example.com", "password": "password123" }
Response: { "token": "jwt-token-here" }
```

### URL Management Endpoints

**POST /shorten**
```json
Request: { "url": "https://example.com/very/long/url" }
Response: { "shortUrl": "http://localhost:3000/r/abc123xyz0" }
```

**GET /user-urls**
```json
Headers: { "Authorization": "Bearer jwt-token-here" }
Response: [
  {
    "id": 1,
    "url": "https://example.com",
    "code": "abc123xyz0",
    "user_id": 1,
    "created_at": "2025-07-14T..."
  }
]
```

## Development

### Code Organization

- **Modular Structure**: Separate files for different concerns
- **Clean Separation**: Frontend/backend logic clearly separated
- **Error Handling**: Comprehensive error handling throughout
- **Consistent Styling**: Unified code style and naming conventions

### Database Management

View database contents:
```bash
node db/view.js
```

Initialize/reset database:
```bash
node db/init.js
```
