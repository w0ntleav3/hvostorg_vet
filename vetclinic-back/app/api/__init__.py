from flask import Blueprint

api_bp = Blueprint('api', __name__)

# все модули API
from . import (
    login,
    clients,
    pets,
    accounts,
    diagnoses,
    diagnosis_classes,
    diagnosis_pets,
    employees,
    med_cards,
    posts,
    record_services,
    roles,
    services,
    vets,
    utils,
    breeds,
    pet_types
)