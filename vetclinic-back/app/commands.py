import click
import random
from datetime import datetime, timedelta
from flask.cli import with_appcontext
from faker import Faker
from app.extensions import db

# Импортируем ВСЕ необходимые модели
from app.models.client import Client
from app.models.employee import Employee
from app.models.pet import Pet
from app.models.pet_type import PetType
from app.models.breed import Breed
from app.models.med_card import MedCard
from app.models.account import Account
from app.models.post import Post
from app.models.role import Role
from app.models.vet import Vet
import re
from app.models.diagnosis import Diagnosis
from app.models.diagnosis_class import Diagnosis_class
from app.models.service import Service
from app.models.record_service import RecordService


@click.command('seed-db')
@with_appcontext
def seed_db():
    """Заполняет базу данных ролями, аккаунтами, клиентами и питомцами."""
    click.echo('Запуск комплексной генерации данных для клиники...')

    fake = Faker('ru_RU')
    fake_en = Faker('en_US')  # Для генерации латинских логинов и почты

    # ---- 1. СОЗДАЕМ РОЛИ ----
    click.echo('-> Заполняем роли пользователей...')
    roles_data = [
        (1, 'Администратор'),
        (2, 'Ветеринар'),
        (3, 'Клиент')
    ]
    for r_id, r_name in roles_data:
        role = Role.query.get(r_id)
        if not role:
            role = Role(id_role=r_id, name_role=r_name)
            db.session.add(role)
    db.session.commit()

    # ---- 2. СОЗДАЕМ ТИПЫ ЖИВОТНЫХ ----
    click.echo('-> Создаем типы животных...')
    raw_types = [
        'Собака', 'Кот', 'Кролик', 'Попугай', 'Хомяк',
        'Морская свинка', 'Хорёк', 'Черепаха', 'Крыса', 'Ящерица'
    ]
    types_dict = {}
    for t_name in raw_types:
        pet_type = PetType.query.filter_by(name_type=t_name).first()
        if not pet_type:
            pet_type = PetType(name_type=t_name)
            db.session.add(pet_type)
            db.session.flush()
        types_dict[t_name] = pet_type

    # ---- 3. СОЗДАЕМ ПОРОДЫ ----
    click.echo('-> Заполняем породы...')
    raw_breeds = {
        'Собака': ['Немецкая овчарка', 'Корги'],
        'Кот': ['Мейн-кун', 'Британская короткошерстная'],
        'Кролик': ['Декоративный ушастый', 'Ангорский'],
        'Попугай': ['Волнистый', 'Корелла'],
        'Хомяк': ['Джунгарский', 'Сирийский'],
        'Морская свинка': ['Абиссинская', 'Гладкая'],
        'Хорёк': ['Стандартный', 'Альбинос'],
        'Черепаха': ['Красноухая', 'Среднеазиатская'],
        'Крыса': ['Дамбо', 'Сфинкс'],
        'Ящерица': ['Бородатая агама', 'Геккон']
    }
    all_breeds = []
    for type_name, breed_list in raw_breeds.items():
        current_type = types_dict[type_name]
        for b_name in breed_list:
            breed = Breed.query.filter_by(name_breed=b_name, id_type=current_type.id_type).first()
            if not breed:
                breed = Breed(name_breed=b_name, id_type=current_type.id_type)
                db.session.add(breed)
                db.session.flush()
            all_breeds.append(breed)
    db.session.commit()

    # Пул кличек
    pet_names_pool = {
        'Собака': ['Арчи', 'Рекс', 'Барон', 'Бобик', 'Альма', 'Герда', 'Рэсси', 'Тобик'],
        'Кот': ['Барсик', 'Мурзик', 'Симба', 'Том', 'Мурка', 'Багира', 'Ася', 'Дымок'],
        'Кролик': ['Пушок', 'Ушастик', 'Банни', 'Крош'],
        'Попугай': ['Кеша', 'Гоша', 'Рома', 'Чика'],
        'Хомяк': ['Хома', 'Пухляш', 'Чип', 'Дейл'],
        'Морская свинка': ['Хрюша', 'Нюша', 'Степа', 'Бусинка'],
        'Хорёк': ['Шустрик', 'Фредди', 'Соня', 'Рикки'],
        'Черепаха': ['Тортила', 'Донателло', 'Чапа', 'Быстрый'],
        'Крыса': ['Сплинтер', 'Реми', 'Лариска', 'Пик'],
        'Ящерица': ['Годзилла', 'Ранго', 'Зубастик', 'Драко']
    }

    # ---- 4. ГЕНЕРИРУЕМ АККАУНТЫ, КЛИЕНТОВ И ПИТОМЦЕВ ----
    CLIENT_COUNT = 500

    # ---- 4. ГЕНЕРИРУЕМ АККАУНТЫ, КЛИЕНТОВ И ПИТОМЦЕВ ----
    click.echo('-> Генерируем клиентов со связанными аккаунтами...')

    generated_phones = set()
    generated_logins = set()

    created_credentials = []

    for i in range(CLIENT_COUNT):

        # ---------- ГЕНЕРАЦИЯ ТЕЛЕФОНА ----------
        while True:
            # всегда одинаковый формат:
            # +7-9XX-XXX-XX-XX

            phone = (
                f"+7-{random.randint(900, 999)}-"
                f"{random.randint(100, 999)}-"
                f"{random.randint(10, 99)}-"
                f"{random.randint(10, 99)}"
            )

            if phone not in generated_phones:
                generated_phones.add(phone)
                break

        # ---------- ГЕНЕРАЦИЯ ЛОГИНА ----------
        while True:
            login = f"{fake_en.user_name()}_{i}"

            if login not in generated_logins and len(login) <= 50:
                generated_logins.add(login)
                break

        # ---------- EMAIL ----------
        email = f"{login}@gmail.com"

        # ---------- ПАРОЛЬ ----------
        raw_password = fake_en.password(
            length=10,
            special_chars=True,
            digits=True,
            upper_case=True
        )

        # ---------- АККАУНТ ----------
        account = Account(
            login=login,
            id_role=3
        )

        account.password = raw_password

        # ---------- КЛИЕНТ ----------
        client = Client(
            name=fake.name(),
            phone=phone,
            email=email,
            discount=random.choice([0, 5, 10, 15, 20]),
            account=account
        )

        db.session.add(account)
        db.session.add(client)
        db.session.flush()

        created_credentials.append(
            (client.name, login, email, raw_password)
        )

        # ---------- ПИТОМЦЫ ----------
        pet_count = random.randint(1, 4)

        for _ in range(pet_count):
            random_breed = random.choice(all_breeds)
            type_name = random_breed.pet_type.name_type

            years_ago = random.randint(1, 15)
            days_offset = random.randint(0, 365)

            date_birth = (
                    datetime.now().date()
                    - timedelta(days=(years_ago * 365) + days_offset)
            )

            pet = Pet(
                id_client=client.id_client,
                name=random.choice(
                    pet_names_pool.get(type_name, ['Питомец'])
                ),
                sex=random.choice(['M', 'F']),
                id_breed=random_breed.id_breed,
                date_birth=date_birth,
                photo=None
            )

            db.session.add(pet)
            db.session.flush()

            # ---------- МЕДКАРТА ----------
            med_card = MedCard(
                id_pet=pet.id_pet,
                date_open=datetime.now().date()
            )

            db.session.add(med_card)

        # ---------- БАТЧ КОММИТ ----------
        if i % 50 == 0 and i != 0:
            db.session.commit()
            click.echo(f'Добавлено клиентов: {i}')

    # ---------- ФИНАЛЬНЫЙ COMMIT ----------
    try:
        db.session.commit()

        click.echo('База данных успешно заполнена!')

        click.echo(
            '\n--- ПЕРВЫЕ 10 СГЕНЕРИРОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ ---'
        )

        for name, log, em, pas in created_credentials[:10]:
            click.echo(
                f"Владелец: {name:.<30} "
                f"Логин: {log:<25} "
                f"Почта: {em:<35} "
                f"Пароль: {pas}"
            )

    except Exception as e:
        db.session.rollback()
        click.echo(f'Ошибка транзакции: {e}')


