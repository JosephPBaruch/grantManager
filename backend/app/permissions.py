from typing import List
from uuid import UUID

from sqlmodel import Session, select

from app.models import GrantPermission, GrantRole, GrantRoleType, User

# Default permissions for each role type
DEFAULT_ROLE_PERMISSIONS = {
    GrantRoleType.OWNER: [
        GrantPermission.APPROVE_EXPENSES,
        GrantPermission.CREATE_RULES,
        GrantPermission.MANAGE_ROLES,
        GrantPermission.VIEW_EXPENSES,
        GrantPermission.SUBMIT_EXPENSES,
        GrantPermission.MANAGE_GRANT,
        GrantPermission.EDIT_EXPENSES,
        GrantPermission.ARCHIVE_GRANT,
        GrantPermission.VIEW_GRANT,
        GrantPermission.EDIT_GRANT,
    ],
    GrantRoleType.ADMIN: [
        GrantPermission.APPROVE_EXPENSES,
        GrantPermission.EDIT_EXPENSES,
        GrantPermission.CREATE_RULES,
        GrantPermission.MANAGE_ROLES,
        GrantPermission.VIEW_EXPENSES,
        GrantPermission.SUBMIT_EXPENSES,
        GrantPermission.MANAGE_GRANT,
        GrantPermission.VIEW_GRANT,
    ],
    GrantRoleType.USER: [
        GrantPermission.VIEW_EXPENSES,
        GrantPermission.SUBMIT_EXPENSES,
        GrantPermission.VIEW_GRANT,
    ],
}


async def get_user_grant_roles(
    session: Session, user_id: UUID, grant_id: UUID
) -> List[GrantRole]:
    """Get all roles a user has for a specific grant."""
    statement = select(GrantRole).where(
        GrantRole.user_id == user_id, GrantRole.grant_id == grant_id
    )
    return session.exec(statement).all()


async def has_grant_permission(
    session: Session, user_id: UUID, grant_id: UUID, permission: GrantPermission
) -> bool:
    """Check if a user has a specific permission for a grant."""
    # First check if the user is a superuser
    user = session.get(User, user_id)
    if user and user.is_superuser:
        return True

    # If not superuser, check their roles
    roles = await get_user_grant_roles(session, user_id, grant_id)

    # Check if any role has the permission
    for role in roles:
        if permission in role.permissions:
            return True

    return False


async def get_user_grant_permissions(
    session: Session, user_id: UUID, grant_id: UUID
) -> List[GrantPermission]:
    """Get all permissions a user has for a specific grant."""
    # First check if the user is a superuser
    user = session.get(User, user_id)
    if user and user.is_superuser:
        return list(GrantPermission)  # Return all possible permissions

    # If not superuser, check their roles
    roles = await get_user_grant_roles(session, user_id, grant_id)

    # Combine all permissions from all roles
    permissions = set()
    for role in roles:
        permissions.update(role.permissions)

    return list(permissions)


async def create_default_grant_role(
    session: Session, user_id: UUID, grant_id: UUID, role_type: GrantRoleType
) -> GrantRole:
    """Create a new grant role with default permissions for the role type."""
    role = GrantRole(
        user_id=user_id,
        grant_id=grant_id,
        role_type=role_type,
        permissions=DEFAULT_ROLE_PERMISSIONS[role_type],
    )
    session.add(role)
    session.commit()
    session.refresh(role)
    return role
