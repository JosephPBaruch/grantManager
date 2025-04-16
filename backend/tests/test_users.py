import pytest
from conftest import UserData
from fastapi.testclient import TestClient


def test_register_user(client: TestClient) -> None:
    """Test user registration endpoint."""
    user_data = {
        "email": "register@example.com",
        "password": "registerpassword",
        "full_name": "Register User",
    }
    response = client.post("/api/v1/users/signup", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["full_name"] == user_data["full_name"]
    assert "id" in data


def test_login(test_superuser: UserData, client: TestClient) -> None:
    """Test login endpoint."""
    login_data = {"username": test_superuser.email, "password": test_superuser.password}
    response = client.post("/api/v1/login/access-token", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    return data["access_token"]


@pytest.mark.username("testUser")
def test_read_users_me(user_login, client: TestClient) -> None:
    """Test reading current user."""
    response = client.get("/api/v1/users/me", headers=user_login)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testUser@test.com"
    assert "id" in data


if __name__ == "__main__":
    pytest.main([__file__])
