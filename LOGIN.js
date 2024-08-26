document.addEventListener('DOMContentLoaded', function() {
    // Limpiar los datos de la sesión al cargar la página de login para permitir un nuevo intento
    sessionStorage.clear();

    // Generar un folio único
    const folioField = document.getElementById('folio');
    const folio = 'FOL-' + Date.now().toString(36).toUpperCase();
    folioField.textContent = folio;

    // Rellenar la fecha y hora actual
    const dateField = document.getElementById('date');
    const timeField = document.getElementById('time');
    const now = new Date();
    dateField.value = now.toLocaleDateString();
    timeField.value = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const lineaSelect = document.getElementById('linea');
    const partNumberSelect = document.getElementById('part-number');

    // Desactivar el campo de número de parte hasta que se seleccione una línea
    lineaSelect.addEventListener('change', function() {
        const selectedLinea = lineaSelect.value;
        if (selectedLinea) {
            partNumberSelect.disabled = false;
            Array.from(partNumberSelect.options).forEach(option => {
                option.style.display = option.getAttribute('data-linea') === selectedLinea ? '' : 'none';
            });
            partNumberSelect.value = ''; // Reinicia la selección de número de parte
        } else {
            partNumberSelect.disabled = true;
        }
    });

    // Manejar el envío del formulario
    const form = document.getElementById('login-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const userId = document.getElementById('user-id').value;

        // Verificar si ya existe un registro de evaluación para este usuario
        const evaluationStarted = sessionStorage.getItem(`evaluationStarted_${userId}`);

        if (!evaluationStarted) {
            // Si no existe un registro previo, iniciar uno nuevo
            sessionStorage.setItem(`evaluationStarted_${userId}`, 'false');
        }

        // Almacenar el ID del usuario
        sessionStorage.setItem('userId', userId);

        // Obtener los valores del formulario
        const userName = document.getElementById('user-name').value;
        const linea = document.getElementById('linea').value;
        const partNumber = document.getElementById('part-number').value;

        // Almacenar datos en sessionStorage
        sessionStorage.setItem('folio', folio);
        sessionStorage.setItem('userName', userName);
        sessionStorage.setItem('linea', linea);
        sessionStorage.setItem('partNumber', partNumber);
        sessionStorage.setItem('attempts', JSON.stringify({}));  // Inicializar intentos como un objeto vacío

        const folderPath = `${linea.replace(' ', '_')}/${partNumber.replace(/ /g, '_')}/PASO_1`;
        const fileName = `${partNumber.replace(/ /g, '_')}_PASO_1.html`;

        // Redirigir al primer paso
        window.location.href = `${folderPath}/${fileName}`;
    });
});
