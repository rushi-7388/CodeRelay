# CodeRelay - Real-time Collab Code Platform

**Real-time Collab Code Platform** (Resume Description)

CodeRelay is a comprehensive, full-stack platform designed for seamless collaborative coding and technical interviews. It enables users to solve Data Structures and Algorithms (DSA) problems together in real-time, featuring integrated video calls, chat, and a synchronized code editor.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

## 🚀 Key Features

*   **Real-time Collaboration**: Synchronized code editor (Monaco), live video, and audio calls using Stream SDK.
*   **Interactive Coding Environment**: Execute code directly within the browser with instant feedback.
*   **Comprehensive Problem Library**: specific DSA problems with difficulty levels and categories.
*   **Session Management**: Create instant coding sessions, invite peers, and track session history.
*   **Secure Authentication**: Robust user management via Clerk.
*   **Modern UI/UX**: Responsive design built with Tailwind CSS v4 and DaisyUI v5.
*   **Scalable Backend**: RESTful API with Node.js/Express and MongoDB.

## 🛠️ Tech Stack

**Frontend:**
*   **Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS v4, DaisyUI v5
*   **State Management:** TanStack Query
*   **Editor:** Monaco Editor
*   **Real-time:** Stream SDK (Video & Chat)
*   **Auth:** Clerk

**Backend:**
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (Mongoose)
*   **Background Jobs:** Inngest
*   **Auth:** Clerk Webhooks

## 📦 Installation & Setup

Prerequisites: Node.js (v18+) and npm.

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
Copy `backend/.env.example` to `backend/.env` and fill in real values.

Start the server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
Copy `frontend/.env.example` to `frontend/.env` and fill in real values.

Start the client:
```bash
npm run dev
```

## 🔐 Environment variables (production mapping)

### Backend (Render/Fly/your host)
- **Required**:
  - **DB_URL**: MongoDB connection string (MongoDB Atlas recommended)
  - **CLIENT_URL**: frontend origin (Vercel URL), e.g. `https://your-app.vercel.app`
  - **CLERK_WEBHOOK_SECRET**: Clerk webhook signing secret (if webhooks enabled)
  - **STREAM_API_KEY / STREAM_API_SECRET**: Stream credentials (video/chat)
- **Payments (if enabled)**:
  - **STRIPE_SECRET_KEY**
  - **STRIPE_WEBHOOK_SECRET**
- **Jobs (optional)**:
  - **INNGEST_EVENT_KEY**
  - **INNGEST_SIGNING_KEY**
- **AI**:
  - **AI_PROVIDER**: `anthropic` (recommended) / `openai` / `custom`
  - **ANTHROPIC_API_KEY**: when `AI_PROVIDER=anthropic`
  - **OPENAI_API_KEY**: when `AI_PROVIDER=openai`
  - **AI_CUSTOM_ENDPOINT**: when `AI_PROVIDER=custom`
  - **AI_MODEL**: optional model override

### Frontend (Vercel)
- **Required**:
  - **VITE_CLERK_PUBLISHABLE_KEY**
  - **VITE_API_URL**: backend API base URL (include `/api`)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
