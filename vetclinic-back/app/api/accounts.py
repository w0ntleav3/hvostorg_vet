from flask import jsonify, request
from . import api_bp
from .utils import get_entity, create_entity
from app.models.account import Account


# Получить все аккаунты
@api_bp.route('/accounts', methods=['GET'])
def get_accounts():
    return get_entity(Account)

# Получить аккаунт по айди
@api_bp.route('/accounts/<int:id>', methods=['GET'])
def get_account(id):
    return get_entity(Account, id)

# Создать аккаунт
@api_bp.route('/accounts', methods=['POST'])
def create_account():
    data = request.get_json()
    account = create_entity(Account, **data)
    return jsonify({"id_account": account.id_account})