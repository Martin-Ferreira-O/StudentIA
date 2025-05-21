// Variable global para almacenar la instancia del SVG para zoom y pan
let svgPanZoomInstance = null;
let mermaidInicializado = false;

// Helper para obtener colores de CSS o usar fallback
const obtenerColorCSS = (nombreVar, fallback) => {
    if (typeof getComputedStyle !== 'undefined' && document.documentElement) {
        const valor = getComputedStyle(document.documentElement).getPropertyValue(nombreVar).trim();
        return valor || fallback;
    }
    return fallback;
};

function inicializarMermaid() {
    if (mermaidInicializado || typeof mermaid === 'undefined') {
        return;
    }

    const esModoOscuro = document.body.classList.contains('dark-theme');
    
    mermaid.initialize({
        startOnLoad: false,
        theme: 'base', // Usar 'base' y controlar con variables para mayor flexibilidad
        fontFamily: '"Roboto", sans-serif',
        flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis',
            padding: 20,
        },
        // Estas variables se aplicarán según el tema claro/oscuro detectado por Mermaid o CSS
        themeVariables: {
            background: obtenerColorCSS('--card-bg', '#ffffff'),
            primaryColor: obtenerColorCSS('--accent-color-dark', '#0056b3'),
            primaryTextColor: obtenerColorCSS('--text-color', '#212529'),
            primaryBorderColor: obtenerColorCSS('--accent-color', '#007bff'),
            lineColor: obtenerColorCSS('--accent-color-dark', '#0056b3'),
            textColor: obtenerColorCSS('--text-color', '#212529'),
            fontSize: '16px',
            nodeBorder: obtenerColorCSS('--accent-color', '#007bff'),
            mainBkg: obtenerColorCSS('--accent-color-light', '#e7f3ff'),
            nodeTextColor: obtenerColorCSS('--text-color', '#212529'),
            
            // Mermaid detectará .dark-theme y aplicará estas si el tema es 'dark' o 'base' con variables oscuras
            darkMode_background: obtenerColorCSS('--card-bg', '#24243e'), // Ejemplo: --dark-card-bg si tienes específicos
            darkMode_primaryColor: obtenerColorCSS('--accent-color-dark', '#6040ff'),
            darkMode_primaryTextColor: obtenerColorCSS('--text-color', '#e0e0ff'),
            darkMode_primaryBorderColor: obtenerColorCSS('--accent-color', '#8a75ff'),
            darkMode_lineColor: obtenerColorCSS('--accent-color-dark', '#6040ff'),
            darkMode_textColor: obtenerColorCSS('--text-color', '#e0e0ff'),
            darkMode_nodeBorder: obtenerColorCSS('--accent-color', '#8a75ff'),
            darkMode_mainBkg: obtenerColorCSS('--accent-color-light', '#30304a'),
            darkMode_nodeTextColor: obtenerColorCSS('--text-color', '#e0e0ff'),

            labelBackground: obtenerColorCSS('--card-bg', esModoOscuro ? '#24243e' : '#ffffff'),
            edgeLabelBackground: obtenerColorCSS('--card-bg', esModoOscuro ? '#24243e' : '#ffffff'),
        }
    });
    mermaidInicializado = true;
    console.log("Mermaid inicializado.");
}

