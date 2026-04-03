# THRIFTY – SMART BUDGET MANAGER
## Full Project Report

**Submitted by:** [Your Name]
**Department:** [Your Department]
**Institution:** [Your College Name]
**Date:** March 2026

---

# TABLE OF CONTENTS

| Chapter | Topic | Page |
|---------|-------|------|
| 1 | Introduction | 5 |
| 2 | Literature Survey | 15 |
| 3 | System Requirements | 25 |
| 4 | System Design & Architecture | 35 |
| 5 | Database Design | 45 |
| 6 | Authentication Module | 55 |
| 7 | Transaction Module | 65 |
| 8 | Budget Planner Module | 75 |
| 9 | AI Financial Advisor Module | 85 |
| 10 | Gamification System | 95 |
| 11 | Reports & Analytics | 105 |
| 12 | Notification System | 115 |
| 13 | Security Implementation | 120 |
| 14 | Testing & Validation | 130 |
| 15 | Conclusion & Future Work | 140 |

---

---

# CHAPTER 1: INTRODUCTION

## 1.1 Overview of the Project

THRIFTY is a full-stack smart budget management web application designed to help individuals track their income and expenses, plan budgets, achieve financial goals, and receive AI-powered financial advice. The system is built using React.js on the frontend and Django on the backend, with SQLite as the local database.

The core purpose of THRIFTY is to simplify personal finance management. In today's fast-paced world, individuals often lose track of their spending habits, fail to set realistic financial goals, and lack timely alerts when budget thresholds are crossed. THRIFTY addresses all of these problems through an intuitive, feature-rich platform.

The application is designed to run entirely on a local development environment (localhost), making it suitable for personal use without the need for cloud hosting or external dependencies. It uses Google OAuth 2.0 for secure authentication and JWT tokens for session management.

THRIFTY provides a dashboard that gives users an instant overview of their financial health — including total income, total expenses, current balance, and spending trends. The gamification system encourages responsible financial behavior by rewarding users with points and badges for consistent tracking.

The AI Advisor module, powered by Ollama (deepseek-r1:1.5b), allows users to ask natural language questions about their finances and receive intelligent, data-driven responses. This makes the app suitable not just as a tracker but as a financial coach.

## 1.2 Problem Statement

Personal finance management is a critical skill that many individuals struggle with. The majority of people do not maintain proper records of their daily expenditures, which leads to unplanned debt, missed savings opportunities, and financial stress. Existing budgeting tools are often either too complex, expensive, or require internet access and cloud accounts, making them inaccessible to many users.

Specifically, the problems this project addresses are:

1. **Lack of real-time tracking**: Most people spend impulsively without any record-keeping.
2. **No budget alerts**: People are unaware when they exceed their monthly limits in specific categories.
3. **No personalized advice**: Generic financial tips do not apply to individual spending patterns.
4. **Manual and cumbersome tools**: Spreadsheets are error-prone and difficult to maintain.
5. **No motivation to save**: Without any reward system, users quickly abandon budget tracking habits.

This project aims to build a solution that directly confronts each of these pain points using modern web technologies, artificial intelligence, and thoughtful UX design.

## 1.3 Objectives

The primary objectives of the THRIFTY project are:

1. **To create a full-stack web application** for personal budget management using React.js and Django.
2. **To implement a secure authentication system** using Google OAuth 2.0 and JWT tokens.
3. **To design an intuitive transaction management module** that allows CRUD operations on income and expense entries.
4. **To develop a budget planning module** with real-time sync and visual overspending alerts.
5. **To integrate an AI financial advisor** that provides personalized recommendations using local AI models.
6. **To implement a gamification system** with points, levels, and achievement badges.
7. **To provide visual analytics** using charts and graphs for better financial insights.
8. **To build a notification system** for budget alerts, goal updates, and app announcements.
9. **To ensure data security and isolation** so each user can only access their own data.
10. **To make the system fully operable on localhost** without any cloud dependency.

