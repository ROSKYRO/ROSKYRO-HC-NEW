# ROSKYRO — pre-launch fix pass

Everything below was found by reading the full codebase and has been fixed in
this copy. Items are ordered by how badly they hurt on a live site.

---

## ⚠️ Do this before you deploy

The backend now **refuses to boot with `ENV=production`** until these are set.
That is deliberate — it is the only reliable way to stop the old default
credentials reaching a live site.

| Variable | Value |
|---|---|
| `ENV` | `production` |
| `SECRET_KEY` | long random string — `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `CORS_ORIGINS` | `https://roskyro.in,https://www.roskyro.in` |
| `ADMIN_SEED_PHONE` | the phone number you will log in with |
| `ADMIN_SEED_PASSWORD` | a strong password (10+ chars) |
| `SEED_DEMO_DATA` | `false` |
| `VITE_ADMIN_LOGIN_PATH` | change it from the default `/team-portal-9f3k` |
| `VITE_WHATSAPP_BOOKING_NUMBER` / `VITE_WHATSAPP_SUPPORT_NUMBER` / `VITE_SUPPORT_PHONE_DISPLAY` | your real numbers (build-time args) |

See `backend/.env.example` and `frontend/.env.example`.

**If a build is already live with the old code, change the admin password right
now** — `9999999999 / admin123` is published in the repository.

---

## Critical — security

1. **Hardcoded admin login removed.** `seed.py` created `9999999999 / admin123`
   (and a demo Hospital Console login `9999999997 / hospital123`) on every
   fresh deploy. Those credentials are in the repo, so anyone who had seen the
   code could sign in as an administrator. The admin account is now created
   only from `ADMIN_SEED_PHONE` / `ADMIN_SEED_PASSWORD`; in development, with
   nothing configured, it generates a random password and logs it once.

2. **Default `SECRET_KEY` could reach production.** Every session token is
   signed with it, so the published default meant anyone could forge an admin
   JWT without ever logging in. `Settings.validate_for_boot()` now blocks
   startup in production on a default or short key.

3. **Path traversal in the static file handler** (`main.py`). `os.path.join(STATIC_DIR, full_path)`
   with a user-controlled path let a request such as `/%2e%2e/%2e%2e/etc/passwd`
   escape `app/static` and read arbitrary container files, including the
   application source. Now resolved with `realpath` and confirmed to sit inside
   the static root.

4. **Demo hospital is opt-in** (`SEED_DEMO_DATA`, forced off in production).

5. **API docs hidden in production.** `/docs`, `/redoc` and `/openapi.json`
   published the entire admin/hospital/officer API surface publicly.

6. **Container no longer runs as root** (root `Dockerfile`).

7. **`robots.txt`** now disallows `/admin`, `/hospital/`, `/officer/`, `/member`.

## Critical — correctness

8. **Illegal CORS combination.** `allow_origins=["*"]` with
   `allow_credentials=True` is rejected by every browser, so on a two-service
   deploy every cross-origin call failed silently. Credentials are now enabled
   only when real origins are listed (auth is a Bearer header, not a cookie).

9. **Unknown `/api/*` returned `index.html` with HTTP 200** instead of a JSON
   404, so the frontend got HTML where it expected JSON and failed with a
   confusing parse error.

10. **WhatsApp numbers were dropped on the combined deploy.** The root
    `Dockerfile` only forwarded `VITE_ADMIN_LOGIN_PATH`, so every CTA shipped
    with the placeholder number baked in. All four `VITE_*` args now pass through.

11. **No rate limiting on public write endpoints** — signup, complaints,
    partner application, city interest. A single script could flood the admin
    console. Added `SIGNUP_RATE_LIMIT` and `PUBLIC_FORM_RATE_LIMIT`.

12. **LIKE wildcard in city interest.** A `city_name` of `%` matched the first
    existing city and incremented its counter instead of creating a new one.

## High — crashes users would have seen

13. **Duplicate signup returned a bare 500.** A blank email was stored as `""`,
    which collides on the UNIQUE index with the next blank-email signup; races
    on phone number did the same. Blanks are stored as `NULL` and
    `IntegrityError` is caught and turned into a readable 400.

14. **Deactivated customers could log in** and receive a token every subsequent
    request then rejected — a dead end with no explanation.

15. **`member_code` collisions crashed membership signup.** `RM-{random 5 digits}`
    against a UNIQUE column collides within a few thousand members. Now retries
    against the database and widens the range as a fallback.

16. **Invalid `status_filter` query params → 500** on six admin endpoints
    (memberships, membership invoices, partner applications, appointment
    requests, notifications, hospital invoices). New `core/enums.py` helper
    returns a 400 listing the accepted values.

17. **Expired sessions broke every dashboard.** Nothing handled a 401, so after
    the 7-day token expiry the stale user stayed in `localStorage` and each
    page showed empty/broken panels forever. `api/client.js` now clears the
    session and redirects to the right login page (customer vs hospital),
    while leaving genuine "wrong password" 401s on the login endpoints alone.

