# MAMP — Mini Asset Maintenance Platform

A full-stack web application for managing physical assets and tracking
maintenance tasks across an organisation.

---

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Running Locally](#running-locally)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Design Decisions](#design-decisions)
- [Folder Structure](#folder-structure)

---

## Overview

MAMP allows organisations to:
- Register and manage physical assets (equipment, facilities, infrastructure)
- Create and assign maintenance tasks linked to those assets
- Track task progress from Pending → In Progress → Completed
- View operational status on a live dashboard
- Receive email reminders for upcoming maintenance deadlines

---

## Tech Stack

### Frontend
| Technology      | Purpose                        |
|-----------------|--------------------------------|
| React 18        | UI framework                   |
| TypeScript      | Type safety                    |
| Tailwind CSS    | Utility-first styling          |
| React Router v6 | Client-side routing            |
| Axios           | HTTP client & interceptors     |
| Recharts        | Dashboard data visualisation   |
| Zustand         | Auth state management          |
| Lucide React    | Icon library                   |
| Vite            | Build tool & dev server        |

### Backend
| Technology        | Purpose                        |
|-------------------|--------------------------------|
| ASP.NET Core      | REST API framework             |
| Entity Framework  | ORM & database access          |
| SQL Server        | Relational database            |
| JWT Bearer Auth   | Authentication & authorisation |

---

## Getting Started

### Prerequisites
Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- [.NET SDK](https://dotnet.microsoft.com/) v8 or higher
- [PostrgreSQL Server] 
- [Git](https://git-scm.com/)

---

## Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Oluiy/MiniAssetManagementProj.git
cd MiniAssetManagementProj
```

### 2. Set Up the Backend

```bash
# Navigate to the API project
cd Mamp_API

# Restore .NET dependencies
dotnet restore

# Update the connection string in appsettings.json
# Open Mamp_API/appsettings.json and set:
# "DefaultConnection": "Server=YOUR_SERVER;Database=MampDb;Trusted_Connection=True;"
```

Apply database migrations:
```bash
dotnet ef database update
```

Start the backend server:
```bash
dotnet run
```

The API will be available at: `http://localhost:5000`
Swagger UI will be available at: `http://localhost:5000/swagger`

---

### 3. Set Up the Frontend

Open a new terminal:

```bash
# Navigate to the frontend project
cd Mamp_Frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` and set:
```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the development server:
```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

---

### 4. Create a Test Account

Once both servers are running:
1. Open `http://localhost:5173`
2. Click **Sign Up** and create an account
3. Log in with your credentials
4. You will be redirected to the Dashboard

---

## Database Schema

### Overview
The database uses a relational structure with three core tables:

```
Users ──────────────── (authentication only)
  │
  └──── Assets ──────── (one user owns many assets)
           │
           └──── MaintenanceTasks ──── (one asset has many tasks)
```

---

### Table: Users

| Column       | Type         | Constraints              | Description                    |
|--------------|--------------|--------------------------|--------------------------------|
| Id           | GUID         | PK, NOT NULL             | Unique user identifier         |
| Username     | NVARCHAR(100)| NOT NULL                 | Display name                   |
| Email        | NVARCHAR(255)| NOT NULL, UNIQUE         | Login email address            |
| PasswordHash | NVARCHAR(MAX)| NOT NULL                 | Bcrypt hashed password         |
| CreatedAt    | DATETIME2    | NOT NULL, DEFAULT NOW()  | Account creation timestamp     |
| RefreshToken | NVARCHAR(MAX)| NULLABLE                 | JWT refresh token              |
| RefreshTokenExpiry | DATETIME2 | NULLABLE            | Refresh token expiry time      |

---

### Table: Assets

| Column     | Type          | Constraints                    | Description                        |
|------------|---------------|--------------------------------|------------------------------------|
| Id         | GUID          | PK, NOT NULL                   | Unique asset identifier            |
| Name       | NVARCHAR(200) | NOT NULL                       | Asset display name                 |
| Type       | NVARCHAR(100) | NOT NULL                       | Category (e.g. Equipment, Vehicle) |
| Location   | NVARCHAR(200) | NOT NULL                       | Physical location                  |
| Status     | NVARCHAR(50)  | NOT NULL, DEFAULT 'Active'     | Active / Inactive / UnderMaintenance |
| CreatedAt  | DATETIME2     | NOT NULL, DEFAULT NOW()        | Date asset was registered          |
| UserId     | GUID          | FK → Users.Id, NOT NULL        | Owner of the asset                 |

**Relationships:**
- `Assets.UserId` → `Users.Id` (Many-to-One)
- One User can own many Assets
- Deleting a User cascades to their Assets

---

### Table: MaintenanceTasks

| Column      | Type          | Constraints                      | Description                          |
|-------------|---------------|----------------------------------|--------------------------------------|
| Id          | GUID          | PK, NOT NULL                     | Unique task identifier               |
| Title       | NVARCHAR(200) | NOT NULL                         | Short task name                      |
| Description | NVARCHAR(MAX) | NULLABLE                         | Detailed task description            |
| Priority    | NVARCHAR(20)  | NOT NULL, DEFAULT 'Medium'       | Low / Medium / High                  |
| Status      | NVARCHAR(20)  | NOT NULL, DEFAULT 'Pending'      | Pending / InProgress / Completed     |
| DueDate     | DATETIME2     | NOT NULL                         | Deadline for the task                |
| AssetId     | GUID          | FK → Assets.Id, NOT NULL         | The asset this task belongs to       |
| CreatedAt   | DATETIME2     | NOT NULL, DEFAULT NOW()          | Date task was created                |

**Relationships:**
- `MaintenanceTasks.AssetId` → `Assets.Id` (Many-to-One)
- One Asset can have many MaintenanceTasks
- Deleting an Asset cascades to its MaintenanceTasks

---

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌──────────────────────┐
│    Users    │         │    Assets    │         │   MaintenanceTasks   │
│─────────────│         │──────────────│         │──────────────────────│
│ Id (PK)     │ 1     * │ Id (PK)      │ 1     * │ Id (PK)              │
│ Username    │─────────│ UserId (FK)  │─────────│ AssetId (FK)         │
│ Email       │         │ Name         │         │ Title                │
│ PasswordHash│         │ Type         │         │ Description          │
│ CreatedAt   │         │ Location     │         │ Priority             │
│ RefreshToken│         │ Status       │         │ Status               │
│             │         │ CreatedAt    │         │ DueDate              │
└─────────────┘         └──────────────┘         │ CreatedAt            │
                                                 └──────────────────────┘
```

---

## API Endpoints

### Authentication
| Method | Endpoint              | Auth Required | Description              |
|--------|-----------------------|---------------|--------------------------|
| POST   | /api/Auth/register    | No            | Create a new account     |
| POST   | /api/Auth/login       | No            | Login, returns JWT       |
| POST   | /api/Auth/refresh     | No            | Refresh access token     |

### Assets
| Method | Endpoint              | Auth Required | Description              |
|--------|-----------------------|---------------|--------------------------|
| GET    | /api/Asset            | Yes           | Get all assets           |
| POST   | /api/Asset            | Yes           | Create a new asset       |
| GET    | /api/Asset/{id}       | Yes           | Get single asset         |
| PUT    | /api/Asset/{id}       | Yes           | Update an asset          |

### Maintenance Tasks
| Method | Endpoint                            | Auth Required | Description              |
|--------|-------------------------------------|---------------|--------------------------|
| POST   | /api/MaintenanceTask                | Yes           | Create a new task        |
| GET    | /api/MaintenanceTask/{id}           | Yes           | Get single task          |
| PATCH  | /api/MaintenanceTask/{id}/status    | Yes           | Update task status       |
| PATCH  | /api/MaintenanceTask/{id}/priority  | Yes           | Update task priority     |

### Dashboard
| Method | Endpoint                  | Auth Required | Description              |
|--------|---------------------------|---------------|--------------------------|
| GET    | /api/Dashboard/overview   | Yes           | Get summary statistics   |

### Notifications
| Method | Endpoint                        | Auth Required | Description                    |
|--------|---------------------------------|---------------|--------------------------------|
|POST    | /api/Notification/SendReminder  | Yes           | Send maintenance email reminders|

---

## Design Decisions

### 1. Architecture — Separation of Concerns
The project is split into distinct layers:
- **Mamp_Frontend** — React SPA, handles all UI and user interaction
- **Mamp_API** — ASP.NET REST API, handles business logic
- **Mamp_Domain** — Core domain models and interfaces
- **Mamp_Application** — Application logic and service layer

This separation makes each layer independently testable and replaceable.

---

### 2. Authentication — JWT with Refresh Tokens
Short-lived access tokens (15–60 min) paired with longer-lived refresh
tokens provide a balance of security and usability. The frontend uses
an Axios response interceptor to automatically refresh tokens on 401
responses, keeping the user session seamless without requiring re-login.

---

### 3. Database — GUIDs as Primary Keys
All tables use GUIDs (not integers) as primary keys. This prevents
enumeration attacks, supports future distributed deployments, and
avoids ID collisions when merging data from multiple sources.

---

### 4. Task Updates — PATCH over PUT
Maintenance task updates use two PATCH endpoints (status and priority)
rather than a single PUT. This follows REST best practices for partial
updates and reduces the risk of overwriting unintended fields.

---

### 5. Frontend State — Zustand over Redux
Zustand was chosen for auth state management due to its minimal
boilerplate. The application's state requirements are simple (auth
token + user info), making a lightweight solution more appropriate
than Redux.

---

### 6. Cascade Deletes
Deleting a User deletes their Assets. Deleting an Asset deletes its
MaintenanceTasks. This maintains referential integrity without requiring
manual cleanup logic in the application layer.

---

### 7. Notifications — On-Demand vs Scheduled
Email reminders are triggered on-demand via the dashboard.


---

## Folder Structure

```
MiniAssetManagementProj/
├── Mamp_API/               # ASP.NET Core Web API
│   ├── Controllers/        # Route handlers
│   ├── appsettings.json    # Configuration
│   └── Program.cs          # App entry point
├── Mamp_Application/       # Business logic / services
├── Mamp_Domain/            # Core models & interfaces
├── Mamp_Frontend/          # React + TypeScript SPA
│   ├── src/
│   │   ├── api/            # Axios instance & API functions
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # One component per route
│   │   ├── store/          # Zustand auth store
│   │   └── types/          # TypeScript interfaces
│   ├── .env.example        # Environment variable template
│   └── package.json
└── README.md               # This file
```

---
