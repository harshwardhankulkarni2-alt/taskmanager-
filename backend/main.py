from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models

from routers.users import router as users_router
from routers.tasks import router as tasks_router
from routers.websockets import router as websocket_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Task Manager API",
    description="Backend API for a real-time task manager",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(tasks_router)
app.include_router(websocket_router)


@app.get("/")
def root():
    return {"message": "Task Manager API is running"}