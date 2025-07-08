from sqlalchemy import Column, Integer, String

from db.config import Base

class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    mobile = Column(String, nullable=False)
    role = Column(String, nullable=False, default='user')  # Added role field

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "mobile": self.mobile,
            "role": self.role
        }