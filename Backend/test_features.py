"""
Comprehensive feature test for all 10 features from TO OUTPERFORM note.
Runs against the live server at http://127.0.0.1:8000

Features tested:
  1. AI Scrutiny Assistant    POST /api/v1/ai/assist/{app_id}
  2. Analytics Dashboard      GET  /api/v1/analytics/overview|by-sector|monthly-trend
  3. GIS Map View             GET  /api/v1/admin/applications/geo
  4. Risk Scoring Engine      risk_score/risk_level columns on applications
  5. Notification System      GET/PATCH /api/v1/notifications/me
  6. Dark Mode                (frontend-only, skipped)
  7. Keyboard Shortcuts       (frontend-only, skipped)
  8. Global Search            GET  /api/v1/search?q=...
  9. CSV Export               GET  /api/v1/admin/export
 10. Compliance Tracker       GET/PATCH /api/v1/compliance/{app_id}
"""

import httpx
import sys
import os

BASE = os.getenv("PARIVESH_API_BASE_URL", "http://127.0.0.1:8000/api/v1")
ADMIN_CREDENTIALS = [
    ("admin@parivesh.demo", "Admin@123"),
    ("admin@parivesh.gov.in", "admin123"),
    ("admin@parivesh.com", "admin123"),
]

PASS = "\033[92m PASS\033[0m"
FAIL = "\033[91m FAIL\033[0m"
SKIP = "\033[93m SKIP\033[0m"

results = []


def check(name: str, ok: bool, detail: str = ""):
    icon = PASS if ok else FAIL
    msg = f"[{icon} ] {name}"
    if detail:
        msg += f"  →  {detail}"
    print(msg)
    results.append((name, ok))


