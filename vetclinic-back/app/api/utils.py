from flask import jsonify
from app import db


# Универсальная функция обработки данных
def get_entity(model, id=None):
    if id is None:
        items = model.query.all()  # Получаем все записи из базы данных
        return jsonify([item.to_dict() for item in items])  # преобразуем их в список словарей
    item = model.query.get(id)  # Получаем одну запись по ID
    if item is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(item.to_dict())  # Преобразуем объект в словарь


# Универсальная функция создания объекта
def create_entity(entity, **kwargs):

    new_entity = entity(**kwargs)
    db.session.add(new_entity)
    db.session.commit()
    return new_entity
