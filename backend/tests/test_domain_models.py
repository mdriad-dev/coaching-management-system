from decimal import Decimal

from app.models import (
    AttendanceStatus,
    Batch,
    Course,
    Enrollment,
    Payment,
)


def test_domain_models_accept_valid_academic_and_financial_values() -> None:
    course = Course(
        organization_id=1,
        name="Python Fundamentals",
        code="PY-101",
        duration_months=3,
        monthly_fee=Decimal("125.00"),
    )
    batch = Batch(
        branch_id=1,
        course_id=1,
        name="Morning",
        capacity=25,
    )
    enrollment = Enrollment(student_id=1, batch_id=1)
    payment = Payment(
        student_id=1,
        amount=Decimal("125.00"),
        payment_method="cash",
    )

    assert course.monthly_fee == Decimal("125.00")
    assert batch.capacity == 25
    assert enrollment.is_active is None
    assert payment.amount == Decimal("125.00")
    assert AttendanceStatus.PRESENT.value == "present"
