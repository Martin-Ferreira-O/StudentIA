from models import Usuario, Resumen
from db import db
from datetime import datetime

class UsuarioManager:
    @staticmethod
    def crear_usuario(nombre, email, password, fecha_nacimiento=None):
        """Crear un nuevo usuario"""
        try:
            # Verificar si el email ya existe
            if Usuario.query.filter_by(email=email).first():
                return None, "El email ya está registrado"
            
            # Crear el nuevo usuario
            nuevo_usuario = Usuario(
                nombre=nombre,
                email=email,
                fecha_nacimiento=fecha_nacimiento
            )
            nuevo_usuario.set_password(password)
            
            # Guardar en la base de datos
            db.session.add(nuevo_usuario)
            db.session.commit()
            
            return nuevo_usuario, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)
    
    @staticmethod
    def obtener_usuario_por_id(usuario_id):
        """Obtener usuario por ID"""
        return Usuario.query.get(usuario_id)
    
    @staticmethod
    def obtener_usuario_por_email(email):
        """Obtener usuario por email"""
        return Usuario.query.filter_by(email=email).first()
    
    @staticmethod
    def actualizar_usuario(usuario_id, datos):
        """Actualizar datos de usuario"""
        try:
            usuario = Usuario.query.get(usuario_id)
            if not usuario:
                return False, "Usuario no encontrado"
            
            # Actualizar datos
            if 'nombre' in datos:
                usuario.nombre = datos['nombre']
            if 'fecha_nacimiento' in datos:
                usuario.fecha_nacimiento = datos['fecha_nacimiento']
            if 'password' in datos:
                usuario.set_password(datos['password'])
            
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    @staticmethod
    def eliminar_usuario(usuario_id):
        """Eliminar usuario"""
        try:
            usuario = Usuario.query.get(usuario_id)
            if not usuario:
                return False, "Usuario no encontrado"
            
            db.session.delete(usuario)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)


class ResumenManager:
    @staticmethod
    def crear_resumen(titulo, texto_original, tipo_archivo, usuario_id=None, 
                      contenido_resumen=None, contenido_mapa=None, contenido_quiz=None, 
                      archivo_guardado=None):
        """Crear un nuevo resumen"""
        try:
            nuevo_resumen = Resumen(
                titulo=titulo,
                texto_original=texto_original,
                tipo_archivo=tipo_archivo,
                usuario_id=usuario_id,
                contenido_resumen=contenido_resumen,
                contenido_mapa=contenido_mapa,
                contenido_quiz=contenido_quiz,
                archivo_guardado=archivo_guardado,
                fecha_creacion=datetime.utcnow()
            )
            
            db.session.add(nuevo_resumen)
            db.session.commit()
            
            return nuevo_resumen, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)
    
    @staticmethod
    def obtener_resumen_por_id(resumen_id):
        """Obtener resumen por ID"""
        return Resumen.query.get(resumen_id)
    
    @staticmethod
    def obtener_resumenes_por_usuario(usuario_id, limit=10, offset=0):
        """Obtener todos los resúmenes de un usuario"""
        return Resumen.query.filter_by(usuario_id=usuario_id)\
            .order_by(Resumen.fecha_creacion.desc())\
            .limit(limit).offset(offset).all()
    
    @staticmethod
    def actualizar_resumen(resumen_id, datos):
        """Actualizar un resumen"""
        try:
            resumen = Resumen.query.get(resumen_id)
            if not resumen:
                return False, "Resumen no encontrado"
            
            # Actualizar campos
            for campo, valor in datos.items():
                if hasattr(resumen, campo):
                    setattr(resumen, campo, valor)
            
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    @staticmethod
    def eliminar_resumen(resumen_id):
        """Eliminar un resumen"""
        try:
            resumen = Resumen.query.get(resumen_id)
            if not resumen:
                return False, "Resumen no encontrado"
            
            db.session.delete(resumen)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    @staticmethod
    def buscar_resumenes(consulta, limit=10, offset=0):
        """Buscar resúmenes por título o contenido"""
        consulta_like = f"%{consulta}%"
        return Resumen.query.filter(
            (Resumen.titulo.like(consulta_like)) | 
            (Resumen.texto_original.like(consulta_like))
        ).order_by(Resumen.fecha_creacion.desc())\
            .limit(limit).offset(offset).all() 