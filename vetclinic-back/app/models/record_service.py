from app import db
from .basemodel import BaseModel


class RecordService(BaseModel):
    __tablename__ = 'record_service'

    id_record = db.Column(db.Integer, primary_key=True)
    # 🔥 ИЗМЕНЕНИЕ: Добавили ondelete='CASCADE'
    id_med_card = db.Column(db.Integer, db.ForeignKey('med_card.id_med_card', ondelete='CASCADE'), nullable=False)
    id_service = db.Column(db.Integer, db.ForeignKey('service.id_service', ondelete='SET NULL'))
    id_emp = db.Column(db.Integer, db.ForeignKey('employee.id_emp'), nullable=False)
    date_service = db.Column(db.DateTime, nullable=False, index=True)
    file_link = db.Column(db.Text)
    comment = db.Column(db.Text)

    med_card = db.relationship('MedCard', back_populates='records')
    service = db.relationship('Service', backref='records')
    employee = db.relationship('Employee', backref='records')

    def __repr__(self):
        return f"<Record_service {self.id_record}>"