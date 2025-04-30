import pytest
from app.models import (
    RulePublic,
)
from fastapi.testclient import TestClient

RULE_TEMPLATES = {
    "max_expense_amount",
    "max_grant_funding",
    "expense_date_range",
    "category_restriction",
}


def test_get_rule_templates(user_login: dict, client: TestClient):
    """GET /rules/templates returns all available template names."""
    r = client.get("/api/v1/rules/templates", headers=user_login)
    assert r.status_code == 200
    data = set(r.json())
    # ensure our known templates are present
    assert RULE_TEMPLATES.issubset(data)


def test_read_grant_rules_empty(user_login: dict, grant_data, client: TestClient):
    """GET /rules/grant/{grant_id} initially returns no rules."""
    grant_id = grant_data.id
    r = client.get(f"/api/v1/rules/grant/{grant_id}", headers=user_login)
    assert r.status_code == 200
    payload = r.json()
    assert payload["count"] == 0
    assert payload["data"] == []


@pytest.fixture(scope="function")
def created_rule(user_login: dict, grant_data, client: TestClient):
    """Create one rule from template and return its JSON."""
    grant_id = grant_data.id
    tmpl = "max_expense_amount"
    r = client.post(
        f"/api/v1/rules/grant/{str(grant_id)}/template/{tmpl}", headers=user_login
    )
    assert r.status_code == 200
    return r.json()


def test_read_grant_rules_non_empty(
    user_login: dict, grant_data, client: TestClient, created_rule: RulePublic
):
    """After creation, GET /rules/grant/{grant_id} returns one rule."""
    grant_id = grant_data.id
    r = client.get(f"/api/v1/rules/grant/{grant_id}", headers=user_login)
    assert r.status_code == 200
    payload = r.json()
    assert payload["count"] == 1
    rule = payload["data"][0]
    assert rule["id"] == created_rule["id"]
    assert rule["name"] == created_rule["name"]


def test_update_and_deactivate_rule(
    user_login: dict, client: TestClient, created_rule: dict
):
    """PUT /rules/{rule_id} can deactivate a rule."""
    rid = created_rule["id"]
    created_rule["is_active"] = False
    # deactivate
    r = client.put(f"/api/v1/rules/{rid}", json=created_rule, headers=user_login)
    assert r.status_code == 200
    updated = r.json()
    assert updated["is_active"] is False
    # reactivate
    created_rule["is_active"] = True
    r2 = client.put(f"/api/v1/rules/{rid}", json=created_rule, headers=user_login)
    assert r2.status_code == 200
    assert r2.json()["is_active"] is True


def test_delete_rule(user_login: dict, client: TestClient, created_rule, grant_data):
    """DELETE /rules/{rule_id} removes the rule."""
    rid = created_rule["id"]
    r = client.delete(f"/api/v1/rules/{rid}", headers=user_login)
    assert r.status_code == 200
    assert r.json().get("message") == "Rule deleted successfully"
    # ensure it's gone
    r2 = client.get(f"/api/v1/rules/grant/{grant_data.id}", headers=user_login)
    assert r2.status_code == 200
    assert r2.json()["count"] == 0