@click.command('seed-staff')
@with_appcontext
def seed_staff():
    """Добавляет в базу данных 2 администраторов и 4 ветеринаров-терапевтов."""
    click.echo('Запуск добавления персонала (2 админа + 4 терапевта)...')

    # ---- 1. СОЗДАЕМ ДОЛЖНОСТИ (POST) ----
    post_admin = Post.query.filter_by(name_post='Администратор').first()
    if not post_admin:
        post_admin = Post(id_post=1, name_post='Администратор')
        db.session.add(post_admin)

    post_vet = Post.query.filter_by(name_post='Ветеринар').first()
    if not post_vet:
        post_vet = Post(id_post=2, name_post='Ветеринар')
        db.session.add(post_vet)

    db.session.flush()

    # ---- 2. ДАННЫЕ ДЛЯ ДОБАВЛЕНИЯ ----
    admins_data = [
        ('admin1', 'Иванова Дарья Дмитриевна', '+7-911-000-01-01', '4015123456', '40817810000000000001', 1001),
        ('admin2', 'Петрова Мария Сергеевна', '+7-911-000-01-02', '4015654321', '40817810000000000002', 1002)
    ]

    vets_data = [
        ('vet1', 'Ковалев Игорь Альбертович', '+7-922-000-02-01', '4016112233', '40817810000000000003', 2001,
         'LIC-77001', 4.8),
        ('vet2', 'Смирнова Анна Олеговна', '+7-922-000-02-02', '4016445566', '40817810000000000004', 2002, 'LIC-77002',
         4.9),
        ('vet3', 'Сидоров Олег Николаевич', '+7-922-000-02-03', '4017778899', '40817810000000000005', 2003, 'LIC-77003',
         4.7),
        ('vet4', 'Кузнецова Елена Васильевна', '+7-922-000-02-04', '4017998877', '40817810000000000006', 2004,
         'LIC-77004', 5.0)
    ]

    # ---- 3. ДОБАВЛЯЕМ АДМИНИСТРАТОРОВ ----
    click.echo('-> Создаем администраторов...')
    for login, name, phone, passport, bank, contract in admins_data:
        # Проверяем, нет ли уже такого аккаунта
        if not Account.query.filter_by(login=login).first():
            account = Account(login=login, id_role=1)  # Роль 1 - Администратор
            account.password = 'password123'  # Здесь сработает твой сеттер хэша

            employee = Employee(
                name_emp=name,
                passport=passport,
                phone=phone,
                salary=50000.00,
                bank_acc_number=bank,
                contract_num=contract,
                id_post=post_admin.id_post,
                account=account
            )
            db.session.add(account)
            db.session.add(employee)

    # ---- 4. ДОБАВЛЯЕМ ВЕТЕРИНАРОВ (ТЕРАПЕВТОВ) ----
    click.echo('-> Создаем ветеринаров-терапевтов...')
    for login, name, phone, passport, bank, contract, license_num, rating in vets_data:
        if not Account.query.filter_by(login=login).first():
            account = Account(login=login, id_role=2)  # Роль 2 - Ветеринар
            account.password = 'password123'  # Здесь сработает твой сеттер хэша

            employee = Employee(
                name_emp=name,
                passport=passport,
                phone=phone,
                salary=85000.00,
                bank_acc_number=bank,
                contract_num=contract,
                id_post=post_vet.id_post,
                account=account
            )
            db.session.add(account)
            db.session.add(employee)
            db.session.flush()  # Получаем id_emp

            vet_info = Vet(
                id_emp=employee.id_emp,
                spec='Терапевт',  # Все врачи строго терапевты
                status=True,
                license_num=license_num,
                rating=rating
            )
            db.session.add(vet_info)

    try:
        db.session.commit()
        click.echo('Персонал клиники успешно сгенерирован встроенным хэшированием!')
        click.echo('Логины: admin1, admin2, vet1, vet2, vet3, vet4')
        click.echo('Пароль для всех учетных записей: password123')
    except Exception as e:
        db.session.rollback()
        click.echo(f'Ошибка транзакции: {e}')


