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
    # Datasets of 12 teams provided by user
    teams = [
        "FC Thanh Triều",
        "Melbourne FPI",
        "F+",
        "All star btec",
        "Max FC",
        "Trẻ MEL",
        "The Fix FC",
        "Galacticos",
        "Đội Văn Bóng",
        "Dừa Fc",
        "TĐ&AE",
        "Lũ Quỷ Thành Mân",
    ]

    # Pair them into 6 fixtures with sample times/status
    fixtures = [
        (teams[0], teams[1], "2025-12-09", "08:00"),
        (teams[2], teams[3], "2025-12-09", "09:30"),
        (teams[4], teams[5], "2025-12-09", "11:00"),
        (teams[6], teams[7], "2025-12-10", "08:00"),
        (teams[8], teams[9], "2025-12-10", "09:30"),
        (teams[10], teams[11], "2025-12-10", "11:00"),
    ]

    demo_matches = []
    for idx, (home, away, date_str, time_str) in enumerate(fixtures, start=1):
        demo_matches.append(
            {
                "competition": "BTEC Football 2025",
                "team_a": home,
                "team_a_color": "#5bed9f",
                "team_b": away,
                "team_b_color": "#e85c5c",
                "date": date_str,
                "kickoff": time_str,
                # Trang thái default: upcoming
                "status": "upcoming",
                "minute": None,
                "score_a": None,
                "score_b": None,
                "is_locked": False,
            }
        )

    # Thêm vài trận ở trạng thái khác để test UI/API
    demo_matches += [
        {
            "competition": "BTEC Football 2025",
            "team_a": "FC Thanh Triều",
            "team_a_color": "#5bed9f",
            "team_b": "Galacticos",
            "team_b_color": "#e85c5c",
            "date": "2025-12-08",
            "kickoff": "13:00",
            "status": "live",
            "minute": "42'",
            "score_a": 1,
            "score_b": 0,
            "is_locked": False,
        },
        {
            "competition": "BTEC Football 2025",
            "team_a": "All star btec",
            "team_a_color": "#4ea8de",
            "team_b": "Lũ Quỷ Thành Mân",
            "team_b_color": "#f08c42",
            "date": "2025-12-07",
            "kickoff": "15:30",
            "status": "ft",
            "minute": "90+2'",
            "score_a": 2,
            "score_b": 2,
            "is_locked": True,
        },
        {
            "competition": "BTEC Football 2025",
            "team_a": "Max FC",
            "team_a_color": "#5bed9f",
            "team_b": "Dừa Fc",
            "team_b_color": "#e85c5c",
            "date": "2025-12-08",
            "kickoff": "17:00",
            "status": "pending",  # tuỳ ý thêm trạng thái khác
            "minute": None,
            "score_a": None,
            "score_b": None,
            "is_locked": False,
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