## 1.4 Scope of the Project

The THRIFTY application covers the following scope:

**In Scope:**
- User registration and login via Google OAuth
- Income and expense transaction management
- Monthly budget planning and monitoring
- Financial goal setting and tracking
- AI-powered financial advisor chat
- Gamification with points and badges
- Charts and analytics dashboard
- In-app notification system
- Password reset via email
- PDF export of reports
- Fully functional on localhost (SQLite database)

**Out of Scope:**
- Bank account integration / automatic bank sync
- Mobile application (Android/iOS)
- Multi-currency live exchange rates
- Investment portfolio management
- Real-time blockchain-based transactions

The system is intended for individual users managing personal finances. It is not designed for businesses or enterprise-level accounting.

## 1.5 Organization of the Report

This report is organized into 15 chapters. Chapter 1 introduces the project, its background, objectives, and scope. Chapter 2 presents a literature survey of existing budget management systems and technologies. Chapter 3 covers system requirements including hardware, software, and functional/non-functional specifications. Chapters 4–5 describe the architecture and database design. Chapters 6–12 cover individual functional modules in detail. Chapter 13 explains security implementations. Chapter 14 presents testing methodologies and results. Chapter 15 concludes the report with future enhancement possibilities.

---

---

# CHAPTER 2: LITERATURE SURVEY

## 2.1 Existing Budget Management Systems

Several personal finance management tools exist in the market today. The most popular are Mint, YNAB (You Need A Budget), Personal Capital, and PocketGuard. Each of these tools has its own strengths but also significant limitations.

**Mint** (by Intuit): Mint automatically connects to bank accounts and credit cards to import transactions. However, it requires sharing sensitive banking credentials and is only available in the United States and Canada. It uses cloud storage, meaning user data is stored on external servers. Also, it is ad-supported, which some users find intrusive.

**YNAB (You Need A Budget)**: YNAB follows the zero-based budgeting philosophy. It is highly effective for disciplined budgeters but has a subscription fee of $14.99/month. It requires manual import or bank sync and has a steep learning curve for new users.

**Personal Capital**: This tool focuses on investment portfolio tracking and net worth analysis. It is well-suited for investors rather than everyday expense trackers. It is free for basic use but pushes users toward its paid financial advisor service.

**PocketGuard**: A simplified budgeting app that shows how much "safe to spend" money you have. However, it lacks deep analytics and goal-setting features.

Compared to these tools, THRIFTY is open-source, locally hosted, free to use, and integrates AI-driven advice without requiring cloud connectivity.

## 2.2 Review of Relevant Technologies

**React.js**: React is a JavaScript library for building user interfaces, maintained by Meta. It uses a component-based architecture and virtual DOM for efficient rendering. React's ecosystem includes tools like React Router (for navigation), Framer Motion (for animations), and Recharts (for data visualization), all of which are used in THRIFTY.

**Django REST Framework (DRF)**: Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design. DRF extends Django with tools for building RESTful APIs, including serializers, viewsets, and authentication backends. It provides built-in support for JWT-based authentication via the `djangorestframework-simplejwt` package.

**SQLite**: SQLite is a lightweight, serverless, self-contained relational database engine. It is the default database for Django projects and stores all data in a single `.sqlite3` file. It is ideal for development, prototyping, and single-user applications.

**Google OAuth 2.0**: OAuth 2.0 is an open standard for access delegation. Google's implementation allows users to sign in using their Google accounts without sharing passwords with third-party applications. It provides a JWT token (credential) that contains user information like email, name, and profile picture.

**JWT (JSON Web Tokens)**: JWT is a compact, URL-safe token format used for securely transmitting information between parties. THRIFTY uses JWT for session management — an access token (valid 60 minutes) and a refresh token (valid 1 day) are issued on login.

## 2.3 Review of AI in Personal Finance

