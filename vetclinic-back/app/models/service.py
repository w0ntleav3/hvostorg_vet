from app import db
from .basemodel import BaseModel


class Service(BaseModel):
    __tablename__ = 'service'

    id_service = db.Column(
        db.Integer,
        primary_key=True,
        nullable=False
    )

    name_service = db.Column(
        db.String(100),
        nullable=False
    )

    cost = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    __repr__ = lambda self: f"<Service {self.name_service}>"