from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.db import Base
from app.models import Branch, Organization, User
from app.seed import seed_demo_data


def test_seed_is_idempotent(monkeypatch, tmp_path) -> None:
    database_url = f"sqlite:///{tmp_path / 'seed.db'}"
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    session_factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    monkeypatch.setattr("app.seed.engine", engine)
    monkeypatch.setattr("app.seed.SessionLocal", session_factory)
    Base.metadata.create_all(bind=engine)

    seed_demo_data()
    seed_demo_data()

    with session_factory() as db:
        assert db.scalar(select(Organization).where(Organization.name == "Demo Coaching Organization")) is not None
        assert len(list(db.scalars(select(Branch)))) == 1
        assert len(list(db.scalars(select(User)))) == 1
