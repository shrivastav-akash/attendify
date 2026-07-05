# Attendify | Smart Attendance Tracker

**Attendify** is a modern MERN stack application that helps students manage their
academic attendance with precision. Track your courses, calculate attendance
percentages, and know exactly how many classes you can skip — or need to attend —
to stay above your target.

## 🚀 Features

- **Authentication**: Email/password signup & login plus **Google Sign-In (OAuth)**,
  with stateless JWT sessions and bcrypt-hashed passwords.
- **Smart Dashboard**: Visual overview of all courses with color-coded attendance.
- **Attendance Logic**:
  - **"Skip?"** — how many classes you can safely miss while staying above your target (default 75%).
  - **"Attend?"** — how many classes you _must_ attend to reach your target.
  - **On Duty (OD)** — counts as attended without penalizing your total in the standard way.
- **Course Management**: Add, edit, and delete courses with ease.
- **Profile Management**: Update your details and university information.
- **Theme System**: Fully functional **Dark** and **Light** modes.
- **Responsive Design**: Optimized for mobile, tablet, laptop, and desktop.

## 🛡️ Security & Reliability

- **Password hashing** with bcrypt — passwords are never stored in plain text.
- **JWT authentication** with a configurable expiry (default 7 days).
- **Rate limiting** on auth and API routes (`express-rate-limit`) to blunt abuse.
- **Helmet** security headers and a configurable **CORS** allow-list.
- **Input validation** and NoSQL-injection guards on all write endpoints.
- **Structured logging** (`pino`) with a central error handler; sensitive headers
  are redacted from logs.
- **Per-user data isolation** — you can only see and manage your own courses.

## 🛠️ Tech Stack

### Frontend

- **React (Vite)** — fast, modern UI.
- **React Router DOM** — client-side routing.
- **@react-oauth/google** — Google Sign-In integration.
- **Axios** — HTTP client for API communication.
- **CSS3 (custom properties)** — lightweight theming system.

### Backend

- **Node.js & Express** — REST API.
- **MongoDB & Mongoose** — data modeling and persistence.
- **JWT** — stateless authentication.
- **bcryptjs** — password hashing.
- **google-auth-library** — Google ID-token verification.
- **helmet, express-rate-limit, cors** — security middleware.
- **pino / pino-http** — structured logging.

## ⚙️ Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or an Atlas connection string)
- A [Google OAuth 2.0](https://console.cloud.google.com/) Web client ID

### 1. Clone the repository

```bash
git clone https://github.com/shrivastav-akash/attendify.git
cd attendify
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `server/.env` file (see `server/.env.example`):

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_32_chars_min   # openssl rand -base64 48
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
# Optional
PORT=5000
JWT_EXPIRES_IN=7d
CLIENT_ORIGINS=http://localhost:5173
```

Start the backend:

```bash
npm run dev      # development (nodemon)
# or
npm start        # production
```

### 3. Frontend setup

```bash
cd ../client
npm install
```

Create a `client/.env` file (see `client/.env.example`):

```env
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

> In local dev, `VITE_API_URL=/api` is proxied to the backend on port 5000
> (see `client/vite.config.js`). In production, set it to your deployed backend
> URL + `/api`.

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173` (or the port shown in your terminal).

## 📡 API Endpoints

### Auth

- `POST /api/auth/signup` — Register a new user.
- `POST /api/auth/login` — Authenticate and receive a JWT.
- `POST /api/auth/google` — Sign in / sign up with a Google ID token.
- `GET /api/auth/me` — Get the current user (requires auth).

### Courses

- `GET /api/courses` — Fetch the logged-in user's courses.
- `POST /api/courses` — Add a course.
- `PUT /api/courses/:id` — Update a course.
- `DELETE /api/courses/:id` — Delete a course.

### Users

- `PUT /api/users/profile` — Update profile details.

## 👨‍💻 Developer

Developed by **Akash**.

- [LinkedIn](https://www.linkedin.com/in/shrivastavakash/)
- [Email](mailto:shrivastav.work@gmail.com)
