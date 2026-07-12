from flask import jsonify, request
from . import api_bp
from .utils import get_entity, create_entity
from app.models.service import Service


# Получить все услуги
@api_bp.route('/services', methods=['GET'])
def get_services():
    return get_entity(Service)

# Получить услугу по айди
@api_bp.route('/services/<int:id>', methods=['GET'])
def get_service(id):
    return get_entity(Service, id)

# Создать услугу
@api_bp.route('/services', methods=['POST'])
def create_service():
    data = request.get_json()
    service = create_entity(Service, **data)
    return jsonify({"id_service": service.id_service})