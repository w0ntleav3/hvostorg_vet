from flask import Flask, jsonify
from .extensions import db, migrate, cors
from .api import api_bp
from flask_jwt_extended import JWTManager
from app.config import Config
from app.commands import seed_db, seed_staff, seed_diagnosis, seed_services, seed_records
import logging



def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ===== DB =====
    db.init_app(app)
    migrate.init_app(app, db)

    # ===== CORS =====
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True
    )

    # ===== JWT =====
    jwt = JWTManager(app)

    @jwt.unauthorized_loader
    def missing_token_callback(reason):
        return jsonify({"error": "Токен отсутствует"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({"error": "Токен неверный"}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Токен истёк"}), 401

    # ===== COMMANDS =====
    app.cli.add_command(seed_db)
    app.cli.add_command(seed_staff)
    app.cli.add_command(seed_diagnosis)
    app.cli.add_command(seed_services)
    app.cli.add_command(seed_records)

    # ===== ROUTES =====
    app.register_blueprint(api_bp, url_prefix='/api')

    logging.basicConfig(level=logging.DEBUG)

    return app