Artificial Intelligence in personal finance has grown rapidly in the past decade. Robo-advisors like Betterment and Wealthfront use AI algorithms to manage investment portfolios. Chatbot-based advisors like Cleo and Olivia use Natural Language Processing (NLP) to answer questions about spending habits.

THRIFTY's AI Advisor uses **Ollama** — a lightweight, local AI model runner — with the **deepseek-r1:1.5b** model. This allows financial advice to be generated completely offline, ensuring privacy. The model analyzes the user's transaction history, budget limits, and goals to provide contextually relevant responses.

A rule-based fallback engine supplements the AI model, ensuring the advisor always responds meaningfully even when the AI model is unavailable.

## 2.4 Gamification in Finance Applications

Gamification refers to the application of game-design elements in non-game contexts to increase engagement. Studies have shown that gamification can increase user retention by up to 47% in productivity and finance apps (source: Gartner, 2020).

THRIFTY implements gamification through:
- **Points**: Awarded for every transaction logged
- **Badges**: Achievement rewards for milestones (first transaction, 10 transactions, 100 points)
- **Levels**: Progressive levels based on accumulated points
- **Progress bars**: Visual representation of level advancement

These elements motivate users to consistently track their finances rather than abandoning the habit after a few days.

## 2.5 Research Gap & Motivation

After reviewing existing tools and academic literature on personal finance, the following gaps were identified:

1. Most tools are cloud-dependent and not privacy-preserving.
2. No freely available tool combines budgeting + AI advice + gamification in a single platform.
3. Existing tools do not provide real-time overspending alerts with category-level color coding.
4. Local-first budgeting tools with modern UI/UX are virtually non-existent.

THRIFTY is motivated by these gaps and aims to be a holistic, privacy-first, AI-enhanced personal finance solution that anyone can run on their own computer.

---

---

# CHAPTER 3: SYSTEM REQUIREMENTS

## 3.1 Hardware Requirements

The following hardware is required to run THRIFTY on a local machine:

| Component | Minimum Requirement | Recommended |
|-----------|--------------------|----|
| Processor | Intel Core i3 / AMD Ryzen 3 | Intel Core i5 / AMD Ryzen 5 |
| RAM | 4 GB | 8 GB or more |
| Storage | 2 GB free space | 5 GB free space |
| Display | 1280 x 720 resolution | 1920 x 1080 Full HD |
| Network | Required only for Google OAuth | Broadband |
| GPU | Not required | Optional (for Ollama AI) |

For the AI Advisor using Ollama locally, a system with at least 8 GB RAM and a modern multi-core processor is recommended for smooth performance.

## 3.2 Software Requirements

The following software must be installed on the development machine:

**Operating System:**
- Windows 10/11 (primary development platform)
- Linux Ubuntu 20.04+ (supported)
- macOS 12+ (supported)

**Frontend Stack:**
- Node.js v18+ (LTS recommended)
- npm v9+
- Vite v5+
- React v19+

**Backend Stack:**
- Python 3.10+
- Django 6.0+
- Django REST Framework 3.15+
- djangorestframework-simplejwt 5.3+
- django-cors-headers 4.3+
- python-decouple 3.8+
- dj-database-url 2.1+
- PyJWT 2.8+

**Database:**
- SQLite 3 (bundled with Python — no separate install required)

**AI Module (Optional):**
- Ollama (local AI model runner)
- deepseek-r1:1.5b model

**Development Tools:**
- Visual Studio Code (recommended IDE)
- PowerShell (Windows) or Terminal (Linux/macOS)
- Git 2.40+
- Google Chrome / Firefox (latest)

## 3.3 Functional Requirements

Functional requirements describe what the system must do:

**Authentication:**
- FR-01: Users must be able to sign in with their Google account.
- FR-02: The system must issue JWT access and refresh tokens on successful login.
- FR-03: Users must be able to log out and have their session cleared.
- FR-04: Users must be able to reset their password via email.

