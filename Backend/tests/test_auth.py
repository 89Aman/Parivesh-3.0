from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
import pytest
from app.main import app
from app.models.user import User, Role, UserRoleEnum

client = TestClient(app)

@pytest.mark.asyncio
async def test_login_success():
    import uuid
    from datetime import datetime, timezone

    # Mocking user data
    mock_role = Role(id=1, name=UserRoleEnum.PP)
    mock_user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        full_name="Test User",
        is_active=True,
        created_at=datetime.now(timezone.utc),
        roles=[mock_role]
    )

    with patch("app.services.user_service.UserService.authenticate", new_callable=AsyncMock) as mock_auth:
        mock_auth.return_value = mock_user
        
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "password123"}
        )
        
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_failure():
    with patch("app.services.user_service.UserService.authenticate", new_callable=AsyncMock) as mock_auth:
        mock_auth.return_value = None
        
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "wrong@example.com", "password": "wrongpassword"}
        )
        
        assert response.status_code == 400
        assert response.json()["detail"] == "Incorrect email or password"