function renderizarDiagramaMermaid(mermaidCode) {
    const mermaidContainer = document.getElementById('mermaid-diagram');
    if (!mermaidContainer) {
        console.error('Mermaid container (#mermaid-diagram) not found');
        return;
    }
    const loadingIndicator = mermaidContainer.querySelector('.mermaid-loading');

    if (!mermaidCode || mermaidCode.trim() === '') {
        mermaidContainer.innerHTML = '<p class="error-message">No hay contenido para el mapa conceptual.</p>';
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        return;
    }

    if (typeof mermaid === 'undefined') {
        console.error("Mermaid no está definido. No se puede renderizar.");
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        mermaidContainer.innerHTML = '<p class="error-message">Error: Librería Mermaid no cargada.</p>';
        return;
    }
    
    // Asegurar que Mermaid esté inicializado
    if (!mermaidInicializado) {
        inicializarMermaid();
    }
    // Forzar actualización de configuración para tema oscuro/claro en cada renderizado
    // Esto es más seguro que confiar en la detección automática de Mermaid si hay cambios dinámicos.
    const esModoOscuroActual = document.body.classList.contains('dark-theme');
    mermaid.再度初期化({ // Re-configure (Japanese for re-initialize, as an example if direct reconfigure not available)
        theme: esModoOscuroActual ? 'dark' : 'base', // Ensure theme is set based on current body class
         fontFamily: '"Roboto", sans-serif', // Re-apply base settings that might be lost
         flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis',
            padding: 20,
        },
        themeVariables: { // Re-apply all theme variables to ensure they match current theme
            background: obtenerColorCSS('--card-bg', '#ffffff'),
            primaryColor: obtenerColorCSS('--accent-color-dark', '#0056b3'),
            primaryTextColor: obtenerColorCSS('--text-color', '#212529'),
            primaryBorderColor: obtenerColorCSS('--accent-color', '#007bff'),
            lineColor: obtenerColorCSS('--accent-color-dark', '#0056b3'),
            textColor: obtenerColorCSS('--text-color', '#212529'),
            fontSize: '16px',
            nodeBorder: obtenerColorCSS('--accent-color', '#007bff'),
            mainBkg: obtenerColorCSS('--accent-color-light', '#e7f3ff'),
            nodeTextColor: obtenerColorCSS('--text-color', '#212529'),
            
            darkMode_background: obtenerColorCSS('--card-bg', '#24243e'),
            darkMode_primaryColor: obtenerColorCSS('--accent-color-dark', '#6040ff'),
            darkMode_primaryTextColor: obtenerColorCSS('--text-color', '#e0e0ff'),
            darkMode_primaryBorderColor: obtenerColorCSS('--accent-color', '#8a75ff'),
            darkMode_lineColor: obtenerColorCSS('--accent-color-dark', '#6040ff'),
            darkMode_textColor: obtenerColorCSS('--text-color', '#e0e0ff'),
            darkMode_nodeBorder: obtenerColorCSS('--accent-color', '#8a75ff'),
            darkMode_mainBkg: obtenerColorCSS('--accent-color-light', '#30304a'),
            darkMode_nodeTextColor: obtenerColorCSS('--text-color', '#e0e0ff'),

            labelBackground: obtenerColorCSS('--card-bg', esModoOscuroActual ? '#24243e' : '#ffffff'),
            edgeLabelBackground: obtenerColorCSS('--card-bg', esModoOscuroActual ? '#24243e' : '#ffffff'),
        }
    });


    try {
        const existingSvg = mermaidContainer.querySelector('svg');
        if (existingSvg) existingSvg.remove();
        const existingError = mermaidContainer.querySelector('.error-message');
        if (existingError) existingError.remove();

        if (loadingIndicator) loadingIndicator.style.display = 'flex';

        const uniqueId = 'mermaid-svg-' + Date.now();
        mermaid.render(uniqueId, mermaidCode, (svgGraph, bindFunctions) => {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            
            const oldSvg = mermaidContainer.querySelector('svg');
            if(oldSvg) oldSvg.remove();
            
            mermaidContainer.insertAdjacentHTML('beforeend', svgGraph);
            const svgElement = mermaidContainer.querySelector('svg');

            if (svgElement) {
                svgElement.style.maxWidth = '100%';
                svgElement.style.height = 'auto';

                if (typeof svgPanZoom !== 'undefined') {
                    if (svgPanZoomInstance) {
                        svgPanZoomInstance.destroy();
                    }
                    svgPanZoomInstance = svgPanZoom(svgElement, {
                        panEnabled: true, zoomEnabled: true, dblClickZoomEnabled: true,
                        controlIconsEnabled: false, preventMouseEventsDefault: true,
                        fit: true, center: true, minZoom: 0.2, maxZoom: 10, zoomScaleSensitivity: 0.3,
                    });

                    document.getElementById('zoom-in-btn').onclick = () => svgPanZoomInstance && svgPanZoomInstance.zoomIn();
                    document.getElementById('zoom-out-btn').onclick = () => svgPanZoomInstance && svgPanZoomInstance.zoomOut();
                    document.getElementById('zoom-reset-btn').onclick = () => {
                        if (svgPanZoomInstance) {
                            svgPanZoomInstance.resetZoom();
                            svgPanZoomInstance.center();
                        }
                    };
                } else {
                    console.warn("svgPanZoom no está definido. Controles de zoom no funcionarán.");
                }
                
                const downloadBtn = document.getElementById('download-mermaid-btn');
                if (downloadBtn) {
                    downloadBtn.onclick = () => downloadSVG(svgElement, mermaidCode);
                }
            } else {
                mermaidContainer.innerHTML = '<p class="error-message">Error al renderizar el SVG del mapa conceptual.</p>';
            }
        });
    } catch (e) {
        console.error('Error al renderizar el mapa conceptual:', e);
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        mermaidContainer.innerHTML = `<p class="error-message">Error al renderizar el mapa: ${e.message}. Asegúrate de que la sintaxis del mapa es correcta.</p>`;
    }
}

