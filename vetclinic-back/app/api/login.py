from flask import request, jsonify
from flask_jwt_extended import create_access_token
from app.models.account import Account
from app import db
from . import api_bp
from ..models import Client


@api_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    login = data.get('login')
    password = data.get('password')

    account = Account.query.filter_by(login=login).first()
    if not account or not account.check_password(password):
        return jsonify({"error": "Неверные данные"}), 401

    access_token = create_access_token(identity=str(account.id_account))

    # проверяем, есть ли связанный сотрудник
    id_emp = None
    if hasattr(account, 'employee') and account.employee:
        id_emp = account.employee.id_emp


    return jsonify({
        "token": access_token,
        "id_account": account.id_account,
        "id_role": account.id_role,
        "id_emp": id_emp
    })


@api_bp.route('/register', methods=['POST'])
def register():
    data = request.json

    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password or not name:
        return jsonify({'error': 'Не все поля заполнены'}), 400

    # проверка что логин не занят
    if Account.query.filter_by(login=email).first():
        return jsonify({'error': 'Аккаунт уже существует'}), 400

    account = Account(
        login=email,
        password=password,
        id_role=3
    )
    db.session.add(account)
    db.session.flush()  # чтобы получить id_account

    client = Client(
        name=name,
        email=email,
        phone='-',
        discount=0,
        id_account=account.id_account
    )

    db.session.add(client)
    db.session.commit()

    return jsonify({'message': 'Регистрация успешна'}), 201