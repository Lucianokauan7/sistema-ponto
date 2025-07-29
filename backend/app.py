from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# Caminho absoluto para garantir onde o banco será criado
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "meubanco.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelo Usuario
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email
        }

    def __repr__(self):
        return f'<Usuario {self.nome}>'

# 🔁 Cria as tabelas ao iniciar o app
with app.app_context():
    db.create_all()
    print("✅ Tabelas criadas no banco de dados!")

@app.route('/')
def index():
    return "Olá, Flask está funcionando!"

if __name__ == '__main__':
    app.run(debug=True)