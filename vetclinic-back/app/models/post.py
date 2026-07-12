from app import db
from .basemodel import BaseModel


class Post(BaseModel):
    id_post = db.Column(db.Integer, primary_key=True, nullable = False)
    name_post = db.Column(db.String(50), nullable = False)



    def __repr__(self):
        return f"<Post {self.name_post}>"