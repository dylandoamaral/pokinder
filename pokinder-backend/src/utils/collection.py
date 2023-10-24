from typing import Any


def arreyfy(value: Any) -> list[Any] | None:
    if value is None:
        return None
    return [value]
