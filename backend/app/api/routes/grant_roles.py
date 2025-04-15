import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUser, GrantPermissionChecker, SessionDep
from app.models import (
    GrantPermission,
    GrantRole,
    GrantRolePublic,
    GrantRolesPublic,
    GrantRoleType,
)
from app.permissions import create_default_grant_role, has_grant_permission

router = APIRouter(prefix="/grant-roles", tags=["Grant Roles"])


@router.get("/grant/{grant_id}", response_model=GrantRolesPublic)
async def read_grant_roles(
    session: SessionDep,
    grant_id: Annotated[
        str, Depends(GrantPermissionChecker(GrantPermission.MANAGE_ROLES))
    ],
) -> Any:
    """
    Get all roles for a specific grant.
    Only users with MANAGE_ROLES permission can view roles.
    """

    statement = select(GrantRole).where(GrantRole.grant_id == grant_id)
    roles = session.exec(statement).all()
    count = len(roles)

    return GrantRolesPublic(data=roles, count=count)


@router.post("/grant/{grant_id}/user/{user_id}", response_model=GrantRolePublic)
async def create_grant_role(
    session: SessionDep,
    grant_id: str,
    user_id: str,
    role_type: GrantRoleType,
    current_user: CurrentUser,
) -> Any:
    """
    Create a new role for a user in a grant.
    Only users with MANAGE_ROLES permission can create roles.
    """
    has_permission = await has_grant_permission(
        session, current_user.id, uuid.UUID(grant_id), GrantPermission.MANAGE_ROLES
    )

    if not has_permission:
        raise HTTPException(
            status_code=403,
            detail=f"User does not have permission: {GrantPermission.MANAGE_ROLES}",
        )

    # Check if role already exists
    statement = select(GrantRole).where(
        GrantRole.grant_id == grant_id, GrantRole.user_id == user_id
    )
    existing_role = session.exec(statement).first()
    if existing_role:
        raise HTTPException(
            status_code=400, detail="User already has a role in this grant"
        )

    role = await create_default_grant_role(session, user_id, grant_id, role_type)
    return role


@router.delete("/{role_id}")
async def delete_grant_role(
    session: SessionDep, role_id: str, current_user: CurrentUser, grant_id: str
) -> Any:
    """
    Delete a grant role.
    Only users with MANAGE_ROLES permission can delete roles.
    """

    has_permission = await has_grant_permission(
        session, current_user.id, uuid.UUID(grant_id), GrantPermission.MANAGE_ROLES
    )

    if not has_permission:
        raise HTTPException(
            status_code=403,
            detail=f"User does not have permission: {GrantPermission.MANAGE_ROLES}",
        )

    role = session.get(GrantRole, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    session.delete(role)
    session.commit()
    return {"message": "Role deleted successfully"}
