# Smart Interviews - Task Tracker (MERN)

A full-stack Task Management System with JWT authentication, task CRUD, filtering/search, pagination/sorting, and a basic analytics dashboard.

## Features

- Signup/Login with JWT (hashed passwords)
- Create / read / update / delete tasks
- Mark tasks as completed
- Filter by status and priority
- Search tasks by title
- Server-side pagination + sorting
- Analytics: totals, completed/pending, completion percentage + chart
- Dark mode (localStorage)

## Tech Stack

- Frontend: React (Vite), `axios`, `react-router-dom`, `recharts`
- Backend: Node.js + Express, MongoDB (Mongoose), JWT auth

## Setup

### 1) Backend

Navigate to `backend/` and install dependencies:

```powershell
cd backend
npm install
```

Copy environment variables:

```powershell
cp .env.example .env
```

Run backend (dev):

```powershell
npm run dev
```

Default: `http://localhost:5000`

### 2) Frontend

Navigate to `frontend/` and install dependencies:

```powershell
cd frontend
npm install
```

Copy environment variables:

```powershell
cp .env.example .env
```

Run frontend (dev):

```powershell
npm run dev
```

Default: `http://localhost:5173`

## API Endpoints

### Authentication

`POST /api/auth/signup`

Request:

```json
{ "email": "user@example.com", "password": "password123" }
```

Response:

```json
{ "token": "JWT_TOKEN", "user": { "id": "USER_ID", "email": "user@example.com", "role": "user" } }
```

`POST /api/auth/login`

Request:

```json
{ "email": "user@example.com", "password": "password123" }
```

Response: same shape as signup.

### Tasks (Authenticated: `Authorization: Bearer <token>`)

`GET /api/tasks`

Query params:

- `page` (default `1`)
- `limit` (default `10`)
- `status` (`Todo` | `In Progress` | `Done`)
- `priority` (`Low` | `Medium` | `High`)
- `search` (title substring/regex)
- `sortBy` (`dueDate` | `priority`)
- `sortOrder` (`asc` | `desc`)

Response:

```json
{
  "tasks": [ { "_id": "...", "title": "...", "description": "...", "status": "...", "priority": "...", "dueDate": "..." } ],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

`POST /api/tasks`

Request:

```json
{
  "title": "Task title",
  "description": "Optional",
  "status": "Todo",
  "priority": "High",
  "dueDate": "2026-03-25T00:00:00.000Z"
}
```

`PUT /api/tasks/:id`

Updates the task (fields are validated; due date/status/priority remain protected by validation).

`PATCH /api/tasks/:id/complete`

Marks a task as `Done`.

`DELETE /api/tasks/:id`

Deletes a task.

### Analytics

`GET /api/tasks/analytics`

Response:

```json
{
  "totalTasks": 10,
  "completedTasks": 4,
  "pendingTasks": 6,
  "completionPercentage": 40,
  "breakdown": { "Todo": 6, "In Progress": 0, "Done": 4 }
}
```

## Design Decisions (Highlights)

- Sorting by priority is handled reliably using a persisted `priorityRank` field in MongoDB.
- Filtering/pagination/sorting are done server-side to keep the UI responsive.
- Global error handling returns consistent JSON for validation and API errors.
- Dark mode is toggled via CSS variables + `data-theme` on `document`.
