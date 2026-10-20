from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.on_event("startup")
def create_development_tables() -> None:
    if settings.app_env != "production":
        Base.metadata.create_all(bind=engine)


@app.get("/", tags=["system"])
def home() -> dict[str, str]:
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