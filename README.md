# StudAI 🎓

> **Your intelligent, AI-powered study companion.** Effortlessly summarize notes, generate smart flashcards, test your knowledge with AI-driven quizzes, master your coursework with real-time collaboration, and track your study progress with gamified streaks.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Here-blue)](https://stud-ai-lilac.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Live-green)](https://studai-52kh.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📹 Video Presentation

**[Watch our 5-minute project demonstration here](https://drive.google.com/file/d/1FDURiNO5zWqRyY63vUKYrWavAuqgIChJ/view?usp=sharing)

This video showcases:
- Complete platform walkthrough
- Key features in action
- AI-powered study tools demonstration
- Real-time collaboration features
- Study tracking and analytics
- Technical architecture overview

---

## 👥 Team Members

| Name | CTC ID | Role |
|------|--------|------|
| **Dagaga Desta Bekele** | CTC 039-26 | Backend Developer|
| **Amen Teshome Regasa** | CTC 4868-26 | Full Stack Developer |
| **Bereket Teshome Wakshume** | CTC 4347-26 | Frontend Developer |
| **Amanuel Legesse Tiruneh** | CTC 4868-26 | Frontend Developer |
| **Tilahun Berga** | CTC 1029-26 | Testing & Documentation |
| **Elsabeth Berhanu** | CTC 1036-26 | Testing & Documentation |

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Architecture](#-architecture)
5. [Getting Started](#-getting-started)
6. [API Documentation](#-api-documentation)
7. [Deployment](#-deployment)
8. [Project Structure](#-project-structure)
9. [Contributing](#-contributing)
10. [License](#-license)

---

## 🎯 Project Overview

### Purpose
StudAI is a comprehensive educational platform designed to revolutionize the way students learn and collaborate. By leveraging cutting-edge AI technology and real-time features, we transform static study materials into interactive, engaging learning experiences.

### Problem Statement
Traditional studying methods are:
- Time-consuming and inefficient
- Lack personalization and immediate feedback
- Don't facilitate effective collaboration
- Fail to track progress and maintain motivation

### Our Solution
StudAI provides an all-in-one platform that:
- **Automates** content summarization and quiz generation
- **Personalizes** learning with AI-powered tutoring
- **Gamifies** study habits with streaks and analytics
- **Enables** real-time collaboration through study groups
- **Tracks** progress with comprehensive analytics

---

## ✨ Key Features

### 🤖 AI-Powered Learning Tools

#### 1. Intelligent PDF Processing
- **Automated Summarization**: Upload lecture notes or textbooks and get instant, concise summaries
- **RAG-Based Chat**: Ask questions about your materials and get contextual, accurate answers
- **Smart Highlights**: AI-suggested important sections and key concepts

#### 2. Dynamic Quiz Generation
- **Multi-Format Questions**: True/False, Multiple Choice, Short Answer, and Essay questions
- **Difficulty Levels**: Easy, Medium, and Hard based on your proficiency
- **Instant Feedback**: Get explanations for correct and incorrect answers
- **Topic-Based Quizzes**: Generate quizzes for specific chapters or concepts

#### 3. AI Flashcard Creation
- **Auto-Generated Cards**: Automatically extract key terms and concepts
- **Spaced Repetition**: Smart review scheduling based on your performance
- **Interactive Review**: Swipe through cards with immediate feedback

### 📚 Study Management

#### 4. Course Organization
- **University Integration**: Browse courses by university, department, and curriculum
- **Material Management**: Upload, organize, and track all your study materials
- **Progress Tracking**: Monitor completion status for each course and material

#### 5. Personal Study Dashboard
- **Activity Overview**: See your recent uploads, quizzes, and study sessions
- **Upcoming Events**: Track deadlines, exams, and study sessions
- **Quick Actions**: Access frequently used features instantly

### 📊 Analytics & Progress Tracking

#### 6. Comprehensive Analytics
- **Performance Metrics**: Quiz scores, study time, and topic mastery
- **Weak Topic Identification**: AI identifies areas needing improvement
- **Progress Visualization**: Charts and graphs showing your learning journey
- **Comparative Analysis**: See how you perform across different subjects

#### 7. Study Sessions & Streaks (NEW ✨)
- **Time Tracking**: Monitor how long you study each day
- **Pomodoro Timer**: Built-in 25/5 minute work/break cycles
- **Streak Gamification**: Maintain daily study streaks for motivation
- **Study Calendar**: Heatmap visualization of your study patterns
- **Statistics Dashboard**: Daily, weekly, and monthly study insights

### 🔖 Smart PDF Features

#### 8. PDF Bookmarks (NEW ✨)
- **Quick Navigation**: Save important pages for instant access
- **Color Coding**: Organize bookmarks by topic or importance (6 colors)
- **Text Selection**: Bookmark specific passages with context
- **Notes**: Add personal notes to each bookmark
- **Cross-PDF Search**: Find bookmarks across all your materials

### 👥 Collaboration Features

#### 9. Study Groups (NEW ✨)
- **Real-Time Chat**: Instant messaging with Socket.IO
- **Group Creation**: Create subject-specific study groups
- **Invite System**: Simple 8-character invite codes
- **Note Sharing**: Share your notes with group members
- **Typing Indicators**: See who's actively participating
- **Role Management**: Admin controls for group organization
- **Member Limits**: Up to 50 students per group

### 🔐 User Management

#### 10. Secure Authentication
- **Email/Password**: Traditional signup with email verification
- **Google OAuth**: One-click sign in with Google
- **Password Recovery**: Secure reset via email tokens
- **JWT Tokens**: Secure, stateless authentication
- **Refresh Tokens**: Extended sessions without re-login

#### 11. Profile Management
- **Academic Profile**: University, department, year, and semester
- **Course Selection**: Choose your enrolled courses
- **Settings**: Customize notifications and preferences
- **Account Security**: Update password and manage sessions

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Real-Time**: Socket.IO Client
- **HTTP Client**: Axios
- **PDF Viewer**: React-PDF
- **Charts**: Recharts
- **Routing**: React Router v6
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js (v24.x)
- **Framework**: Express.js
- **Language**: JavaScript (ES Modules)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Caching**: Redis
- **Real-Time**: Socket.IO
- **Authentication**: JWT + Google OAuth
- **Email**: Nodemailer
- **File Upload**: Multer
- **PDF Processing**: pdf.js
- **AI Models**: Google Gemini API
- **Embeddings**: Xenova Transformers
- **Deployment**: Render

### AI & ML
- **Language Model**: Google Gemini 1.5 Pro
- **Embeddings**: all-MiniLM-L6-v2
- **Vector Search**: PostgreSQL pgvector
- **RAG System**: Custom implementation with chunking

### Infrastructure
- **Database Hosting**: Neon (PostgreSQL)
- **Cache**: Redis Cloud
- **Backend Hosting**: Render
- **Frontend Hosting**: Vercel
- **Version Control**: Git & GitHub
- **CI/CD**: Automated via Vercel & Render

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │   Courses    │  │  Study Tools  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS / WebSocket
┌───────────────────────┴─────────────────────────────────────┐
│                    Backend API (Express)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │   Materials  │  │   AI/RAG     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Quizzes   │  │   Analytics  │  │ Study Groups │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
│  PostgreSQL  │ │    Redis    │ │ Gemini API │
│    (Neon)    │ │   (Cache)   │ │    (AI)    │
└──────────────┘ └─────────────┘ └────────────┘
```

### Database Schema Highlights

**Core Entities:**
- Student (User accounts & profiles)
- University → Department → Curriculum → Course
- CourseMaterial (PDFs, documents)
- MaterialChunk (Vector embeddings for RAG)
- Note, Flashcard, Quiz, Exam
- StudySession, StudyStreak, Bookmark
- StudyGroup, GroupMessage, GroupMember

### Real-Time Architecture (Socket.IO)

- **Authentication**: JWT-based socket authentication
- **Rooms**: Student-specific and group-specific rooms
- **Events**: Message broadcasting, typing indicators, member updates
- **Scaling**: Redis adapter for horizontal scaling

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Redis server
- Google Gemini API key
- Gmail account for emails (or SMTP server)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/degagadesta/StudAI.git
cd StudAI
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed database with sample data
npx prisma db seed

# Start development server
npm run dev
```

**Backend runs on:** `http://localhost:3000`

#### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Update VITE_API_URL to match your backend

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

### Environment Variables

#### Backend `.env`

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT Secrets
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI
GEMINI_API_KEY="your-gemini-api-key"

# Email (Gmail)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# Redis
REDIS_URL="redis://localhost:6379"

# Frontend URL
FRONTEND_URL="http://localhost:5173"
```

#### Frontend `.env`

```env
VITE_API_URL="http://localhost:3000"
```

---

## 📡 API Documentation

### Authentication Endpoints

```
POST   /api/v1/auth/register              Register new user
POST   /api/v1/auth/login                 Login with credentials
POST   /api/v1/auth/google                Google OAuth login
POST   /api/v1/auth/refresh               Refresh access token
POST   /api/v1/auth/logout                Logout user
GET    /api/v1/auth/verify-email          Verify email
POST   /api/v1/auth/forgot-password       Request password reset
POST   /api/v1/auth/reset-password        Reset password
```

### Study Materials

```
GET    /api/v1/student/pdfs               Get all materials
POST   /api/v1/student/pdfs/upload        Upload PDF
GET    /api/v1/student/pdfs/:id           Get material details
DELETE /api/v1/student/pdfs/:id           Delete material
GET    /api/v1/student/pdfs/:id/file      Download PDF file
```

### AI Features

```
POST   /api/v1/student/ai/summarize       Generate summary
POST   /api/v1/student/ai/chat            RAG-based chat
POST   /api/v1/student/ai/flashcards      Generate flashcards
POST   /api/v1/student/ai/quiz            Generate quiz
```

### Study Sessions (NEW)

```
POST   /api/v1/student/study-sessions/start            Start session
POST   /api/v1/student/study-sessions/:id/end          End session
GET    /api/v1/student/study-sessions/active           Get active session
POST   /api/v1/student/study-sessions/:id/pomodoro     Increment pomodoro
GET    /api/v1/student/study-sessions/history          Get history
GET    /api/v1/student/study-sessions/stats            Get statistics
GET    /api/v1/student/study-sessions/streak           Get streak info
GET    /api/v1/student/study-sessions/calendar         Get calendar data
```

### Bookmarks (NEW)

```
POST   /api/v1/student/materials/:id/bookmarks    Create bookmark
GET    /api/v1/student/materials/:id/bookmarks    Get material bookmarks
GET    /api/v1/student/bookmarks                  Get all bookmarks
GET    /api/v1/student/bookmarks/:id              Get bookmark
PATCH  /api/v1/student/bookmarks/:id              Update bookmark
DELETE /api/v1/student/bookmarks/:id              Delete bookmark
```

### Study Groups (NEW)

```
POST   /api/v1/student/study-groups                Create group
GET    /api/v1/student/study-groups                Get my groups
POST   /api/v1/student/study-groups/join           Join via invite code
GET    /api/v1/student/study-groups/:id            Get group details
PATCH  /api/v1/student/study-groups/:id            Update group
DELETE /api/v1/student/study-groups/:id            Delete group
POST   /api/v1/student/study-groups/:id/leave      Leave group
GET    /api/v1/student/study-groups/:id/messages   Get messages
POST   /api/v1/student/study-groups/:id/notes      Share note
GET    /api/v1/student/study-groups/:id/notes      Get shared notes
```

**Full API documentation:** See `backend/StudAI-Postman-Collection.json`

---

## 🌐 Deployment

### Live URLs

- **Frontend**: https://stud-ai-lilac.vercel.app
- **Backend**: https://studai-52kh.onrender.com

---

## 📂 Project Structure

```
StudAI/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema
│   │   └── migrations/                # Migration files
│   ├── src/
│   │   ├── config/                    # Configuration
│   │   ├── lib/                       # Core libraries (Prisma, Redis, etc)
│   │   ├── middlewares/               # Auth, cache, error handling
│   │   ├── modules/                   # Feature modules
│   │   │   ├── auth/                  # Authentication
│   │   │   ├── course/                # Course management
│   │   │   ├── pdf/                   # PDF processing
│   │   │   ├── ai/                    # AI features
│   │   │   ├── studySession/          # Study tracking (NEW)
│   │   │   ├── bookmark/              # PDF bookmarks (NEW)
│   │   │   └── studyGroup/            # Study groups (NEW)
│   │   ├── routes/                    # Route definitions
│   │   ├── sockets/                   # Socket.IO handlers
│   │   └── utils/                     # Utility functions
│   ├── uploads/                       # Uploaded files
│   ├── app.js                         # Express app setup
│   ├── server.js                      # Server entry point
│   └── package.json
│
├── Frontend/
│   ├── src/       
│   │   ├── api/                # API client functions
│   │   ├── components/                # Reusable components
│   │   ├── contexts/                  # React contexts
│   │   ├── hooks/                     # Custom hooks
│   │   ├── pages/                     # Page components
│   │   ├── services/                  # Service layer
│   │   ├── utils/                     # Utility functions
│   │   ├── App.tsx                    # Root component
│   │   └── main.tsx                   # Entry point
│   ├── public/                        # Static assets
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── docs/
│   ├── IMPLEMENTATION_SUMMARY.md      # Backend implementation details
│   ├── FRONTEND_IMPLEMENTATION_PLAN.md # Frontend development guide
│   ├── MIGRATION_GUIDE.md             # Database migration guide
│   └── API_DOCUMENTATION.md           # Comprehensive API docs
│
├── docker-compose.yml                 # Docker orchestration
└── README.md                          # This file
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini API** for powering our AI features
- **Neon** for database hosting
- **Render** & **Vercel** for deployment platforms
- All open-source libraries and frameworks used

---

## 📧 Contact & Support

For questions, issues, or suggestions:

- **GitHub Issues**: [Create an issue](https://github.com/degagadesta/StudAI/issues)
- **Email**: [Contact team lead](mailto:degagadesta840@gmail.com)
- **Demo**: [Live Demo](https://stud-ai-lilac.vercel.app)

---


**Built with ❤️ by the StudAI Team**

*Empowering students to learn smarter, not harder.*
