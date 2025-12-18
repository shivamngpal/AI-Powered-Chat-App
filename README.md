# 💬 Real-Time Chat Application

A full-stack real-time chat app with AI assistance, secure authentication, and instant messaging.

**Tech Stack:** React, Node.js, Express, MongoDB, Socket.IO, Gemini AI

---

## ✨ Features

### Core Functionality

- 💬 Real-time messaging with Socket.IO
- 👥 Online/offline status indicators
- ⌨️ Typing indicators
- 📷 Image & file sharing
- 😊 Emoji picker
- 💾 Persistent message history

### AI Integration

- 🤖 AI chatbot (Vach AI) powered by Google Gemini
- ⚡ Slash commands (`/ai`, `/summarize`, `/translate`, `/explain`, `/fix`, `/improve`)
- 💡 In-chat AI assistance without switching conversations

### Authentication & Security

- 🔐 JWT authentication with bcrypt password hashing
- 🔒 Secure password reset via email
- ✉️ Email verification with SendGrid
- 🛡️ Rate limiting & NoSQL injection protection
- ⚠️ Input validation & error handling

### User Experience

- 👤 User profiles with avatar upload
- 🔍 Search functionality
- 📱 Responsive design
- 🔌 Connection status monitoring

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- MongoDB

### Installation

**1. Clone & Install**

```bash
git clone "http://github.com/shivamngpal/AI-Powered-Chat-App"
cd chat-app

# Install backend
cd server
npm install

# Install frontend
cd ../client
npm install
```

**2. Setup Environment Variables**

Create `server/.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:3000
```

**3. Run the Application**

```bash
# Start backend (from server folder)
npm run dev

# Start frontend (from client folder)
npm run dev
```

**4. Open Browser**
Navigate to `http://localhost:3000`

---

## 📁 Project Structure

```
chat-app/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components (Messages, Emoji, Typing)
│   │   ├── context/     # Auth & Socket context
│   │   ├── pages/       # Login, Signup, Chat, Password Reset
│   │   └── utils/       # API utilities
│   └── package.json
│
└── server/              # Node.js backend
    ├── controllers/     # Auth, Messages, Users
    ├── models/          # MongoDB schemas
    ├── routes/          # API endpoints
    ├── services/        # AI service (Gemini)
    ├── utils/           # Slash commands, AI helpers
    ├── middleware/      # Security, Rate limiting
    └── socket/          # Real-time communication
```

---

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| POST   | `/api/auth/signup`          | Register user          |
| POST   | `/api/auth/signin`          | Login user             |
| POST   | `/api/auth/logout`          | Logout user            |
| POST   | `/api/auth/forgot-password` | Request password reset |
| POST   | `/api/auth/reset-password`  | Reset password         |
| GET    | `/api/users`                | Get all users          |
| GET    | `/api/messages/:id`         | Get messages           |
| POST   | `/api/messages/send/:id`    | Send message           |
| POST   | `/api/messages/upload`      | Upload file/image      |
| GET    | `/api/users`                | Get all users          |
| GET    | `/api/messages/:id`         | Get messages           |
| POST   | `/api/messages/send/:id`    | Send message           |

---

**Basic Chat**: Register two users, login, and exchange messages in real-time 2. **AI Commands**: Type `/ai What is React?` in any chat to test AI integration 3. **File Sharing**: Upload images using the attachment button 4. **Password Reset**: Test forgot password flow with email verification 5. **Status**: Check online/offline indicators and typing status

- [ ] File sharing
- [ ] Message reactions
- [ ] AI chatbot integration

---

## ‍💻 Author

**Shivam Nagpal**

- GitHub: [@shivamngpal](https://github.com/shivamngpal)

---

**Built with ❤️ using React, Node.js, and Socket.IO**
