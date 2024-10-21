import requests

from src.utils.env import retrieve_discord_url

from .notification_dependency import NotificationDependency


class DiscordNotificationDependency(NotificationDependency):
    def send_notification(self, json: dict) -> None:
        webhook_url = retrieve_discord_url()

        requests.post(webhook_url, json=json)


def use_discord_notification_dependency() -> NotificationDependency:
    return DiscordNotificationDependency()
