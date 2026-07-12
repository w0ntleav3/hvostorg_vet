from app import db
from .basemodel import BaseModel

class Diagnosis(BaseModel):
    id_diagnosis = db.Column(db.String(10), primary_key=True)
    name_diagnosis = db.Column(db.String(300), nullable=False)
    id_class = db.Column(db.Integer, db.ForeignKey('diagnosis_class.id_class'))
    is_dangerous = db.Column(db.Boolean, default=False)
    classs = db.relationship('Diagnosis_class', backref='diagnoses', uselist=False)


    def __repr__(self):
        return f"<Diagnosis {self.name_diagnosis}>"