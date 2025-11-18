/* =============================================
   1. VARIABLES GLOBALES
   (Accesibles para todos los scripts)
   ============================================== */

// Define al usuario ACTUAL para que TODOS los scripts lo sepan
const userType = localStorage.getItem('currentUser') || 'normal';

// Constantes para el Lector (TTS)
const synth = window.speechSynthesis;
let ttsActive = false;

/* =============================================
   2. FUNCIONES GLOBALES
   (Llamadas por las páginas específicas)
   ============================================== */

/**
 * Lee el contenido de un post usando Text-to-Speech.
 * Esta función es llamada por el script de cada página (ej. perfil.html).
 * @param {object} publicacion - El objeto del post con {titulo, contenido, usuario.nombre}
 * @param {HTMLElement} element - El elemento .post-card que se debe resaltar
 */
function readPost(publicacion, element) {
    if (!ttsActive) return; // Si el lector no está prendido, no hace nada
    
    if (synth.speaking) {
        // Si ya estaba hablando y se le pica de nuevo, se calla
        synth.cancel();
        return;
    }

    // Limpia el texto para que se lea bien
    const titulo = publicacion.titulo ? publicacion.titulo.trim() : 'Sin título';
    const contenido = publicacion.contenido ? publicacion.contenido.trim() : 'Sin contenido';
    const autor = publicacion.usuario ? publicacion.usuario.nombre : 'un usuario';
    const textoALeer = `Publicación de ${autor}. Título: ${titulo}. Contenido: ${contenido}.`;

    const utterance = new SpeechSynthesisUtterance(textoALeer);
    utterance.lang = 'es-MX'; // Pone el acento correcto
    
    // Resalta el post cuando empieza a hablar
    utterance.onstart = () => {
        document.querySelectorAll('.post-card.is-reading').forEach(el => el.classList.remove('is-reading'));
        element.classList.add('is-reading');
    };
    
    // Quita el resaltado cuando termina (o si hay error)
    utterance.onend = () => {
        element.classList.remove('is-reading');
    };
    utterance.onerror = () => {
        element.classList.remove('is-reading');
    };

    // ¡Habla!
    synth.speak(utterance);
}

/**
 * Redirige al Timeline (TL) de Usuario o de Admin, basado en localStorage.
 * Esta función es llamada directamente por el HTML (onclick).
 */
function redirectToHome() {
    const userType = localStorage.getItem('currentUser') || 'normal';
    if (userType === 'admin') {
        // Redirigir a la página de Admin
        window.location.href = '../Pagina Inicio Admin/TLAdmin.html';
    } else {
        // Redirigir a la página de Usuario
        window.location.href = '../Pagina inicio/TL.html';
    }
}


/* =============================================
   3. LÓGICA DE INICIO (Cuando carga CADA página)
   ============================================== */