function downloadSVG(svgElement, mermaidCode) {
    if (!svgElement || typeof XMLSerializer === 'undefined' || typeof document.createElementNS === 'undefined') {
        console.error('Error: No se puede descargar el SVG. Elemento SVG no válido o funcionalidades del navegador faltantes.');
        alert('No se pudo preparar el SVG para la descarga. Revisa la consola para más detalles.');
        return;
    }

    try {
        // Clonar el SVG para no modificar el original en la página
        const clonedSvgElement = svgElement.cloneNode(true);
        const esModoOscuro = document.body.classList.contains('dark-theme');
        clonedSvgElement.style.backgroundColor = obtenerColorCSS('--card-bg', esModoOscuro ? '#24243e' : '#ffffff');

        const serializer = new XMLSerializer();
        
        const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
        
        styleEl.textContent = `
            svg {
                background-color: ${obtenerColorCSS('--card-bg', esModoOscuro ? '#24243e' : '#ffffff')};
                font-family: "Roboto", sans-serif;
            }
            .node rect, .node circle, .node ellipse, .node polygon, .node path {
                fill: ${obtenerColorCSS('--accent-color-light', esModoOscuro ? '#30304a' : '#e7f3ff')};
                stroke: ${obtenerColorCSS('--accent-color', esModoOscuro ? '#8a75ff' : '#007bff')};
                stroke-width: 2px;
            }
            .node .label, .node text {
                fill: ${obtenerColorCSS('--text-color', esModoOscuro ? '#e0e0ff' : '#212529')};
                font-size: 15px;
                font-weight: 500;
            }
            .edgePath .path {
                stroke: ${obtenerColorCSS('--accent-color-dark', esModoOscuro ? '#6040ff' : '#0056b3')};
                stroke-width: 2px;
            }
            .edgePath .arrowhead {
                 fill: ${obtenerColorCSS('--accent-color-dark', esModoOscuro ? '#6040ff' : '#0056b3')};
            }
            .edgeLabel {
                background-color: ${obtenerColorCSS('--card-bg', esModoOscuro ? '#24243e' : '#ffffff')};
                color: ${obtenerColorCSS('--text-color', esModoOscuro ? '#e0e0ff' : '#212529')};
                padding: 2px 4px;
                border-radius: 3px;
                font-size: 13px;
            }
            .cluster rect {
                fill: ${esModoOscuro ? 'rgba(48, 48, 74, 0.5)' : 'rgba(231, 243, 255, 0.5)'};
                stroke: ${obtenerColorCSS('--accent-color', esModoOscuro ? '#8a75ff' : '#007bff')};
                stroke-width: 1.5px;
                stroke-dasharray: 4, 2;
            }
            .cluster text {
                fill: ${obtenerColorCSS('--text-secondary', esModoOscuro ? '#a0a0cc' : '#6c757d')};
                font-weight: bold;
            }
        `;
        clonedSvgElement.prepend(styleEl);

        let source = serializer.serializeToString(clonedSvgElement);
        
        if (!source.match(/^<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!source.match(/^<svg[^>]*xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }

        const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        let filename = 'mapa_conceptual.svg';
        if (mermaidCode) {
            const firstLine = mermaidCode.split('\n')[0];
            const safePart = firstLine.replace(/[^a-z0-9_.-]/gi, '_').substring(0, 50);
            if (safePart) filename = `${safePart}_map.svg`;
        }
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (e) {
        console.error('Error detallado al descargar el SVG:', e);
        alert(`Error al descargar el mapa conceptual: ${e.message}. Por favor, revisa la consola.`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Intentar inicializar Mermaid tan pronto como el DOM esté listo y Mermaid esté disponible
    if (typeof mermaid !== 'undefined') {
        inicializarMermaid();
    } else {
        // Si Mermaid no está, podría estar cargándose asíncronamente.
        // Se podría añadir un observador o un reintento, pero la lógica de renderizado ya lo comprueba.
        console.warn("Mermaid no definido en DOMContentLoaded, se inicializará al primer renderizado.");
    }
    
    const realizarRenderizadoInicialSiActivo = () => {
        const mermaidCodeEl = document.getElementById('mermaid-code');
        const mapaTab = document.querySelector('.tab-button[data-target="mapa-content"]');
        if (mermaidCodeEl && mapaTab && mapaTab.classList.contains('active')) {
            if (typeof renderizarDiagramaMermaid !== 'undefined' && typeof svgPanZoom !== 'undefined' && typeof mermaid !== 'undefined') {
                // Pequeña demora para asegurar que todo esté realmente listo
                setTimeout(() => renderizarDiagramaMermaid(mermaidCodeEl.textContent), 150);
            } else {
                console.warn("Componentes (Mermaid, svgPanZoom, o renderizarDiagramaMermaid) no listos para renderizado inicial. Reintentando...");
                setTimeout(realizarRenderizadoInicialSiActivo, 500); // Reintentar
            }
        }
    };

    if (typeof svgPanZoom === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js';
        script.onload = () => {
            console.log('svg-pan-zoom cargado dinámicamente.');
            realizarRenderizadoInicialSiActivo();
        };
        script.onerror = () => {
            console.error("Error al cargar svg-pan-zoom.");
            // Intentar renderizar de todas formas, el zoom no funcionará.
             realizarRenderizadoInicialSiActivo();
        }
        document.head.appendChild(script);
    } else {
        realizarRenderizadoInicialSiActivo();
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTimeout(() => {
                // Re-inicializar o re-configurar Mermaid para que tome el nuevo tema
                // La inicialización ahora ocurre una vez, pero podemos forzar re-configuración de tema
                if (typeof mermaid !== 'undefined' && mermaidInicializado) {
                     // Forzar la re-aplicación de la configuración del tema
                    const esModoOscuroActual = document.body.classList.contains('dark-theme');
                    mermaid.再度初期化({ // Mermaid API no tiene un "reconfigure" directo, pero llamar a init de nuevo con nuevas config a veces funciona o usar `setConfig`
                        theme: esModoOscuroActual ? 'dark' : 'base',
                        themeVariables: { /* ... re-listar TODAS las themeVariables actualizadas ... */
                                background: obtenerColorCSS('--card-bg', '#ffffff'),
                                primaryColor: obtenerColorCSS('--accent-color-dark', '#0056b3'),
                                primaryTextColor: obtenerColorCSS('--text-color', '#212529'),
                                primaryBorderColor: obtenerColorCSS('--accent-color', '#007bff'),
                                lineColor: obtenerColorCSS('--accent-color-dark', '#0056b3'),
                                textColor: obtenerColorCSS('--text-color', '#212529'),
                                fontSize: '16px',
                                nodeBorder: obtenerColorCSS('--accent-color', '#007bff'),
                                mainBkg: obtenerColorCSS('--accent-color-light', '#e7f3ff'),
                                nodeTextColor: obtenerColorCSS('--text-color', '#212529'),
                                
                                darkMode_background: obtenerColorCSS('--card-bg', '#24243e'),
                                darkMode_primaryColor: obtenerColorCSS('--accent-color-dark', '#6040ff'),
                                darkMode_primaryTextColor: obtenerColorCSS('--text-color', '#e0e0ff'),
                                darkMode_primaryBorderColor: obtenerColorCSS('--accent-color', '#8a75ff'),
                                darkMode_lineColor: obtenerColorCSS('--accent-color-dark', '#6040ff'),
                                darkMode_textColor: obtenerColorCSS('--text-color', '#e0e0ff'),
                                darkMode_nodeBorder: obtenerColorCSS('--accent-color', '#8a75ff'),
                                darkMode_mainBkg: obtenerColorCSS('--accent-color-light', '#30304a'),
                                darkMode_nodeTextColor: obtenerColorCSS('--text-color', '#e0e0ff'),

                                labelBackground: obtenerColorCSS('--card-bg', esModoOscuroActual ? '#24243e' : '#ffffff'),
                                edgeLabelBackground: obtenerColorCSS('--card-bg', esModoOscuroActual ? '#24243e' : '#ffffff'),
                        }
                    }); // Esto puede o no funcionar como se espera, Mermaid es peculiar con la reconfiguración
                    console.log("Intentando reconfigurar Mermaid para el nuevo tema.");
                }

                const mermaidCodeEl = document.getElementById('mermaid-code');
                const mermaidContainer = document.getElementById('mermaid-diagram');
                if (mermaidCodeEl && mermaidCodeEl.textContent && mermaidContainer && mermaidContainer.querySelector('svg')) { 
                    console.log("Re-renderizando el mapa conceptual por cambio de tema.");
                    if (typeof renderizarDiagramaMermaid !== 'undefined') {
                         renderizarDiagramaMermaid(mermaidCodeEl.textContent);
                    }
                }
            }, 150);
        });
    }
    
    const mapaTabButton = document.querySelector('.tab-button[data-target="mapa-content"]');
    if (mapaTabButton) {
        mapaTabButton.addEventListener('click', function() {
            const mermaidCodeElement = document.getElementById('mermaid-code');
            const mermaidDiagramElement = document.getElementById('mermaid-diagram');
            if (mermaidCodeElement && mermaidDiagramElement && 
                (!mermaidDiagramElement.querySelector('svg') || mermaidDiagramElement.querySelector('.mermaid-loading'))) {
                if (typeof renderizarDiagramaMermaid !== 'undefined' && typeof mermaid !== 'undefined' && typeof svgPanZoom !== 'undefined') {
                     renderizarDiagramaMermaid(mermaidCodeElement.textContent);
                } else {
                    console.warn("Componentes (Mermaid, svgPanZoom o renderizarDiagramaMermaid) no listos para renderizar al cambiar de pestaña.");
                }
            }
        });
    }
}); 