# StudentIA 2.0 - Documentación de la API

## Descripción General

StudentIA 2.0 es una aplicación web que utiliza inteligencia artificial para procesar archivos (presentaciones PPTX o archivos de audio) y generar automáticamente resúmenes, mapas conceptuales y cuestionarios. La aplicación cuenta con un sistema de autenticación de usuarios y almacenamiento de resultados en una base de datos PostgreSQL.

## Requisitos Técnicos

- Python 3.8+
- PostgreSQL
- Dependencias principales:
  - Flask 2.3.3
  - python-pptx 0.6.21
  - whisper 1.1.10 (para transcripción de audio)
  - google-generativeai 0.3.1 (API de Gemini)
  - SQLAlchemy 2.0.23 y Flask-SQLAlchemy 3.1.1
  - Flask-Migrate 4.0.5
  - passlib 1.7.4 (para hash de contraseñas)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd StudentIA2.0
   ```

2. Crea un entorno virtual y actívalo:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # En Windows: .venv\Scripts\activate
   ```

3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Configura las variables de entorno:
   ```bash
   cp env.example .env
   # Edita el archivo .env con tus credenciales
   ```

5. Crea la base de datos:
   ```bash
   flask crear-tablas
   ```

## Configuración

La aplicación utiliza variables de entorno para la configuración. Copia el archivo `env.example` a `.env` y configura las siguientes variables:

```
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_ia
SECRET_KEY=clave_secreta_para_sesiones
GOOGLE_API_KEY=tu_clave_api_de_google_gemini
```

## Rutas de la API

### Procesamiento de Archivos

#### `POST /`
Procesa un archivo PPTX o de audio y genera contenido mediante IA.

**Parámetros de formulario:**
- `archivo`: Archivo a procesar (PPTX o audio)
- `tipo_archivo`: Tipo de archivo (`pptx` o `audio`)
- `salida`: Lista de tipos de salida deseados (`resumen`, `mapa`, `quiz`)

**Respuesta:**
```json
{
  "texto": "Texto extraído del archivo",
  "resumen": "Resumen generado por IA (si se solicitó)",
  "mapa_conceptual": "Código Mermaid del mapa conceptual (si se solicitó)",
  "quiz": "Quiz generado por IA (si se solicitó)"
}
```

### Autenticación y Gestión de Usuarios

#### `GET /login`
Muestra la página de inicio de sesión.

#### `POST /login`
Autentica a un usuario.

**Parámetros de formulario:**
- `email`: Correo electrónico del usuario
- `password`: Contraseña del usuario

**Respuesta:**
```json
{
  "success": true|false,
  "error": "Mensaje de error (si hay error)"
}
```

#### `GET /registro`
Muestra la página de registro.

#### `POST /registro`
Registra un nuevo usuario.

**Parámetros de formulario:**
- `nombre`: Nombre del usuario
- `email`: Correo electrónico del usuario
- `password`: Contraseña del usuario
- `fecha_nacimiento`: Fecha de nacimiento (formato YYYY-MM-DD, opcional)

**Respuesta:**
```json
{
  "success": true|false,
  "error": "Mensaje de error (si hay error)"
}
```

#### `GET /logout`
Cierra la sesión del usuario actual.

**Respuesta:**
```json
{
  "success": true
}
```

### Gestión de Resúmenes

#### `GET /mis-resumenes`
Muestra la página con todos los resúmenes del usuario autenticado.

#### `GET /resumen/<id>`
Muestra un resumen específico.

**Parámetros de URL:**
- `id`: ID del resumen a visualizar

#### `POST /resumen/<id>/eliminar`
Elimina un resumen específico.

**Parámetros de URL:**
- `id`: ID del resumen a eliminar

**Respuesta:**
```json
{
  "success": true|false,
  "error": "Mensaje de error (si hay error)"
}
```

## Modelos de Datos

### Usuario
- `id`: Identificador único (entero, clave primaria)
- `nombre`: Nombre del usuario (cadena, requerido)
- `email`: Correo electrónico (cadena, único, requerido)
- `fecha_nacimiento`: Fecha de nacimiento (fecha, opcional)
- `hash_password`: Contraseña hasheada (cadena, requerido)
- `fecha_registro`: Fecha de registro (fecha y hora, automático)

### Resumen
- `id`: Identificador único (entero, clave primaria)
- `titulo`: Título del resumen (cadena, requerido)
- `texto_original`: Texto extraído del archivo original (texto, requerido)
- `contenido_resumen`: Resumen generado por IA (texto, opcional)
- `contenido_mapa`: Código Mermaid del mapa conceptual (texto, opcional)
- `contenido_quiz`: Quiz generado por IA (texto, opcional)
- `tipo_archivo`: Tipo de archivo procesado (cadena, requerido)
- `fecha_creacion`: Fecha de creación (fecha y hora, automático)
- `archivo_guardado`: Ruta al archivo guardado (cadena, opcional)
- `usuario_id`: ID del usuario propietario (entero, clave foránea)

## Funcionalidades de IA

La aplicación utiliza la API de Google Gemini para generar:

1. **Resúmenes**: Extrae los puntos clave del contenido.
2. **Mapas Conceptuales**: Genera diagramas Mermaid que representan visualmente los conceptos y sus relaciones.
3. **Cuestionarios**: Crea preguntas de opción múltiple basadas en el contenido.

## Ejecución de la Aplicación

Para ejecutar la aplicación:

```bash
python app.py
```

La aplicación estará disponible en http://localhost:3000

## Estructura de Directorios

- `/templates`: Plantillas HTML para la interfaz web
- `/static`: Archivos CSS, JavaScript e imágenes
- `/temp`: Directorio temporal para archivos subidos (creado automáticamente)
- `/output`: Directorio para archivos de salida (creado automáticamente)

## Solución de Problemas

Si encuentras problemas con SQLAlchemy-Utils durante la instalación, puedes instalarla manualmente:

```bash
pip install SQLAlchemy-Utils==0.41.1
```

Para problemas con la base de datos, asegúrate de que PostgreSQL esté correctamente instalado y en ejecución, y que las credenciales en el archivo `.env` sean correctas. 