18. **Corrupt `localStorage` white-screened the app.** `JSON.parse` in the
    `AuthProvider` initializer threw before React rendered anything. All
    storage access is now guarded, including Safari private-mode write quota.

19. **`pending_discharge` was a dead end** in the officer's discharge link — no
    copy and the confirm form hidden, so such a case could never be closed.

20. **`test_booking_timestamps.py` broke the whole test suite.** It imports
    `app.models.service`, deleted with the booking feature, so `pytest` could
    not collect *any* test. Renamed to `.py.disabled`.

## Medium — visible to customers

21. **Tailwind config silently killed two colour palettes.** Declaring
    `violet: "#4B21C4"` as a bare string replaced Tailwind's entire built-in
    violet scale, and `emerald` only defined 5 of its shades. Roughly **55 class
    usages generated no CSS at all** and rendered uncoloured — `text-emerald-800`
    (12×), `border-emerald-200` (10×), `text-emerald-400` (7×), `text-violet-300`,
    `bg-violet-50`, `from-emerald-950` and more. Both are now full scales with a
    `DEFAULT`, so existing `bg-violet` / `text-emerald` usage is unchanged.
    Added the `rose` shades used by the officer error panel.

22. **`animate-fadeIn` was never defined** — used in Hero, ThreePillarsSection
    and the Navbar mobile drawer. Keyframes and animation added.

23. **Invalid spacing classes.** Tailwind has no `4.5` step, so `w-4.5 h-4.5`
    and `py-4.5` produced nothing. Added to the spacing scale.

24. **890 KB favicon on every page load.** `brand/logo.png` is 1254×1254 / 890 KB
    and was used as the favicon *and* as a 16-pixel inline icon in eight places —
    brutal on a mobile connection. Generated `favicon-64.png` (3 KB),
    `icon-192.png` (13 KB), `icon-512.png` (98 KB), `apple-touch-icon.png` (26 KB),
    `brand/logo-sm.png` (7 KB, used for every on-page logo) and
    `brand/logo-og.png` (137 KB, for social previews). The original is untouched.

25. **`manifest.json` lied about icon sizes** (`512x512` pointing at a 1254 px
    file) and had no maskable or 192 px icon. Rewritten.

26. **Missing `fonts.gstatic.com` preconnect**, so the Google Fonts stylesheet
    resolved before the font files could start downloading.

27. **Seed city contradicted the site.** It created `INDIA / Bihar` as the live
    city while every page says "Ambikapur, Chhattisgarh pilot". Now seeds
    `Ambikapur / Chhattisgarh`.

28. **`sitemap.xml` listed 2 of 10 public routes.** Rewritten.

29. **Prerender tree didn't match the client tree.** `entry-server.jsx` omitted
    `LanguageProvider`, so prerendered HTML fell back to the no-provider default
    and could differ from what the browser renders.

30. **A seed failure took the whole app down.** Now logged and survived.

31. **Doctor timestamps were serialized wrong.** `app/schemas/doctor.py` used a
    bare `datetime` on 5 fields (`created_at`, `portal_token_expires_at`,
    `expires_at`, `occurred_at`) instead of the app's `UTCDateTime`, so the
    doctor portal (unlike every other page) would have shown timestamps
    ~5h30m off from real IST time. `test_timezone.py` now actually catches
    this — it originally passed only because these fields were missed.

32. **A missing/stale static asset silently returned `index.html` (200)
    instead of a 404.** After any redeploy that changes the hashed JS/CSS
    filenames, a browser tab left open on the old page would request the old
    `/assets/index-<oldhash>.js`, get back HTML instead of JS, and fail with a
    confusing MIME-type error instead of the browser cleanly reloading. The
    SPA fallback in `main.py` now only applies to extension-less paths (real
    client routes); anything that looks like a static file and isn't found
    404s.

33. **No root `.gitignore` existed at all.** `.env` secrets, the local SQLite
    dev database, `node_modules/`, and the frontend `dist/` build could all
    have been committed by accident. Added.

34. **`backend/.env.example` and `frontend/.env.example` were referenced by
    this file but not actually in the repo.** Added both, matching every real
    setting in `app/core/config.py` and every `VITE_*` var the frontend reads.

---

## Checked and clean

- Every `.jsx`/`.js` file parses; no undefined components or variables.
- All 80+ frontend API calls match a real backend route.
- All Python compiles.
- Discharge/billing logic, the officer roster capacity guard, and the
  token-expiry rules on the no-login officer links all read as correct.

## Still worth doing (not bugs, but next)

- Swap `Base.metadata.create_all()` + `db/migrate.py` for Alembic.
- `slowapi` uses in-memory counters — point it at Redis before running more
  than one backend instance, or the limits multiply by instance count.
- `db.query(Model).get(id)` is the SQLAlchemy 1.x API and warns on 2.0; prefer
  `db.get(Model, id)`.
- `@app.on_event("startup")` is deprecated in favour of a lifespan handler.
- Wire `services/notifications.py` to a real WhatsApp provider; today every
  message waits in a manual admin queue.
