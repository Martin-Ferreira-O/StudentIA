import os
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
from passlib.hash import pbkdf2_sha256

# Inicializar la instancia de SQLAlchemy
db = SQLAlchemy()

def init_app(app):
    """Inicializar la aplicación con extensiones de base de datos"""
    # Configuración de la conexión a PostgreSQL
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'postgres')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'student_ia')
    
    # URI de conexión a PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicializar la app con SQLAlchemy
    db.init_app(app)
    
    # Configurar Flask-Migrate para migraciones de base de datos
    migrate = Migrate(app, db)
    
    return db 