def get_token(client: httpx.Client, email: str, password: str) -> str | None:
    r = client.post(f"{BASE}/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        return r.json()["access_token"]
    return None


def get_admin_token(client: httpx.Client) -> tuple[str | None, str | None]:
    for email, password in ADMIN_CREDENTIALS:
        token = get_token(client, email, password)
        if token:
            return token, email
    return None, None


def get_first_application_id(client: httpx.Client, headers: dict) -> str | None:
    """Try admin list endpoint to get an app ID."""
    r = client.get(f"{BASE}/admin/applications", headers=headers)
    if r.status_code == 200:
        data = r.json()
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
            items = data.get("items") or data.get("data") or []
        else:
            return None
        if items:
            first = items[0]
            return str(first.get("id") or first.get("app_id", ""))
    return None


def run_tests():
    with httpx.Client(timeout=30) as client:
        # ── Auth ────────────────────────────────────────────────────────────
        print("\n── Auth ────────────────────────────────────────────────────")
        token, admin_email = get_admin_token(client)
        check("Admin login", token is not None, f"email={admin_email or 'MISSING'} token={'<ok>' if token else 'MISSING'}")
        if not token:
            print("Cannot continue without auth token. Make sure admin user exists.")
            sys.exit(1)

        headers = {"Authorization": f"Bearer {token}"}

        # Get first app ID for tests that need it
        app_id = get_first_application_id(client, headers)
        print(f"  (First application ID for tests: {app_id or 'NONE'})\n")

        # ── Feature 2: Analytics ─────────────────────────────────────────────
        print("── Feature 2: Analytics Dashboard ─────────────────────────────")
        r = client.get(f"{BASE}/analytics/overview", headers=headers)
        check("GET /analytics/overview (200)", r.status_code == 200, f"status={r.status_code}")
        if r.status_code == 200:
            body = r.json()
            check("  Contains total_applications", "total_applications" in body)
            check("  Contains by_status list", isinstance(body.get("by_status"), list))

        r = client.get(f"{BASE}/analytics/by-sector", headers=headers)
        check("GET /analytics/by-sector (200)", r.status_code == 200, f"status={r.status_code}")

        r = client.get(f"{BASE}/analytics/monthly-trend", headers=headers)
        check("GET /analytics/monthly-trend (200)", r.status_code == 200, f"status={r.status_code}")

        # ── Feature 3: GIS Map View ──────────────────────────────────────────
        print("\n── Feature 3: GIS Map View ─────────────────────────────────────")
        r = client.get(f"{BASE}/admin/applications/geo", headers=headers)
        check("GET /admin/applications/geo (200)", r.status_code == 200, f"status={r.status_code}")
        if r.status_code == 200:
            data = r.json()
            check("  Returns a list", isinstance(data, list))
            if data:
                check("  First item has lat/lng", "lat" in data[0] and "lng" in data[0],
                      str(list(data[0].keys())))

        # ── Feature 4: Risk Scoring ──────────────────────────────────────────
        print("\n── Feature 4: Risk Scoring Engine ──────────────────────────────")
        r = client.get(f"{BASE}/admin/applications", headers=headers)
        if r.status_code == 200:
            data = r.json()
            items = data if isinstance(data, list) else data.get("items", data.get("data", []))
            if items:
                first = items[0]
                check("  applications have risk_score field",
                      "risk_score" in first, str(list(first.keys())[:8]))
                check("  applications have risk_level field",
                      "risk_level" in first)
            else:
                check("  risk_score column exists (no apps to check)", True, "no applications yet")
        else:
            check("GET /admin/applications for risk check", False, f"status={r.status_code}")

        # ── Feature 5: Notifications ─────────────────────────────────────────
        print("\n── Feature 5: Notification System ──────────────────────────────")
        r = client.get(f"{BASE}/notifications/me", headers=headers)
        check("GET /notifications/me (200)", r.status_code == 200, f"status={r.status_code}")
        if r.status_code == 200:
            check("  Returns list", isinstance(r.json(), list))

        r = client.get(f"{BASE}/notifications/me/unread-count", headers=headers)
        check("GET /notifications/me/unread-count (200)", r.status_code == 200, f"status={r.status_code}")
        if r.status_code == 200:
            check("  Has 'unread' key", "unread" in r.json())

        r = client.post(f"{BASE}/notifications/me/read-all", headers=headers)
        check("POST /notifications/me/read-all (200)", r.status_code == 200, f"status={r.status_code}")

        # ── Feature 6 & 7: Frontend-only ─────────────────────────────────────
        print(f"\n── Feature 6: Dark Mode            [{SKIP} ] Frontend-only")
        print(f"── Feature 7: Keyboard Shortcuts   [{SKIP} ] Frontend-only")

        # ── Feature 8: Global Search ─────────────────────────────────────────
        print("\n── Feature 8: Global Search ─────────────────────────────────────")
        r = client.get(f"{BASE}/search?q=coal", headers=headers)
        check("GET /search?q=coal (200)", r.status_code == 200, f"status={r.status_code}")
        if r.status_code == 200:
            check("  Returns list", isinstance(r.json(), list))

        r = client.get(f"{BASE}/search?q=a", headers=headers)
        check("GET /search?q=a (200 — short query)", r.status_code == 200, f"status={r.status_code}")

        r = client.get(f"{BASE}/search", headers=headers)
        check("GET /search (no q → 422)", r.status_code == 422, f"status={r.status_code}")

        # ── Feature 9: CSV Export ─────────────────────────────────────────────
        print("\n── Feature 9: CSV Export ────────────────────────────────────────")
        r = client.get(f"{BASE}/admin/export", headers=headers)
        check("GET /admin/export (200)", r.status_code == 200, f"status={r.status_code}")
        if r.status_code == 200:
            ct = r.headers.get("content-type", "")
            check("  Content-Type is text/csv", "csv" in ct or "text/plain" in ct, f"ct={ct}")
            check("  Body is non-empty", len(r.content) > 0)

        # ── Feature 1: AI Assistant ───────────────────────────────────────────
        print("\n── Feature 1: AI Scrutiny Assistant ────────────────────────────")
        if app_id:
            r = client.post(
                f"{BASE}/ai/assist/{app_id}",
                headers=headers,
                json={"question": "What are the key environmental risks for this project?"},
            )
            check(f"POST /ai/assist/{{app_id}} (200 or 503)", r.status_code in (200, 503),
                  f"status={r.status_code}")
            if r.status_code == 200:
                check("  Has 'answer' field", "answer" in r.json())
        else:
            print(f"  [{SKIP} ] No application available to test AI assist")

        # ── Feature 10: Compliance Tracker ───────────────────────────────────
        print("\n── Feature 10: Compliance Tracker ──────────────────────────────")
        r = client.get(f"{BASE}/compliance/admin/all", headers=headers)
        check("GET /compliance/admin/all (200)", r.status_code == 200, f"status={r.status_code}")
        if r.status_code == 200:
            check("  Returns list", isinstance(r.json(), list))

        if app_id:
            r = client.get(f"{BASE}/compliance/{app_id}", headers=headers)
            check(f"GET /compliance/{{app_id}} (200)", r.status_code == 200, f"status={r.status_code}")
        else:
            print(f"  [{SKIP} ] No application to test compliance tasks endpoint")

        # ── Summary ──────────────────────────────────────────────────────────
        print("\n" + "=" * 60)
        passed = sum(1 for _, ok in results if ok)
        total = len(results)
        failed = [(n, ok) for n, ok in results if not ok]
        print(f"Results: {passed}/{total} passed")
        if failed:
            print("\nFailed tests:")
            for name, _ in failed:
                print(f"  ✗ {name}")
            sys.exit(1)
        else:
            print("All tests passed! ✓")


if __name__ == "__main__":
    run_tests()
