from fastapi import APIRouter

from app.api.routes import (
    grant_approvals,
    grant_categories,
    grant_expenses,
    grant_roles,
    grants,
    login,
    private,
    projection,
    rules,
    users,
    utils,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(rules.router)
api_router.include_router(grants.router)
api_router.include_router(grant_categories.router)
api_router.include_router(grant_expenses.router)
api_router.include_router(grant_approvals.router)
api_router.include_router(grant_roles.router)
api_router.include_router(utils.router)
api_router.include_router(projection.router)

if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
