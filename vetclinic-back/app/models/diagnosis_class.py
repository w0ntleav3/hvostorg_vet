from app import db
from .basemodel import BaseModel

class Diagnosis_class(BaseModel):
    id_class = db.Column(db.Integer, primary_key=True)
    name_class = db.Column(db.String(300), nullable=False)


    def __repr__(self):
        return f"<Diagnosis_class {self.name_class}>"