# app.py
import os
from flask import Flask, request, render_template, jsonify
from pptx import Presentation
import whisper
from datetime import datetime

from ia import Resumen


app = Flask(__name__)

resumen = Resumen()

# Función para guardar texto en archivo TXT
def guardar_texto_txt(texto, prefijo="texto"):
    # Crear directorio de salida si no existe
    if not os.path.exists("output"):
        os.makedirs("output")
    
    # Generar nombre de archivo con fecha unica
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_archivo = f"output/{prefijo}_{timestamp}.txt"
    
    # Guardar el texto en el archivo
    with open(nombre_archivo, "w", encoding="utf-8") as f:
        f.write(texto)
    
    resumen.read_files(nombre_archivo)

    return nombre_archivo

# Función para extraer texto de un archivo .pptx
def extraer_texto_pptx(archivo_pptx):
    presentacion = Presentation(archivo_pptx)
    texto_completo = ""
    for diapositiva in presentacion.slides:
        for forma in diapositiva.shapes:
            if hasattr(forma, "text"):
                texto_completo += forma.text + "\n"
    
    # Guardar el texto extraído en un archivo TXT
    archivo_txt = guardar_texto_txt(texto_completo, "pptx")
    print(f"Texto extraído guardado en: {archivo_txt}")
    
    return texto_completo

# Función para transcribir audio usando Whisper
def transcribir_audio(audio_path):
    model = whisper.load_model("small") # large, medium, small, base
    result = model.transcribe(audio_path, language="es")
    texto_transcrito = result["text"]
    
    # Guardar la transcripción en un archivo TXT
    archivo_txt = guardar_texto_txt(texto_transcrito, "audio")
    print(f"Transcripción guardada en: {archivo_txt}")
    
    return texto_transcrito


# Rutas de la aplicación
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        archivo = request.files["archivo"]
        tipo_archivo = request.form.get("tipo_archivo")
        salidas = request.form.getlist("salida")
                
        if tipo_archivo == "pptx":
            # Guardar archivo temporalmente
            ruta_temporal = os.path.join("temp", archivo.filename)
            archivo.save(ruta_temporal)

            # Extraer texto del archivo .pptx
            texto = extraer_texto_pptx(ruta_temporal)
            os.remove(ruta_temporal)  # Eliminar archivo temporal

        elif tipo_archivo == "audio":
            # Guardar archivo temporalmente
            ruta_temporal = os.path.join("temp", archivo.filename)
            archivo.save(ruta_temporal)

            # Transcribir audio
            texto = transcribir_audio(ruta_temporal)
            os.remove(ruta_temporal)  # Eliminar archivo temporal

        else:
            return jsonify({"error": "Tipo de archivo no soportado"}), 400

        resultado = {"texto": texto}
        
        if "resumen" in salidas:
            resultado["resumen"] = resumen.send_resume()
        if "mapa" in salidas:
            mapa = resumen.generate_concept_map()
            print("\n--- CÓDIGO MERMAID GENERADO ---\n", mapa, "\n------------------------------\n")
            resultado["mapa_conceptual"] = mapa
        if "quiz" in salidas:
            quiz = resumen.generate_quiz()
            resultado["quiz"] = quiz

        return jsonify(resultado)

    return render_template("index.html")

@app.route("/login", methods=["GET"])
def login():
    return render_template("login.html")

if __name__ == "__main__":
    if not os.path.exists("temp"):
        os.makedirs("temp")
    if not os.path.exists("output"):
        os.makedirs("output")
    print("Iniciando servidor... en http://localhost:3000")
    app.run(debug=True, port=3000)
