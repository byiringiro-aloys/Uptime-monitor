# 📊 Uptime Monitor

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.0.0-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-7.0.0-green.svg)
![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)

> A robust, real-time website uptime monitoring solution built with the MERN stack. Track status, get instant alerts, and analyze uptime history.

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## ✨ Features

- **⚡ Real-time Monitoring**: Tracks website status changes instantly using Socket.io.
- **📈 Detailed Analytics**: View response times, uptime percentages, and incident history.
- **🛡️ Secure Authentication**: JWT & bcrypt for secure signup/login, plus **2FA (TOTP)** for extra security.
- **📧 Instant Notifications**: Get alerted immediately via email (powered by Resend) when a monitor goes down.
- **🚥 Rate Limiting**: Intelligent API protection against abuse.
- **📱 Responsive Design**: Modern, mobile-first UI built with Tailwind CSS.

## 🛠️ Tech Stack

### Backend
- **Core**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Real-time**: Socket.io
- **Utilities**: Node Cron, Resend (Email), Passport/JWT

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State/Routing**: React Router, Context API
- **Charts**: Recharts

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/Uptime-monitor.git
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

#### Backend (.env)
Create `backend/.env` from `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uptime-monitor
JWT_SECRET=your_secure_jwt_secret
RESEND_API_KEY=your_resend_api_key
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
Create `frontend/.env` from `.env.example`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### Running Locally

1.  **Start Backend**
    ```bash
    cd backend
    npm run dev
    ```

2.  **Start Frontend**
    ```bash
    cd frontend
    npm start
    ```
    Visit `http://localhost:3000` to view the app.

## 📂 Project Structure

```
Uptime-monitor/
├── backend/            # API & Server Logic
│   ├── config/         # DB & App Config
│   ├── middleware/     # Security & Validation
│   ├── models/         # DB Schemas
│   ├── routes/         # API Endpoint Definitions
│   ├── services/       # Core Business Logic
│   └── server.js       # Entry Point
│
└── frontend/           # React UI
    ├── src/
        ├── components/ # Reusable UI Elements
        ├── pages/      # Application Views
        └── context/    # Global State Management
```

## 🔐 Security

- **Helmet**: Secures HTTP headers.
- **CORS**: Configured to restrict access to trusted origins.
- **Input Sanitization**: Defends against NoSQL injection.
- **Bcrypt**: Industry-standard password hashing.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## ⭐️ Show your support

Give a ⭐️ if this project helped you!
