import hashlib
import secrets


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    )

    return salt + ":" + password_hash.hex()


def verify_password(
    password: str,
    stored_password: str
) -> bool:

    try:
        salt, stored_hash = stored_password.split(":")

        password_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            100000
        )

        return secrets.compare_digest(
            password_hash.hex(),
            stored_hash
        )

    except ValueError:
        return False