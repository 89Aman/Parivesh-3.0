import httpx
import asyncio
import json
import os
import uuid

BASE_URL = os.getenv("PARIVESH_API_BASE_URL", "http://localhost:8000/api/v1")

async def test_full_flow():
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("--- Testing Auth ---")
        # 1. Login as PP
        login_resp = await client.post(f"{BASE_URL}/auth/login", json={
            "email": "pp@parivesh.com",
            "password": "pp123"
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        pp_token = login_resp.json()["access_token"]
        pp_headers = {"Authorization": f"Bearer {pp_token}"}
        print("PP Login Successful")

        # 2. Check Profile
        profile_resp = await client.get(f"{BASE_URL}/pp/profile", headers=pp_headers)
        assert profile_resp.status_code == 200
        print("PP Profile Check Successful")

        # 3. Create Application
        app_data = {
            "project_name": "Test Mine " + str(uuid.uuid4())[:8],
            "project_description": "A test mining project for API verification.",
            "category": "A",
            "sector_id": 1,
            "state": "Odisha",
            "district": "Khurda",
            "taluk": "Bhubaneswar",
            "village": "Test Village",
            "pincode": "751001",
            "latitude": 20.296,
            "longitude": 85.824,
            "project_area_ha": 500.5
        }
        create_resp = await client.post(f"{BASE_URL}/pp/applications", json=app_data, headers=pp_headers)
        assert create_resp.status_code == 200, f"Create App failed: {create_resp.text}"
        app_id = create_resp.json()["id"]
        print(f"Application Created: {app_id}")

        # 4. Set Parameters
        param_data = [
            {"sector_parameter_id": 1, "value_text": "10 MTPA"},
            {"sector_parameter_id": 2, "value_number": 5.5},
            {"sector_parameter_id": 3, "value_boolean": True}
        ]
        param_resp = await client.post(f"{BASE_URL}/pp/applications/{app_id}/parameters", json=param_data, headers=pp_headers)

        assert param_resp.status_code == 200
        print("Parameters Set Successful")

        # 5.1 Simulate Payment
        print("Simulating Payment...")
        pay_resp = await client.post(f"{BASE_URL}/pp/applications/{app_id}/payment/simulate", json={"amount": 50000.0}, headers=pp_headers)
        assert pay_resp.status_code == 200, f"Payment failed: {pay_resp.text}"
        print("Payment Simulated Successful")

        # 5. Submit Application (Transitions to SUBMITTED)
        submit_resp = await client.post(f"{BASE_URL}/pp/applications/{app_id}/submit", headers=pp_headers)
        assert submit_resp.status_code == 200, f"Submit failed: {submit_resp.text}"

        print("Application Submitted Successful")

        print("\n--- Testing Scrutiny ---")
        # 6. Login as Scrutiny
        s_login_resp = await client.post(f"{BASE_URL}/auth/login", json={
            "email": "scrutiny@parivesh.com",
            "password": "scrutiny123"
        })
        s_token = s_login_resp.json()["access_token"]
        s_headers = {"Authorization": f"Bearer {s_token}"}
        print("Scrutiny Login Successful")

        # 7. Accept Application (Transitions to UNDER_SCRUTINY)
        accept_resp = await client.post(f"{BASE_URL}/scrutiny/applications/{app_id}/accept", headers=s_headers)
        assert accept_resp.status_code == 200, f"Accept failed: {accept_resp.text}"
        print("Application Accepted by Scrutiny")

        # 7.1 Verify Payment
        print("Verifying Payment...")
        verify_resp = await client.post(f"{BASE_URL}/scrutiny/applications/{app_id}/payment/verify", headers=s_headers)
        assert verify_resp.status_code == 200, f"Payment verify failed: {verify_resp.text}"
        print("Payment Verified Successful")


        # 9. List Meetings
        meetings_resp = await client.get(f"{BASE_URL}/scrutiny/meetings", headers=s_headers)
        assert meetings_resp.status_code == 200
        meetings = meetings_resp.json()
        print(f"Found {len(meetings)} meetings")

        meeting_id = None
        if not meetings:
            # Create a meeting if none exists
            m_create_resp = await client.post(f"{BASE_URL}/scrutiny/meetings", json={
                "title": "EC Meeting March",
                "meeting_date": "2026-03-20T10:00:00",
                "location": "Bhubaneswar",
                "category": "A"
            }, headers=s_headers)
            meeting_id = m_create_resp.json()["id"]
        else:
            meeting_id = meetings[0]["id"]

        # 10. Refer to Meeting
        refer_resp = await client.post(f"{BASE_URL}/scrutiny/applications/{app_id}/refer", json={
            "meeting_id": meeting_id,
            "referral_notes": "Ready for committee review."
        }, headers=s_headers)
        assert refer_resp.status_code == 200, f"Refer failed: {refer_resp.text}"
        print("Application Referred to Meeting Successful")

        # 11. Generate Gist (AI)
        print("Generating Gist (AI)...")
        gist_resp = await client.post(f"{BASE_URL}/scrutiny/applications/{app_id}/gist/generate", headers=s_headers)
        assert gist_resp.status_code == 200, f"Gist failed: {gist_resp.text}"
        print("Gist Generated Successful")


        print("\n--- Testing MoM ---")
        # 11. Login as MoM
        m_login_resp = await client.post(f"{BASE_URL}/auth/login", json={
            "email": "mom@parivesh.com",
            "password": "mom123"
        })
        m_token = m_login_resp.json()["access_token"]
        m_headers = {"Authorization": f"Bearer {m_token}"}
        print("MoM Login Successful")

        # 12. Create MoM
        mom_resp = await client.post(f"{BASE_URL}/mom/applications/{app_id}/mom", json={
            "content": "Initial MoM draft based on discussion."
        }, headers=m_headers)
        assert mom_resp.status_code == 200
        print("MoM Draft Created Successful")

        # 13. Finalize MoM
        finalize_resp = await client.post(f"{BASE_URL}/mom/applications/{app_id}/mom/finalize", headers=m_headers)
        assert finalize_resp.status_code == 200
        print("MoM Finalized Successful")

        print("\n--- Testing Metadata ---")
        # 14. Get Sectors
        sectors_resp = await client.get(f"{BASE_URL}/metadata/sectors")
        assert sectors_resp.status_code == 200
        print("Metadata Sectors Successful")

        print("\n=== ALL CORE API TESTS PASSED ===")

if __name__ == "__main__":
    asyncio.run(test_full_flow())
