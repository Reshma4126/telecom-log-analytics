
import csv
import random
from pathlib import Path

random.seed(42)

OUTPUT = Path.home() / "telecom-project" / "data" / "telecom_calls_large.csv"
RECORD_COUNT = 100_000

regions = [
    "Coimbatore",
    "Chennai",
    "Bengaluru",
    "Hyderabad",
    "Mumbai",
    "Delhi",
    "Kochi",
    "Pune",
]

# Different simulated failure probabilities by caller region.
# These are deliberately chosen for testing, not real network statistics.
failure_probability = {
    "Coimbatore": 0.03,
    "Chennai": 0.10,
    "Bengaluru": 0.04,
    "Hyderabad": 0.05,
    "Mumbai": 0.12,
    "Delhi": 0.06,
    "Kochi": 0.02,
    "Pune": 0.08,
}

OUTPUT.parent.mkdir(parents=True, exist_ok=True)

with OUTPUT.open("w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow([
        "call_id",
        "caller_region",
        "receiver_region",
        "duration_seconds",
        "status",
    ])

    for i in range(1, RECORD_COUNT + 1):
        caller = random.choice(regions)
        receiver = random.choice([r for r in regions if r != caller])

        failed = random.random() < failure_probability[caller]
        status = "FAILED" if failed else "SUCCESS"

        # Failed calls have zero duration in this simulated dataset.
        duration = 0 if failed else random.randint(10, 1800)

        writer.writerow([
            f"C{i:06d}",
            caller,
            receiver,
            duration,
            status,
        ])

print(f"Generated {RECORD_COUNT:,} simulated calls: {OUTPUT}")
