"""
Test-only helper: point the whole app at a brand-new, isolated SQLite file.

Why this exists: app.db.session's `engine`/`SessionLocal` are created once,
at that module's FIRST import, from settings.DATABASE_URL. Setting
os.environ["DATABASE_URL"] before `from app.main import app` only controls
that first import — every test_*.py script imported afterwards in the same
process (e.g. when pytest collects several of these scripts together, or
several are run back-to-back in one interpreter) would otherwise silently
share whichever database got bound first, and collide on the same phone
numbers / IDs another test already inserted.

reset_test_database() fixes that regardless of import order: call it right
after `from app.main import app` (the earliest point every model is
registered on Base.metadata) and before pulling anything else out of
app.db.session — it swaps in a fresh engine + SessionLocal bound to their
own temp file and creates every table on it. Every router's
`Depends(get_db)` picks this up automatically: get_db() looks up the
module-level `SessionLocal` name at call time, not at import time, so
reassigning it here redirects every future request without needing
`app.dependency_overrides`.
"""
import tempfile

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.db.session as db_session
from app.db.migrate import sync_missing_columns, sync_missing_enum_values


def reset_test_database() -> str:
    """Point the app at a brand-new SQLite file and create every table on
    it. Returns the file path (handy to print when debugging a failure)."""
    db_path = tempfile.mktemp(suffix=".db")
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    db_session.engine = engine
    db_session.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db_session.Base.metadata.create_all(bind=engine)
    # Mirrors exactly what app.main does at import time (see the comment
    # there) -- needed here too since Base.metadata.create_all() alone won't
    # backfill columns/enum values onto a table that's only in memory because
    # an EARLIER test's import of app.main already ran it once.
    sync_missing_columns(engine, db_session.Base)
    sync_missing_enum_values(engine, db_session.Base)
    return db_path
