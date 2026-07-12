from app import db
from .basemodel import BaseModel


class MedCard(BaseModel):
    __tablename__ = 'med_card'

    id_med_card = db.Column(db.Integer, primary_key=True)
    id_pet = db.Column(db.Integer, db.ForeignKey('pet.id_pet', ondelete='CASCADE'), nullable=False) # Подсказали про ON DELETE CASCADE
    date_open = db.Column(db.Date, nullable=False)

    # 🔥 ИЗМЕНЕНИЕ: Меняем backref на back_populates
    pet = db.relationship('Pet', back_populates='med_card')

    # 🔥 ИЗМЕНЕНИЕ: Добавляем каскад для записей услуг
    records = db.relationship(
        'RecordService',
        back_populates='med_card',
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def __repr__(self):
        return f"<Med_card {self.id_med_card}>"