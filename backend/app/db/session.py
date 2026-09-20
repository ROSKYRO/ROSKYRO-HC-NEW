from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

is_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    # Railway's Postgres proxy drops idle connections after a few minutes.
    # Without pool_pre_ping, the first request after a quiet period reuses a
    # dead socket and fails with "server closed the connection unexpectedly" —
    # a 500 for whichever customer happened to arrive first. pre_ping costs one
    # trivial round-trip and retries transparently; pool_recycle retires
    # connections before the proxy has a chance to kill them.
    pool_pre_ping=not is_sqlite,
    pool_recycle=280 if not is_sqlite else -1,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
