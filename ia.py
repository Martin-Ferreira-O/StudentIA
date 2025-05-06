from openai import OpenAI
import os
class Resumen:
    def __init__(self):
        # USar variables de entorno
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
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

# ejemplo de uso:
if __name__ == '__main__':
    resumen = Resumen()

    resumen.save_files("output/bla")

    print(resumen.send_resume())