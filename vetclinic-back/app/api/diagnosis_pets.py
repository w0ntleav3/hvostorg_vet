from flask import jsonify, request
from . import api_bp
from .utils import get_entity
from app.models.diagnosis_pet import Diagnosis_pet
from .. import db


@api_bp.route('/diagnosis_pets', methods=['GET'])
def get_diagnosis_pets():
    return get_entity(Diagnosis_pet)

@api_bp.route('/diagnosis_pets/<int:id>', methods=['GET'])
def get_diagnosis_pet():
    return get_entity(Diagnosis_pet, id)


@api_bp.route('/diagnosis_pets', methods=['POST'])
def create_diagnosis_pets():
    data = request.get_json()

    id_med_card = data.get('id_med_card')
    id_diagnosis = data.get('id_diagnosis')
    date_diagnosis = data.get('date_diagnosis')
    status = data.get('status', True)
    comments = data.get('comments', '')

    # 💀 защита от NULL
    if id_diagnosis is None:
        return jsonify({"error": "id_diagnosis обязателен"}), 400

    new_row = Diagnosis_pet(
        id_med_card=id_med_card,
        id_diagnosis=id_diagnosis,
        date_diagnosis=date_diagnosis,
        status=status,
        comments=comments
    )

    db.session.add(new_row)
    db.session.commit()

    return jsonify({
        "id_diagnosis_pet": new_row.id_diagnosis_record
    })


@api_bp.route('/diagnosis_pets/<int:id>', methods=['PATCH'])
def update_diagnosis_pet(id):
    diagnosis_pet = Diagnosis_pet.query.get_or_404(id)
    data = request.get_json()

    # проверяем есть ли статус в запросе
    if 'status' in data:
        diagnosis_pet.status = data['status']

    if 'comments' in data:
        diagnosis_pet.comments = data['comments']

    from app import db
    db.session.commit()
    return jsonify({"message": "Диагноз обновлён", "status": diagnosis_pet.status})
