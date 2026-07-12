# app/models/pet_type.py
from app import db
from .basemodel import BaseModel


class PetType(BaseModel):
    __tablename__ = 'pet_type'
    id_type = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name_type = db.Column(db.String(100), nullable=False, unique=True)

    def to_dict(self):
        return {
            "id_type": self.id_type,
            "name_type": self.name_type
        }


