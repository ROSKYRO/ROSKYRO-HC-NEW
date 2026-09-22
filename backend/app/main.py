import logging
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.core.limiter import limiter
from app.db.session import Base, engine
from app.db.migrate import sync_missing_columns, sync_missing_enum_values
from app.routers import (
    auth, agents, misc, admin, membership, priority_access, officer,
    hospitals, hospital_admin, doctor,
)

logger = logging.getLogger("roskyro")

# Refuse to boot a production deploy that is still carrying the repo's example
# secrets (default SECRET_KEY, wildcard CORS, default admin login, demo data).
# Failing loudly here is the point: a site that silently went live with
# admin123 is far worse than a deploy that stops and tells you what to set.
_config_problems = settings.validate_for_boot()
if _config_problems:
    raise RuntimeError(
        "ROSKYRO refused to start — unsafe production configuration:\n"
        + "\n".join(f"  - {p}" for p in _config_problems)
        + "\n\nSet these as environment variables (Railway → Variables) and redeploy. "
          "To run with the insecure defaults on purpose (local/staging only), set ENV=development."
    )

# Auto-create tables on boot for simplicity (swap for Alembic migrations in production).
Base.metadata.create_all(bind=engine)
# Then patch in anything a model gained on an already-existing table that
# create_all() alone never touches: new columns (e.g. User.hospital_id) and
# new members on an existing Postgres enum type (e.g. UserRole.hospital_staff).
# See db/migrate.py for exactly why both steps exist.
sync_missing_columns(engine, Base)
sync_missing_enum_values(engine, Base)

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="Backend API for ROSKYRO — a verified on-demand care & assistance marketplace.",
    version="1.0.0",
    # /docs, /redoc and /openapi.json publish the complete admin, hospital and
    # officer API surface — including every field name and enum value — to
    # anyone who visits. Useful while building, so they stay on in development
    # and are switched off on the live site.
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    # A wildcard origin with credentials on is rejected by every browser, so
    # credentials are only enabled when real origins are listed. Auth is a
    # Bearer header, not a cookie, so nothing needs credentials either way.
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All API routes live under /api so they never collide with the frontend's own
# client-side routes of the same name (e.g. the React app also has a "/admin" page).
app.include_router(auth.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(misc.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(membership.router, prefix="/api")
app.include_router(priority_access.router, prefix="/api")
app.include_router(officer.router, prefix="/api")
app.include_router(doctor.router, prefix="/api")
app.include_router(hospitals.public_router, prefix="/api")
app.include_router(hospitals.router, prefix="/api")
app.include_router(hospital_admin.router, prefix="/api")


@app.on_event("startup")
def seed_on_boot():
    # Populates cities/admin login on first boot only, and upserts any new
    # services (by slug) on every boot — safe to leave on for every deploy.
    if settings.AUTO_SEED:
        from app.seed import run as run_seed
        try:
            run_seed()
        except Exception:
            # A seed hiccup (e.g. a unique clash against pre-existing rows)
            # must not stop an already-working deploy from serving customers.
            logger.exception("Seed on boot failed — continuing without it")


@app.get("/health")
def health():
    return {"status": "ok"}


# --- Combined single-service deploy: serve the built React frontend ---
# When the frontend is built into backend/app/static (see root Dockerfile), this
# app serves both the API (under /api) and the website (everything else) from one
# process/one Railway service. If app/static doesn't exist (e.g. running the
# backend alone via `backend/Dockerfile` in the two-service setup), this block is
# skipped and only the JSON API responds — nothing breaks either way.
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

STATIC_ROOT = os.path.realpath(STATIC_DIR)

if os.path.isdir(STATIC_DIR):
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        # An unmatched /api/* path must NOT fall through to index.html: the
        # frontend would receive 200 + HTML where it expects JSON and fail with
        # a confusing parse error instead of a clean 404.
        if full_path == "api" or full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")

        # Resolve the requested path and confirm it really sits inside the
        # static directory. Without this, an encoded traversal such as
        # /%2e%2e/%2e%2e/etc/passwd is decoded by Starlette into "../../etc/passwd"
        # and os.path.join happily walks out of app/static, serving arbitrary
        # files (including app source) off the container.
        candidate = os.path.realpath(os.path.join(STATIC_ROOT, full_path))
        inside_static = candidate == STATIC_ROOT or candidate.startswith(STATIC_ROOT + os.sep)
        if full_path and inside_static and os.path.isfile(candidate):
            return FileResponse(candidate)

        # A path that LOOKS like a static asset (has a file extension, e.g.
        # /assets/index-abc123.js or /favicon.ico) but wasn't found above is a
        # real 404 — a stale hashed filename after a redeploy, a typo'd image
        # path, etc. Falling through to index.html here used to return 200
        # HTML for a request the browser made expecting JS/CSS, so a stale
        # cached page failed with a confusing MIME/parse error instead of a
        # clean 404 the browser (or a service worker) could react to.
        last_segment = full_path.rsplit("/", 1)[-1]
        looks_like_asset = "." in last_segment
        if looks_like_asset:
            raise HTTPException(status_code=404, detail="Not found")

        # Anything else (/, /login, /my-bookings, /admin, deep links, refreshes)
        # falls back to index.html so React Router can take over client-side.
        return FileResponse(os.path.join(STATIC_ROOT, "index.html"))
else:
    @app.get("/")
    def root():
        return {"app": settings.APP_NAME, "status": "live"}
