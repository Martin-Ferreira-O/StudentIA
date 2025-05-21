import base64
import io
import requests
from PIL import Image as im
import matplotlib.pyplot as plt

def generateImageMermaid(graph):
    graphbytes = graph.encode("utf8")
    base64_bytes = base64.urlsafe_b64encode(graphbytes)
    base64_string = base64_bytes.decode("ascii")
    
    response = requests.get('https://mermaid.ink/img/' + base64_string)
    response.raise_for_status() # Asegurarse de que la solicitud fue exitosa
    
    pil_img = im.open(io.BytesIO(response.content))
    
    fig, ax = plt.subplots()
    ax.imshow(pil_img)
    ax.axis('off')
    
    # Guardar la figura en un buffer de memoria
    img_io = io.BytesIO()
    plt.savefig(img_io, format='png', dpi=300, bbox_inches='tight', pad_inches=0) # DPI ajustado, 1200 puede ser muy grande
    plt.close(fig) # Cerrar la figura para liberar memoria
    
    img_io.seek(0) # Rebobinar el buffer al principio
    return img_io
