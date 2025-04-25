import sqlalchemy
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()

db_host = POSTGRES_HOST = os.getenv("POSTGRES_HOST")
db_port = POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
db_user = POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
db_password = POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
db_name = POSTGRES_DATABASE = os.getenv("POSTGRES_DATABASE", "postgres")
db_url = f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


engine = create_async_engine(db_url, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as db:
        yield db
