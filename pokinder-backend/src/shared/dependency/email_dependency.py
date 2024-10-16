from typing import Protocol, runtime_checkable


@runtime_checkable
class EmailDependency(Protocol):
    def send_email(self, subject: str, to: str, body: str) -> None:
        pass
