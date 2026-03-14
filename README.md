# MAMP — Mini Asset Maintenance Platform

A full-stack web application for managing physical assets and tracking maintenance tasks.

**Live Demo:** [https://mini-asset-management-proj.vercel.app/](https://mini-asset-management-proj.vercel.app/)

---

## Quick Start

```bash
# Frontend
cd Mamp_Frontend
npm install
npm run dev  # http://localhost:5173

# Backend
cd Mamp_API
dotnet restore
dotnet run  # http://localhost:5235
```

Set `VITE_API_BASE_URL=http://localhost:5235` in `.env`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Tailwind CSS + Vite |
| Backend | ASP.NET Core 9 + Entity Framework 9 |
| Database | PostgreSQL (Aiven) |
| Auth | JWT + Refresh Tokens |
| Deployment | Vercel (Frontend) + Render (Backend, Docker) |

---

## Design Decisions

### 1. **User Isolation First**
Every read query is scoped by `UserId`. Assets and tasks are strictly personal—no cross-user data leakage. Task creation validates asset ownership before allowing assignment.

### 2. **JWT with Refresh Tokens**
Short-lived access tokens (60 min) + long-lived refresh tokens. Axios interceptor auto-refreshes on 401, keeping sessions seamless. More secure than session cookies.

### 3. **PATCH for Partial Updates**
Task status and priority use separate PATCH endpoints instead of PUT. Follows REST best practices and prevents accidental overwrites of unrelated fields.

### 4. **GUIDs as Primary Keys**
All tables use GUIDs instead of integers. Prevents enumeration attacks, enables distributed deployments, and allows safe data merges across systems.

### 5. **Cascade Deletes**
Deleting a User cascades to Assets. Deleting an Asset cascades to MaintenanceTasks. Maintains referential integrity without manual cleanup in the application layer.

### 6. **Zustand for Auth State**
Minimal boilerplate for simple state needs (token + user info). Redux would be overkill; Zustand keeps the frontend lean and fast.

### 7. **Email Service via Background Job**
Scheduled background service (EmailReminderBackgroundService) runs daily at 8:00 AM UTC, checking for upcoming tasks and sending reminders. Uses HTML sanitization + validation to prevent injection attacks. It might not work well becuase of some Render issue due to the free tier deplyment.

### 8. **Responsive-First Mobile UX**
Hidden action buttons (hover on desktop) are always visible on touch devices. Loading states prevent double-submission. Mobile logout button in header for easy access on small screens.

### 9. **Sequential Task Updates**
Priority and status updates are sent sequentially, not in parallel. Prevents race conditions on the backend where concurrent updates might overwrite each other.

### 10. **Docker Containerization**
Backend packaged as Docker image for easy Render deployment. Multi-stage build (SDK → ASP.NET runtime) keeps image size minimal.

---

## Database Schema

```
Users (1) ──→ (many) Assets (1) ──→ (many) MaintenanceTasks
  ├─ Id (GUID, PK)           ├─ Id (GUID, PK)           ├─ Id (GUID, PK)
  ├─ Email (unique)          ├─ UserId (FK)             ├─ AssetId (FK)
  ├─ PasswordHash (Bcrypt)    ├─ Name                    ├─ Title
  └─ CreatedAt               ├─ Type                    ├─ Priority (Low/Med/High)
                             ├─ Location                ├─ Status (Pending/In Progress/Completed)
                             ├─ Status (Active/Inactive)├─ DueDate
                             └─ CreatedAt               └─ CreatedAt
```

**Key Relationships:**
- One user owns many assets (UserID scopes all reads)
- One asset has many tasks (cascade delete on asset removal)
- One user created many tasks (for audit trails)
- Task creation validates: asset exists AND asset.UserId == currentUser.Id

---

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/Auth/register` | POST | No | Create account |
| `/api/Auth/login` | POST | No | Login, get JWT |
| `/api/Auth/refresh` | POST | No | Refresh access token |
| `/api/Asset` | GET | Yes | List user's assets |
| `/api/Asset` | POST | Yes | Create new asset |
| `/api/Asset/{id}` | PUT | Yes | Update asset (owner check) |
| `/api/MaintenanceTask` | GET | Yes | List user's tasks |
| `/api/MaintenanceTask` | POST | Yes | Create task (asset ownership check) |
| `/api/MaintenanceTask/{id}/status` | PATCH | Yes | Update status (owner check) |
| `/api/MaintenanceTask/{id}/priority` | PATCH | Yes | Update priority (owner check) |
| `/api/Dashboard/overview` | GET | Yes | Stats (pending/in-progress/completed) |

---

## Folder Structure

```
MiniAssetManagementProj/
├── Mamp_API/               # ASP.NET REST API
│   ├── Controllers/        # HTTP endpoints
│   ├── Program.cs          # DI + middleware setup
│   └── Dockerfile          # Docker image for Render
├── Mamp_Application/       # Business logic & services
├── Mamp_Domain/            # Models & interfaces
├── Mamp_Infrastructure/    # EF Core DbContext & migrations
├── Mamp_Frontend/          # React SPA
│   ├── src/api/            # Axios client + interceptors
│   ├── src/pages/          # Routes (Login, Signup, Assets, Tasks, Dashboard)
│   ├── src/components/     # Reusable UI (Layout, Badge, etc)
│   ├── src/store/          # Zustand auth store
│   └── .env.example        # Environment template
└── README.md
```

---

## Deployment

- **Frontend:** Vercel (auto-deploy on push to `main`)
- **Backend:** Render + Docker (set `VITE_API_BASE_URL` env var in Vercel)
- **Database:** Aiven PostgreSQL

See `Mamp_API/Dockerfile` and deploy instructions in the Render dashboard.

---
