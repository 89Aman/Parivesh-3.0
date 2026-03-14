"""
Comprehensive end-to-end test for all Parivesh API routes.
Tests the complete workflow: DRAFT → SUBMITTED → UNDER_SCRUTINY → EDS → UNDER_SCRUTINY → REFERRED → MOM_GENERATED → FINALIZED
Also tests all Admin, PP, Scrutiny, and MoM routes.
"""
import httpx
import asyncio
import json
import os
import sys
import traceback as tb

BASE = os.getenv("PARIVESH_API_BASE_URL", "http://localhost:8000/api/v1")
ROOT_URL = BASE.removesuffix("/api/v1")
RESULTS = {"passed": [], "failed": []}

def log_pass(test_name, detail=""):
    RESULTS["passed"].append(test_name)
    print(f"  ✅ PASS: {test_name} {detail}")

def log_fail(test_name, detail=""):
    RESULTS["failed"].append(test_name)
    print(f"  ❌ FAIL: {test_name} {detail}")


async def main():
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("\n" + "=" * 70)
        print("  PARIVESH BACKEND — COMPREHENSIVE ROUTE TEST")
        print("=" * 70)

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 0. Health / Root
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n── 0. Health / Root ──")
        r = await client.get(f"{ROOT_URL}/")
        if r.status_code == 200 and "Parivesh" in r.text:
            log_pass("GET /", f"({r.status_code})")
        else:
            log_fail("GET /", f"({r.status_code}) {r.text[:100]}")

        r = await client.get(f"{ROOT_URL}/health")
        if r.status_code == 200:
            log_pass("GET /health", f"({r.status_code})")
        else:
            log_fail("GET /health", f"({r.status_code}) {r.text[:100]}")

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 1. AUTH — Register PP and Login
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n── 1. Auth Routes ──")

        # Register PP
        pp_data = {
            "email": f"testpp_{asyncio.get_event_loop().time():.0f}@test.com",
            "password": "TestPass123!",
            "full_name": "Test PP User",
            "organization": "Test Org",
            "phone": "9876543210",
        }
        r = await client.post(f"{BASE}/auth/register-pp", json=pp_data)
        if r.status_code == 200:
            pp_user = r.json()
            pp_id = pp_user["id"]
            log_pass("POST /auth/register-pp", f"({r.status_code}) user_id={pp_id}")
        else:
            log_fail("POST /auth/register-pp", f"({r.status_code}) {r.text[:200]}")
            print("    Cannot continue without PP user. Aborting.")
            return

        # Login PP
        r = await client.post(f"{BASE}/auth/login", json={"email": pp_data["email"], "password": pp_data["password"]})
        if r.status_code == 200:
            pp_token = r.json()["access_token"]
            log_pass("POST /auth/login (PP)", f"({r.status_code}) token obtained")
        else:
            log_fail("POST /auth/login (PP)", f"({r.status_code}) {r.text[:200]}")
            print("    Cannot continue without PP token. Aborting.")
            return

        pp_headers = {"Authorization": f"Bearer {pp_token}"}

        # Try login with wrong password
        r = await client.post(f"{BASE}/auth/login", json={"email": pp_data["email"], "password": "wrongpass"})
        if r.status_code == 400:
            log_pass("POST /auth/login (wrong pwd)", f"({r.status_code}) correctly rejected")
        else:
            log_fail("POST /auth/login (wrong pwd)", f"({r.status_code}) expected 400")

        # Duplicate registration
        r = await client.post(f"{BASE}/auth/register-pp", json=pp_data)
        if r.status_code == 400:
            log_pass("POST /auth/register-pp (duplicate)", f"({r.status_code}) correctly rejected")
        else:
            log_fail("POST /auth/register-pp (duplicate)", f"({r.status_code}) expected 400")

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 2. Login as ADMIN (need an admin user in DB)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n── 2. Admin Login ──")

        # Try common admin credentials
        admin_token = None
        for admin_email in ["admin@parivesh.com", "admin@admin.com", "admin@test.com"]:
            r = await client.post(f"{BASE}/auth/login", json={"email": admin_email, "password": "admin123"})
            if r.status_code == 200:
                admin_token = r.json()["access_token"]
                log_pass(f"POST /auth/login (ADMIN)", f"({r.status_code}) email={admin_email}")
                break

        if not admin_token:
            log_fail("ADMIN login", "No admin user found — will skip admin-only tests")

        admin_headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else None

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 3. METADATA (Public)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n── 3. Metadata Routes (Public) ──")
        r = await client.get(f"{BASE}/metadata/sectors")
        if r.status_code == 200:
            sectors = r.json()
            log_pass("GET /metadata/sectors", f"({r.status_code}) count={len(sectors)}")
        else:
            log_fail("GET /metadata/sectors", f"({r.status_code}) {r.text[:200]}")
            sectors = []

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 4. ADMIN ROUTES
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n── 4. Admin Routes ──")

        sector_id = None
        if admin_headers:
            # List users
            r = await client.get(f"{BASE}/admin/users", headers=admin_headers)
            if r.status_code == 200:
                log_pass("GET /admin/users", f"({r.status_code}) count={len(r.json())}")
            else:
                log_fail("GET /admin/users", f"({r.status_code}) {r.text[:200]}")

            # Create sector
            r = await client.post(f"{BASE}/admin/sectors", json={"name": f"TestSector_{asyncio.get_event_loop().time():.0f}", "description": "Test sector for E2E testing"}, headers=admin_headers)
            if r.status_code == 200:
                sector_id = r.json()["id"]
                log_pass("POST /admin/sectors", f"({r.status_code}) id={sector_id}")
            else:
                log_fail("POST /admin/sectors", f"({r.status_code}) {r.text[:200]}")

            # List sectors (admin)
            r = await client.get(f"{BASE}/admin/sectors", headers=admin_headers)
            if r.status_code == 200:
                log_pass("GET /admin/sectors", f"({r.status_code}) count={len(r.json())}")
            else:
                log_fail("GET /admin/sectors", f"({r.status_code}) {r.text[:200]}")

            # Add sector parameter
            param_id = None
            if sector_id:
                r = await client.post(f"{BASE}/admin/sectors/{sector_id}/parameters", json={
                    "name": "Production Capacity",
                    "key": "capacity_param",
                    "type": "TEXT",
                    "is_required": True,
                    "display_order": 1,
                }, headers=admin_headers)
                if r.status_code == 200:
                    param_id = r.json()["id"]
                    log_pass("POST /admin/sectors/{id}/parameters", f"({r.status_code}) id={param_id}")
                else:
                    log_fail("POST /admin/sectors/{id}/parameters", f"({r.status_code}) {r.text[:200]}")

                # List parameters
                r = await client.get(f"{BASE}/admin/sectors/{sector_id}/parameters", headers=admin_headers)
                if r.status_code == 200:
                    log_pass("GET /admin/sectors/{id}/parameters", f"({r.status_code}) count={len(r.json())}")
                else:
                    log_fail("GET /admin/sectors/{id}/parameters", f"({r.status_code}) {r.text[:200]}")

                # Update parameter
                if param_id:
                    r = await client.put(f"{BASE}/admin/sectors/{sector_id}/parameters/{param_id}", json={
                        "name": "Updated Capacity",
                        "display_order": 2,
                    }, headers=admin_headers)
                    if r.status_code == 200:
                        log_pass("PUT /admin/sectors/{id}/parameters/{pid}", f"({r.status_code})")
                    else:
                        log_fail("PUT /admin/sectors/{id}/parameters/{pid}", f"({r.status_code}) {r.text[:200]}")

            # Create gist template
            template_id = None
            if sector_id:
                r = await client.post(f"{BASE}/admin/gist-templates", json={
                    "name": "Test Gist Template",
                    "category": "A",
                    "sector_id": sector_id,
                    "content": "Project: {{project_name}}\nCategory: {{category}}\nState: {{state}}\nDistrict: {{district}}\nCapacity: {{capacity}}\nArea: {{project_area_ha}} hectares\nDescription: {{project_description}}",
                }, headers=admin_headers)
                if r.status_code == 200:
                    template_id = r.json()["id"]
                    log_pass("POST /admin/gist-templates", f"({r.status_code}) id={template_id}")
                else:
                    log_fail("POST /admin/gist-templates", f"({r.status_code}) {r.text[:200]}")

            # List gist templates
            r = await client.get(f"{BASE}/admin/gist-templates", headers=admin_headers)
            if r.status_code == 200:
                log_pass("GET /admin/gist-templates", f"({r.status_code}) count={len(r.json())}")
            else:
                log_fail("GET /admin/gist-templates", f"({r.status_code}) {r.text[:200]}")

            # Update gist template
            if template_id:
                r = await client.put(f"{BASE}/admin/gist-templates/{template_id}", json={
                    "name": "Updated Test Gist Template",
                }, headers=admin_headers)
                if r.status_code == 200:
                    log_pass("PUT /admin/gist-templates/{id}", f"({r.status_code})")
                else:
                    log_fail("PUT /admin/gist-templates/{id}", f"({r.status_code}) {r.text[:200]}")

            # Assign role (admin adds SCRUTINY role to the PP user for testing later)
            # We need scrutiny & mom users. Register them as PP first, then assign roles via admin
            scrutiny_data = {
                "email": f"testscrutiny_{asyncio.get_event_loop().time():.0f}@test.com",
                "password": "TestPass123!",
                "full_name": "Test Scrutiny User",
            }
            r = await client.post(f"{BASE}/auth/register-pp", json=scrutiny_data)
            scrutiny_id = r.json()["id"] if r.status_code == 200 else None

            mom_data = {
                "email": f"testmom_{asyncio.get_event_loop().time():.0f}@test.com",
                "password": "TestPass123!",
                "full_name": "Test MoM User",
            }
            r = await client.post(f"{BASE}/auth/register-pp", json=mom_data)
            mom_id = r.json()["id"] if r.status_code == 200 else None

            # Assign SCRUTINY role
            if scrutiny_id:
                r = await client.post(f"{BASE}/admin/users/{scrutiny_id}/roles", json={"role_name": "SCRUTINY"}, headers=admin_headers)
                if r.status_code == 200:
                    log_pass("POST /admin/users/{id}/roles (SCRUTINY)", f"({r.status_code})")
                else:
                    log_fail("POST /admin/users/{id}/roles (SCRUTINY)", f"({r.status_code}) {r.text[:200]}")

            # Assign MOM role
            if mom_id:
                r = await client.post(f"{BASE}/admin/users/{mom_id}/roles", json={"role_name": "MOM"}, headers=admin_headers)
                if r.status_code == 200:
                    log_pass("POST /admin/users/{id}/roles (MOM)", f"({r.status_code})")
                else:
                    log_fail("POST /admin/users/{id}/roles (MOM)", f"({r.status_code}) {r.text[:200]}")

            # Test remove role (and re-add)
            if scrutiny_id:
                r = await client.delete(f"{BASE}/admin/users/{scrutiny_id}/roles/PP", headers=admin_headers)
                if r.status_code == 200:
                    log_pass("DELETE /admin/users/{id}/roles/PP", f"({r.status_code})")
                else:
                    log_fail("DELETE /admin/users/{id}/roles/PP", f"({r.status_code}) {r.text[:200]}")

            if mom_id:
                r = await client.delete(f"{BASE}/admin/users/{mom_id}/roles/PP", headers=admin_headers)
                if r.status_code == 200:
                    log_pass("DELETE /admin/users/{id}/roles/PP (MOM user)", f"({r.status_code})")
                else:
                    log_fail("DELETE /admin/users/{id}/roles/PP (MOM user)", f"({r.status_code}) {r.text[:200]}")

            # RBAC test: PP should NOT access admin routes
            r = await client.get(f"{BASE}/admin/users", headers=pp_headers)
            if r.status_code == 403:
                log_pass("RBAC: PP cannot access /admin/users", f"({r.status_code}) correctly forbidden")
            else:
                log_fail("RBAC: PP cannot access /admin/users", f"({r.status_code}) expected 403")
        else:
            log_fail("Admin routes", "Skipped — no admin token")
            # Use existing sectors if available
            if sectors:
                sector_id = sectors[0]["id"]

        # Login scrutiny and mom
        scrutiny_token = None
        if scrutiny_id:
            r = await client.post(f"{BASE}/auth/login", json={"email": scrutiny_data["email"], "password": scrutiny_data["password"]})
            if r.status_code == 200:
                scrutiny_token = r.json()["access_token"]
                log_pass("POST /auth/login (SCRUTINY)", f"({r.status_code})")
            else:
                log_fail("POST /auth/login (SCRUTINY)", f"({r.status_code}) {r.text[:200]}")

        mom_token = None
        if mom_id:
            r = await client.post(f"{BASE}/auth/login", json={"email": mom_data["email"], "password": mom_data["password"]})
            if r.status_code == 200:
                mom_token = r.json()["access_token"]
                log_pass("POST /auth/login (MOM)", f"({r.status_code})")
            else:
                log_fail("POST /auth/login (MOM)", f"({r.status_code}) {r.text[:200]}")

        scrutiny_headers = {"Authorization": f"Bearer {scrutiny_token}"} if scrutiny_token else None
        mom_headers = {"Authorization": f"Bearer {mom_token}"} if mom_token else None

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 5. PP ROUTES
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n── 5. PP Routes ──")

        # Profile
        r = await client.get(f"{BASE}/pp/profile", headers=pp_headers)
        if r.status_code == 200:
            log_pass("GET /pp/profile", f"({r.status_code}) email={r.json()['email']}")
        else:
            log_fail("GET /pp/profile", f"({r.status_code}) {r.text[:200]}")

        # Update profile
        r = await client.put(f"{BASE}/pp/profile", json={"full_name": "Updated PP User", "organization": "Updated Org"}, headers=pp_headers)
        if r.status_code == 200:
            log_pass("PUT /pp/profile", f"({r.status_code})")
        else:
            log_fail("PUT /pp/profile", f"({r.status_code}) {r.text[:200]}")

        # Create application (DRAFT)
        if not sector_id:
            log_fail("Create application", "No sector_id available — cannot create application")
            print("\n  ABORTING: Need a sector to create an application")
            print_summary()
            return

        app_data = {
            "project_name": "Test Mining Project",
            "project_description": "A comprehensive test mining project for E2E testing",
            "category": "A",
            "sector_id": sector_id,
            "state": "Karnataka",
            "district": "Bangalore",
            "taluk": "North",
            "village": "Hebbal",
            "pincode": "560024",
            "latitude": 13.0358,
            "longitude": 77.597,
            "project_area_ha": 250.5,
            "capacity": "5000 tons/year",
        }
        r = await client.post(f"{BASE}/pp/applications", json=app_data, headers=pp_headers)
        if r.status_code == 200:
            app = r.json()
            app_id = app["id"]
            log_pass("POST /pp/applications (create DRAFT)", f"({r.status_code}) id={app_id} status={app['status']}")
        else:
            log_fail("POST /pp/applications", f"({r.status_code}) {r.text[:200]}")
            print("\n  ABORTING: Cannot continue without an application")
            print_summary()
            return

        # List applications
        r = await client.get(f"{BASE}/pp/applications", headers=pp_headers)
        if r.status_code == 200:
            log_pass("GET /pp/applications", f"({r.status_code}) count={len(r.json())}")
        else:
            log_fail("GET /pp/applications", f"({r.status_code}) {r.text[:200]}")

        # Get single application
        r = await client.get(f"{BASE}/pp/applications/{app_id}", headers=pp_headers)
        if r.status_code == 200:
            log_pass("GET /pp/applications/{id}", f"({r.status_code})")
        else:
            log_fail("GET /pp/applications/{id}", f"({r.status_code}) {r.text[:200]}")

        # Update application (while DRAFT)
        r = await client.put(f"{BASE}/pp/applications/{app_id}", json={"project_name": "Updated Mining Project"}, headers=pp_headers)
        if r.status_code == 200:
            log_pass("PUT /pp/applications/{id}", f"({r.status_code})")
        else:
            log_fail("PUT /pp/applications/{id}", f"({r.status_code}) {r.text[:200]}")

        # Set parameters
        if param_id:
            r = await client.post(f"{BASE}/pp/applications/{app_id}/parameters", json=[{
                "sector_parameter_id": param_id,
                "value_text": "5000 tons/year",
            }], headers=pp_headers)
            if r.status_code == 200:
                log_pass("POST /pp/applications/{id}/parameters", f"({r.status_code}) count={len(r.json())}")
            else:
                log_fail("POST /pp/applications/{id}/parameters", f"({r.status_code}) {r.text[:200]}")

        # Upload document
        r = await client.post(f"{BASE}/pp/applications/{app_id}/documents", params={"name": "EIA Report", "file_path": "/uploads/eia_report.pdf", "mime_type": "application/pdf"}, headers=pp_headers)
        if r.status_code == 200:
            log_pass("POST /pp/applications/{id}/documents", f"({r.status_code})")
        else:
            log_fail("POST /pp/applications/{id}/documents", f"({r.status_code}) {r.text[:200]}")

        # List documents
        r = await client.get(f"{BASE}/pp/applications/{app_id}/documents", headers=pp_headers)
        if r.status_code == 200:
            log_pass("GET /pp/applications/{id}/documents", f"({r.status_code}) count={len(r.json())}")
        else:
            log_fail("GET /pp/applications/{id}/documents", f"({r.status_code}) {r.text[:200]}")

        # Simulate payment
        r = await client.post(f"{BASE}/pp/applications/{app_id}/payment/simulate", json={"amount": 25000.00}, headers=pp_headers)
        if r.status_code == 200:
            payment = r.json()
            log_pass("POST /pp/applications/{id}/payment/simulate", f"({r.status_code}) txn={payment.get('transaction_ref')} status={payment.get('status')}")
        else:
            log_fail("POST /pp/applications/{id}/payment/simulate", f"({r.status_code}) {r.text[:200]}")

        # Get payment
        r = await client.get(f"{BASE}/pp/applications/{app_id}/payment", headers=pp_headers)
        if r.status_code == 200:
            log_pass("GET /pp/applications/{id}/payment", f"({r.status_code})")
        else:
            log_fail("GET /pp/applications/{id}/payment", f"({r.status_code}) {r.text[:200]}")

        # Duplicate payment
        r = await client.post(f"{BASE}/pp/applications/{app_id}/payment/simulate", json={"amount": 25000.00}, headers=pp_headers)
        if r.status_code == 400:
            log_pass("POST payment/simulate (duplicate)", f"({r.status_code}) correctly rejected")
        else:
            log_fail("POST payment/simulate (duplicate)", f"({r.status_code}) expected 400")

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 6. WORKFLOW: DRAFT → SUBMITTED
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n── 6. Workflow: DRAFT → SUBMITTED ──")
        r = await client.post(f"{BASE}/pp/applications/{app_id}/submit", headers=pp_headers)
        if r.status_code == 200 and r.json()["status"] == "SUBMITTED":
            log_pass("POST /pp/applications/{id}/submit", f"({r.status_code}) status={r.json()['status']}")
        else:
            log_fail("POST /pp/applications/{id}/submit", f"({r.status_code}) {r.text[:200]}")

        # Verify: cannot edit after submit
        r = await client.put(f"{BASE}/pp/applications/{app_id}", json={"project_name": "Should Fail"}, headers=pp_headers)
        if r.status_code == 400:
            log_pass("PUT /pp/applications/{id} (after submit)", f"({r.status_code}) correctly rejected")
        else:
            log_fail("PUT /pp/applications/{id} (after submit)", f"({r.status_code}) expected 400")

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 7. SCRUTINY ROUTES
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n── 7. Scrutiny Routes ──")

        if not scrutiny_headers:
            log_fail("Scrutiny routes", "Skipped — no scrutiny token")
        else:
            # RBAC: MOM cannot access scrutiny
            if mom_headers:
                r = await client.get(f"{BASE}/scrutiny/applications", headers=mom_headers)
                if r.status_code == 403:
                    log_pass("RBAC: MOM cannot access /scrutiny", f"({r.status_code})")
                else:
                    log_fail("RBAC: MOM cannot access /scrutiny", f"({r.status_code}) expected 403")

            # Dashboard
            r = await client.get(f"{BASE}/scrutiny/applications", headers=scrutiny_headers)
            if r.status_code == 200:
                log_pass("GET /scrutiny/applications", f"({r.status_code}) count={len(r.json())}")
            else:
                log_fail("GET /scrutiny/applications", f"({r.status_code}) {r.text[:200]}")

            # Filter by status
            r = await client.get(f"{BASE}/scrutiny/applications?status=SUBMITTED", headers=scrutiny_headers)
            if r.status_code == 200:
                log_pass("GET /scrutiny/applications?status=SUBMITTED", f"({r.status_code}) count={len(r.json())}")
            else:
                log_fail("GET /scrutiny/applications?status=SUBMITTED", f"({r.status_code}) {r.text[:200]}")

            # Get single application
            r = await client.get(f"{BASE}/scrutiny/applications/{app_id}", headers=scrutiny_headers)
            if r.status_code == 200:
                log_pass("GET /scrutiny/applications/{id}", f"({r.status_code})")
            else:
                log_fail("GET /scrutiny/applications/{id}", f"({r.status_code}) {r.text[:200]}")

            # SUBMITTED → UNDER_SCRUTINY
            print("\n── 7a. Workflow: SUBMITTED → UNDER_SCRUTINY ──")
            r = await client.post(f"{BASE}/scrutiny/applications/{app_id}/accept", headers=scrutiny_headers)
            if r.status_code == 200 and r.json()["status"] == "UNDER_SCRUTINY":
                log_pass("POST /scrutiny/applications/{id}/accept", f"({r.status_code}) status={r.json()['status']}")
            else:
                log_fail("POST /scrutiny/applications/{id}/accept", f"({r.status_code}) {r.text[:200]}")

            # Verify payment
            print("\n── 7b. Payment Verification ──")
            r = await client.post(f"{BASE}/scrutiny/applications/{app_id}/payment/verify", headers=scrutiny_headers)
            if r.status_code == 200 and r.json()["status"] == "VERIFIED":
                log_pass("POST /scrutiny/.../payment/verify", f"({r.status_code}) status={r.json()['status']}")
            else:
                log_fail("POST /scrutiny/.../payment/verify", f"({r.status_code}) {r.text[:200]}")

            # Verify already verified
            r = await client.post(f"{BASE}/scrutiny/applications/{app_id}/payment/verify", headers=scrutiny_headers)
            if r.status_code == 400:
                log_pass("Payment verify (duplicate)", f"({r.status_code}) correctly rejected")
            else:
                log_fail("Payment verify (duplicate)", f"({r.status_code}) expected 400")

            # ── EDS flow ──
            print("\n── 7c. EDS Flow ──")
            # UNDER_SCRUTINY → EDS
            r = await client.post(f"{BASE}/scrutiny/applications/{app_id}/eds", json={
                "general_comments": "Missing EIA details",
                "issues": [
                    {"standard_reason": "Incomplete document", "affected_field": "EIA Report", "comments": "Section 4 is missing"},
                    {"standard_reason": "Data mismatch", "affected_field": "capacity", "comments": "Capacity figures don't match"},
                ],
            }, headers=scrutiny_headers)
            if r.status_code == 200:
                eds = r.json()
                log_pass("POST /scrutiny/applications/{id}/eds (raise EDS)", f"({r.status_code}) cycle={eds.get('cycle_number')} issues={len(eds.get('issues', []))}")
            else:
                log_fail("POST /scrutiny/applications/{id}/eds", f"({r.status_code}) {r.text[:200]}")

            # PP views EDS
            r = await client.get(f"{BASE}/pp/applications/{app_id}/eds", headers=pp_headers)
            if r.status_code == 200:
                log_pass("GET /pp/applications/{id}/eds", f"({r.status_code}) issues={len(r.json().get('issues', []))}")
            else:
                log_fail("GET /pp/applications/{id}/eds", f"({r.status_code}) {r.text[:200]}")

            # PP resolves EDS → EDS → UNDER_SCRUTINY
            r = await client.post(f"{BASE}/pp/applications/{app_id}/eds/resolve", json={
                "resolution_text": "Updated all missing documents and corrected capacity figures",
            }, headers=pp_headers)
            if r.status_code == 200:
                log_pass("POST /pp/applications/{id}/eds/resolve", f"({r.status_code}) resolved_at={r.json().get('resolved_at')}")
            else:
                log_fail("POST /pp/applications/{id}/eds/resolve", f"({r.status_code}) {r.text[:200]}")

            # Verify application is back to UNDER_SCRUTINY
            r = await client.get(f"{BASE}/scrutiny/applications/{app_id}", headers=scrutiny_headers)
            if r.status_code == 200 and r.json()["status"] == "UNDER_SCRUTINY":
                log_pass("Application back to UNDER_SCRUTINY", f"status={r.json()['status']} eds_cycle={r.json()['eds_cycle_count']}")
            else:
                log_fail("Application back to UNDER_SCRUTINY", f"({r.status_code}) {r.text[:200]}")

            # ── Meeting & Referral ──
            print("\n── 7d. Meeting & Referral ──")
            # Create meeting
            r = await client.post(f"{BASE}/scrutiny/meetings", json={
                "meeting_date": "2026-04-15",
                "meeting_time": "10:30:00",
                "meeting_type": "EAC Mining",
                "committee_name": "Expert Appraisal Committee",
            }, headers=scrutiny_headers)
            meeting_id = None
            if r.status_code == 200:
                meeting_id = r.json()["id"]
                log_pass("POST /scrutiny/meetings", f"({r.status_code}) id={meeting_id}")
            else:
                log_fail("POST /scrutiny/meetings", f"({r.status_code}) {r.text[:200]}")

            # List meetings
            r = await client.get(f"{BASE}/scrutiny/meetings", headers=scrutiny_headers)
            if r.status_code == 200:
                log_pass("GET /scrutiny/meetings", f"({r.status_code}) count={len(r.json())}")
            else:
                log_fail("GET /scrutiny/meetings", f"({r.status_code}) {r.text[:200]}")

            # Refer application → UNDER_SCRUTINY → REFERRED
            if meeting_id:
                r = await client.post(f"{BASE}/scrutiny/applications/{app_id}/refer", json={
                    "meeting_id": meeting_id,
                    "referral_notes": "Application complete, referring for committee review",
                }, headers=scrutiny_headers)
                if r.status_code == 200:
                    log_pass("POST /scrutiny/applications/{id}/refer", f"({r.status_code})")
                else:
                    log_fail("POST /scrutiny/applications/{id}/refer", f"({r.status_code}) {r.text[:200]}")

            # ── Auto-Gist ──
            print("\n── 7e. Auto-Gist Generation ──")
            r = await client.post(f"{BASE}/scrutiny/applications/{app_id}/gist/generate", headers=scrutiny_headers)
            gist_id = None
            if r.status_code == 200:
                gist = r.json()
                gist_id = gist["id"]
                log_pass("POST /scrutiny/.../gist/generate", f"({r.status_code}) id={gist_id}")
                # Show gist content snippet
                content = gist.get("content", "")
                if content:
                    print(f"    📝 Gist content preview: {content[:100]}...")
            else:
                log_fail("POST /scrutiny/.../gist/generate", f"({r.status_code}) {r.text[:200]}")

            # Get gist (read-only)
            r = await client.get(f"{BASE}/scrutiny/applications/{app_id}/gist", headers=scrutiny_headers)
            if r.status_code == 200:
                log_pass("GET /scrutiny/applications/{id}/gist", f"({r.status_code})")
            else:
                log_fail("GET /scrutiny/applications/{id}/gist", f"({r.status_code}) {r.text[:200]}")

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 8. MOM ROUTES
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n── 8. MoM Routes ──")

        if not mom_headers:
            log_fail("MoM routes", "Skipped — no MoM token")
        else:
            # RBAC: PP cannot access MoM routes
            r = await client.get(f"{BASE}/mom/applications", headers=pp_headers)
            if r.status_code == 403:
                log_pass("RBAC: PP cannot access /mom", f"({r.status_code})")
            else:
                log_fail("RBAC: PP cannot access /mom", f"({r.status_code}) expected 403")

            # Dashboard
            r = await client.get(f"{BASE}/mom/applications", headers=mom_headers)
            if r.status_code == 200:
                log_pass("GET /mom/applications", f"({r.status_code}) count={len(r.json())}")
            else:
                log_fail("GET /mom/applications", f"({r.status_code}) {r.text[:200]}")

            # Get gist
            if gist_id:
                r = await client.get(f"{BASE}/mom/gists/{gist_id}", headers=mom_headers)
                if r.status_code == 200:
                    log_pass("GET /mom/gists/{id}", f"({r.status_code})")
                else:
                    log_fail("GET /mom/gists/{id}", f"({r.status_code}) {r.text[:200]}")

                # Update gist (MoM can edit)
                r = await client.put(f"{BASE}/mom/gists/{gist_id}", json={"content": "Updated gist content by MoM team with additional notes."}, headers=mom_headers)
                if r.status_code == 200:
                    log_pass("PUT /mom/gists/{id}", f"({r.status_code})")
                else:
                    log_fail("PUT /mom/gists/{id}", f"({r.status_code}) {r.text[:200]}")

                # RBAC: Scrutiny cannot update MoM gists
                if scrutiny_headers:
                    r = await client.put(f"{BASE}/mom/gists/{gist_id}", json={"content": "Scrutiny attempting edit"}, headers=scrutiny_headers)
                    if r.status_code == 403:
                        log_pass("RBAC: Scrutiny cannot edit /mom/gists", f"({r.status_code})")
                    else:
                        log_fail("RBAC: Scrutiny cannot edit /mom/gists", f"({r.status_code}) expected 403")

            # Create MoM
            r = await client.post(f"{BASE}/mom/applications/{app_id}/mom", json={
                "content": "Minutes of Meeting:\n1. Project reviewed and found satisfactory\n2. Environment clearance recommended with conditions\n3. Monitoring required quarterly",
            }, headers=mom_headers)
            if r.status_code == 200:
                mom_record = r.json()
                log_pass("POST /mom/applications/{id}/mom", f"({r.status_code}) status={mom_record['status']}")
            else:
                log_fail("POST /mom/applications/{id}/mom", f"({r.status_code}) {r.text[:200]}")

            # Get MoM
            r = await client.get(f"{BASE}/mom/applications/{app_id}/mom", headers=mom_headers)
            if r.status_code == 200:
                log_pass("GET /mom/applications/{id}/mom", f"({r.status_code})")
            else:
                log_fail("GET /mom/applications/{id}/mom", f"({r.status_code}) {r.text[:200]}")

            # Finalize MoM → MOM_GENERATED → FINALIZED
            print("\n── 8a. Workflow: MOM_GENERATED → FINALIZED ──")
            r = await client.post(f"{BASE}/mom/applications/{app_id}/mom/finalize", headers=mom_headers)
            if r.status_code == 200:
                mom_finalized = r.json()
                log_pass("POST /mom/.../mom/finalize", f"({r.status_code}) status={mom_finalized['status']} pdf={mom_finalized.get('mom_pdf_path')}")
            else:
                log_fail("POST /mom/.../mom/finalize", f"({r.status_code}) {r.text[:200]}")

            # Verify finalization (cannot edit)
            r = await client.post(f"{BASE}/mom/applications/{app_id}/mom", json={"content": "Should fail"}, headers=mom_headers)
            if r.status_code == 400:
                log_pass("MoM edit after finalize", f"({r.status_code}) correctly rejected")
            else:
                log_fail("MoM edit after finalize", f"({r.status_code}) expected 400")

            # Double finalize
            r = await client.post(f"{BASE}/mom/applications/{app_id}/mom/finalize", headers=mom_headers)
            if r.status_code == 400:
                log_pass("MoM double finalize", f"({r.status_code}) correctly rejected")
            else:
                log_fail("MoM double finalize", f"({r.status_code}) expected 400")

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 9. Verify Final State
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n── 9. Final State Verification ──")
        r = await client.get(f"{BASE}/pp/applications/{app_id}", headers=pp_headers)
        if r.status_code == 200:
            final = r.json()
            if final["status"] == "FINALIZED":
                log_pass("Final application status", f"status={final['status']} ✨ FULL WORKFLOW COMPLETE!")
            else:
                log_fail("Final application status", f"Expected FINALIZED, got {final['status']}")
        else:
            log_fail("Final application status check", f"({r.status_code}) {r.text[:200]}")

        print_summary()


def print_summary():
    print("\n" + "=" * 70)
    print("  TEST SUMMARY")
    print("=" * 70)
    total = len(RESULTS["passed"]) + len(RESULTS["failed"])
    print(f"  Total: {total} | ✅ Passed: {len(RESULTS['passed'])} | ❌ Failed: {len(RESULTS['failed'])}")
    if RESULTS["failed"]:
        print(f"\n  Failed tests:")
        for f in RESULTS["failed"]:
            print(f"    ❌ {f}")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
