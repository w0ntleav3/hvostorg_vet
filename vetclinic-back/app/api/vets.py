from datetime import date, datetime, time, timedelta

from app import db
from flask import jsonify, request
from . import api_bp
from .utils import get_entity
from app.models.employee import Employee
from app.models.vet import Vet
from app.models.record_service import RecordService
from ..models import Pet
from ..models.med_card import MedCard

# 🕒 настройки рабочего дня
WORK_START = time(10, 0)
WORK_END = time(18, 0)
SLOT_DURATION_MIN = 30


# =========================
# 🎯 ФУНКЦИЯ СЛОТОВ
# =========================
def get_free_slots_for_day(vet_id: int, target_date: date):
    start_dt = datetime.combine(target_date, WORK_START)
    end_dt = datetime.combine(target_date, WORK_END)

    # 🔥 ВАЖНО: нормальный фильтр по дню
    records = db.session.query(RecordService).filter(
        RecordService.id_emp == vet_id,
        RecordService.date_service >= start_dt,
        RecordService.date_service < end_dt
    ).all()

    # 🔥 занятые слоты (строго по старту)
    busy = set(
        r.date_service.replace(second=0, microsecond=0)
        for r in records
        if r.date_service
    )

    slots = []
    current = start_dt

    while current < end_dt:
        slot = current.replace(second=0, microsecond=0)

        if slot not in busy:
            slots.append(slot.strftime("%H:%M"))

        current += timedelta(minutes=SLOT_DURATION_MIN)

    return slots


# =========================
# 👨‍⚕️ СПИСОК ВРАЧЕЙ
# =========================
@api_bp.route('/vets', methods=['GET'])
def get_vets():
    vets = db.session.query(Vet, Employee).join(Employee).all()

    return jsonify([
        {
            "id_emp": vet.id_emp,
            "name_emp": emp.name_emp,
            "phone": emp.phone,
            "spec": vet.spec,
            "rating": vet.rating,
            "status": vet.status
        }
        for vet, emp in vets
    ])


# =========================
# 👨‍⚕️ ОДИН ВЕТ
# =========================
@api_bp.route('/vets/<int:id>', methods=['GET'])
def get_vet(id):
    return get_entity(Vet, id)


# =========================
# 📅 ДОСТУПНЫЕ ДАТЫ
# =========================
@api_bp.route('/vets/<int:id>/available_dates', methods=['GET'])
def get_vet_available_dates(id):
    days = int(request.args.get('days', 14))

    vet = db.session.query(Vet).filter_by(id_emp=id).first()
    if not vet:
        return jsonify({"error": "vet not found"}), 404

    today = date.today()
    result = []

    for i in range(days):
        d = today + timedelta(days=i)

        slots = get_free_slots_for_day(id, d)

        if slots:
            result.append(d.isoformat())

    return jsonify({"dates": result})


# =========================
# ⏰ ДОСТУПНЫЕ СЛОТЫ
# =========================
@api_bp.route('/vets/<int:id>/available_slots', methods=['GET'])
def get_vet_available_slots(id):
    date_str = request.args.get('date')

    if not date_str:
        return jsonify({"error": "date param required"}), 400

    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "invalid date format"}), 400

    vet = db.session.query(Vet).filter_by(id_emp=id).first()
    if not vet:
        return jsonify({"error": "vet not found"}), 404

    slots = get_free_slots_for_day(id, target_date)

    return jsonify({"slots": slots})


# =========================
# 📋 ВЕТ + ЗАПИСИ
# =========================
@api_bp.route('/vets/with-records', methods=['GET'])
def get_vets_with_records():
    now = datetime.now()

    vets = (
        db.session.query(Vet, Employee)
        .join(Employee, Vet.id_emp == Employee.id_emp)
        .all()
    )

    result = []

    for vet, emp in vets:
        records = (
            db.session.query(RecordService, MedCard, Pet)
            .select_from(RecordService)
            .join(MedCard, RecordService.id_med_card == MedCard.id_med_card)
            .join(Pet, MedCard.id_pet == Pet.id_pet)
            .filter(
                RecordService.id_emp == vet.id_emp,
                RecordService.date_service >= now
            )
            .all()
        )

        future = []

        for r, mc, pet in records:
            future.append({
                "id_record": r.id_record,
                "date_service": r.date_service.isoformat(),
                "pet_id": pet.id_pet,
                "pet_name": pet.name
            })

        result.append({
            "id_emp": vet.id_emp,
            "name": emp.name_emp,
            "spec": vet.spec,
            "rating": vet.rating,
            "future_records": future
        })

    return jsonify(result)