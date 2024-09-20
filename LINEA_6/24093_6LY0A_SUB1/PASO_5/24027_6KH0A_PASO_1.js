let selectedCable = null;
let connections = [];
let countdown;  // Variable para almacenar el temporizador
let timeLeft = 180; // Tiempo en segundos (3 minutos)

// Obtener el ID del usuario desde sessionStorage
let userId = sessionStorage.getItem('userId');
 
window.onload = function () {
    const currentPath = window.location.pathname;
    const currentFileName = currentPath.split('/').pop(); // Obtener el nombre del archivo actual
    const stepIndex = parseInt(currentFileName.match(/PASO_(\d+)/)[1]); // Extraer el número del paso

    // Verificar si el usuario ha completado el paso anterior
    const lastCompletedStep = parseInt(sessionStorage.getItem('lastCompletedStep')) || 0;

    if (stepIndex !== lastCompletedStep + 1) {
        // Si el paso actual no es el siguiente en la secuencia, redirigir al login
        redirectToLogin();
        return;
    }

    // Si es PASO_1, iniciar la evaluación con la lógica actual
    if (stepIndex === 1) {
        if (sessionStorage.getItem(`evaluationStarted_${userId}`) === 'true') {
            // Si ya se inició, redirigir al login
            redirectToLogin();
        } else {
            // Mostrar el modal para confirmar inicio
            const modal = document.getElementById('confirmation-modal');
            modal.style.display = 'block';

            // Manejar la confirmación de iniciar la evaluación
            document.getElementById('confirm-start').addEventListener('click', function () {
                sessionStorage.setItem(`evaluationStarted_${userId}`, 'true');
                const startTime = new Date().getTime();
                sessionStorage.setItem(`startTime_${userId}`, startTime); // Guardar la hora de inicio
                modal.style.display = 'none';
                startTimer(); // Iniciar el temporizador
                sessionStorage.setItem('lastCompletedStep', 1); // Marcar PASO_1 como completado
            });

            // Manejar la cancelación, redirigir al login
            document.getElementById('cancel-start').addEventListener('click', function () {
                redirectToLogin();
            });
        }
    } else {
        // Para cualquier otro paso, solo continuar con el temporizador desde la hora de inicio almacenada
        startTimer(); // Iniciar el temporizador
    }
};

// Función para iniciar el temporizador
function startTimer() {
    const timerDisplay = document.getElementById('timer');

    countdown = setInterval(function() {
        const startTime = parseInt(sessionStorage.getItem(`startTime_${userId}`));
        const currentTime = new Date().getTime();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);

        timeLeft = 180 - elapsedTime;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            showTimeoutModal(); // Mostrar el modal de tiempo agotado
        } else {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;

            // Actualizar el contenido del temporizador en la pantalla
            timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }, 1000);
}

// Función para mostrar el modal de tiempo agotado
function showTimeoutModal() {
    const timeoutModal = document.getElementById('timeout-modal');
    timeoutModal.style.display = 'block';

    document.getElementById('exit-evaluation').addEventListener('click', function() {
        redirectToLogin();
    });
}

// Función para redirigir al login
function redirectToLogin() {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/');

    // Subir tres niveles desde el paso (ejemplo: /LINEA_X/NUMERO_PARTE/PASO_X/)
    const loginPath = pathSegments.slice(0, -4).join('/') + '/LOGIN.html';

    window.location.href = loginPath;
}

function selectCable(event) {
    if (event.target.tagName === 'circle') {
        if (selectedCable) {
            if (selectedCable.circle === event.target) {
                // Si el cable seleccionado es el mismo que se está haciendo clic nuevamente, se deselecciona
                resetSelectedCable();
                return;
            } else {
                // Si ya hay otro cable seleccionado, se deselecciona primero
                resetSelectedCable();
            }
        }

        const cableItem = event.target.parentNode.parentNode;
        const delimiter = document.createElement('div');
        delimiter.className = 'cable-delimiter';
        cableItem.appendChild(delimiter);

        const cableType = event.target.parentNode.dataset.id;

        selectedCable = {
            element: event.target.parentNode,
            circle: event.target,
            originalColor: event.target.getAttribute("fill"),
            delimiter: delimiter,
            isDummy: cableType === 'DMY'
        };

        const overlayLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        overlayLine.setAttribute("stroke", selectedCable.isDummy ? "black" : selectedCable.originalColor);
        overlayLine.setAttribute("stroke-width", "4");

        if (selectedCable.isDummy) {
            overlayLine.setAttribute("stroke-dasharray", "4");
        }

        const overlay = document.getElementById("cable-overlay");
        overlay.appendChild(overlayLine);

        selectedCable.overlayLine = overlayLine;

        document.addEventListener("mousemove", moveCable);
    }
}

