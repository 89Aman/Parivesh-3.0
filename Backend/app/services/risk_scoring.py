"""
Risk Scoring Service — calculates an automatic risk score (0–100) for an
application based on category, project area, sector, and EDS history.
"""
from app.models.application import Application

# Sector IDs considered high-sensitivity (e.g. mining, thermal power, nuclear)
HIGH_SENSITIVITY_SECTORS = {1, 2, 3, 5, 7}
MEDIUM_SENSITIVITY_SECTORS = {4, 6, 8, 9, 10}

CATEGORY_SCORES = {"A": 40, "B1": 25, "B2": 10}


def calculate_risk_score(app: Application) -> tuple[int, str]:
    """Return (score 0–100, level LOW|MEDIUM|HIGH|CRITICAL)."""
    score = 0

    # 1. Category weight (40 pts max)
    score += CATEGORY_SCORES.get(app.category, 10)

    # 2. Project area
    area = float(app.project_area_ha or 0)
    if area >= 500:
        score += 25
    elif area >= 100:
        score += 15
    elif area >= 20:
        score += 8
    else:
        score += 2

    # 3. Sector sensitivity (20 pts max)
    sector_id = app.sector_id
    if sector_id in HIGH_SENSITIVITY_SECTORS:
        score += 20
    elif sector_id in MEDIUM_SENSITIVITY_SECTORS:
        score += 10

    # 4. EDS history (15 pts max)
    eds_cycles = app.eds_cycle_count or 0
    score += min(eds_cycles * 5, 15)

    score = min(score, 100)

    if score >= 75:
        level = "CRITICAL"
    elif score >= 50:
        level = "HIGH"
    elif score >= 25:
        level = "MEDIUM"
    else:
        level = "LOW"

    return score, level
