from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models import Task, User
from schemas import TaskCreate, TaskResponse, TaskUpdate
from websocket_manager import manager


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_task = Task(
        title=task.title,
        description=task.description,
        owner_id=current_user.id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    await manager.broadcast({
        "type": "task_created",
        "task": {
            "id": new_task.id,
            "title": new_task.title,
            "description": new_task.description,
            "completed": new_task.completed,
            "owner_id": new_task.owner_id
        }
    })

    return new_task


@router.get(
    "/",
    response_model=list[TaskResponse]
)
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Task).filter(
        Task.owner_id == current_user.id
    ).all()


@router.get(
    "/status/{completed}",
    response_model=list[TaskResponse]
)
def get_tasks_by_status(
    completed: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.completed == completed
    ).all()


@router.get(
    "/{task_id}",
    response_model=TaskResponse
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put(
    "/{task_id}",
    response_model=TaskResponse
)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task_data.title is not None:
        task.title = task_data.title

    if task_data.description is not None:
        task.description = task_data.description

    if task_data.completed is not None:
        task.completed = task_data.completed

    db.commit()
    db.refresh(task)

    await manager.broadcast({
        "type": "task_updated",
        "task": {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "owner_id": task.owner_id
        }
    })

    return task


@router.patch(
    "/{task_id}/complete",
    response_model=TaskResponse
)
async def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.completed = True

    db.commit()
    db.refresh(task)

    await manager.broadcast({
        "type": "task_updated",
        "task": {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "owner_id": task.owner_id
        }
    })

    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    await manager.broadcast({
        "type": "task_deleted",
        "task_id": task_id
    })

    return None