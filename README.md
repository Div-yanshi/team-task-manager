
# Team Task Manager

A full-stack Team Task Management web application where users can create projects, add members, assign tasks, update task status, and view dashboard summaries.

## Tech Stack
- Frontend: React (JavaScript)
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Authentication: JWT

## Features
- User signup and login
- Protected routes with JWT
- Create and view projects
- Add and remove project members
- Create tasks inside projects
- Assign tasks to members
- Update task status
- Delete tasks
- Dashboard summary:
  - total tasks
  - tasks by status
  - overdue tasks
  - tasks per user

## Folder Structure
- `server` -> backend
- `client` -> frontend

## Backend Setup
```bash
cd server
npm install
npm run dev

Create a .env file inside server with:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Frontend Setup

cd client
npm install
npm start

API Base URL

Frontend uses:

http://localhost:5000/api

Main Routes

Auth

POST /api/auth/signup

POST /api/auth/login

GET /api/auth/me


Projects

POST /api/projects

GET /api/projects

GET /api/projects/:id

POST /api/projects/:id/members

DELETE /api/projects/:id/members/:userId


Tasks

POST /api/tasks

GET /api/tasks/project/:projectId

PATCH /api/tasks/:taskId/status

DELETE /api/tasks/:taskId


Dashboard

GET /api/dashboard/:projectId


How it Works

User signs up or logs in

JWT token is stored in localStorage

User creates a project

Admin adds members

Admin creates tasks and assigns them

Members can view project tasks

Dashboard shows project progress summary


Deployment

Backend can be deployed on Railway

Frontend can be deployed on Railway or Netlify

MongoDB Atlas is used as cloud database


Demo

Include:

live app URL

GitHub repo URL

short demo video link



