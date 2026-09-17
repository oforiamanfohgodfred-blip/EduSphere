# EduSphere

**Learn. Share. Achieve.**

EduSphere V1.0 is a full-stack Virtual Learning Environment (VLE) for organizations, teachers, and students. The platform keeps academic management connected: organizations create and monitor classes and staff, teachers manage their assigned class learning spaces, and students work inside those spaces.

## V1.0 includes

- Organization registration, authentication, and account settings
- Organization-managed teachers and students
- Classes, subjects, class membership, and teacher assignment
- Teacher and student authentication with JWT/bcrypt-backed accounts
- VLE class workspaces
- Assignments with draft, published, and closed states
- Student submissions, teacher grading, marks, and feedback
- Announcements and learning resources
- Timetables with class/teacher conflict validation
- Exams and upcoming-exam tracking
- In-app notifications for key academic activity
- Organization academic monitoring and live counts
- Authenticated teacher/student profiles and account identity
- Responsive, polished dashboard UI

## Project structure

```text
EduSphere/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── migrations/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── styles/
└── .github/workflows/
```

## Local setup

### 1. Backend

```bash
cd backend
npm ci
```

Create `backend/.env` from `backend/.env.example` and configure PostgreSQL plus `JWT_SECRET`.

Start the API:

```bash
npm start
```

For development with automatic restarts:

```bash
npm run dev
```

### 2. Database

Create the PostgreSQL database named for your environment, then apply the SQL schema/migration files in `backend/database/` and `backend/migrations/` in the project’s intended setup order.

### 3. Frontend

```bash
cd frontend
npm ci
```

Create `frontend/.env` from `frontend/.env.example` if you need to change the API/proxy settings.

Start the Vite development server:

```bash
npm run dev
```

The default development URLs are `http://localhost:5173` for the frontend and `http://localhost:5000` for the backend.

## Quality checks

The repository CI runs the frontend lint/build checks and backend JavaScript syntax checks on pushes and pull requests targeting `main`.

```bash
cd frontend && npm run lint && npm run build
cd ../backend && node --check server.js
```

## V2 direction

Features intentionally outside the V1 release boundary can be added in V2 without changing the V1 organization → teacher → class → student academic workflow.
