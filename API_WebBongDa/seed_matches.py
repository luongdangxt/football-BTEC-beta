import asyncio
from datetime import datetime
from dotenv import load_dotenv
import os
import motor.motor_asyncio

# Simple seed script to insert demo matches with different statuses

load_dotenv()

client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
match_collection = db.get_collection("matches")


def build_start_time(date_str: str, time_str: str) -> datetime:
    try:
        return datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    except Exception:
        return datetime.utcnow()


async def seed():
    demo_matches = [
        {
            "competition": "Demo Cup",
            "team_a": "Team Live",
            "team_a_color": "#5bed9f",
            "team_b": "Team Check",
            "team_b_color": "#e85c5c",
            "date": "2025-12-08",
            "kickoff": "13:13",
            "status": "live",
            "minute": "45'",
            "score_a": 1,
            "score_b": 0,
            "is_locked": False,
        },
        {
            "competition": "Demo Cup",
            "team_a": "Team Done",
            "team_a_color": "#5bed9f",
            "team_b": "Team Past",
            "team_b_color": "#e85c5c",
            "date": "2025-12-07",
            "kickoff": "10:00",
            "status": "ft",
            "minute": "90+3'",
            "score_a": 2,
            "score_b": 2,
            "is_locked": True,
        },
    ]

    for match in demo_matches:
        match["start_time"] = build_start_time(match["date"], match["kickoff"])
        # Remove old documents with same teams to avoid duplicates
        await match_collection.delete_many({"team_a": match["team_a"], "team_b": match["team_b"], "date": match["date"]})
        result = await match_collection.insert_one(match)
        print(f"Inserted {match['team_a']} vs {match['team_b']} with status {match['status']} (id={result.inserted_id})")


if __name__ == "__main__":
    asyncio.run(seed())
