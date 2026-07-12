from flask import jsonify, request
from . import api_bp
from .utils import get_entity, create_entity
from app.models.employee import Employee


@api_bp.route('/employees', methods=['GET'])
def get_employee():
    return get_entity(Employee)

@api_bp.route('/employees/<int:id>', methods=['GET'])
def get_employees():
    return get_entity(Employee, id)

@api_bp.route('/employees', methods=['POST'])
def create_employee():
    data = request.get_json()
    employee = create_entity(Employee, data)
    return jsonify({"id_employee":employee.id_employee})