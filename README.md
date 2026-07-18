# Cognitive Alarm App

A full-stack application designed to build better wake-up habits through cognitive challenges. The project uses a monorepo structure containing a React web frontend, a FastAPI backend, and an Expo React Native mobile app.

---

## 🚀 Getting Started

### Prerequisites — Start These First

> [!IMPORTANT]
> **Docker must be running before you start the backend.**
> The backend depends on PostgreSQL, MongoDB, and Redis — all managed via Docker Compose.
> Open Docker Desktop and make sure the engine is running before proceeding.

---

### 1. Clone the Repository

```bash
git clone https://github.com/Shadow-sama287/intelligent-cognitive-alarm-platform.git
cd intelligent-cognitive-alarm-platform
```

---

### 2. Start the Databases (Docker)

```bash
cd backend
docker-compose up -d
```

Verify all containers are healthy:

```bash
docker-compose ps
```

You should see `postgres`, `mongo`, and `redis` all with status `Up`.

---

### 3. Start the Backend

In the `backend/` directory:

```bash
python -m venv .venv

# Activate (Mac/Linux):
source .venv/bin/activate
# Activate (Windows):
.venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

### 4. Start the Web Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The web app will be available at `http://localhost:5173`.

---

## 📱 Mobile App (Expo) — Additional Setup

The Expo app connects to your backend over your local network. Because a physical phone is on your WiFi (not inside your PC), there are a few extra steps required every time.

### Step 1 — Run uvicorn with `--host 0.0.0.0`

> [!IMPORTANT]
> You **must** start uvicorn with `--host 0.0.0.0`, not the default `--host 127.0.0.1`.
>
> **Why?** By default, uvicorn only listens on `localhost` (127.0.0.1), which means it only accepts connections from your own computer. When `--host 0.0.0.0` is used, the server listens on **all network interfaces** — including your WiFi adapter — making it reachable from your phone on the same network.

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0
```

### Step 2 — Find Your Machine's Local IP

> [!IMPORTANT]
> Your `.env` file **must be updated with your current local IP address every time** your IP changes (e.g., after reconnecting to WiFi or switching networks).

Run this to find your IP:

**Windows:**

```powershell
ipconfig
```

Look for the **IPv4 Address** under your **Wi-Fi adapter** (e.g., `192.168.1.5`).

> [!WARNING]
> Your machine may show multiple IPv4 addresses (e.g., one for WSL/Hyper-V like `172.x.x.x`, one for Wi-Fi like `192.168.x.x`).
> **Always use the Wi-Fi IPv4 address.** The WSL/Hyper-V addresses (172.x.x.x) are internal virtual adapters — your phone cannot reach them over WiFi.

**Mac/Linux:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Step 3 — Update `mobile/.env`

Open `mobile/.env` and set your IP:

```env
EXPO_PUBLIC_API_URL=http://<YOUR_WIFI_IPV4>:8000/api/v1
```

Example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.5:8000/api/v1
```

> [!NOTE]
> After editing `.env`, you must **fully restart Metro** (`Ctrl+C` then `npx expo start`) — environment variables are not hot-reloaded.

### Step 4 — Start Expo

```bash
cd mobile
npx expo start
```

Make sure your phone and PC are on the **same WiFi network**, then scan the QR code.

---

## 🌿 Git Workflow & Branching Strategy

To prevent merge conflicts and keep `main` stable, we use a strict feature-branching workflow. **No one commits directly to `main`.**

---

### Branch Naming Convention

```
<your-name>/<type>/<short-description>
```

| Type    | Use for       | Example                    |
| ------- | ------------- | -------------------------- |
| `feat/` | New features  | `karan/feat/user-auth`     |
| `fix/`  | Bug fixes     | `karan/fix/cors-error`     |
| `docs/` | Documentation | `karan/docs/api-endpoints` |

---

### For Team Members Who Forked the Repository

If you are working from a **fork** (your own copy of the repo on GitHub), you need to set up two remotes so you can both push your work and stay in sync with the main repository.

**Check your current remotes:**

```bash
git remote -v
```

You will likely see only `origin` pointing to your fork. Add the main repository as `upstream`:

```bash
git remote add upstream https://github.com/Shadow-sama287/intelligent-cognitive-alarm-platform.git
```

**Verify both remotes exist:**

```bash
git remote -v
# origin    https://github.com/<YOUR-USERNAME>/intelligent-cognitive-alarm-platform.git (fetch)
# upstream  https://github.com/Shadow-sama287/intelligent-cognitive-alarm-platform.git (fetch)
```

**To sync your fork with the latest main:**

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main   # update your fork's main on GitHub
```

> [!NOTE]
> Think of it this way:
>
> - **`origin`** = your fork on GitHub (you push feature branches here)
> - **`upstream`** = the team's main repository (you pull updates from here)

---

### Daily Workflow

**1. Sync with main before starting any task:**

```bash
git checkout main
git pull upstream main    # if you forked
# OR
git pull origin main      # if you cloned the main repo directly
```

**2. Create your feature branch:**

```bash
git checkout -b <your-name>/<type>/<feature-name>
# Example: git checkout -b karan/feat/database-schema
```

**3. Commit and push your work:**

```bash
git add .
git commit -m "Brief description of what you changed"
git push origin <your-name>/<type>/<feature-name>
```

**4. Open a Pull Request:**

Go to GitHub and open a PR from your branch into `main` on the main repository.

- Your PR must be reviewed and approved by **at least one other team member** before merging.
- Once merged, delete your feature branch on GitHub.

---

### After Your PR is Merged — Cleanup Loop

Your remote branch is deleted on GitHub but your local machine doesn't know yet. Run this cleanup every time after a merge:

```bash
# 1. Switch back to main
git checkout main

# 2. Pull the latest merged code
git pull upstream main    # if you forked
# OR
git pull origin main      # if you cloned directly

# 3. Delete your local feature branch (it's safely in main now)
git branch -d <your-name>/<type>/<your-finished-feature>

# 4. Prune stale remote branch references (optional but recommended)
git fetch -p
```
