import google.generativeai as genai

import os
import dotenv
import re

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
        
    def limpiar_mermaid(self, codigo):
        """
        Aplica correcciones comunes al código Mermaid para evitar errores de sintaxis.
        """
        # Eliminar '```mermaid' al inicio y '```' al final si existen
        codigo = codigo.strip()
        if codigo.startswith('```mermaid'):
            codigo = codigo[len('```mermaid'):].lstrip('\n')
        if codigo.endswith('```'):
            codigo = codigo[:-3].rstrip('\n')

        # Eliminar espacios innecesarios antes de flechas
        codigo = re.sub(r'[^\S]+-->', ' -->', codigo)
        codigo = re.sub(r'[^\S]+<--', ' <--', codigo)
        codigo = re.sub(r'[^\S]+---', ' ---', codigo)

        # Corregir múltiples corchetes o mal cerrados
        codigo = re.sub(r'\[([^\]]+)\[', r'[\1', codigo)
        codigo = re.sub(r'\]{2,}', ']', codigo)

        # Quitar saltos de línea repetidos
        codigo = re.sub(r'\n{2,}', '\n', codigo)

        # Quitar espacios al final de las líneas
        codigo = re.sub(r'[ \t]+$', '', codigo, flags=re.MULTILINE)

        # Corregir etiquetas mal cerradas o símbolos extraños (opcional)
        codigo = re.sub(r'[^\x00-\x7F]', '', codigo)  # elimina caracteres no ASCII

        # Asegurar que comience con un tipo de gráfico válido
        if not re.match(r'^\s*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|mindmap)\b', codigo):
            codigo = 'graph TD\n' + codigo  # Añadir un encabezado básico si falta

        return codigo.strip()

    def generate_concept_map(self):
        # Enviar el contenido del archivo como mensaje al modelo para generar mapa conceptual con Mermaid
        print("Generando mapa conceptual.")
        response = self.model.generate_content(f"""Se te entregará un archivo con un texto educativo. Tu trabajo será analizar el contenido, hacer un resumen corto, identificar las ideas principales y relaciones entre conceptos, y generar un mapa conceptual usando el lenguaje de diagramas Mermaid.

        INSTRUCCIONES IMPORTANTES:
        1. SOLO DEBES RESPONDER EL CÓDIGO MERMAID, NO EL TEXTO. NO UN SALUDO. SOLO EL CÓDIGO MERMAID.
        2. NO RESPONDAS ```mermaid al comienzo del código. NI PONGAS ``` al final.
        3. SOLO EL CÓDIGO Y NADA MÁS.
        4. Asegúrate de que el código mermaid esté bien formado, sin errores de sintaxis.
        5. Dentro de los subgraph, no pueden haber símbolos extraños dentro de los nodos tales como ([]) o cualquier tipo de llave.
        6. Usa colores para los nodos y las conexiones para mejorar la visualización.
        7. Usa un tamaño de letra adecuado para que sea legible.
        8. Usa un diseño claro y organizado.
        9. INCLUYE ESTA CONFIGURACIÓN AL INICIO DEL CÓDIGO:
        flowchart TD
        classDef conceptoPrincipal fill:#f9f,stroke:#333,stroke-width:2px
        classDef concepto fill:#bbf,stroke:#333,stroke-width:1px
        classDef subconcepto fill:#ddf,stroke:#333,stroke-width:1px

        El archivo es: \n{self.file_content}""")        
        print(response.text)
        text_clean = self.limpiar_mermaid(response.text)
        print(text_clean)
        return text_clean
        
    def generate_quiz(self):
        # Enviar el contenido del archivo como mensaje al modelo para generar un quiz
        print("Generando quiz de opción múltiple.")
        response = self.model.generate_content(f"Se te entregará un archivo con un texto educativo. Tu tarea será leerlo, identificar los puntos clave y generar un quiz en formato de opción múltiple (mínimo 5 preguntas), cada una con 1 respuesta correcta y 3 incorrectas. El archivo es:\n{self.file_content}")
        return response.text
