"""Quick test for the submit endpoint."""
import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(base_url="http://localhost:8000/api/v1", timeout=30) as c:
        login = await c.post("/auth/login", json={"email": "ppuser@test.com", "password": "test1234"})
        if login.status_code != 200:
            reg = await c.post("/auth/register-pp", json={
                "email": "ppuser@test.com",
                "password": "test1234",
                "full_name": "PP User",
                "organization": "Test Org"
            })
            print(f"Register: {reg.status_code}")
            login = await c.post("/auth/login", json={"email": "ppuser@test.com", "password": "test1234"})
        
        token = login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a draft app
        create = await c.post("/pp/applications", json={
            "project_name": "Submit Test App",
            "category": "A",
            "sector_id": 1
        }, headers=headers)
        print(f"Create: {create.status_code}")
        
        if create.status_code == 200:
            app_id = create.json()["id"]
            status = create.json()["status"]
            print(f"App ID: {app_id}, Status: {status}")
            
            # Try to submit
            submit = await c.post(f"/pp/applications/{app_id}/submit", headers=headers)
            print(f"Submit status: {submit.status_code}")
            print(f"Submit body: {submit.text}")

asyncio.run(test())
