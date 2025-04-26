from functools import wraps
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from typing import Callable, TypeVar, Any, Literal

T = TypeVar("T")
OperationType = Literal["read", "write"]


def handle_db_errors(operation_name: str, operation_type: OperationType = "read"):
    """
    Decorator to handle database errors consistently across services.

    Args:
        operation_name (str): Name of the operation for error message
        operation_type (OperationType): Type of operation - "read" or "write".
            Only "write" operations will attempt rollback.

    Returns:
        Callable: Decorated function with error handling
    """

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            try:
                return await func(*args, **kwargs)
            except SQLAlchemyError as e:
                # Only attempt rollback for write operations
                if operation_type == "write":
                    # Find the db session in args or kwargs
                    db = next(
                        (arg for arg in args if isinstance(arg, AsyncSession)), None
                    )
                    if db is None:
                        db = kwargs.get("db")

                    # Rollback if we have a session
                    if db:
                        await db.rollback()

                raise HTTPException(
                    status_code=500,
                    detail=f"Database error occurred while {operation_name}",
                )

        return wrapper

    return decorator
