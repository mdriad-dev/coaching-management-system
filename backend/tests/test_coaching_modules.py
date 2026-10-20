from datetime import time
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas import MarkCreate, TimetableCreate


def test_timetable_payload_accepts_a_valid_class_slot() -> None:
    payload = TimetableCreate(
        batch_id=1,
        teacher_id=2,
        weekday="Monday",
        starts_at=time(9, 0),
        ends_at=time(10, 30),
        room="Room A",
    )

    assert payload.starts_at == time(9, 0)


def test_mark_payload_rejects_negative_scores() -> None:
    with pytest.raises(ValidationError):
        MarkCreate(
            student_id=1,
            batch_id=1,
            assessment_name="Weekly test",
            max_marks=Decimal("100"),
            obtained_marks=Decimal("-1"),
        )
