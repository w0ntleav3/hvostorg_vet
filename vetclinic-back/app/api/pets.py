from flask import jsonify, request
from . import api_bp
from .utils import get_entity, create_entity
from app.models.pet import Pet
from app.models.diagnosis_pet import Diagnosis_pet  # Убедись, что путь импорта правильный!
from app.models.breed import Breed  # Импортируем новую модель
from .. import db
from ..models.pet_type import PetType


# Получить всех питомцев
# Получить всех питомцев
@api_bp.route('/pets', methods=['GET'])
def get_pets():
    pets = Pet.query.all()
    # Просто вызываем to_dict() для каждого питомца — там уже есть и type, и breed, и owner!
    return jsonify([p.to_dict() for p in pets])


# Получить питомца по айди с подробностями
@api_bp.route('/pets/<int:id>', methods=['GET'])
def get_pet(id):
    pet = Pet.query.get(id)

    if not pet:
        return jsonify({"error": "Питомец не найден"}), 404

    # 🔥 ИСПРАВЛЕНО: Здесь тоже берем тип через породу
    breed_info = {
        "id_breed": pet.id_breed,
        "name_breed": pet.breed_rel.name_breed if pet.breed_rel else "Неизвестно",
        "type": pet.breed_rel.pet_type.name_type if (pet.breed_rel and pet.breed_rel.pet_type) else "Неизвестно"
    }

    med_cards_list = []

    if pet.med_card:
        mc = pet.med_card

        records_list = [{
            "id_record": r.id_record,
            "date_service": r.date_service.isoformat() if r.date_service else None,
            "comment": r.comment or "",
            "file_link": r.file_link,
            "service": {
                "id_service": r.service.id_service if r.service else None,
                "name_service": r.service.name_service if r.service else "-",
                "cost": r.service.cost if r.service else None
            },
            "employee": {
                "id_emp": r.employee.id_emp if r.employee else None,
                "name": r.employee.name_emp if r.employee else "-"
            }
        } for r in mc.records]

        diagnoses_list = [{
            "id_diagnosis_record": d.id_diagnosis_record,
            "id_diagnosis": d.id_diagnosis,
            "date_diagnosis": d.date_diagnosis.isoformat() if d.date_diagnosis else None,
            "status": d.status,
            "comments": d.comments,
            "diagnosis_rel": {
                "name_diagnosis": d.diagnosis_rel.name_diagnosis if d.diagnosis_rel else "Неизвестно",
                "classs": {
                    "name_class": d.diagnosis_rel.classs.name_class if (
                                d.diagnosis_rel and d.diagnosis_rel.classs) else "Без категории"
                }
            }
        } for d in Diagnosis_pet.query.filter_by(id_med_card=mc.id_med_card).all()]

        med_cards_list.append({
            "id_med_card": mc.id_med_card,
            "records": records_list,
            "diagnoses": diagnoses_list
        })

    pet_dict = pet.to_dict(include_records=True)

    pet_dict["breed_info"] = breed_info
    pet_dict["med_cards"] = med_cards_list

    return jsonify(pet_dict)


# Создать питомца
@api_bp.route('/pets', methods=['POST'])
def create_pet():
    data = request.get_json()

    id_breed = data.get('id_breed')
    id_type = data.get('id_type')  # Передаем id_type с фронтенда для подстраховки

    # Если порода не выбрана, но вид (тип) животного есть
    if not id_breed and id_type:
        # 1. Находим название типа (например, "Хомяк"), чтобы сделать красивое имя породы
        pet_type_obj = PetType.query.get(int(id_type))
        type_name = pet_type_obj.name_type if pet_type_obj else "Неизвестный вид"

        generated_breed_name = f"Не определено ({type_name})"

        # 2. Проверяем, может такую породу для этого типа уже создавали ранее?
        existing_breed = Breed.query.filter_by(name_breed=generated_breed_name, id_type=int(id_type)).first()

        if existing_breed:
            id_breed = existing_breed.id_breed
        else:
            # 3. Если еще нет, создаем новую "виртуальную" породу
            new_breed = Breed(name_breed=generated_breed_name, id_type=int(id_type))
            db.session.add(new_breed)
            db.session.commit()  # Сохраняем, чтобы сгенерировался id_breed
            id_breed = new_breed.id_breed

    # Теперь собираем питомца, у которого id_breed гарантированно существует
    pet_data = {
        "id_client": data.get('id_client'),
        "name": data.get('name'),
        "sex": data.get('sex'),
        "id_breed": int(id_breed) if id_breed else None,
        "date_birth": data.get('date_birth'),
        "photo": data.get('photo')
    }

    pet = create_entity(Pet, **pet_data)
    return jsonify({"id_pet": pet.id_pet})