**Transactions:**
- FR-05: Users must be able to add income and expense transactions.
- FR-06: Each transaction must include amount, category, type, description, and date.
- FR-07: Users must be able to edit and delete their transactions.
- FR-08: Transactions must be filterable by date, type, and category.

**Budget:**
- FR-09: Users must be able to set a monthly budget limit per category.
- FR-10: The system must calculate how much of each budget has been spent.
- FR-11: The system must color-code budgets based on spending percentage.
- FR-12: The system must alert users when a budget limit is exceeded.

**Goals:**
- FR-13: Users must be able to create financial goals with a target amount.
- FR-14: The system must track progress toward each goal.

**AI Advisor:**
- FR-15: Users must be able to ask natural language questions to the AI advisor.
- FR-16: The AI must respond with data-driven insights based on user transactions.

**Gamification:**
- FR-17: Users must earn points for each completed transaction.
- FR-18: The system must award badges based on predefined milestones.

## 3.4 Non-Functional Requirements

Non-functional requirements define the quality attributes of the system:

**Performance:**
- NFR-01: The dashboard should load within 2 seconds on localhost.
- NFR-02: API responses should return within 500ms under normal conditions.
- NFR-03: Charts and analytics should render within 1 second of data load.

**Security:**
- NFR-04: All API endpoints (except login) must require JWT authentication.
- NFR-05: User data must be isolated — users can only see their own data.
- NFR-06: Tokens must expire and be refreshed automatically.
- NFR-07: CORS must be restricted to localhost origins only.

**Usability:**
- NFR-08: The UI must be responsive and work on screens 1280px wide and above.
- NFR-09: All interactive elements must provide visual feedback within 200ms.
- NFR-10: Error messages must be clear and actionable.

**Reliability:**
- NFR-11: The system must handle invalid API inputs gracefully with proper error messages.
- NFR-12: The AI advisor must fall back to a rule-based engine if Ollama is unavailable.

**Maintainability:**
- NFR-13: Code must follow modular structure with separate components, context, and API layers.
- NFR-14: Environment variables must be used for all configuration values.

## 3.5 Use Case Diagram Description

The main actors in THRIFTY are:

1. **User (Authenticated)** — The primary actor who interacts with all features.
2. **Google OAuth Server** — External service that authenticates users.
3. **Django Backend** — Processes all API requests and business logic.
4. **SQLite Database** — Stores all persistent data.
5. **Ollama AI Engine** — Provides AI-generated financial advice.

**Key Use Cases:**
- UC-01: Login with Google
- UC-02: View Dashboard
- UC-03: Add Transaction
- UC-04: Edit / Delete Transaction
- UC-05: Set Budget
- UC-06: View Budget Status
- UC-07: Set Financial Goal
- UC-08: Chat with AI Advisor
- UC-09: View Badges & Points
- UC-10: View Notifications
- UC-11: Export Report as PDF
- UC-12: Logout

---

---

# CHAPTER 4: SYSTEM DESIGN & ARCHITECTURE

## 4.1 Overall System Architecture

THRIFTY follows a **client-server architecture** with clear separation of concerns between the frontend and backend:

```
┌──────────────────────────────────────────────┐
│         CLIENT LAYER (React + Vite)          │
│  Components → Context → Axios API → Routes  │
│              localhost:5173                  │
└─────────────────────┬────────────────────────┘
                      │ REST API (HTTP/JSON)
                      │ JWT Authorization Header
┌─────────────────────▼────────────────────────┐
│        SERVER LAYER (Django + DRF)           │
│  URLs → Views → Serializers → Models         │
│              localhost:8000                  │
└─────────────────────┬────────────────────────┘
                      │ ORM Queries
┌─────────────────────▼────────────────────────┐
│          DATA LAYER (SQLite)                 │
│            backend/db.sqlite3                │
└──────────────────────────────────────────────┘
```

