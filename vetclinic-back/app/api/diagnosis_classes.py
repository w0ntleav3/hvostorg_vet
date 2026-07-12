from flask import jsonify, request
from . import api_bp
from .utils import get_entity, create_entity
from app.models.diagnosis_class import Diagnosis_class


@api_bp.route('/diagnosis_classes', methods=['GET'])
def get_diagnosis_classes():
    return get_entity(Diagnosis_class)

@api_bp.route('/diagnosis_classes/<int:id>', methods=['GET'])
def get_diagnosis_class():
    return get_entity(Diagnosis_class, id)

@api_bp.route('/diagnosis_classes', methods=['POST'])
def create_diagnosis_classes():
    data = request.get_json()
    diagnosis_class = create_entity(Diagnosis_class, data)
    return jsonify({"id_diagnosis_class": diagnosis_class.id_diagnosis_class})