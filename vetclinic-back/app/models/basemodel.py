from app import db


class BaseModel(db.Model):
    __abstract__ = True

    # Динамическая сборка словаря на основе столбцов конкретной таблицы
    def to_dict(self):

        columns = [column.name for column in self.__table__.columns]
        return {column: getattr(self, column) for column in columns}