This layered architecture ensures each component has a single responsibility and can be modified independently.

## 4.2 Frontend Architecture (React.js)

The frontend is built with React.js using the Vite build tool. The architecture follows a **component-based pattern** with a global state managed by React Context API.

**Folder Structure:**
```
src/
├── api/
│   └── axios.js          ← Axios instance + interceptors
├── components/
│   ├── Login.jsx          ← Google OAuth login UI
│   ├── Navbar.jsx         ← Navigation bar
│   ├── TransactionCard.jsx
│   └── BudgetCard.jsx
├── context/
│   └── AppContext.jsx     ← Global state (auth, transactions, budgets)
├── pages/
│   ├── Dashboard.jsx
│   ├── TransactionsPage.jsx
│   ├── BudgetPage.jsx
│   ├── GoalsPage.jsx
│   ├── AIAdvisorPage.jsx
│   └── ProfilePage.jsx
└── App.jsx               ← Router + AppProvider wrapper
```

**State Management:**
- React Context API (`AppContext`) manages global state
- Local component state (`useState`) handles UI-only state
- `localStorage` is used for token persistence

## 4.3 Backend Architecture (Django)

The backend follows Django's **MTV (Model-Template-View)** pattern, modified for REST API usage:

```
thrifty_backend/
├── settings.py      ← Configuration (CORS, JWT, DB, Email)
├── urls.py          ← Root URL router
└── wsgi.py          ← WSGI server entry point

users/
├── models.py        ← Database models
├── serializers.py   ← Data validation & formatting
├── views.py         ← Business logic & API handlers
├── urls.py          ← API endpoint routing
├── ai_service.py    ← Ollama AI integration
└── utils.py         ← Helper functions
```

**API Design:**
- RESTful API design principles followed
- All endpoints prefixed with `/api/`
- ViewSets used for CRUD operations (transactions, budgets, goals, badges)
- APIViews used for custom logic (Google login, AI advisor, support)

## 4.4 API Endpoint Design

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/users/google/ | Google OAuth login | No |
| POST | /api/users/register/ | Register new user | No |
| POST | /api/users/login/ | Username/password login | No |
| GET | /api/users/me/ | Get current user | Yes |
| PATCH | /api/users/me/ | Update user profile | Yes |
| GET | /api/users/transactions/ | List transactions | Yes |
| POST | /api/users/transactions/ | Create transaction | Yes |
| PATCH | /api/users/transactions/{id}/ | Update transaction | Yes |
| DELETE | /api/users/transactions/{id}/ | Delete transaction | Yes |
| GET | /api/users/budgets/ | List budgets | Yes |
| POST | /api/users/budgets/ | Create budget | Yes |
| GET | /api/users/goals/ | List goals | Yes |
| POST | /api/users/goals/ | Create goal | Yes |
| POST | /api/users/ai-advisor/ | AI advice query | Yes |
| GET | /api/users/notifications/ | List notifications | Yes |

## 4.5 Data Flow Diagram

**Login Flow:**
```
User → Click "Sign in with Google"
     → Google OAuth returns credential token (JWT)
     → Frontend sends token to /api/users/google/
     → Backend decodes token, extracts email/name
     → Backend looks up or creates User in SQLite
     → Backend issues Access Token + Refresh Token
     → Frontend stores tokens in localStorage
     → User redirected to Dashboard
```

**Transaction Flow:**
```
User → Fills transaction form
     → Frontend calls POST /api/users/transactions/
     → Axios adds Authorization: Bearer <token> header
     → Django authenticates token
     → Transaction saved to SQLite (linked to user)
     → Response returned → UI updated
     → Budget module auto-updates → Alerts triggered if needed
```

---

---

# CHAPTER 5: DATABASE DESIGN

## 5.1 Database Overview

