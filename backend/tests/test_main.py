from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check_reports_api_status() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "environment": "development",
        "version": "1.0.0",
    }


def test_existing_root_endpoint_remains_available() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"].endswith("API is running")


def test_existing_students_endpoint_remains_available() -> None:
    response = client.get("/students")

    assert response.status_code == 200
    assert len(response.json()["students"]) == 3
