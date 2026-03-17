from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from backend import models, schemas
from backend.auth import verify_password, get_password_hash


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    statement = select(models.User).where(models.User.email == email)
    return db.exec(statement).first()


def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    user = models.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def get_tasks_for_user(db: Session, user_id: int) -> list[models.Task]:
    statement = select(models.Task).where(models.Task.owner_id == user_id).order_by(models.Task.created_at.desc())
    return list(db.exec(statement).all())


def create_task(db: Session, task_in: schemas.TaskCreate, owner_id: int) -> models.Task:
    task = models.Task(**task_in.dict(), owner_id=owner_id, created_at=datetime.utcnow())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: int, task_in: schemas.TaskCreate, owner_id: int) -> Optional[models.Task]:
    statement = select(models.Task).where(models.Task.id == task_id, models.Task.owner_id == owner_id)
    task = db.exec(statement).first()
    if not task:
        return None
    for field, value in task_in.dict(exclude_unset=True).items():
        setattr(task, field, value)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int, owner_id: int) -> bool:
    statement = select(models.Task).where(models.Task.id == task_id, models.Task.owner_id == owner_id)
    task = db.exec(statement).first()
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True