document.addEventListener('DOMContentLoaded', function() {
    
    // --- Lógica del Dark Mode ---
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        if (toggleBtn) toggleBtn.textContent = '☀️';
    }
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                toggleBtn.textContent = '☀️';
                localStorage.setItem('theme', 'dark');
            } else {
                toggleBtn.textContent = '🌙';
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // --- Lógica del Sidebar (Abrir/Cerrar) ---
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');

    if (sidebar && openBtn && closeBtn && overlay) { // Revisa si existen
        openBtn.addEventListener('click', function() {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });

        function closeSidebar() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active'); 
        }
        closeBtn.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
    }
    
    // --- Lógica del Sidebar (Cerrar al hacer clic en link) ---
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // No cerrar si es el botón de Configuración
            if (link.id === 'open-settings-btn') return; 
            
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        });
    });

    // --- Lógica del Sidebar (Rutas de Admin/User) ---
    if (userType === 'admin') {
        console.log('Admin detectado: actualizando rutas del sidebar.');
        const linkInicio = document.getElementById('sidebar-link-inicio');
        const linkPerfil = document.getElementById('sidebar-link-perfil');
        const linkBuscar = document.getElementById('sidebar-link-buscar'); // Este es tu link de "Guardados"
        const linkMundiales = document.getElementById('sidebar-link-mundiales')
        
        if (linkInicio) linkInicio.href = '../Pagina Inicio Admin/TLAdmin.html';
        if (linkPerfil) linkPerfil.href = '../Perfil Admin/perfil Admin.html';
        if (linkBuscar) linkBuscar.href = '../Saved/guardados.html'; // Asegúrate que apunte a guardados
        if (linkMundiales) linkMundiales.href = '../Mundiales/Mundiales.html'; // (Asumiendo que es la misma página para ambos)
    }

    // --- Lógica del Modal de Accesibilidad (Abrir/Cerrar) ---
    const settingsBtnSidebar = document.getElementById('open-settings-btn'); // El botón del sidebar
    const settingsBtnProfile = document.querySelector('.btn-secondary'); // El botón de perfil (si existe)
    const modal = document.getElementById('settings-modal');
    const closeBtnModal = document.getElementById('close-modal-btn');

    function openModal() {
        if (modal) {
            modal.classList.add('visible');
            modal.classList.remove('hidden');
        }
    }
    function closeModal() {
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('visible');
        }
    }
    
    // Asigna los eventos (funcionará si CUALQUIERA de los botones existe)
    if (settingsBtnSidebar) {
        settingsBtnSidebar.addEventListener('click', openModal);
    }
    if (settingsBtnProfile) { 
        settingsBtnProfile.addEventListener('click', openModal);
    }
    
    // Asigna los eventos de cierre
    if (closeBtnModal) {
        closeBtnModal.addEventListener('click', closeModal);
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { closeModal(); } // Si pica en el fondo oscuro
        });
    }

    // --- Lógica INTERNA del Modal (Slider y TTS) ---
    const fontSizeSlider = document.getElementById('font-size-slider');
    if (fontSizeSlider) { // Solo corre esto si el modal existe en la página
        
        const sliderValue = document.querySelector('.slider-value');
        
        // Carga la preferencia guardada de tamaño
        const savedScale = localStorage.getItem('fontScale') || 1;
        document.body.style.setProperty('--font-scale', savedScale);
        fontSizeSlider.value = savedScale;
        updateSliderLabel(savedScale);

        // Evento del slider
        fontSizeSlider.addEventListener('input', (e) => {
            const scale = e.target.value;
            document.body.style.setProperty('--font-scale', scale);
            localStorage.setItem('fontScale', scale);
            updateSliderLabel(scale);
        });

        function updateSliderLabel(scale) {
            if (scale == 1) sliderValue.textContent = 'Normal';
            else if (scale > 1) sliderValue.textContent = `Grande (${scale}x)`;
            else sliderValue.textContent = `Pequeño (${scale}x)`;
        }

        // --- Lógica del Botón TTS ---
        const ttsToggleBtn = document.getElementById('tts-toggle-btn');
        const ttsHelperText = document.getElementById('tts-helper-text');

        ttsToggleBtn.addEventListener('click', () => {
            ttsActive = !ttsActive; // Modifica la variable global
            if (ttsActive) {
                ttsToggleBtn.innerHTML = '<i class="fas fa-stop"></i> Desactivar Lector';
                ttsHelperText.textContent = "Haz clic en un post para leerlo. Clic de nuevo para parar.";
            } else {
                synth.cancel(); // Para cualquier lectura
                ttsToggleBtn.innerHTML = '<i class="fas fa-play"></i> Activar Lector';
                ttsHelperText.textContent = "Una vez activo, haz clic en cualquier publicación para escucharla.";
            }
        });
    } // Fin del if (fontSizeSlider)

    // --- Lógica de la Búsqueda (Responsive) ---
// ... (justo antes del final '}); // Fin del DOMContentLoaded')

    // --- Lógica de la Búsqueda (Responsive) ---
    const searchForm = document.getElementById('search-form');
    const searchButton = document.getElementById('btnsearch');
    
    if (searchForm && searchButton) {

// Función para redirigir a la página de búsqueda CON LA PALABRA CLAVE
        function irABuscar() {
            const input = document.querySelector('.search-input');
            const termino = input ? input.value.trim() : "";
            
            // Codificamos el texto para que viaje bien en la URL (ej. "Hola Mundo" -> "Hola%20Mundo")
            const queryParam = `?q=${encodeURIComponent(termino)}`;

            if (userType === 'admin') {
                window.location.href = '../Searchres Admin/Searchres Admin.html' + queryParam;
            } else {
                window.location.href = '../Searchres/Searchres.html' + queryParam;
            }
        }

        searchButton.addEventListener('click', function(event) {
            event.preventDefault(); // Detenemos la acción por defecto SIEMPRE
            
            const isMobile = window.innerWidth <= 768;
            const isExpanded = searchForm.classList.contains('search-expanded');

            if (isMobile && !isExpanded) {
                // 1. Si es móvil y NO está expandido:
                searchForm.classList.add('search-expanded');
                searchForm.querySelector('.search-input').focus();
            } else {
                // 2. Si ESTÁ EXPANDIDO o SI ES DESKTOP:
                // ¡Ahora sí redirige a la página correcta!
                irABuscar();
            }
        });

        // 🔥 AÑADIR ESTO: Si le dan "Enter" al input, también busca
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            irABuscar();
        });

        // Cierra la barra de búsqueda si picas afuera
        document.addEventListener('click', function(event) {
            if (!searchForm.contains(event.target) && searchForm.classList.contains('search-expanded')) {
                searchForm.classList.remove('search-expanded');
            }
        });
    }
    
}); // Fin del DOMContentLoaded
    
