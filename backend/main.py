from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from backend.config import settings
from backend.database import init_db, get_session
from backend import schemas, crud, auth, predictor, ws

app = FastAPI(title=settings.app_name, version="0.1.0")

# Allow local frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict this!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    predictor.load_model()


@app.post("/auth/register", response_model=schemas.UserRead)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_session)):
    existing = crud.get_user_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user_in)


@app.post("/auth/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=schemas.UserRead)
def read_current_user(current_user: dict = Depends(auth.get_current_active_user)):
    return current_user


@app.get("/tasks", response_model=list[schemas.TaskRead])
def list_tasks(
    current_user=Depends(auth.get_current_active_user),
    db: Session = Depends(get_session),
):
    return crud.get_tasks_for_user(db, user_id=current_user.id)


@app.post("/tasks", response_model=schemas.TaskRead)
async def create_task(
    task_in: schemas.TaskCreate,
    current_user=Depends(auth.get_current_active_user),
    db: Session = Depends(get_session),
):
    task = crud.create_task(db, task_in, owner_id=current_user.id)
    await ws.manager.broadcast({"type": "task_created", "task": task.dict()})
    return task


@app.put("/tasks/{task_id}", response_model=schemas.TaskRead)
async def update_task(
    task_id: int,
    task_in: schemas.TaskCreate,
    current_user=Depends(auth.get_current_active_user),
    db: Session = Depends(get_session),
):
    task = crud.update_task(db, task_id, task_in, owner_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await ws.manager.broadcast({"type": "task_updated", "task": task.dict()})
    return task


@app.delete("/tasks/{task_id}", status_code=204)
async def delete_task(
    task_id: int,
    current_user=Depends(auth.get_current_active_user),
    db: Session = Depends(get_session),
):
    deleted = crud.delete_task(db, task_id, owner_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    await ws.manager.broadcast({"type": "task_deleted", "task_id": task_id})
    return {"ok": True}


@app.post("/predict")
def predict_kpi(
    features: schemas.ModelInput,
    current_user=Depends(auth.get_current_active_user),
):
    prediction = predictor.predict(features)
    return {"prediction": prediction}


@app.websocket("/ws/tasks")
async def websocket_tasks(websocket: WebSocket):
    await ws.manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws.manager.disconnect(websocket)
