# Smart Analytics & Task Management Platform

A full-stack Python + JavaScript platform with:
- **FastAPI** backend (CRUD + auth + WebSocket updates)
- **SQLite** (default) backend with SQLModel
- **Pandas ETL pipelines** for cleaning and aggregating data
- **PyTorch** predictive model exposed via API
- **React + TailwindCSS** dashboard for tasks, charts, and predictions

---

## 🚀 Getting Started (Local)

### 1) Backend Setup (Python)

1. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
.venv\Scripts\Activate    # Windows
pip install -r requirements.txt
```

2. (Optional) Generate sample data and load into the database:

```bash
python -m data.load_sample_data
```

3. Start the FastAPI server:

```bash
uvicorn backend.main:app --reload
```

The API will be available at: `http://127.0.0.1:8000`


### 2) Frontend Setup (React + Tailwind)

1. Install dependencies:

```bash
cd frontend/web
npm install
```

2. Start the development server:

```bash
npm run dev
```

Open the app at: `http://localhost:5173`


## 🧩 Project Structure

- `backend/` – FastAPI REST + WebSocket backend, auth, DB models, prediction endpoint.
- `data/` – ETL helpers, sample datasets, and a loader script.
- `training/` – PyTorch model training script.
- `frontend/web/` – React + Tailwind dashboard.
- `ai_core/` – legacy AI inference modules (kept for compatibility).


## ✅ Available Features

- **User authentication** with JWT (register/login)
- **Task CRUD API** with WebSocket pushing real-time updates
- **Prediction endpoint** powered by a simple PyTorch model
- **ETL utilities** for cleaning and summarizing data
- **React dashboard** (tasks + charts + prediction form)


## 🧪 Quick Usage

1. Start backend (`uvicorn backend.main:app --reload`)
2. Start frontend (`cd frontend/web && npm run dev`)
3. Login with the seeded user:
   - Email: `admin@example.com`
   - Password: `password123`


## 📌 Notes

- You can use SQLite (`app.db`) by default; change `backend/config.py` to connect to PostgreSQL.
- The model used for `/predict` is a simple demo network. Replace training data and model logic in `training/train_forecast.py` and `backend/predictor.py` for production.

---

Enjoy building! 🎉
