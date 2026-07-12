from app import db
from .basemodel import BaseModel


class Employee(BaseModel):
    __tablename__ = 'employee'

    id_emp = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    id_account = db.Column(
        db.Integer,
        db.ForeignKey('account.id_account'),
        nullable=False
    )

    id_post = db.Column(
        db.Integer,
        db.ForeignKey('post.id_post'),
        nullable=False
    )

    name_emp = db.Column(
        db.String(100),
        nullable=False,
        index=True
    )

    passport = db.Column(
        db.String(10),
        nullable=False
    )

    phone = db.Column(
        db.String(20),
        nullable=False,
        unique=True
    )

    salary = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    bank_acc_number = db.Column(
        db.String(20),
        nullable=False
    )

    contract_num = db.Column(
        db.BigInteger,
        nullable=False
    )

    post = db.relationship(
        'Post',
        backref='owner',
        lazy=True
    )

    def __repr__(self):
        return f"<Employee {self.name_emp}>"