def render_milestone_total(amount: int, kind: str) -> dict:
    return {
        "content": "🎉 Milestone Unlocked!",
        "embeds": [
            {
                "description": f"We just hit {amount} {kind}!",
                "color": 2003199,
                "thumbnail": {
                    "url": "https://api.minio.pokinder.com:443/fusions/cf28c3dd-05ac-47c6-b983-8e469075bfdd.webp"
                },
            }
        ],
    }


def render_milestone_total_with_image(amount: int, kind: str, image: str) -> dict:
    return {
        "content": "🎉 Milestone Unlocked!",
        "embeds": [
            {
                "description": f"We just hit {amount} {kind}!",
                "color": 2003199,
                "thumbnail": {"url": image},
            }
        ],
    }
