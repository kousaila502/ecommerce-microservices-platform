from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from db.config import Base
from datetime import datetime
from enum import Enum

class UserStatus(str, Enum):
    ACTIVE = "active"
    BLOCKED = "blocked"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"

class User(Base):
    __tablename__ = 'user'
    
    # Existing fields
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    mobile = Column(String, nullable=False)
    role = Column(String, nullable=False, default='user')
    password = Column(String, nullable=False)
    
    # Status fields
    status = Column(String, nullable=False, default=UserStatus.ACTIVE)
    is_email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Admin action tracking
    blocked_at = Column(DateTime, nullable=True)
    blocked_by = Column(Integer, nullable=True)
    blocked_reason = Column(Text, nullable=True)
    
    # Password reset fields
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    
    # Email verification fields (NEW)
    email_verification_token = Column(String(255), nullable=True)
    email_verification_expires = Column(DateTime, nullable=True)
    verification_sent_at = Column(DateTime, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "mobile": self.mobile,
            "role": self.role,
            "status": self.status,
            "is_email_verified": self.is_email_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "blocked_at": self.blocked_at.isoformat() if self.blocked_at else None,
            "blocked_reason": self.blocked_reason
        }
    
    def is_active(self):
        return self.status == UserStatus.ACTIVE
    
    def is_blocked(self):
        return self.status in [UserStatus.BLOCKED, UserStatus.SUSPENDED]

# User Session Model (unchanged)
class UserSession(Base):
    __tablename__ = 'user_sessions'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    token_id = Column(String, nullable=False, unique=True)
    login_time = Column(DateTime, default=datetime.utcnow)
    logout_time = Column(DateTime, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)