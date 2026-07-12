from flask import jsonify, request
from . import api_bp
from .utils import get_entity, create_entity
from app.models.role import Role


# Получить все роли
@api_bp.route('/roles', methods=['GET'])
def get_roles():
    return get_entity(Role)

# Получить роль по айди
@api_bp.route('/roles/<int:id>', methods=['GET'])
def get_role(id):
    return get_entity(Role, id)

# Создать роль
@api_bp.route('/roles', methods=['POST'])
def create_role():
    data = request.get_json()
    role = create_entity(Role, **data)
    return jsonify({"id_role": role.id_role})