import logging
from collections.abc import Iterable
from logging.config import fileConfig
from typing import Any

import alembic
import sqlalchemy.sql.base
from alembic import context
from alembic.autogenerate.api import AutogenContext
from alembic.operations.ops import CreateTableOp, ExecuteSQLOp, UpgradeOps
from sqlalchemy import engine_from_config, pool

_logger = logging.getLogger(f"alembic.{__name__}")


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata

from app.core.config import settings  # noqa
from app.models import SQLModel  # noqa

target_metadata = SQLModel.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def get_url():
    return str(settings.SQLALCHEMY_DATABASE_URI)


def run_migrations_offline():
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_url()
    context.configure(
        url=url, target_metadata=target_metadata, literal_binds=True, compare_type=True
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata, compare_type=True
        )

        with context.begin_transaction():
            context.run_migrations()


class ExecuteArbitraryDDLOp(ExecuteSQLOp):
    def __init__(
        self,
        ddl: sqlalchemy.sql.base.Executable | str,
        reverse_ddl: sqlalchemy.sql.base.Executable | str,
        *,
        execution_options: dict[str, Any] | None = None,
    ) -> None:
        """A DDL Operation with both upgrade and downgrade commands."""
        super().__init__(ddl, execution_options=execution_options)
        self.reverse_ddl = reverse_ddl

    def reverse(self) -> "ExecuteArbitraryDDLOp":
        """Return the reverse of this ArbitraryDDL operation (used for downgrades)."""
        return ExecuteArbitraryDDLOp(
            ddl=self.reverse_ddl,
            reverse_ddl=self.sqltext,
            execution_options=self.execution_options,
        )


@alembic.autogenerate.comparators.dispatch_for("schema")
def create_missing_schemas(
    autogen_context: AutogenContext,
    upgrade_ops: UpgradeOps,
    schema_names: Iterable[str | None],
) -> None:
    """Creates missing schemas.

    This depends on sqla/alembic to give us all existing
    schemas in the schema_names argument.
    """
    used_schemas = set()
    for operations_group in upgrade_ops.ops:
        # We only care about Tables at the top level, so this is enough for us.
        if isinstance(operations_group, CreateTableOp) and operations_group.schema:
            used_schemas.add(operations_group.schema)

    existing_schemas = set(schema_names)
    missing_schemas = used_schemas - existing_schemas
    if missing_schemas:
        for schema in missing_schemas:
            _logger.info("Add migration ops for schema: %s", schema)
            upgrade_ops.ops.insert(
                0,
                ExecuteArbitraryDDLOp(
                    ddl=f"CREATE SCHEMA {schema}",
                    reverse_ddl=f"DROP SCHEMA {schema}",
                ),
            )


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
