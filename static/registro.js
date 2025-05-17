document.addEventListener('DOMContentLoaded', function() {
    // Toggle para visualizar la contraseña
    document.querySelectorAll('.toggle-password').forEach(function(toggle, index) {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
    // Manejar el formulario de registro
    const registroForm = document.getElementById('registro-form');
    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const errorMessage = document.getElementById('error-message');
            errorMessage.style.display = 'none';
            // Validar que las contraseñas coincidan
            const password = document.getElementById('password').value;
            const confirmarPassword = document.getElementById('confirmar_password').value;
            if (password !== confirmarPassword) {
                errorMessage.textContent = 'Las contraseñas no coinciden';
                errorMessage.style.display = 'block';
                return;
            }
            // Crear objeto con datos del formulario
            const formData = new FormData(registroForm);
            formData.delete('confirmar_password'); // No enviar al servidor
            // Enviar datos al servidor
            fetch('/registro', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/';
                } else {
                    errorMessage.textContent = data.error || 'Error al registrar usuario';
                    errorMessage.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.textContent = 'Error de conexión';
                errorMessage.style.display = 'block';
            });
        });
    }
}); 