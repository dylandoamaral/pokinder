from datetime import datetime
from enum import Enum
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.utils.sqlalchemy import (
    BaseTable,
    UUIDPrimaryKey,
    build_created_at_column,
    private,
    read_only,
    write_only,
)


class AccountResetPasswordStatus(Enum):
    PENDING = 0
    VALIDATED = 1
    SKIPPED = 2


class AccountResetPassword(BaseTable, UUIDPrimaryKey):
    __tablename__ = "account_reset_password"  #  type: ignore[assignment]

    account_id: Mapped[UUID] = mapped_column(ForeignKey("account.id"), nullable=False, info=write_only)
    token: Mapped[bytes] = mapped_column(nullable=False, info=private)
    status: Mapped[AccountResetPasswordStatus] = mapped_column(
        nullable=False,
        default=AccountResetPasswordStatus.PENDING,
    )
    created_at: Mapped[datetime] = build_created_at_column()

    account = relationship("Account", lazy="joined", foreign_keys=[account_id], info=read_only)
