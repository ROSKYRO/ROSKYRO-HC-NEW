"""
Central configuration for ROSKYRO.

All environment-specific values (DB url, secret key, business rule constants)
live here so the rest of the app never hardcodes them. Override anything via
a .env file or real environment variables in production/deployment.
"""
from pydantic import field_validator
from pydantic_settings import BaseSettings
from typing import List

# The literal shipped-in-the-repo defaults. Anything matching these must never
# survive into a production boot — see Settings.is_production / validate_for_boot().
DEFAULT_SECRET_KEY = "change-this-in-production-to-a-long-random-string"
DEFAULT_ADMIN_PASSWORD = "admin123"
DEFAULT_HOSPITAL_PASSWORD = "hospital123"


class Settings(BaseSettings):
    APP_NAME: str = "ROSKYRO"
    ENV: str = "development"

    # Use SQLite for local/dev by default; point DATABASE_URL at Postgres in prod.
    # Railway's Postgres plugin injects DATABASE_URL automatically (as postgres://,
    # which we normalize to postgresql:// below since SQLAlchemy/psycopg2 need that).
    DATABASE_URL: str = "sqlite:///./roskyro.db"

    SECRET_KEY: str = "change-this-in-production-to-a-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days (customer sessions)

    # Admin/support sessions. Matches customer session length (7 days) for
    # convenience — shorten this back down (e.g. 60-120 minutes) if you'd
    # rather trade convenience for a smaller window if a token ever leaks.
    ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Basic login rate limiting (per IP). Admin login gets a tighter limit.
    LOGIN_RATE_LIMIT: str = "10/minute"
    ADMIN_LOGIN_RATE_LIMIT: str = "5/minute"

    # Kept as a plain string (not List[str]) because pydantic-settings tries to
    # JSON-parse env vars for list-typed fields, which breaks Railway's plain
    # comma-separated env var style. Use the `cors_origins` property below to
    # get the parsed list. Accepts "*" , "https://a.com,https://b.com", or a
    # JSON array string like '["https://a.com"]'.
    CORS_ORIGINS: str = "*"

    # Auto-seed the database with launch services/cities/admin on first boot if empty.
    # Safe to leave on in production — seed.py is idempotent (checks before inserting).
    AUTO_SEED: bool = True

    # Optional: set these as Railway Variables to reset the admin login on next boot
    # (e.g. after the default 9999999999/admin123 has been used). Leave unset normally —
    # when both are set, seed.py overwrites the existing admin's phone/password with
    # these values on every boot, so remove the variables again once you've changed in.
    ADMIN_RESET_PHONE: str | None = None
    ADMIN_RESET_PASSWORD: str | None = None

    # Credentials used when the FIRST admin account is created (first boot on an
    # empty database). Unlike ADMIN_RESET_*, these are only ever applied when no
    # admin exists yet, so they're safe to leave set permanently. In production
    # these are REQUIRED — without them the app refuses to boot rather than
    # quietly creating the well-known 9999999999 / admin123 account.
    ADMIN_SEED_PHONE: str | None = None
    ADMIN_SEED_PASSWORD: str | None = None

    # The demo partner hospital + its "hospital123" Hospital Console login are
    # useful for a local walkthrough and dangerous on a live site, so they are
    # off unless explicitly asked for.
    SEED_DEMO_DATA: bool = False

    # Anti-spam limits for the unauthenticated public forms (signup, complaint,
    # partner application, city interest). These endpoints write to the database
    # and had no limit at all, so a single script could flood the admin console.
    SIGNUP_RATE_LIMIT: str = "5/minute"
    PUBLIC_FORM_RATE_LIMIT: str = "10/minute"

    @field_validator("DATABASE_URL")
    @classmethod
    def _normalize_db_url(cls, v: str) -> str:
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)
        return v

    @property
    def cors_origins(self) -> List[str]:
        raw = self.CORS_ORIGINS.strip()
        if raw.startswith("["):
            import json
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                pass
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    @property
    def cors_allow_credentials(self) -> bool:
        """`Access-Control-Allow-Origin: *` together with
        `Access-Control-Allow-Credentials: true` is an illegal combination —
        browsers reject every such response, so a wildcard CORS config with
        credentials on silently breaks every cross-origin call. Auth here is a
        Bearer header (not a cookie), so credentials are simply turned off
        whenever the origin list is a wildcard, which is the combination that
        actually works."""
        return "*" not in self.cors_origins

    @property
    def is_production(self) -> bool:
        return self.ENV.strip().lower() in ("production", "prod", "live")

    def validate_for_boot(self) -> List[str]:
        """Refuse to start a production deploy that is still carrying the
        repo's example secrets. Returns a list of fatal problems (empty =
        safe to boot). Called from main.py before the app is built."""
        problems: List[str] = []
        if not self.is_production:
            return problems
        if self.SECRET_KEY == DEFAULT_SECRET_KEY or len(self.SECRET_KEY) < 32:
            problems.append(
                "SECRET_KEY is still the shipped default (or is shorter than 32 "
                "characters). Anyone who has seen this repository could forge an "
                "admin session token. Set a long random SECRET_KEY environment "
                "variable, e.g. `python -c \"import secrets; print(secrets.token_urlsafe(48))\"`."
            )
        if "*" in self.cors_origins:
            problems.append(
                "CORS_ORIGINS is \"*\". Set it to your real site origin(s), e.g. "
                "CORS_ORIGINS=https://roskyro.in,https://www.roskyro.in"
            )
        if self.SEED_DEMO_DATA:
            problems.append(
                "SEED_DEMO_DATA is on in production — that creates a demo hospital "
                "with a publicly documented login. Set SEED_DEMO_DATA=false."
            )
        if self.AUTO_SEED and not (self.ADMIN_SEED_PHONE and self.ADMIN_SEED_PASSWORD) \
                and not (self.ADMIN_RESET_PHONE and self.ADMIN_RESET_PASSWORD):
            problems.append(
                "No admin credentials configured. Set ADMIN_SEED_PHONE and "
                "ADMIN_SEED_PASSWORD (first boot) so the admin account is never "
                "created with the default 9999999999 / admin123 login."
            )
        for label, value in (("ADMIN_SEED_PASSWORD", self.ADMIN_SEED_PASSWORD),
                             ("ADMIN_RESET_PASSWORD", self.ADMIN_RESET_PASSWORD)):
            if value and (value == DEFAULT_ADMIN_PASSWORD or len(value) < 10):
                problems.append(f"{label} is too weak — use at least 10 characters.")
        return problems

    # ---- Business rule constants (mirrors the source business model) ----
    GST_PERCENT: float = 18.0
    FREE_CUSHION_MINUTES: int = 15
    MIN_BILLABLE_FRACTION_SHORT: float = 0.5   # bookings < 4 hrs: min 50% of booked hours billed
    MIN_BILLABLE_FRACTION_LONG: float = 0.75   # bookings >= 4 hrs: min 75% of booked hours billed
    LONG_BOOKING_HOURS_THRESHOLD: float = 4.0
    RETURN_SUPPORT_FEE: float = 49.0           # flat fee if service ends at a different location

    # Arrival fee tiers: (max_km, fee). First matching tier (by distance) applies.
    ARRIVAL_FEE_TIERS: List[List[float]] = [
        [3, 0],
        [8, 29],
        [13, 59],
        [18, 79],
        [999, 99],
    ]

    FIRST_HOUR_FREE_SLOTS: int = 50  # launch-offer style promo, configurable per city
    SUPPORT_EMAIL: str = "support@roskyro.in"

    # ---- Hospital patient-case / dual discharge confirmation rules ----
    # How far in the future a confirmed discharge date/time may be. This is a
    # confirmation of something that already happened, so the only slack here
    # is for clock skew between the phone/browser and the server.
    DISCHARGE_FUTURE_TOLERANCE_MINUTES: int = 15
    # How far apart the hospital's and the officer's confirmed discharge
    # date/times may be before we stop accepting the second one silently.
    # Beyond this, the two sides genuinely disagree about what happened and a
    # human (ROSKYRO Admin, via force-close) has to decide.
    DISCHARGE_MAX_CONFIRMATION_GAP_HOURS: int = 72
    # How long an officer's no-login discharge link stays usable after it is
    # issued/refreshed. A leaked link stops working after this.
    OFFICER_DISCHARGE_LINK_TTL_DAYS: int = 30
    # A case sitting half-confirmed for longer than this shows up as an alert
    # on the ops board (warning), then escalates (critical).
    DISCHARGE_PENDING_ALERT_HOURS: int = 24
    DISCHARGE_PENDING_ESCALATE_HOURS: int = 72
    # The Hospital Console no longer confirms discharge itself (ROSKYRO's
    # assigned officer is the sole confirming side, with a photo as proof).
    # Instead, the hospital is notified (WhatsApp/SMS) the moment the officer
    # confirms, and has this many hours to raise a dispute if it's wrong
    # before ROSKYRO treats the discharge as settled.
    HOSPITAL_DISCHARGE_DISPUTE_WINDOW_HOURS: int = 48

    # How many patients one Relationship Officer can be covering on the same
    # calendar day before the ops board refuses the assignment (a human can
    # consciously override this — see AssignOfficerIn.force — but it never
    # slides past silently). A hospital-program-specific cap, separate from
    # anything in the on-demand booking marketplace.
    MAX_DAILY_PATIENTS_PER_OFFICER: int = 4
    # Same idea as OFFICER_DISCHARGE_LINK_TTL_DAYS, but for the officer's
    # standing "my day" portal link rather than a single case's link.
    OFFICER_PORTAL_TOKEN_TTL_DAYS: int = 30

    class Config:
        env_file = ".env"


settings = Settings()
