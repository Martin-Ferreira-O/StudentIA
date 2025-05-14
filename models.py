from db import db
from datetime import datetime
from passlib.hash import pbkdf2_sha256
import uuid

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    fecha_nacimiento = db.Column(db.Date, nullable=True)
    hash_password = db.Column(db.String(255), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con los resúmenes
    resumenes = db.relationship('Resumen', backref='usuario', lazy=True)
    
    def set_password(self, password):
        """Hashear la contraseña"""
        self.hash_password = pbkdf2_sha256.hash(password)
    
    def check_password(self, password):
        """Verificar si la contraseña es correcta"""
        return pbkdf2_sha256.verify(password, self.hash_password)
    
    def __repr__(self):
        return f'<Usuario {self.nombre}>'


class Resumen(db.Model):
    __tablename__ = 'resumenes'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    texto_original = db.Column(db.Text, nullable=False)
    contenido_resumen = db.Column(db.Text, nullable=True)
    contenido_mapa = db.Column(db.Text, nullable=True) 
    contenido_quiz = db.Column(db.Text, nullable=True)
    tipo_archivo = db.Column(db.String(20), nullable=False)  # pptx, audio
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    archivo_guardado = db.Column(db.String(255), nullable=True)  # Ruta al archivo guardado si aplica
    
    # Clave foránea al usuario
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    
    def generate_filename(self, extension):
        """Genera un nombre de archivo único"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        random_id = str(uuid.uuid4())[:8]
        return f"{self.tipo_archivo}_{timestamp}_{random_id}.{extension}"
    
    def __repr__(self):
        return f'<Resumen {self.titulo}>' 