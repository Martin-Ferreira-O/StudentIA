from openai import OpenAI
import os
import dotenv

dotenv.load_dotenv()

class Resumen:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"), #ACA LOS IDIOTAS DEBEN PONER EN SU .ENV LA APIKEY IDIOTASSSSS >:D
            base_url=os.getenv("OPENAI_BASE_URL")
        )

    def read_files(self, path = "clase1.txt"):
        # Leer el contenido del archivo .txt
        print(f"leyendo {path}")
        with open(path, "r", encoding="utf-8") as file:
            self.file_content = file.read()

    def send_resume(self):
        # Enviar el contenido del archivo como mensaje al modelo
        print("Enviando texto a resumir.")
        chat = self.client.chat.completions.create(
            model="deepseek/deepseek-r1:free",
            messages=[
                {
                    "role": "user",
                    "content": f"Se te entregara un archivo con un texto educativo. tu trabajo sera resumirlo y entregar los puntos claves. El archivo es:\n{self.file_content}"
                }
            ]
        )

        return chat.choices[0].message.content
        
    def generate_concept_map(self):
        # Enviar el contenido del archivo como mensaje al modelo para generar mapa conceptual con Mermaid
        print("Generando mapa conceptual.")
        chat = self.client.chat.completions.create(
            model="deepseek/deepseek-r1:free",
            messages=[
                {
                    "role": "user",
                    "content": f"Se te entregará un archivo con un texto educativo. Tu trabajo será analizar el contenido, identificar las ideas principales y relaciones entre conceptos, y generar un mapa conceptual usando el lenguaje de diagramas Mermaid. SOLO DEBES RESPONDER EL CODIGO MERMAID, NO EL TEXTO. NO UN SALUDO. SOLO EL CODIGO MERMAID. SI NO EL PROGRAMA FALLARA Y EL MUNDO EXPLOTARA. El archivo es: \n{self.file_content}"
                }
            ]
        )
        print("CODIGO MERMIAD SUPER MEGA DUPER IMPORTANTE")
        print(chat.choices[0].message.content)
        print("----------------------------------")
        return chat.choices[0].message.content

    def generate_quiz(self):
        # Enviar el contenido del archivo como mensaje al modelo para generar un quiz
        print("Generando quiz de opción múltiple.")
        chat = self.client.chat.completions.create(
            model="deepseek/deepseek-r1:free",
            messages=[
                {
                    "role": "user",
                    "content": f"Se te entregará un archivo con un texto educativo. Tu tarea será leerlo, identificar los puntos clave y generar un quiz en formato de opción múltiple (mínimo 5 preguntas), cada una con 1 respuesta correcta y 3 incorrectas. El archivo es:\n{self.file_content}"
                }
            ]
        )
        return chat.choices[0].message.content

# ejemplo de uso:
if __name__ == '__main__':
    resumen = Resumen()

    resumen.save_files("output/bla")

    print(resumen.send_resume())