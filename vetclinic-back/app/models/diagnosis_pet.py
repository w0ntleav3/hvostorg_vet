from app import db
from .basemodel import BaseModel


class Diagnosis_pet(BaseModel):
    __tablename__ = 'diagnosis_pet'

    id_diagnosis_record = db.Column(db.Integer, primary_key=True)
    id_med_card = db.Column(db.Integer, db.ForeignKey('med_card.id_med_card', ondelete='CASCADE'), nullable=False)

    id_diagnosis = db.Column(db.String(10), db.ForeignKey('diagnosis.id_diagnosis'), nullable=False)
    date_diagnosis = db.Column(db.Date, nullable=False, index=True)
    status = db.Column(db.Boolean, nullable=False)
    comments = db.Column(db.Text)

    med_card = db.relationship(
        'MedCard',
        backref=db.backref(
            'diagnoses',
            cascade="all, delete-orphan",
            passive_deletes=True
        ),
        lazy=True
    )

    diagnosis_rel = db.relationship('Diagnosis', backref='diagnosis_records', uselist=False)

    def to_dict(self):
        return {
            "id_diagnosis_record": self.id_diagnosis_record,
            "date_diagnosis": self.date_diagnosis.isoformat() if self.date_diagnosis else None,
            "status": self.status,
            "comments": self.comments,
            "diagnosis_rel": {
                "id_diagnosis": self.diagnosis_rel.id_diagnosis if self.diagnosis_rel else None,
                "name_diagnosis": self.diagnosis_rel.name_diagnosis if self.diagnosis_rel else None,
                "classs": {
                    "name_class": self.diagnosis_rel.classs.name_class
                } if self.diagnosis_rel and self.diagnosis_rel.classs else None
            } if self.diagnosis_rel else None
        }

    def __repr__(self):
        return f"<Diagnosis_pet {self.id_diagnosis_record}>"