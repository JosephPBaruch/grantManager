from app.models import GrantPublic
from fastapi.testclient import TestClient


def _create_grant(client: TestClient, auth: dict) -> GrantPublic:
    grant_data = {
        "title": "Test Grant",
        "funding_agency": "Test Agency",
        "start_date": "2024-01-01T00:00:00Z",
        "end_date": "2024-12-31T00:00:00Z",
        "total_amount": 100000.0,
        "description": "Test grant description",
    }
    response = client.post("/api/v1/grants/", json=grant_data, headers=auth)
    assert response.status_code == 200
    return GrantPublic(**response.json())


def _register_user(client: TestClient) -> None:
    """Test user registration endpoint."""
    user_data = {
        "email": "other@example.com",
        "password": "registerpassword",
        "full_name": "Register User",
    }
    response = client.post("/api/v1/users/signup", json=user_data)
    assert response.status_code == 200 or response.status_code == 400
    return user_data


def _get_login_headers(client: TestClient, username, password):
    login_data = {"username": username, "password": password}

    response = client.post("/api/v1/login/access-token", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    return {"Authorization": f"Bearer {data['access_token']}"}


def test_read_grant_roles(client: TestClient, user_login: dict):
    """Test reading roles for a specific grant."""
    grant_id = _create_grant(client, user_login).id
    response = client.get(f"/api/v1/grant-roles/grant/{grant_id}", headers=user_login)
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "count" in data
    assert isinstance(data["data"], list)
    assert isinstance(data["count"], int)


def test_create_grant_role(client: TestClient, user_login: dict):
    """Test creating a new role for a user in a grant."""
    grant_id = _create_grant(client, user_login).id
    email = _register_user(client)["email"]
    role_data = {"email": email, "role_type": "USER"}

    response = client.post(
        f"/api/v1/grant-roles/grant/{grant_id}",
        json=role_data,
        headers=user_login,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert data["role_type"] == "USER"


def test_delete_grant_role(client: TestClient, user_login: dict):
    """Test deleting a grant role."""
    grant_id = _create_grant(client, user_login).id
    role_id = "some-role-id"  # Replace with a valid role ID

    response = client.delete(f"/api/v1/grant-roles/{role_id}", headers=user_login)
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Role deleted successfully"
