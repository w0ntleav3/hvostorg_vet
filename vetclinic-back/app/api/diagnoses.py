from flask import jsonify, request
from . import api_bp
from .utils import get_entity, create_entity
from app.models.diagnosis import Diagnosis

from app.models.diagnosis import Diagnosis  # Убедись, что импортируешь правильную модель диагноза


@api_bp.route('/diagnoses', methods=['GET'])
def get_all_diagnoses():
    diagnoses = Diagnosis.query.all()
    result = []
    for d in diagnoses:
        result.append({
            "id_diagnosis": d.id_diagnosis,
            "name_diagnosis": d.name_diagnosis,
            "id_class": d.id_class,
            "is_dangerous": d.is_dangerous,
            "classs": {
                "name_class": d.classs.name_class if d.classs else "Без класса"
            }
        })
    return jsonify(result)


@api_bp.route('/diagnoses/<int:id>', methods=['GET'])
def get_diagnosis():
    return get_entity(Diagnosis, id)

@api_bp.route('/diagnoses', methods=['POST'])
def create_diagnoses():
    data = request.get_json()
    diagnosis = create_entity(Diagnosis, data)
    return jsonify({"id_diagnosis": diagnosis.id_diagnosis})