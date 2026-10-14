from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_event import SecurityAuditEvent


async def record_audit(
    db: AsyncSession,
    action: str,
    resource_type: str,
    *,
    actor_user_id: str | None,
    resource_id: str | None = None,
    outcome: str = "success",
    metadata: dict[str, Any] | None = None,
) -> None:
    db.add(
        SecurityAuditEvent(
            actor_user_id=actor_user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            outcome=outcome,
            metadata_json=metadata or {},
        )
    )
