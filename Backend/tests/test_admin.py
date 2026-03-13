from fastapi.testclient import TestClient
import pytest
from app.main import app
from app.core.auth import get_current_user
from app.models.user import User, Role, UserRoleEnum
from unittest.mock import AsyncMock, patch
from datetime import datetime
import uuid

client = TestClient(app)

# Mock admin user
mock_admin_role = Role(
    id=0,
    name=UserRoleEnum.ADMIN,
    label="Administrator"
)
mock_admin = User(
    id=uuid.uuid4(),
    email="admin@example.com",
    full_name="Admin User",
    roles=[mock_admin_role],
    is_active=True,
    created_at=datetime.utcnow()
)

async def override_get_current_admin():
    return mock_admin

@pytest.fixture
def admin_client():
    app.dependency_overrides[get_current_user] = override_get_current_admin
    yield client
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_users(admin_client):
    mock_users = [
        User(
            id=uuid.uuid4(),
            email="user1@example.com",
            full_name="User One",
            roles=[mock_admin_role],
            is_active=True,
            created_at=datetime.utcnow()
        )
    ]
    
    with patch("app.services.user_service.UserService.list_users", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = mock_users
        
        response = admin_client.get("/api/v1/admin/users")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["email"] == "user1@example.com"

@pytest.mark.asyncio
async def test_list_users_forbidden():
    # Mock a non-admin user
    mock_pp_role = Role(id=1, name=UserRoleEnum.PP, label="PP")
    mock_pp = User(
        id=uuid.uuid4(),
        email="pp@example.com",
        full_name="PP User",
        roles=[mock_pp_role],
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    async def override_get_current_pp():
        return mock_pp
        
    app.dependency_overrides[get_current_user] = override_get_current_pp
    
    response = client.get("/api/v1/admin/users")
    assert response.status_code == 403
    assert response.json()["detail"] == "Operation not permitted"
    
    app.dependency_overrides.clear()
