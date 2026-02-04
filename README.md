# 📊 Uptime Monitor

A robust, real-time website uptime monitoring solution built with the MERN stack (MongoDB, Express, React, Node.js). This application allows users to track the status of their websites, receive instant notifications upon downtime, and view detailed historically uptime analytics.

## ✨ Features

- **Real-time Monitoring**: Tracks website status changes instantly using Socket.io.
- **Detailed Analytics**: View response times, uptime percentages, and incident history.
- **User Authentication**: Secure signup and login with JWT and bcrypt.
- **Two-Factor Authentication (2FA)**: Enhanced security using Time-based One-Time Passwords (TOTP).
- **Email Notifications**: Get alerted immediately via email when a monitor goes down (powered by Resend).
- **Rate Limiting**: Protects the API from abuse.
- **Responsive Design**: Modern UI built with Tailwind CSS, fully responsive across devices.

## 🛠️ Tech Stack

### Backend
- **Node.js**: Runtime environment.
- **Express**: Web framework.
- **MongoDB**: NoSQL database for storing user data and monitor logs.
- **Mongoose**: ODM for MongoDB.
- **Socket.io**: Real-time bidirectional event-based communication.
- **Node Cron**: Cron jobs for scheduled monitoring tasks.
- **Resend**: Email API for notifications.
- **Passport/JWT**: Authentication strategies.

### Frontend
- **React**: UI library.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **React Router**: Routing management.
- **Recharts**: Charting library for analytics visualization.
- **Socket.io Client**: Real-time client-side communication.
- **Lucide React**: Icon set.

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local user or Atlas connection string)
- **npm** or **yarn**

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd Uptime-monitor
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd ../frontend
    npm install
    ```

### Configuration

#### Backend Setup
1.  Navigate to the `backend` directory.
2.  Create a `.env` file based on the example:
    ```bash
    cp .env.example .env
    ```
3.  Update the variables in `.env`:
    - `MONGODB_URI`: Your MongoDB connection string.
    - `JWT_SECRET`: A secure random string for signing tokens.
    - `RESEND_API_KEY`: Your API key from Resend (for emails).
    - `FRONTEND_URL`: URL of your frontend (e.g., `http://localhost:3000`).

#### Frontend Setup
1.  Navigate to the `frontend` directory.
2.  Create a `.env` file based on the example:
    ```bash
    cp .env.example .env
    ```
3.  Update the variables in `.env`:
    - `REACT_APP_API_URL`: URL of your backend API (e.g., `http://localhost:5000`).

### Running the Application

1.  **Start the Backend Server**
    ```bash
    cd backend
    npm run dev
    ```
    The server will start on port 5000 (or your configured PORT).

2.  **Start the Frontend Development Server**
    ```bash
    cd frontend
    npm start
    ```
    The application will launch in your browser at `http://localhost:3000`.

## 📂 Project Structure

```
Uptime-monitor/
├── backend/            # Express server and API
│   ├── config/         # Database and app configuration
│   ├── middleware/     # Auth, rate limiting, and error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic (monitoring, email, cron)
│   └── server.js       # Entry point
│
└── frontend/           # React application
    ├── public/         # Static assets
    └── src/
        ├── components/ # Reusable UI components
        ├── pages/      # Route pages
        └── context/    # React context (Auth, etc.)
```

## 🔐 Security

- **Helmet**: Secures HTTP headers.
- **CORS**: Configured to allow trusted origins.
- **Input Sanitization**: Prevents NoSQL injection.
- **Bcrypt**: Hashes passwords.
- **Rate Limiting**: Prevents brute-force attacks.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
