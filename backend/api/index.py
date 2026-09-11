"""Vercel Python entrypoint for a standalone backend deployment.

Any `.py` file under `api/` is auto-detected by Vercel as a serverless
function when this directory (`backend/`) is the project's Root Directory -
no vercel.json needed. `requirements.txt` lives one level up, at the project
root (`backend/requirements.txt`), which is exactly where Vercel looks for
it. This file just re-exports the actual FastAPI app from `app.main` so
there's a single source of truth for the application code; the Docker path
(`entrypoint.sh` + `uvicorn app.main:app`) is untouched.
"""

from app.main import app  # noqa: F401
