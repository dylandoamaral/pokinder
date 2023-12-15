import uuid


def is_uuid(value: str):
    try:
        uuid.UUID(value)
        return True
    except ValueError:
        return False
