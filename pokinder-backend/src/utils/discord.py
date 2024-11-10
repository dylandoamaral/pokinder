def render_milestone_total(amount: int, kind: str) -> dict:
    return {
        "content": "🎉 Milestone Unlocked!",
        "embeds": [
            {
                "description": f"We just hit {amount} {kind}!",
                "color": 2003199,
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
