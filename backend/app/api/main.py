from fastapi import APIRouter

from app.api.routes import (
    actions,
    budgets,
    conditions,
    login,
    private,
    rules,
    selectors,
    users,
    utils,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(rules.router)
api_router.include_router(actions.router)
api_router.include_router(conditions.router)
api_router.include_router(selectors.router)
api_router.include_router(budgets.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
