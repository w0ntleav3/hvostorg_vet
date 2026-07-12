# app/models/breed.py
from app import db
from .basemodel import BaseModel


class Breed(BaseModel):
    __tablename__ = 'breed'
    id_breed = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name_breed = db.Column(db.String(100), nullable=False)
    id_type = db.Column(db.Integer, db.ForeignKey('pet_type.id_type'), nullable=False)

    # Связь с видом животного
    pet_type = db.relationship('PetType', backref='breeds')

    def to_dict(self):
        return {
            "id_breed": self.id_breed,
            "name_breed": self.name_breed,
            "id_type": self.id_type,
            "type_name": self.pet_type.name_type if self.pet_type else None
        }