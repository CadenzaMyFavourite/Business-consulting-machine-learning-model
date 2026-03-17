"""Load sample data into the backend database for local development."""

import os
import sys

# Ensure project root is on sys.path when running directly from the data/ folder.
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

import pandas as pd

from backend.database import init_db, get_session
from backend import crud, schemas


def load_sample_data():
    init_db()

    # Create an admin user for local testing
    with next(get_session()) as db:
        admin = crud.get_user_by_email(db, "admin@example.com")
        if not admin:
            admin = crud.create_user(
                db,
                schemas.UserCreate(email="admin@example.com", password="password123"),
            )

        # Load tasks from CSV and link to admin user
        df = pd.read_csv("data/sample_tasks.csv")
        for row in df.to_dict(orient="records"):
            crud.create_task(
                db,
                schemas.TaskCreate(
                    title=row.get("title", ""),
                    description=row.get("description"),
                    status=row.get("status", "todo"),
                    priority=int(row.get("priority", 3)),
                    due_date=row.get("due_date"),
                ),
                owner_id=admin.id,
            )

    print("Loaded sample data and created an admin user (admin@example.com / password123)")


if __name__ == "__main__":
    load_sample_data()
