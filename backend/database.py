from sqlmodel import SQLModel, Session, create_engine

from backend.config import settings

engine_kwargs: dict = {"echo": False}
if settings.database_url.startswith("sqlite"):
    # SQLite needs this flag when used with multiple threads (e.g. FastAPI).
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.database_url, **engine_kwargs)


def init_db() -> None:
    """Create database tables."""
    from backend import models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
