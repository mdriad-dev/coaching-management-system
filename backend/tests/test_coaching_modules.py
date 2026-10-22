from datetime import time, datetime, UTC
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas import MarkCreate, TimetableCreate, BranchCreate, PaymentCreate, EnrollmentCreate


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


def test_branch_create_payload() -> None:
    payload = BranchCreate(code="UTTARA", name="Uttara Branch")
    assert payload.code == "UTTARA"
    assert payload.name == "Uttara Branch"


def test_payment_create_payload() -> None:
    payload = PaymentCreate(
        student_id=1,
        amount=Decimal("3500.00"),
        payment_method="bKash",
        transaction_reference="TRX123456"
    )
    assert payload.amount == Decimal("3500.00")
    assert payload.payment_method == "bKash"


def test_enrollment_create_payload() -> None:
    payload = EnrollmentCreate(student_id=1, batch_id=2)
    assert payload.student_id == 1
    assert payload.batch_id == 2