function moveCable(event) {
    if (!selectedCable) return;

    const cableRect = selectedCable.circle.getBoundingClientRect();
    const x1 = cableRect.left + cableRect.width / 2 + window.scrollX;
    const y1 = cableRect.top + cableRect.height / 2 + window.scrollY;

    const x2 = event.clientX + window.scrollX;
    const y2 = event.clientY + window.scrollY;

    selectedCable.overlayLine.setAttribute("x1", x1);
    selectedCable.overlayLine.setAttribute("y1", y1);
    selectedCable.overlayLine.setAttribute("x2", x2);
    selectedCable.overlayLine.setAttribute("y2", y2);
}

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

    const pathSegments = window.location.pathname.split('/');
    const stepFolder = pathSegments[pathSegments.length - 2]; // Carpeta del paso actual
    const stepName = stepFolder.replace('_', ' '); // Reemplazar _ por un espacio

    const stepElement = document.getElementById('step');
    stepElement.textContent = stepName.charAt(0).toUpperCase() + stepName.slice(1); // Capitaliza la primera letra

    const connectorElement = document.querySelector('.connector');

    // Calcular cuántas cavidades irán en la fila inferior y superior
    const cavitiesPerRowBottom = Math.ceil(numberOfCavities / 2); // Redondear hacia arriba para la fila inferior
    const cavitiesPerRowTop = Math.floor(numberOfCavities / 2);  // Redondear hacia abajo para la fila superior

    // Generar cavidades automáticamente
    for (let i = 1; i <= numberOfCavities; i++) {
        const cavity = document.createElement('div');
        cavity.className = 'cavity';
        cavity.dataset.id = i;
        cavity.textContent = i;
        cavity.style.position = 'absolute'; // Asegura que se pueda posicionar

        const connectorElement = document.querySelector('.connector');
        connectorElement.appendChild(cavity);

        // Verificar si la posición ya está definida en el CSS
        const computedStyle = window.getComputedStyle(cavity);
        const topCSS = computedStyle.getPropertyValue('top');
        const leftCSS = computedStyle.getPropertyValue('left');

        if (topCSS === 'auto' || leftCSS === 'auto') {
            // Si no hay posición en el CSS, usar la posición generada automáticamente

            // Determinar si la cavidad está en la fila superior o inferior
            let rowIndex, colIndex;
            if (i <= cavitiesPerRowBottom) {
                // Colocar en la fila inferior
                rowIndex = 0; // Fila inferior
                colIndex = i - 1;
            } else {
                // Colocar en la fila superior
                rowIndex = 1; // Fila superior
                colIndex = i - 1 - cavitiesPerRowBottom;
            }

            // Posicionar las cavidades
            const topOffset = 160 - rowIndex * 45; // Ajusta la altura de las filas (primera fila abajo)
            const leftOffset = 60 + colIndex * 35; // Ajusta la separación entre cavidades

            cavity.style.top = `${topOffset}px`;
            cavity.style.left = `${leftOffset}px`;
        }

        // Asigna el evento de clic
        cavity.onclick = handleCavityClick;
    }
});

function handleCavityClick(event) {
    const cavityId = event.target.dataset.id;

    // Verificar si ya hay un cable conectado a esta cavidad
    const existingConnection = connections.find(connection => connection.cavityId === cavityId);

    if (existingConnection) {
        // Si ya hay una conexión, eliminar el cable
        removeCable(event);
    } else {
        // Si no hay conexión, intentar colocar el cable
        placeCable(event);
    }
}

function placeCable(event) {
    // Verifica si el objetivo de clic es una cavidad
    if (!selectedCable || !event.target.classList.contains('cavity')) return;

    const cavityRect = event.target.getBoundingClientRect();
    const x2 = cavityRect.left + cavityRect.width / 2 + window.scrollX;
    const y2 = cavityRect.top + cavityRect.height / 2 + window.scrollY;

    const cableRect = selectedCable.circle.getBoundingClientRect();
    const x1 = cableRect.left + cableRect.width / 2 + window.scrollX;
    const y1 = cableRect.top + cableRect.height / 2 + window.scrollY;

    selectedCable.overlayLine.setAttribute("x2", x2);
    selectedCable.overlayLine.setAttribute("y2", y2);

    // Crear un círculo en la cavidad objetivo
    const cavityCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    cavityCircle.setAttribute("cx", x2);
    cavityCircle.setAttribute("cy", y2);
    cavityCircle.setAttribute("r", "10");

    if (selectedCable.isDummy) {
        cavityCircle.setAttribute("fill", "transparent");
        cavityCircle.setAttribute("stroke", "black");
        cavityCircle.setAttribute("stroke-dasharray", "4"); // Círculo punteado para cable dummy
    } else {
        cavityCircle.setAttribute("fill", selectedCable.originalColor);
    }

    const overlay = document.getElementById("cable-overlay");
    overlay.appendChild(cavityCircle);

    // Elimina el círculo delimitador negro cuando se coloca el cable
    selectedCable.delimiter.remove();

    connections.push({
        cableId: selectedCable.element.dataset.id,
        cavityId: event.target.dataset.id,
        overlayLine: selectedCable.overlayLine,
        cableCircle: selectedCable.circle,
        cavityElement: event.target,
        cavityCircle: cavityCircle // Guarda el círculo de la cavidad para futuras manipulaciones
    });

    selectedCable = null;
    document.removeEventListener("mousemove", moveCable);

    updateLines(); // Asegura que todas las líneas estén actualizadas
}

