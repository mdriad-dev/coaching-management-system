from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from .config import get_settings
from .api import router
from .db import Base, engine

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.api_version,
    description="REST API for the multi-branch coaching management system.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)

frontend_index = Path(__file__).resolve().parent.parent / "static" / "index.html"


@app.on_event("startup")
def create_development_tables() -> None:
    if settings.app_env != "production":
        Base.metadata.create_all(bind=engine)


@app.get("/", response_model=None, tags=["system"])
def home() -> FileResponse | dict[str, str]:
    if frontend_index.exists():
        return FileResponse(frontend_index)
    return {"message": f"{settings.app_name} API is running"}


@app.get("/api/v1/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "environment": settings.app_env,
        "version": settings.api_version,
    }


@app.get("/students", tags=["students"])
def get_students() -> dict[str, list[dict[str, int | str]]]:
    return {
        "students": [
            {"id": 1, "name": "Riad"},
            {"id": 2, "name": "Rahim"},
            {"id": 3, "name": "Sakib"},
        ]
    }


@app.get("/{path:path}", include_in_schema=False)
def frontend_fallback(path: str) -> FileResponse:
    if frontend_index.exists():
        return FileResponse(frontend_index)
    raise HTTPException(status_code=404, detail="Frontend is not available")