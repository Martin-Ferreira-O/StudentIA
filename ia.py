import google.generativeai as genai

import os
import dotenv

dotenv.load_dotenv()

class Resumen:
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    # Cambiar a set path
    def read_files(self, path = "clase1.txt"):
        with open(path, "r", encoding="utf-8") as file:
            self.file_content = file.read()

    def send_resume(self):
        print("Enviando texto a resumir.")
        response = self.model.generate_content(f"Se te entregara un archivo con un texto educativo. tu trabajo sera resumirlo y entregar los puntos claves. El archivo es:\n{self.file_content}")        
        return response.text
        
    def generate_concept_map(self):
        # Enviar el contenido del archivo como mensaje al modelo para generar mapa conceptual con Mermaid
        print("Generando mapa conceptual.")
        response = self.model.generate_content(f"Se te entregará un archivo con un texto educativo. Tu trabajo será analizar el contenido, identificar las ideas principales y relaciones entre conceptos, y generar un mapa conceptual usando el lenguaje de diagramas Mermaid. SOLO DEBES RESPONDER EL CODIGO MERMAID, NO EL TEXTO. NO UN SALUDO. SOLO EL CODIGO MERMAID. SI NO EL PROGRAMA FALLARA. NO RESPONDAS ```mermaid  al comienzo del codigo. NI PONGAS ``` al final. SOLO EL CODIGO Y NADA MÁS. Asegurate de que el codigo mermaid este bien formado, no tenga errores de sintaxis. Por ejemplo dentro de los subgraph, no pueden haber simbolos extraños dentro de los nodos tales como ([]) o cualquier tipo de llave. Necesitamos un mapa conceptual que sea facil de leer y entender. SOLO SEA EL CODIGO, nada de texto, nada de comentarios, nada de nada (NI DE style). El archivo es: \n{self.file_content}")        
        print(response.text)
        return response.text
        
    def generate_quiz(self):
        # Enviar el contenido del archivo como mensaje al modelo para generar un quiz
        print("Generando quiz de opción múltiple.")
        response = self.model.generate_content(f"Se te entregará un archivo con un texto educativo. Tu tarea será leerlo, identificar los puntos clave y generar un quiz en formato de opción múltiple (mínimo 5 preguntas), cada una con 1 respuesta correcta y 3 incorrectas. El archivo es:\n{self.file_content}")
        return response.text