@click.command('seed-diagnosis')
@with_appcontext
def seed_diagnosis():
    """Автоматически парсит ГОСТ и заполняет диагнозы + классы."""

    click.echo("Запуск импорта диагнозов...")

    with open("diagnoses.txt", "r", encoding="utf-8") as f:
        text = f.read()

    Diagnosis.query.delete()
    Diagnosis_class.query.delete()
    db.session.commit()

    lines = text.splitlines()

    class_pattern = r'^\d+\.\d+(?:\.\d+)?\s+(.+?)\s+\(([A-Z]\d+—[A-Z]\d+)\)'
    diag_pattern = r'^([A-Z]\d{2}(?:\.\d+)?)\s+(.+?)\.?$'

    current_class_id = 0

    dangerous = {
        "A00", "A01", "A07"
    }

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # --- класс ---
        class_match = re.match(class_pattern, line)
        if class_match:
            current_class_id += 1

            class_name = class_match.group(1)

            db.session.add(Diagnosis_class(
                id_class=current_class_id,
                name_class=class_name
            ))

            click.echo(f"[CLASS] {class_name}")
            continue

        # --- диагноз ---
        diag_match = re.match(diag_pattern, line)
        if diag_match and current_class_id:

            code = diag_match.group(1)
            name = diag_match.group(2)

            # чистим мусор про животных
            name = (
                name.replace("кошек", "")
                    .replace("кошачьих", "")
                    .replace("собак", "")
                    .replace("псовых", "")
                    .strip()
            )

            db.session.add(Diagnosis(
                id_diagnosis=code,
                name_diagnosis=name,
                id_class=current_class_id,
                is_dangerous=code in dangerous
            ))

            click.echo(f"  └─ {code} {name}")

    db.session.commit()
    click.echo("Импорт диагнозов завершён")

