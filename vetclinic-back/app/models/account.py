from app import db
from .basemodel import BaseModel
from werkzeug.security import generate_password_hash, check_password_hash

class Account(BaseModel):
    id_account = db.Column(db.Integer, primary_key=True, autoincrement=True)
    login = db.Column(db.String(50), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    id_role = db.Column(db.Integer, nullable=False)
    employee = db.relationship('Employee', backref='account', uselist=False)

    @property
    def password(self):
        raise AttributeError("Пароль нельзя прочитать напрямую")

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password_input):
        return check_password_hash(self.password_hash, password_input)
