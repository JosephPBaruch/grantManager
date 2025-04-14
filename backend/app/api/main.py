from fastapi import APIRouter

from app.api.routes import (
    actions,
    conditions,
    grant_approvals,
    grant_categories,
    grant_expenses,
    grants,
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
api_router.include_router(grants.router)
api_router.include_router(grant_categories.router)
api_router.include_router(grant_expenses.router)
api_router.include_router(grant_approvals.router)

if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
