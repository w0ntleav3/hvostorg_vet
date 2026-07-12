from flask import request
from .utils import get_entity, create_entity
from flask import jsonify
from . import api_bp
from app import db
from app.models.record_service import RecordService
from app.models.med_card import MedCard
from app.models.pet import Pet
from app.models.client import Client
from app.models.employee import Employee
from app.models.service import Service


@api_bp.route('/records/with-details', methods=['GET'])
def get_records_with_details():
    records = (
        db.session.query(
            RecordService,
            MedCard,
            Pet,
            Client,
            Employee,
            Service
        )
        .join(MedCard, RecordService.id_med_card == MedCard.id_med_card)
        .join(Pet, MedCard.id_pet == Pet.id_pet)
        .join(Client, Pet.id_client == Client.id_client)
        .join(Employee, RecordService.id_emp == Employee.id_emp)
        .outerjoin(Service, RecordService.id_service == Service.id_service)
        .order_by(RecordService.date_service.desc())
        .all()
    )

    result = []

    for r, mc, pet, client, emp, service in records:
        result.append({
            "id_record": r.id_record,
            "date_service": r.date_service.isoformat() if r.date_service else None,

            "client_id": client.id_client,
            "client_name": client.name,

            "pet_id": pet.id_pet,
            "pet_name": pet.name,

            "service_id": service.id_service if service else None,
            "service_name": service.name_service if service else "-",
            "service_cost": service.cost if service else None,

            "employee_id": emp.id_emp,
            "employee_name": emp.name_emp,

            "comment": r.comment or "",
            "file_link": r.file_link
        })

    return jsonify(result)

# Получить все записи
@api_bp.route('/records', methods=['GET'])
def get_records():
    return get_entity(RecordService)

# Получить запись по айди
@api_bp.route('/records/<int:id>', methods=['GET'])
def get_record(id):
    return get_entity(RecordService, id)

# Создать запись
@api_bp.route('/records', methods=['POST'])
def create_record():
    data = request.get_json()

    existing = RecordService.query.filter_by(
        id_emp=data['id_emp'],
        date_service=data['date_service']
    ).first()

    if existing:
        return jsonify({
            "error": "Это время уже занято"
        }), 400

    record_service = create_entity(RecordService, **data)

    return jsonify({
        "id_record": record_service.id_record
    })

# Обновить комментарий и/или ссылку на файл у записи
@api_bp.route('/records/<int:id>', methods=['PATCH'])
def update_record(id):
    record = RecordService.query.get_or_404(id)
    data = request.get_json()

    if 'comment' in data:
        record.comment = data['comment']
    if 'file_link' in data:
        record.file_link = data['file_link']

    db.session.commit()
    return jsonify({
        "id_record": record.id_record,
        "comment": record.comment,
        "file_link": record.file_link
    })
from datetime import datetime, timezone

@api_bp.route('/records/<int:id>', methods=['DELETE'])
def delete_record(id):
    record = RecordService.query.get_or_404(id)

    # приводим к datetime
    record_time = record.date_service

    if isinstance(record_time, str):
        record_time = datetime.fromisoformat(record_time)

    now = datetime.now()

    # защита: нельзя удалять прошлые записи
    if record_time <= now:
        return jsonify({
            "error": "Нельзя удалить прошедшую запись"
        }), 403

    db.session.delete(record)
    db.session.commit()

    return jsonify({"ok": True})