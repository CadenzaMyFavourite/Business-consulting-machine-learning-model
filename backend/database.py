from sqlmodel import SQLModel, create_engine, Session

from backend.config import settings

# SQLite needs this flag when used with multiple threads (e.g. FastAPI)
engine = create_engine(
    settings.database_url,
    echo=False,
    connect_args={"check_same_thread": False},
)


def init_db() -> None:
    """Create database tables."""
    from backend import models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
