# app.py
import os
from flask import Flask, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# 🔧 Configuração do banco: SQLite local + PostgreSQL no Render
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    # 🌐 Produção: Render.com usa PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    # 💻 Desenvolvimento: você usa SQLite local
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///meubanco.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializa o banco
db = SQLAlchemy(app)

# Modelo: Usuario
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

# 🔁 Cria as tabelas ao iniciar
with app.app_context():
    db.create_all()
    print("✅ Tabelas criadas no banco de dados!")

# 🏠 Rota principal: serve o frontend (seu site bonito)
@app.route('/')
def home():
    return send_from_directory('static', 'index.html')

# 📋 GET /usuarios - Listar todos
@app.route('/usuarios', methods=['GET'])
def listar_usuarios():
    usuarios = Usuario.query.all()
    return jsonify([u.to_dict() for u in usuarios])

# ➕ POST /usuarios - Criar novo
@app.route('/usuarios', methods=['POST'])
def criar_usuario():
    data = request.get_json()

    if not data or not 'nome' in data or not 'email' in data:
        return jsonify({'erro': 'Nome e email são obrigatórios'}), 400

    if Usuario.query.filter_by(email=data['email']).first():
        return jsonify({'erro': 'Email já cadastrado'}), 409

    novo = Usuario(nome=data['nome'], email=data['email'])
    db.session.add(novo)
    db.session.commit()

    return jsonify(novo.to_dict()), 201

# 🔍 GET /usuarios/<id>
@app.route('/usuarios/<int:id>', methods=['GET'])
def obter_usuario(id):
    usuario = Usuario.query.get_or_404(id, description="Usuário não encontrado")
    return jsonify(usuario.to_dict())

# 🗑️ DELETE /usuarios/<id>
@app.route('/usuarios/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
    usuario = Usuario.query.get_or_404(id, description="Usuário não encontrado")
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({'mensagem': 'Usuário deletado com sucesso'}), 200

# 🔌 Health check (opcional, bom para ver se está no ar)
@app.route('/health')
def health():
    return jsonify({'status': 'API no ar!'}), 200

# 🚀 Início da aplicação
if __name__ == '__main__':
    # No Render, a porta é definida pela variável PORT
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
