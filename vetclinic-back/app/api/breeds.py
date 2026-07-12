from flask import jsonify, request

from . import api_bp
from app.models.breed import Breed


# Получить список всех пород
@api_bp.route('/breeds', methods=['GET'])
def get_breeds():
    # Можно добавить фильтрацию по id_type: /breeds?type_id=1
    type_id = request.args.get('type_id')
    if type_id:
        breeds = Breed.query.filter_by(id_type=type_id).all()
    else:
        breeds = Breed.query.all()

    return jsonify([{
        "id_breed": b.id_breed,
        "name_breed": b.name_breed,
        "id_type": b.id_type,
        "type_name": b.pet_type.name_type if b.pet_type else None
    } for b in breeds])


@api_bp.route('/breeds', methods=['POST'])
def create_breed():
    data = request.get_json()
    new_breed = Breed(name_breed=data['name_breed'], id_type=data['id_type'])
    db.session.add(new_breed)
    db.session.commit()
    return jsonify(new_breed.to_dict()), 201

