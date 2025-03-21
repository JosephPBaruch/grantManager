import logging

from app import crud
from app.core.config import settings
from app.models import User, UserCreate
from sqlalchemy import event
from sqlmodel import Session, create_engine, select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


ENABLE_PLPYTHON = "CREATE EXTENSION IF NOT EXISTS plpython3u"


def create_triggers(session: Session):
    pass


# Enable PLPython on connection
@event.listens_for(engine, "connect", insert=True)
def enable_pl_python(dbapi_connection, connection_record):
    cursor_obj = dbapi_connection.cursor()
    cursor_obj.execute(ENABLE_PLPYTHON)
    cursor_obj.close()


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
        user = crud.create_user(session=session, user_create=user_in)
