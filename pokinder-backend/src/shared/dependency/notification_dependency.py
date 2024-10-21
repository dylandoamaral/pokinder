from typing import Protocol, runtime_checkable


@runtime_checkable
class NotificationDependency(Protocol):
    def send_notification(self, json: dict) -> None:
        pass
