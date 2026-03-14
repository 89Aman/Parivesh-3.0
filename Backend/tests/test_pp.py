from fastapi.testclient import TestClient
import pytest
from app.main import app
from app.core.auth import get_current_user
from app.models.user import User, Role, UserRoleEnum
from unittest.mock import MagicMock

client = TestClient(app)

from datetime import datetime, timezone
import uuid

# Mock user
mock_role = Role(
    id=1,
    name=UserRoleEnum.PP,
    label="Project Proponent"
)
mock_user = User(
    id=uuid.UUID("123e4567-e89b-12d3-a456-426614174000"),
    email="pp@example.com",
    full_name="PP User",
    roles=[mock_role],
    is_active=True,
    created_at=datetime.now(timezone.utc)
)

async def override_get_current_user():
    return mock_user

@pytest.fixture
def authenticated_client():
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield client
    app.dependency_overrides.clear()

def test_get_profile(authenticated_client):
    response = authenticated_client.get("/api/v1/pp/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "pp@example.com"
    assert data["full_name"] == "PP User"

def test_get_profile_unauthorized():
    # No dependency override here, should fail due to missing token
    response = client.get("/api/v1/pp/profile")
    assert response.status_code == 401 # OAuth2PasswordBearer raises 401 if no token
