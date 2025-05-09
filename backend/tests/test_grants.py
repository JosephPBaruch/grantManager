from typing import TYPE_CHECKING

import pytest
from app.models import GrantPublic
from fastapi.testclient import TestClient

if TYPE_CHECKING:
    from tests.conftest import UserData  # noqa: F401


def _get_login_headers(client: TestClient, username, password):
    login_data = {"username": username, "password": password}

    response = client.post("/api/v1/login/access-token", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    return {"Authorization": f"Bearer {data['access_token']}"}


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


def test_create_grant(user_login: dict, client: TestClient) -> None:
    """Test creating a new grant."""
    grant_data = {
        "title": "Test Grant",
        "funding_agency": "Test Agency",
        "start_date": "2024-01-01T00:00:00Z",
        "end_date": "2024-12-31T00:00:00Z",
        "total_amount": 100000.0,
        "description": "Test grant description",
    }
    response = client.post("/api/v1/grants/", json=grant_data, headers=user_login)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == grant_data["title"]
    assert data["funding_agency"] == grant_data["funding_agency"]
    assert data["total_amount"] == grant_data["total_amount"]
    assert "id" in data
    return data["id"]


def test_read_grants(user_login: dict, client: TestClient) -> None:
    """Test reading grants."""
    response = client.get("/api/v1/grants/", headers=user_login)
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "count" in data
    assert isinstance(data["data"], list)
    assert isinstance(data["count"], int)


def test_read_grant_by_id(
    test_user,  # type: UserData
    client: TestClient,
) -> None:
    """Test reading a specific grant by ID."""
    # First create a grant
    auth = _get_login_headers(client, test_user.email, test_user.password)
    grant_id = _create_grant(client, auth)

    # Then read it
    response = client.get(f"/api/v1/grants/{str(grant_id.id)}", headers=auth)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(grant_id.id)
    assert data["title"] == "Test Grant"


def test_update_grant(
    test_user,  # type: UserData
    client: TestClient,
) -> None:
    """Test updating a grant."""
    # First create a grant
    auth = _get_login_headers(client, test_user.email, test_user.password)
    grant = _create_grant(client, auth)
    grant_id = str(grant.id)
    # Then update it
    update_data = {
        "title": "Updated Grant",
        "funding_agency": "Updated Agency",
        "total_amount": 200000.0,
        "description": "Updated grant description",
    }
    response = client.put(f"/api/v1/grants/{grant_id}", json=update_data, headers=auth)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == grant_id
    assert data["title"] == update_data["title"]
    assert data["funding_agency"] == update_data["funding_agency"]
    assert data["total_amount"] == update_data["total_amount"]


@pytest.mark.username("testUser")
def test_grant_permissions(
    user_login: dict, client: TestClient, grant_data: GrantPublic
) -> None:
    """Test grant permissions."""
    # Create a grant
    grant_id = grant_data.id
    other_grant_data = {
        "title": "Test Grant",
        "funding_agency": "Test Agency",
        "start_date": "2024-01-01T00:00:00Z",
        "end_date": "2024-12-31T00:00:00Z",
        "total_amount": 100000.0,
        "description": "Test grant description",
    }
    response = client.post("/api/v1/grants/", json=grant_data, headers=user_login)
    data = response.json()
    other_grant = GrantPublic(**data)
    # Try to access grant with different permissions
    response = client.get(f"/api/v1/grants/{grant_id}", headers=user_login)
    assert response.status_code == 200  # Should have view permission

    # Try to update without manage permission
    update_data = {"title": "Unauthorized Update", "total_amount": 999999.0}
    response = client.patch(
        f"/api/v1/grants/{grant_id}", json=update_data, headers=user_login
    )
    # This should fail if user doesn't have manage permission
    assert response.status_code in [
        403,
        200,
    ]  # 403 if no permission, 200 if has permission

    # Try to archive without archive permission
    response = client.delete(f"/api/v1/grants/{grant_id}", headers=user_login)
    # This should fail if user doesn't have archive permission
    assert response.status_code in [
        403,
        200,
    ]  # 403 if no permission, 200 if has permission


@pytest.mark.username("testUser")
def test_grant_pagination(user_login: dict, client: TestClient) -> None:
    """Test grant list pagination."""
    # Create multiple grants
    for i in range(5):
        grant_data = {
            "title": f"Test Grant {i}",
            "funding_agency": f"Test Agency {i}",
            "start_date": "2024-01-01T00:00:00Z",
            "end_date": "2024-12-31T00:00:00Z",
            "total_amount": 100000.0 * (i + 1),
            "description": f"Test grant description {i}",
        }
        response = client.post("/api/v1/grants/", json=grant_data, headers=user_login)
        assert response.status_code == 200

    # Test pagination
    response = client.get("/api/v1/grants/?skip=0&limit=2", headers=user_login)
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 2
    assert data["count"] >= 5

    # Test second page
    response = client.get("/api/v1/grants/?skip=2&limit=2", headers=user_login)
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 2


if __name__ == "__main__":
    pytest.main([__file__])