@click.command('seed-services')
@with_appcontext
def seed_services():
    """Заполняет таблицу услуг ветеринарной клиники."""

    click.echo('Запуск генерации услуг...')

    services_data = [
        (1, 'Первичный осмотр и консультация', 1200),
        (2, 'Повторный прием терапевта', 900),
        (3, 'Клинический осмотр дерматолога', 1500),
        (4, 'Вызов ветеринарного врача на дом', 3500),
        (5, 'Взятие крови из вены', 400),
        (6, 'Взятие мазка / соскоба', 500),
        (7, 'Общий анализ крови (ОАК)', 800),
        (8, 'Биохимический анализ крови (10 пок.)', 1800),
        (9, 'Общий анализ мочи', 600),
        (10, 'Анализ кала (на паразитов)', 700),

        (11, 'УЗИ брюшной полости', 2200),
        (12, 'УЗИ сердца (ЭхоКГ)', 2500),
        (13, 'Рентгенография (1 проекция)', 1400),
        (14, 'ЭКГ с расшифровкой', 1300),
        (15, 'Кастрация кота', 3500),
        (16, 'Стерилизация кошки (овариэктомия)', 6500),
        (17, 'Кастрация кобеля', 5500),
        (18, 'Стерилизация собаки', 9500),
        (19, 'Операция на мягких тканях', 7000),
        (20, 'Ампутация конечности', 12000),

        (21, 'Удаление новообразования (малое)', 3000),
        (22, 'Удаление новообразования (крупное)', 8000),
        (23, 'Санация ротовой полости (чистка зубов)', 4000),
        (24, 'Удаление зубного камня (ультразвук)', 3500),
        (25, 'Обработка раны с наложением швов', 2500),
        (26, 'Снятие швов', 500),
        (27, 'Постановка внутривенного катетера', 700),
        (28, 'Внутривенная инфузия (капельница)', 1800),
        (29, 'Подкожная инъекция', 300),
        (30, 'Внутримышечная инъекция', 300),

        (31, 'Комплексная вакцинация (собаки)', 2500),
        (32, 'Комплексная вакцинация (кошки)', 2200),
        (33, 'Вакцинация против бешенства', 1200),
        (34, 'Чипирование животного', 1800),
        (35, 'Оформление ветеринарного паспорта', 700),
        (36, 'Стрижка когтей', 500),
        (37, 'Чистка параанальных желез', 900),
        (38, 'Гигиеническая стрижка', 2500),
        (39, 'Обработка от эктопаразитов', 1000),
        (40, 'Санация ушных раковин', 1200),
    ]

    try:

        # очищаем старые услуги
        Service.query.delete()
        db.session.commit()

        for service_id, name, cost in services_data:

            service = Service(
                id_service=service_id,
                name_service=name,
                cost=cost
            )

            db.session.add(service)

        db.session.commit()

        click.echo('Услуги успешно добавлены!')
        click.echo(f'Всего услуг: {len(services_data)}')

    except Exception as e:
        db.session.rollback()
        click.echo(f'Ошибка: {e}')


