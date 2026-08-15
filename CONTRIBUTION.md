# 🤝 Contributing to Intelligent Cognitive Alarm Platform (ICAP)

Thank you for contributing to the **Intelligent Cognitive Alarm Platform**! This document provides complete instructions for setting up your local development environment, database migrations, mobile networking, Git branching workflow, and submitting pull requests.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Local Development Setup](#-local-development-setup)
   - [1. Clone Repository](#1-clone-the-repository)
   - [2. Start Databases (Docker Compose)](#2-start-the-databases-docker)
   - [3. Database Migrations (Alembic)](#3-database-migrations-alembic)
   - [4. Start FastAPI Backend](#4-start-the-backend)
   - [5. Start React Web Frontend](#5-start-the-web-frontend)
   - [6. Start React Native Mobile App (Expo)](#6-start-the-mobile-app-expo)
3. [Git Branching Strategy & Workflow](#-git-branching-strategy--workflow)
   - [Branch Naming Convention](#branch-naming-convention)
   - [Fork & Upstream Configuration](#for-team-members-working-from-a-fork)
   - [Daily Development Workflow](#daily-development-cycle)
   - [Pull Request & Review Guidelines](#pull-request-guidelines)
   - [Post-Merge Cleanup](#after-your-pr-is-merged--cleanup-loop)
4. [Testing & Quality Verification](#-testing--quality-verification)
5. [Code Style & Standards](#-code-style--standards)

---

## 🚀 Prerequisites

Make sure the following tools are installed on your machine before beginning:

- **Docker Desktop**: Engine must be running for PostgreSQL, MongoDB, and Redis containers.
- **Python 3.11+**: For the FastAPI backend.
- **Node.js 18+ & npm**: For both the Web Frontend (Vite) and Mobile App (Expo).
- **Git**: For version control.
- **Expo Go App** *(Optional, for physical device testing)*: Available on iOS App Store & Google Play Store.

> [!IMPORTANT]
> **Docker must be running before you start the backend.**
> The backend depends on PostgreSQL (Relational store), MongoDB (Challenge question bank), and Redis (Active ringing session cache) — all managed via Docker Compose.

---

## 💻 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Shadow-sama287/intelligent-cognitive-alarm-platform.git
cd intelligent-cognitive-alarm-platform
```

---

### 2. Start the Databases (Docker)

Navigate into the `backend/` directory and spin up the multi-database Docker container stack:

```bash
cd backend
docker-compose up -d
```

Verify that all containers are healthy and running:

```bash
docker-compose ps
```

You should see `postgres`, `mongo`, and `redis` all with the status `Up` (or `healthy`).

---

### 3. Database Migrations (Alembic)

Apply the latest PostgreSQL relational schemas using Alembic:

```bash
cd backend
alembic upgrade head
```

> [!NOTE]
> If you create new database models or modify existing ones in `app/models/`, generate and run a new migration:
> ```bash
> alembic revision --autogenerate -m "describe_your_schema_changes"
> alembic upgrade head
> ```

---

### 4. Start the Backend

Create and activate a Python virtual environment, install dependencies, and start the FastAPI development server:

```bash
cd backend

# 1. Create virtual environment
python -m venv .venv

# 2. Activate virtual environment
# Windows (PowerShell / Command Prompt):
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Start FastAPI server with live-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **API Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

### 5. Start the Web Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The web dashboard will be accessible at `http://localhost:5173`.

---

### 6. Start the Mobile App (Expo)

The Expo mobile app connects to your local backend over your local WiFi network.

#### Step A — Ensure Backend Listens on `0.0.0.0`
> [!IMPORTANT]
> You **must** run `uvicorn` with `--host 0.0.0.0` (as shown in Step 4). This allows devices on your local network (like your phone or simulator) to reach the API server.

#### Step B — Launch Expo Dev Server
Open a new terminal window:

```bash
cd mobile
npm install
npx expo start
```

- **Physical Device**: Scan the generated QR code using the **Expo Go** app (Android) or the Camera app (iOS). Ensure your phone and PC are connected to the **same WiFi network**.
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal.

> [!NOTE]
> We use dynamic IP resolution via `expo-constants`. If your network configuration prevents automatic detection, create a `.env` file inside `mobile/`:
> ```env
> EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IPV4_ADDRESS>:8000/api/v1
> ```
> Then restart Expo with `npx expo start -c`.

---

## 🌿 Git Branching Strategy & Workflow

To maintain a clean and conflict-free git history across multiple contributors, follow this branching model strictly. **Direct commits to `main` are prohibited.**

---

### Branch Naming Convention

Feature branches should follow one of these two standardized naming formats:

```text
week-<WEEK_NUM>/dev-<DEV_NUM>-<feature-description>
# OR
<your-name>/<type>/<short-description>
```

| Prefix / Type | Use Case | Example |
| :--- | :--- | :--- |
| `week-XX/dev-X-...` | Assigned Milestone & Sprint tasks | `week-03/dev-3-math-generator` |
| `feat/` | New feature implementation | `karan/feat/snooze-escalation` |
| `fix/` | Bug fixes & patches | `karan/fix/cors-origin-issue` |
| `docs/` | Documentation & Handbook updates | `karan/docs/api-specifications` |
| `test/` | Automated test additions & suites | `karan/test/auth-integration` |

---

### For Team Members Working from a Fork

If you are contributing via a GitHub fork, configure both `origin` and `upstream` remotes:

```bash
# Verify your current remote
git remote -v

# Add the central team repository as upstream
git remote add upstream https://github.com/Shadow-sama287/intelligent-cognitive-alarm-platform.git

# Verify both remotes exist
git remote -v
# origin    https://github.com/<YOUR-USERNAME>/intelligent-cognitive-alarm-platform.git (fetch/push)
# upstream  https://github.com/Shadow-sama287/intelligent-cognitive-alarm-platform.git (fetch/push)
```

**To keep your fork in sync with latest upstream changes:**
```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

### Daily Development Cycle

1. **Synchronize local `main` before starting work:**
   ```bash
   git checkout main
   git pull upstream main   # if forked, OR 'git pull origin main'
   ```

2. **Create your feature branch:**
   ```bash
   git checkout -b week-03/dev-2-verification-pipeline
   ```

3. **Commit your changes with clear, descriptive messages:**
   ```bash
   git add .
   git commit -m "feat(verify): add latency tracking to challenge answer evaluation"
   ```

4. **Push your feature branch:**
   ```bash
   git push origin week-03/dev-2-verification-pipeline
   ```

---

### Pull Request Guidelines

1. Navigate to the GitHub repository and open a **Pull Request (PR)** targeting the `main` branch.
2. Fill out the PR description with:
   - Summary of changes implemented.
   - Associated Milestone and Week (e.g., *Milestone 2 - Week 3*).
   - Test verification evidence (screenshots, terminal logs, or pytest results).
3. Every PR must receive at least **one peer review approval** prior to merging.

---

### After Your PR is Merged — Cleanup Loop

Keep your local environment clean by pruning stale branches:

```bash
# 1. Switch back to main
git checkout main

# 2. Pull the latest merged changes
git pull upstream main   # or 'git pull origin main'

# 3. Delete your local merged branch
git branch -d week-03/dev-2-verification-pipeline

# 4. Prune stale remote tracking branches
git fetch -p
```

---

## 🧪 Testing & Quality Verification

Always verify your changes before opening a PR:

### Backend Tests
Run the automated test suite with pytest:
```bash
cd backend
pytest -v
```

### API Endpoint Validation
Open Swagger UI at `http://localhost:8000/docs` to test requests and responses interactively.

### Frontend Verification
```bash
cd frontend
npm run lint
npm run build   # Ensures production bundle builds without errors
```

---

## 📐 Code Style & Standards

- **Python (FastAPI)**: Follow PEP 8 guidelines. Use type hints (`typing` / Pydantic v2 schemas) on all endpoint handlers, dependencies, and service functions.
- **Frontend (React)**: Use functional components with React Hooks. Follow the established ICAP design system (modern dark aesthetics, smooth micro-interactions, Tailwind CSS classes).
- **Mobile (React Native)**: Use SafeAreaView wrappers, modular components, and responsive typography.
- **Documentation Sync**: When modifying endpoints, models, or core business logic, always update the corresponding handbook guides in `docs/handbook/`.

---

Thank you for helping build the future of intelligent wakefulness! 🚀
