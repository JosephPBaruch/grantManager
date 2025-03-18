import logging

from app import crud
from app.core.config import settings
from app.models import User, UserCreate
from sqlalchemy import Engine
from sqlalchemy.schema import CreateSchema
from sqlmodel import Session, create_engine, select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


def create_schema(engine: Engine, db_schema: str):
    with engine.connect() as conn:
        if not conn.dialect.has_schema(conn, "rules"):
            logger.warning(f"Schema '{db_schema}' not found in database. Creating...")
            conn.execute(CreateSchema(db_schema))
            conn.commit()


def init_db(session: Session) -> None:
    # from sqlalchemy import SQLModel

    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.create_user(session=session, user_create=user_in)
