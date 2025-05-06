document.addEventListener('DOMContentLoaded', function() {
  // Referencias a elementos del DOM
  const themeToggle = document.getElementById('theme-toggle');
  const uploadForm = document.getElementById('upload-form');
  const fileInput = document.getElementById('archivo');
  const fileDropArea = document.getElementById('file-drop-area');
  const fileName = document.getElementById('file-name');
  const submitButton = document.getElementById('submit-button');
  const loaderContainer = document.getElementById('loader-container');
  const aiLoader = document.getElementById('ai-loader');
  const resultadoContainer = document.getElementById('resultado-container');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const editButton = document.getElementById('edit-button');
  const saveButton = document.getElementById('save-button');
  
  // Variables para el contenido del resumen
  let resumenOriginal = '';
  let resumenEditado = '';
  
  // Configuración de marked.js para procesar Markdown
  marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-',
    pedantic: false,
    gfm: true,
    breaks: true,
    sanitize: false,
    smartypants: false,
    xhtml: false
  });
  
  // Inicializar elementos de IA loader
  inicializarAILoader();
  
  // Cambiar tema claro/oscuro
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    const icon = this.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      localStorage.setItem('theme', 'dark');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      localStorage.setItem('theme', 'light');
    }
  });
  
  // Cargar tema guardado
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    const icon = themeToggle.querySelector('i');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }
  
  // Cambiar visualización cuando se selecciona un archivo
  fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      fileName.textContent = this.files[0].name;
      fileName.style.display = 'block';
      submitButton.disabled = false;
    } else {
      fileName.style.display = 'none';
      submitButton.disabled = true;
    }
  });
  
  // Drag and drop para archivos
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight() {
    fileDropArea.classList.add('dragover');
  }
  
  function unhighlight() {
    fileDropArea.classList.remove('dragover');
  }
  
  fileDropArea.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    fileInput.files = files;
    
    if (files.length > 0) {
      fileName.textContent = files[0].name;
      fileName.style.display = 'block';
      submitButton.disabled = false;
    }
  }
  
  // Manejo de pestañas
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      
      // Desactivar todas las pestañas
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Activar pestaña seleccionada
      button.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
  
  // Botones de copiar
  document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', () => {
      const contentId = button.dataset.target;
      const content = document.getElementById(contentId).textContent;
      
      navigator.clipboard.writeText(content).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
          button.innerHTML = originalText;
        }, 2000);
      });
    });
  });
  
  // Funcionalidad de edición
  if (editButton && saveButton) {
    // Botón de editar
    editButton.addEventListener('click', () => {
      const resumenContainer = document.getElementById('resumen-content');
      const markdownContent = resumenContainer.querySelector('.markdown-content');
      
      if (!markdownContent) return;
      
      // Iniciar modo edición
      resumenContainer.classList.add('editing');
      editButton.classList.add('hidden');
      saveButton.classList.remove('hidden');
      
      // Crear editor de Markdown si no existe
      if (!resumenContainer.querySelector('.markdown-editor')) {
        // Obtener texto original de Markdown
        const rawText = document.getElementById('resumen-raw').textContent;
        resumenOriginal = rawText;
        
        // Crear herramientas de formato
        const editingTools = document.createElement('div');
        editingTools.className = 'editing-tools';
        
        const formatButtons = [
          { icon: 'fa-heading', text: 'Título', action: () => insertMarkdown('# ', ' ') },
          { icon: 'fa-heading', text: 'Subtítulo', action: () => insertMarkdown('## ', ' ') },
          { icon: 'fa-bold', text: 'Negrita', action: () => insertMarkdown('**', '**') },
          { icon: 'fa-italic', text: 'Cursiva', action: () => insertMarkdown('*', '*') },
          { icon: 'fa-list-ul', text: 'Lista', action: () => insertMarkdown('- ', '\n- ') },
          { icon: 'fa-list-ol', text: 'Lista numerada', action: () => insertMarkdown('1. ', '\n2. ') },
          { icon: 'fa-code', text: 'Código', action: () => insertMarkdown('`', '`') },
          { icon: 'fa-quote-right', text: 'Cita', action: () => insertMarkdown('> ', '') }
        ];
        
        formatButtons.forEach(btn => {
          const button = document.createElement('button');
          button.className = 'format-button';
          button.innerHTML = `<i class="fas ${btn.icon}"></i> ${btn.text}`;
          button.addEventListener('click', btn.action);
          editingTools.appendChild(button);
        });
        
        // Contenedor para todo
        const contentContainer = document.createElement('div');
        contentContainer.className = 'content-container';
        
        // Crear editor
        const editor = document.createElement('textarea');
        editor.className = 'markdown-editor';
        editor.value = rawText;
        editor.addEventListener('input', () => {
          resumenEditado = editor.value;
          previewMarkdown(editor.value);
        });
        
        // Crear vista previa
        const preview = document.createElement('div');
        preview.className = 'markdown-preview markdown-content';
        preview.innerHTML = marked.parse(rawText);
        
        // Agregar elementos al DOM
        contentContainer.appendChild(editingTools);
        contentContainer.appendChild(editor);
        contentContainer.appendChild(preview);
        
        // Reemplazar el contenido actual con el editor
        markdownContent.after(contentContainer);
        
        // Función para mostrar vista previa en vivo
        function previewMarkdown(text) {
          preview.innerHTML = marked.parse(text);
          // Aplicar highlight.js a los bloques de código
          preview.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
          });
        }
        
        // Función para insertar markdown
        function insertMarkdown(before, after) {
          const start = editor.selectionStart;
          const end = editor.selectionEnd;
          const selectedText = editor.value.substring(start, end);
          const textBefore = editor.value.substring(0, start);
          const textAfter = editor.value.substring(end);
          
          editor.value = textBefore + before + selectedText + after + textAfter;
          editor.focus();
          
          // Actualizar vista previa
          resumenEditado = editor.value;
          previewMarkdown(editor.value);
          
          // Posicionar el cursor después del texto insertado
          if (selectedText.length > 0) {
            editor.selectionStart = start + before.length;
            editor.selectionEnd = end + before.length;
          } else {
            editor.selectionStart = start + before.length;
            editor.selectionEnd = start + before.length;
          }
        }
      } else {
        // Mostrar el editor existente
        resumenContainer.querySelector('.content-container').style.display = 'block';
      }
    });
    
    // Botón de guardar
    saveButton.addEventListener('click', () => {
      const resumenContainer = document.getElementById('resumen-content');
      const contentContainer = resumenContainer.querySelector('.content-container');
      const editor = resumenContainer.querySelector('.markdown-editor');
      
      if (!editor) return;
      
      // Obtener el texto editado
      const textoEditado = editor.value;
      
      // Actualizar el contenido de Markdown
      renderText(resumenContainer, textoEditado, true);
      
      // Actualizar el texto original para copiar
      document.getElementById('resumen-raw').textContent = textoEditado;
      
      // Salir del modo edición
      resumenContainer.classList.remove('editing');
      saveButton.classList.add('hidden');
      editButton.classList.remove('hidden');
      
      // Mostrar mensaje de éxito
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Resumen actualizado';
      resumenContainer.appendChild(successMessage);
      
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    });
  }
  
  // Procesar Markdown y mostrar contenido
  function renderText(contenedor, texto, esMarkdown = false) {
    // Guardar texto original para copiar
    const contenedorId = contenedor.id;
    const rawTextId = contenedorId.replace('-content', '-raw');
    const rawText = document.getElementById(rawTextId);
    if (rawText) {
      rawText.textContent = texto;
    }
    
    // Limpiar contenedor manteniendo los botones de acción
    const tabActions = contenedor.querySelector('.tab-actions');
    if (tabActions) {
      contenedor.innerHTML = '';
      contenedor.appendChild(tabActions);
    } else {
      contenedor.innerHTML = '';
      
      // Si no existe tab-actions, recrear botón de copiar para texto normal
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.dataset.target = rawTextId;
      copyButton.innerHTML = '<i class="fas fa-copy"></i>';
      contenedor.appendChild(copyButton);
    }
    
    // Mantener elemento raw oculto
    if (rawText) {
      contenedor.appendChild(rawText);
    } else {
      const newRawText = document.createElement('pre');
      newRawText.id = rawTextId;
      newRawText.className = 'hidden';
      newRawText.textContent = texto;
      contenedor.appendChild(newRawText);
    }
    
    // Procesar y mostrar el texto
    const contentDiv = document.createElement('div');
    
    if (esMarkdown) {
      contentDiv.className = 'markdown-content';
      contentDiv.innerHTML = marked.parse(texto);
      
      // Aplicar highlight.js a los bloques de código
      contentDiv.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    } else {
      contentDiv.className = 'plain-text';
      contentDiv.textContent = texto;
    }
    
    contenedor.appendChild(contentDiv);
    
    // Reactivar los botones de copiar
    if (tabActions) {
      const copyButton = tabActions.querySelector('.copy-button');
      if (copyButton) {
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(texto).then(() => {
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-check"></i>';
            
            setTimeout(() => {
              copyButton.innerHTML = originalText;
            }, 2000);
          });
        });
      }
    } else {
      const copyButton = contenedor.querySelector('.copy-button');
      if (copyButton) {
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(texto).then(() => {
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-check"></i>';
            
            setTimeout(() => {
              copyButton.innerHTML = originalText;
            }, 2000);
          });
        });
      }
    }
  }
  
  // Manejar envío del formulario
  uploadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (fileInput.files.length === 0) {
      alert('Por favor selecciona un archivo.');
      return;
    }
    
    // Ocultar formulario y mostrar pantalla de carga
    uploadForm.classList.add('hidden');
    loaderContainer.style.display = 'block';
    
    // Después de 2 segundos, mostrar la animación de IA procesando
    setTimeout(() => {
      loaderContainer.style.display = 'none';
      aiLoader.style.display = 'block';
      
      const formData = new FormData(uploadForm);
      
      fetch('/', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
      })
      .then(data => {
        // Ocultar loaders y mostrar resultados
        aiLoader.style.display = 'none';
        resultadoContainer.style.display = 'block';
        
        // Renderizar contenido
        const textoContainer = document.getElementById('texto-content');
        const resumenContainer = document.getElementById('resumen-content');
        
        renderText(textoContainer, data.texto, false);
        renderText(resumenContainer, data.resumen, true);
        
        // Guardar versión original del resumen
        resumenOriginal = data.resumen;
        
        // Activar primera pestaña por defecto
        document.querySelector('.tab-button').click();
        
        // Mostrar botones de edición
        if (editButton) {
          editButton.classList.remove('hidden');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        aiLoader.style.display = 'none';
        alert('Ha ocurrido un error. Por favor intenta de nuevo.');
        uploadForm.classList.remove('hidden');
      });
    }, 2000);
  });
  
  // Crear la animación del loader de IA
  function inicializarAILoader() {
    const aiLoader = document.getElementById('ai-loader');
    if (!aiLoader) return;
    
    // Crear nodos
    const numNodes = 5;
    const nodes = [];
    
    for (let i = 0; i < numNodes; i++) {
      const node = document.createElement('div');
      node.className = 'node';
      node.style.left = `${(i * 100) / (numNodes - 1)}%`;
      
      if (i === 0 || i === numNodes - 1) {
        node.classList.add('pulse');
      }
      
      aiLoader.appendChild(node);
      nodes.push(node);
    }
    
    // Crear conexiones
    for (let i = 0; i < numNodes - 1; i++) {
      const connection = document.createElement('div');
      connection.className = 'connection';
      connection.style.left = `${(i * 100) / (numNodes - 1)}%`;
      connection.style.width = `${100 / (numNodes - 1)}%`;
      aiLoader.appendChild(connection);
    }
    
    // Animar propagación de impulsos
    let activeNodeIndex = 0;
    
    setInterval(() => {
      // Quitar clase activa de todos los nodos
      nodes.forEach(node => {
        if (node.classList.contains('pulse') && 
            node !== nodes[0] && 
            node !== nodes[nodes.length - 1]) {
          node.classList.remove('pulse');
        }
      });
      
      // Activar nodo actual
      activeNodeIndex = (activeNodeIndex + 1) % (numNodes - 2) + 1;
      nodes[activeNodeIndex].classList.add('pulse');
    }, 600);
  }
});