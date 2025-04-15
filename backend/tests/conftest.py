from typing import Generator

import psycopg2
import pytest
from app import crud
from app.api.deps import get_db
from app.core.config import settings
from app.main import app
from app.models import GrantPublic, User, UserCreate
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlalchemy.engine import Engine

USER_CREATE = {
    "email": "test@test.com",
    "password": "testpassword",
    "is_superuser": False,
}

SUPERUSER_CREATE = UserCreate(
    email="test@test.com",
    password="testpassword",
    is_superuser=True,
)


class UserData(User):
    password: str

    def as_user(self) -> User:
        params = self.model_dump()
        params.pop("password")
        return User(**params)


@pytest.fixture(name="engine", scope="session")
def engine_fixture():
    conn = psycopg2.connect(
        database=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        host=settings.POSTGRES_SERVER,
        port=settings.POSTGRES_PORT,
    )
    conn.autocommit = True
    cursor = conn.cursor()
    # Clear existing
    sql = f"DROP DATABASE IF EXISTS {settings.POSTGRES_TESTING_DB}"
    cursor.execute(sql)
    sql = f"""CREATE DATABASE {settings.POSTGRES_TESTING_DB}"""
    # Creating a database
    cursor.execute(sql)
    cursor.close()
    conn.close()
    
    engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
    SQLModel.metadata.create_all(engine)
    yield engine


@pytest.fixture(name="session")
def session_fixture(engine: Engine):
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client",)
def client_fixture(session: Session):
    def get_db_override():
        yield session

    app.dependency_overrides[get_db] = get_db_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def test_user_fixture(request: pytest.FixtureRequest, session: Session) -> UserData:
    username = "testUser"
    mark = request.node.get_closest_marker("username")
    if mark is not None:
        if len(mark.args) == 1:
            username = mark.args[0]

    user_info = dict(**USER_CREATE)
    user_info["email"] = f"{username}@test.com"
    user_in = UserCreate(**user_info)

    user = session.exec(select(User).where(User.email == user_in.email)).first()
    if not user:
        user = crud.create_user(session=session, user_create=user_in)

    return UserData(password=user_info["password"], **user.model_dump())


@pytest.fixture(name="test_superuser")
def test_superuser_fixture(session: Session) -> UserData:
    user = session.exec(
        select(User).where(User.email == SUPERUSER_CREATE.email)
    ).first()
    if not user:
        user = crud.create_user(session=session, user_create=SUPERUSER_CREATE)

    return UserData(password=SUPERUSER_CREATE.password, **user.model_dump())


@pytest.fixture(name="user_login")
def test_user_with_login(
    test_user: UserData, client: TestClient
) -> Generator[dict[str, str], None, None]:
    login_data = {"username": test_user.email, "password": test_user.password}

    response = client.post("/api/v1/login/access-token", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    yield {"Authorization": f"Bearer {data['access_token']}"}


@pytest.fixture(name="grant_data")
def make_grant(user_login, client: TestClient):
    """Test create grant endpoint."""
    grant_data = {
        "title": "Test Grant",
        "funding_agency": "Test Agency",
        "start_date": "2024-01-01T00:00:00Z",
        "end_date": "2024-12-31T00:00:00Z",
        "total_amount": 100000.0,
        "description": "Test grant description",
    }
    response = client.post("/api/v1/grants/", json=grant_data, headers=user_login)
    data = response.json()
    resp_grant = GrantPublic(**data)

    yield resp_grant
