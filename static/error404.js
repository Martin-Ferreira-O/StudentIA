document.addEventListener('DOMContentLoaded', function() {
    // Toggle tema oscuro/claro
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    // Verificar si hay un tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-theme');
        const isDark = body.classList.contains('dark-theme');
        // Guardar preferencia
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        // Cambiar ícono
        const icon = themeToggle.querySelector('i');
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    });
}); 