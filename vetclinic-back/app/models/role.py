from app import db
from .basemodel import BaseModel


class Role(BaseModel):
    id_role = db.Column(db.Integer, primary_key=True, nullable = False)
    name_role = db.Column(db.String(50), nullable=False)


    def __repr__(self):
        return f"<Role {self.name_role}>"