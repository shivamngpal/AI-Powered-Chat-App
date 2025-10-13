# 💬 Real-Time Chat Application

A full-stack real-time chat app with authentication, instant messaging, and online status tracking.

**Tech Stack:** React, Node.js, Express, MongoDB, Socket.IO

---

## ✨ Features

- 🔐 User authentication (JWT + bcrypt)
- � Real-time messaging with Socket.IO
- 👥 Online/offline status indicators
- 📱 Clean, responsive UI
- 💾 Message history persistence

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
│   │   ├── components/  # UI components
│   │   ├── context/     # Auth & Socket context
│   │   └── pages/       # Login, Signup, Chat
│   └── package.json
│
└── server/              # Node.js backend
    ├── controllers/     # Business logic
    ├── models/          # MongoDB schemas
    ├── routes/          # API routes
    ├── socket/          # Socket.IO logic
    └── package.json
```

---

## � API Endpoints

| Method | Endpoint                 | Description   |
| ------ | ------------------------ | ------------- |
| POST   | `/api/auth/signup`       | Register user |
| POST   | `/api/auth/signin`       | Login user    |
| POST   | `/api/auth/logout`       | Logout user   |
| GET    | `/api/users`             | Get all users |
| GET    | `/api/messages/:id`      | Get messages  |
| POST   | `/api/messages/send/:id` | Send message  |

---

## 🧪 Testing

1. Register two users in separate browser windows
2. Login with both accounts
3. See green dot indicating online status
4. Send messages - they appear instantly!

---

## 🚀 Future Features

- [ ] Typing indicators
- [ ] Group chats
- [ ] File sharing
- [ ] Message reactions
- [ ] AI chatbot integration

---

## ‍💻 Author

**Shivam Nagpal**

- GitHub: [@shivamngpal](https://github.com/shivamngpal)

---

**Built with ❤️ using React, Node.js, and Socket.IO**
