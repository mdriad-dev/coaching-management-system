from app.security import hash_password, verify_password


def test_password_hashing_is_not_reversible_and_verifies() -> None:
    encoded = hash_password("correct horse battery staple")

    assert encoded != "correct horse battery staple"
    assert verify_password("correct horse battery staple", encoded)
    assert not verify_password("wrong password", encoded)


def test_password_hashing_uses_unique_salts() -> None:
    first = hash_password("same password")
    second = hash_password("same password")

    assert first != second