THRIFTY uses **SQLite** as its local relational database. SQLite is a lightweight, file-based database that is bundled with Python and requires no separate installation or configuration. The database file is stored at `backend/db.sqlite3`.

Django's ORM (Object-Relational Mapper) is used to interact with the database. All database operations are written as Python code using Django models, eliminating the need to write raw SQL queries for most use cases.

The database consists of the following main tables (Django models):
1. `auth_user` (Django built-in) — User accounts
2. `users_userprofile` — Extended user data (points, level, avatar)
3. `users_transaction` — Income and expense records
4. `users_budget` — Monthly budget limits per category
5. `users_goal` — Financial savings goals
6. `users_badge` — Achievement badges earned
7. `users_notification` — In-app notifications

## 5.2 Entity-Relationship Diagram Description

The relationships between entities are:

- **User** (1) ←→ (1) **UserProfile**: Every user has exactly one profile.
- **User** (1) ←→ (M) **Transaction**: A user can have many transactions.
- **User** (1) ←→ (M) **Budget**: A user can have many budget categories.
- **User** (1) ←→ (M) **Goal**: A user can set many financial goals.
- **User** (1) ←→ (M) **Badge**: A user can earn many badges.
- **User** (1) ←→ (M) **Notification**: A user receives many notifications.

All relationships use Django's `ForeignKey` with `CASCADE` deletion, meaning all related data is automatically deleted when a user account is deleted.

## 5.3 Table Schemas

**users_transaction:**
```sql
CREATE TABLE users_transaction (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    amount      DECIMAL(10, 2) NOT NULL,
    type        VARCHAR(10) NOT NULL,       -- 'income' or 'expense'
    category    VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    date        DATE NOT NULL,
    receipt     VARCHAR(200),               -- Optional image path
    created_at  DATETIME DEFAULT NOW()
);
```

**users_budget:**
```sql
CREATE TABLE users_budget (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    category    VARCHAR(100) NOT NULL,
    budget_limit DECIMAL(10, 2) NOT NULL,
    spent       DECIMAL(10, 2) DEFAULT 0,
    month       INTEGER,
    year        INTEGER
);
```

**users_goal:**
```sql
CREATE TABLE users_goal (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    name           VARCHAR(200) NOT NULL,
    target_amount  DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) DEFAULT 0,
    deadline       DATE,
    created_at     DATETIME DEFAULT NOW()
);
```

**users_userprofile:**
```sql
CREATE TABLE users_userprofile (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER UNIQUE NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    points      INTEGER DEFAULT 0,
    level       INTEGER DEFAULT 1,
    avatar      VARCHAR(200),
    currency    VARCHAR(10) DEFAULT 'INR'
);
```

## 5.4 Data Isolation & Multi-User Support

A critical security requirement in THRIFTY is **data isolation** — each user must only be able to access their own data. This is enforced at multiple levels:

1. **Backend QuerySet filtering**: Every database query filters by the currently authenticated user.
```python
def get_queryset(self):
    return Transaction.objects.filter(user=self.request.user)
```

2. **JWT Authentication**: Every API request requires a valid JWT token. The token contains the `user_id`, which Django uses to identify the user.

3. **Permission Classes**: All protected views use `permissions.IsAuthenticated`, ensuring unauthenticated users get a 401 Unauthorized response.

4. **Object-level permissions**: Users cannot access, edit, or delete records belonging to other users — doing so returns a 404 Not Found response.

## 5.5 Database Migrations

Django's migration system tracks all changes to the database schema over time. Each change to a model (adding a field, changing a data type, etc.) generates a new migration file that can be applied to the database.

**Running Migrations:**
```bash
# Generate migration files from model changes
python manage.py makemigrations

# Apply all pending migrations to the database
python manage.py migrate

# View migration status
python manage.py showmigrations
```

Migrations are stored in `backend/users/migrations/` and are version-controlled with Git. This ensures the database schema stays in sync across different development environments.

---
