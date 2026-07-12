from flask import jsonify, request
from . import api_bp
from .utils import get_entity
from app.models.med_card import MedCard
from .. import db


@api_bp.route('/med_cards', methods=['GET'])
def get_med_card():
    return get_entity(MedCard)

@api_bp.route('/med_cards/<int:id>', methods=['GET'])
def get_med_cards():
    return get_entity(MedCard, id)

@api_bp.route('/med_cards', methods=['POST'])
def create_med_card():
    data = request.get_json()
    med_card = MedCard(
        id_pet=data['id_pet'],
        date_open=data['date_open']
    )
    db.session.add(med_card)
    db.session.commit()
    return jsonify({"id_med_card": med_card.id_med_card})


