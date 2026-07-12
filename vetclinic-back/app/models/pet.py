from app import db
from app.models.basemodel import BaseModel


class Pet(BaseModel):
    __tablename__ = 'pet'

    id_pet = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_client = db.Column(db.Integer, db.ForeignKey('client.id_client'), nullable=False)
    name = db.Column(db.String(100), index=True)
    sex = db.Column(db.String(1), nullable=True)
    id_breed = db.Column(db.Integer, db.ForeignKey('breed.id_breed'), nullable=True)
    date_birth = db.Column(db.Date)
    photo = db.Column(db.Text)

    __table_args__ = (
        db.CheckConstraint("sex IN ('M', 'F')", name='chk_pet_sex'),
    )

    breed_rel = db.relationship('Breed', backref='pets')

    med_card = db.relationship(
        'MedCard',
        back_populates='pet',
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def __repr__(self):
        return f"<Pet {self.name}>"

    def to_dict(self, include_records=False):
        data = {
            "id_pet": self.id_pet,
            "id_client": self.id_client,
            "name": self.name,
            "sex": self.sex,
            "id_breed": self.id_breed,
            "type": self.breed_rel.pet_type.name_type if (self.breed_rel and self.breed_rel.pet_type) else "Без типа",
            "breed": self.breed_rel.name_breed if self.breed_rel else "Без породы",
            "date_birth": self.date_birth.isoformat() if self.date_birth else None,
            "photo": self.photo,
            "owner": {
                "id_client": self.id_client,
                "name": self.owner.name if self.owner else "Без владельца"
            }
        }

        if include_records:
            if self.med_card:
                mc = self.med_card
                data["med_cards"] = [{
                    "id_med_card": mc.id_med_card,
                    "date_open": mc.date_open.isoformat() if mc.date_open else None,
                    "records": [],
                    "diagnoses": []
                }]
            else:
                data["med_cards"] = []

        return data