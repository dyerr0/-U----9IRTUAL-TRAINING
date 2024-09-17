document.addEventListener('DOMContentLoaded', function() {
    // Aplicar la animación de entrada cuando la página se carga
    document.body.classList.add('fade-in');

    // Redirigir a otra página con una animación de salida
    function redirectWithTransition(url) {
        document.body.classList.add('fade-out');
        setTimeout(function() {
            window.location.href = url;
        }, 1000); // El tiempo aquí debe coincidir con la duración de la animación fade-out (1s)
    }

    // Obtener los datos del usuario desde la URL o sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId') || sessionStorage.getItem('userId');
    const userName = urlParams.get('userName') || sessionStorage.getItem('userName');
    const folio = sessionStorage.getItem('folio'); // Obtener el folio correctamente
    const date = urlParams.get('date') || new Date().toLocaleDateString();
    const time = urlParams.get('time') || new Date().toLocaleTimeString();

    // Guardar el tiempo de término
    const endTime = new Date().getTime();
    sessionStorage.setItem('endTime', endTime);

    // Verificar que todos los pasos anteriores se hayan completado
    const currentPath = window.location.pathname;
    const currentFileName = currentPath.split('/').pop(); // Obtener el nombre del archivo actual
    const stepIndex = parseInt(currentFileName.match(/PASO_(\d+)/)[1]); // Extraer el número del paso
    const lastCompletedStep = parseInt(sessionStorage.getItem('lastCompletedStep')) || 0;

    if (stepIndex !== lastCompletedStep + 1) {
        // Si el paso actual no es el siguiente en la secuencia, redirigir al login
        redirectToLogin();
        return;
    }

    // Si pasó la verificación, actualizar el último paso completado
    sessionStorage.setItem('lastCompletedStep', stepIndex);

    const startTime = parseInt(sessionStorage.getItem(`startTime_${userId}`));
    const totalTime = Math.floor((endTime - startTime) / 1000); 

    let hours = Math.floor(totalTime / 3600);
    let minutes = Math.floor((totalTime % 3600) / 60);
    let seconds = totalTime % 60;

    const formattedTime = hours > 0 
        ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` 
        : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const attempts = JSON.parse(sessionStorage.getItem('attempts'));

    let totalErrors = 0;
    for (const attemptCount of Object.values(attempts)) {
        if (attemptCount > 1) {
            totalErrors += (attemptCount - 1);
        }
    }

    let resultado;
    if (totalErrors === 0) {
        resultado = 'S+';
    } else if (totalErrors === 1) {
        resultado = 'S';
    } else if (totalErrors === 2) {
        resultado = 'A+';
    } else if (totalErrors === 3) {
        resultado = 'A';
    } else if (totalErrors === 4) {
        resultado = 'A-';
    } else if (totalErrors === 5) {
        resultado = 'B+';
    } else if (totalErrors === 6) {
        resultado = 'B';
    } else if (totalErrors === 7) {
        resultado = 'B-';
    } else if (totalErrors === 8) {
        resultado = 'C+';
    } else if (totalErrors === 9) {
        resultado = 'C';
    } else if (totalErrors === 10) {
        resultado = 'C-';
    } else if (totalErrors === 11) {
        resultado = 'D+';
    } else if (totalErrors === 12) {
        resultado = 'D';
    } else if (totalErrors === 13) {
        resultado = 'D-';
    } else {
        resultado = 'F';
    }


    document.getElementById('user-id').textContent = userId;
    document.getElementById('user-name').textContent = userName;
    document.getElementById('folio').textContent = folio;
    document.getElementById('total-time').textContent = formattedTime;
    const resultadoElement = document.getElementById('resultado');
    resultadoElement.textContent = resultado;

    // Aplicar animación al resultado
    resultadoElement.classList.add('bounce-in');

    // Finalizar la evaluación y redirigir al login
    document.getElementById('finalize-button').addEventListener('click', function() {
        generateCSV();
        sessionStorage.clear(); // Limpiar los datos de la sesión al finalizar
        redirectToLogin(); // Redirigir al login
    });
});

function generateCSV() {
    const folio = sessionStorage.getItem('folio');
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');
    const linea = sessionStorage.getItem('linea');
    const partNumber = sessionStorage.getItem('partNumber');
    const startTime = parseInt(sessionStorage.getItem(`startTime_${userId}`));
    const endTime = parseInt(sessionStorage.getItem('endTime'));
    const totalTime = Math.floor((endTime - startTime) / 1000); // Tiempo total en segundos
    const attempts = JSON.parse(sessionStorage.getItem('attempts'));

    // Formatear tiempo total a hh:mm:ss o mm:ss
    let hours = Math.floor(totalTime / 3600);
    let minutes = Math.floor((totalTime % 3600) / 60);
    let seconds = totalTime % 60;

    const formattedTime = hours > 0 
        ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` 
        : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Crear el contenido CSV
    let csvContent = "Folio,UserId,UserName,Linea,PartNumber";

    // Agregar las columnas de los pasos
    for (const step of Object.keys(attempts)) {
        csvContent += `,${step}`;
    }

    csvContent += ",TotalTime\n"; // Agregar la columna de tiempo total

    // Agregar los valores correspondientes
    csvContent += `${folio},${userId},${userName},${linea},${partNumber}`;
    
    // Agregar los intentos por paso
    for (const attemptCount of Object.values(attempts)) {
        csvContent += `,${attemptCount}`;
    }

    csvContent += `,${formattedTime}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${folio}_evaluation.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Redirigir al login después de generar el CSV
function redirectToLogin() {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/');

    // Subir tres niveles desde la carpeta del paso actual para llegar a "VIRTUAL TRAINING"
    const basePath = pathSegments.slice(0, -4).join('/');
    
    // Construir la ruta completa hacia LOGIN.html
    const loginPath = `${basePath}/LOGIN.html`;

    // Redirigir a la página de login
    window.location.href = loginPath;
}