@click.command('seed-records')
@with_appcontext
def seed_records():
    """Генерирует записи услуг для всех питомцев."""

    click.echo('Генерация записей услуг...')

    fake = Faker('ru_RU')

    # получаем все нужные данные
    med_cards = MedCard.query.all()
    services = Service.query.all()

    # берем сотрудников-ветеринаров
    vets = (
        db.session.query(Employee)
        .join(Vet, Vet.id_emp == Employee.id_emp)
        .all()
    )

    if not med_cards:
        click.echo('Медкарты не найдены')
        return

    if not services:
        click.echo('Услуги не найдены')
        return

    if not vets:
        click.echo('Ветеринары не найдены')
        return

    try:

        # очищаем старые записи
        RecordService.query.delete()
        db.session.commit()

        total_records = 0

        # диапазон дат
        start_date = datetime(2023, 1, 1)
        end_date = datetime(2026, 8, 1)

        comments_pool = [
            'Животное вело себя спокойно.',
            'Рекомендовано наблюдение в течение 7 дней.',
            'Назначено симптоматическое лечение.',
            'Состояние удовлетворительное.',
            'Проведена консультация владельца.',
            'Рекомендована повторная явка.',
            'Аппетит сохранён.',
            'Температура в пределах нормы.',
            'Жалоб после процедуры нет.',
            'Перенес процедуру хорошо.',
            'Выявлено воспаление лёгкой степени.',
            'Назначены дополнительные анализы.',
            'Состояние стабильное.',
            'Отмечается положительная динамика.',
            'Питомец сильно нервничал на приёме.'
        ]

        for index, med_card in enumerate(med_cards):

            # минимум 1 запись
            # максимум 8
            records_count = random.randint(1, 8)

            # генерируем даты
            generated_dates = []

            for _ in range(records_count):

                random_days = random.randint(
                    0,
                    (end_date - start_date).days
                )

                service_date = start_date + timedelta(days=random_days)

                # случайное время
                service_date = service_date.replace(
                    hour=random.randint(9, 20),
                    minute=random.choice([0, 15, 30, 45]),
                    second=0
                )

                generated_dates.append(service_date)

            # сортируем по времени
            generated_dates.sort()

            for service_date in generated_dates:

                random_service = random.choice(services)
                random_vet = random.choice(vets)

                record = RecordService(
                    id_med_card=med_card.id_med_card,
                    id_service=random_service.id_service,
                    id_emp=random_vet.id_emp,
                    date_service=service_date,
                    file_link=None,
                    comment=random.choice(comments_pool)
                )

                db.session.add(record)

                total_records += 1

            # батч коммит
            if index % 100 == 0 and index != 0:
                db.session.commit()
                click.echo(
                    f'Обработано медкарт: {index} | '
                    f'Записей: {total_records}'
                )

        db.session.commit()

        click.echo('Записи успешно созданы!')
        click.echo(f'Всего записей: {total_records}')

    except Exception as e:
        db.session.rollback()
        click.echo(f'Ошибка: {e}')