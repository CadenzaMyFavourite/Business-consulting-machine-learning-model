# Smart Analytics & Task Management Platform

A full-stack project with:

- **FastAPI** for auth, task CRUD, predictions, and authenticated WebSocket updates
- **SQLite** by default, with conditional engine config for PostgreSQL-style URLs
- **Pandas** utilities for sample data loading and ETL
- **PyTorch** for a lightweight KPI prediction demo
- **Vite + React + TailwindCSS** for the only supported frontend

## Getting Started

### 1. Backend setup

Create a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate   # macOS/Linux
.venv\Scripts\Activate.ps1  # Windows PowerShell
pip install -r requirements.txt
```

Optional: load demo data and a seeded demo user:

```bash
python -m data.load_sample_data
```

Start the API:

```bash
uvicorn backend.main:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

### 2. Frontend setup

Install the Vite app dependencies:

```bash
cd frontend/web
npm install
```

Start the React dev server:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`.

By default, Vite proxies API and WebSocket traffic to `http://127.0.0.1:8000`. If you want to point the frontend at a different backend, copy `frontend/web/.env.example` to `frontend/web/.env` and set `VITE_API_BASE_URL` or `VITE_API_PROXY_TARGET`.

## Quick Usage

1. Start the backend.
2. Start the frontend.
3. Open `http://localhost:5173`.
4. Create an account in the UI, or load sample data and sign in with:
   - Email: `admin@example.com`
   - Password: `password123`

## Project Structure

- `backend/` FastAPI application, auth helpers, SQLModel models, and WebSocket manager
- `data/` sample datasets, ETL helpers, and demo-data loader
- `training/` demo model training scripts
- `frontend/web/` Vite + React dashboard
- `ai_core/` legacy inference modules kept for compatibility experiments

## Notes

- The task WebSocket now requires authentication and only broadcasts updates back to the signed-in user.
- The KPI model behind `/predict` is still a demo network. Replace the training data and model logic before production use.
- SQLite is the default database. Set `DATABASE_URL` in `.env` to point at a different database engine.
