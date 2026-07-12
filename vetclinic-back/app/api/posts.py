from flask import jsonify, request
from . import api_bp
from .utils import get_entity, create_entity
from app.models.post import Post


# Получить все должности
@api_bp.route('/posts', methods=['GET'])
def get_posts():
    return get_entity(Post)

# Получить должность по айди
@api_bp.route('/posts/<int:id>', methods=['GET'])
def get_post(id):
    return get_entity(Post, id)

# Создать должность
@api_bp.route('/posts', methods=['POST'])
def create_post():
    data = request.get_json()
    post = create_entity(Post, **data)
    return jsonify({"id_post": post.id_post})