function resetSelectedCable() {
    if (selectedCable) {
        if (selectedCable.overlayLine) {
            selectedCable.overlayLine.remove();
        }
        if (selectedCable.delimiter) {
            selectedCable.delimiter.remove();
        }
    }
    document.removeEventListener("mousemove", moveCable);
    selectedCable = null;
}

function removeCable(event) {
    const cavityId = event.target.dataset.id;

    const connectionIndex = connections.findIndex(connection => connection.cavityId === cavityId);

    if (connectionIndex !== -1) {
        const connection = connections[connectionIndex];
        connection.overlayLine.remove();
        connection.cavityCircle.remove(); // Remover el círculo de la cavidad
        connections.splice(connectionIndex, 1);
    }
}

function updateLines() {
    connections.forEach(connection => {
        const cableRect = connection.cableCircle.getBoundingClientRect();
        const cavityRect = connection.cavityElement.getBoundingClientRect();

        const x1 = cableRect.left + cableRect.width / 2 + window.scrollX;
        const y1 = cableRect.top + cableRect.height / 2 + window.scrollY;

        const x2 = cavityRect.left + cavityRect.width / 2 + window.scrollX;
        const y2 = cavityRect.top + cavityRect.height / 2 + window.scrollY;

        connection.overlayLine.setAttribute("x1", x1);
        connection.overlayLine.setAttribute("y1", y1);
        connection.overlayLine.setAttribute("x2", x2);
        connection.overlayLine.setAttribute("y2", y2);

        // Actualiza la posición del círculo de la cavidad también
        connection.cavityCircle.setAttribute("cx", x2);
        connection.cavityCircle.setAttribute("cy", y2);
    });
}

// Actualizar líneas cuando la ventana se redimensiona o se desplaza
window.addEventListener('resize', updateLines);
window.addEventListener('scroll', updateLines);

function evaluateConnections() {
    const currentPath = window.location.pathname;
    const currentFileName = currentPath.split('/').pop(); // Obtener el nombre del archivo actual
    const stepIndex = parseInt(currentFileName.match(/PASO_(\d+)/)[1]); // Extraer el número del paso

    let attempts = JSON.parse(sessionStorage.getItem('attempts')) || {};
    const currentStep = `PASO_${stepIndex}`;

    if (!attempts[currentStep]) {
        attempts[currentStep] = 0;
    }
    attempts[currentStep] += 1;  // Incrementar intentos para este paso
    sessionStorage.setItem('attempts', JSON.stringify(attempts));

    if (connections.length === 0) {
        const resultElement = document.getElementById("result");
        resultElement.textContent = "No hay conexiones realizadas.";
        resultElement.style.color = "orange";
        return;
    }

    let isCorrect = true;
    for (let cavityId in correctConnections) {
        const requiredCableId = correctConnections[cavityId];
        const connection = connections.find(conn => conn.cavityId == cavityId && conn.cableId == requiredCableId);

        if (!connection) {
            isCorrect = false;
            break;
        }
    }

    const resultElement = document.getElementById("result");
    if (isCorrect) {
        resultElement.textContent = "¡Conexión correcta!";
        resultElement.style.color = "green";

        // Mostrar botón de "Siguiente Paso"
        showNextStepButton(); // Mostrar el botón "Siguiente Paso"
    } else {
        resultElement.textContent = "Conexión incorrecta";
        resultElement.style.color = "red";
    }
}

function showNextStepButton() {
    const nextButton = document.getElementById('next-step-button');
    nextButton.style.display = 'inline-block'; // Mostrar el botón

    // Asignar la función para ir al siguiente paso
    nextButton.onclick = function() {
        const currentPath = window.location.pathname;
        const pathSegments = currentPath.split('/');

        // Obtener el nombre del archivo actual
        const currentFileName = pathSegments[pathSegments.length - 1]; // e.g., 24093_6LY0A_PASO_1.html

        // Extraer el número de paso actual del nombre del archivo
        const stepIndex = parseInt(currentFileName.match(/PASO_(\d+)/)[1]);
        const nextStepIndex = stepIndex + 1;

        // Guardar el último paso completado
        sessionStorage.setItem('lastCompletedStep', stepIndex);

        // Construir el nombre del archivo para el siguiente paso
        const nextStepFileName = currentFileName.replace(`PASO_${stepIndex}`, `PASO_${nextStepIndex}`);

        // Construir la ruta completa para la carpeta del siguiente paso
        const currentPartFolder = pathSegments.slice(0, -2).join('/'); // Subir hasta la carpeta del número de parte
        const nextStepFolder = `PASO_${nextStepIndex}`; // Carpeta del siguiente paso
        const fullNextStepPath = `${currentPartFolder}/${nextStepFolder}/${nextStepFileName}`;

        window.location.href = fullNextStepPath;
    };
}

const numberOfCavities = 3; // Declara aquí el número de cavidades que necesitas

// Definir qué cable va en cada cavidad
const correctConnections = {
    1: 'SB',
    2: 'R',
    3: 'W',
};