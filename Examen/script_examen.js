// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDCDJxGT6Ar07iCIX_R3t95-EBhbILvOg4",
    authDomain: "login-7dbbd.firebaseapp.com",
    databaseURL: "https://login-7dbbd-default-rtdb.firebaseio.com",
    projectId: "login-7dbbd",
    storageBucket: "login-7dbbd.appspot.com",
    messagingSenderId: "382984172488",
    appId: "1:382984172488:web:858b9fd7045b9de873c6fd"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Función para crear el examen
window.crearExamen = async function(event) {
    event.preventDefault();

    // Obtener datos del formulario
    const titulo = document.getElementById('titulo').value;
    const fechaPublicacion = document.getElementById('fecha_publicacion').value;
    const horaInicio = document.getElementById('hora_inicio').value;
    const puntuacionMaxima = document.getElementById('puntuacion_maxima').value;

    // Validar que los campos requeridos no estén vacíos
    if (!titulo || !fechaPublicacion || !horaInicio || !puntuacionMaxima) {
        alert("Por favor, completa todos los campos requeridos.");
        return;
    }

    // Obtener preguntas
    const preguntasElements = document.querySelectorAll('.pregunta');
    const preguntas = [];

    preguntasElements.forEach(pregunta => {
        const textoPregunta = pregunta.querySelector('.texto').value;
        const opciones = Array.from(pregunta.querySelectorAll('.opcion')).map(opcion => opcion.value);
        const respuestaCorrecta = pregunta.querySelector('.respuesta_correcta').value;

        // Validar que la pregunta y la respuesta correcta no estén vacías
        if (textoPregunta && opciones.length > 0 && respuestaCorrecta) {
            preguntas.push({
                texto: textoPregunta,
                opciones: opciones,
                respuestaCorrecta: respuestaCorrecta
            });
        } else {
            alert("Por favor, completa todas las opciones de la pregunta.");
        }
    });

    // Validar que haya al menos una pregunta
    if (preguntas.length === 0) {
        alert("Debes agregar al menos una pregunta.");
        return;
    }

    // Guardar examen en Firebase
    const examRef = ref(database, 'examenes/' + titulo.replace(/\s+/g, '_'));
    await set(examRef, {
        titulo,
        fechaPublicacion,
        horaInicio,
        puntuacionMaxima,
        preguntas // Aquí se incluyen las preguntas
    });

    // Mostrar modal de confirmación
    document.getElementById("modalConfirmacion").style.display = "block";

    // Restablecer el formulario
    document.getElementById('examenForm').reset();
}

// Función para cerrar el modal de confirmación
window.cerrarModal = function() {
    document.getElementById("modalConfirmacion").style.display = "none";
}

// Función para agregar preguntas dinámicas
window.agregarPregunta = function() {
    const preguntasContainer = document.getElementById('preguntas');
    const preguntaHTML = `
        <div class="pregunta">
            <label>Pregunta:</label>
            <input type="text" class="texto" required>
            <div class="opciones">
                <label>Opción 1:</label><input type="text" class="opcion" required>
                <label>Opción 2:</label><input type="text" class="opcion" required>
                <button type="button" onclick="agregarOpcion(this)">Agregar Opción</button>
            </div>
            <label>Respuesta correcta:</label>
            <input type="text" class="respuesta_correcta" required>
            <button type="button" onclick="eliminarPregunta(this)">Eliminar Pregunta</button>
        </div>
    `;
    preguntasContainer.insertAdjacentHTML('beforeend', preguntaHTML);
    actualizarIndices();
}

// Función para agregar opciones dinámicas
window.agregarOpcion = function(button) {
    const opcionesContainer = button.parentElement;
    const index = opcionesContainer.querySelectorAll('.opcion').length + 1;
    const opcionHTML = `
        <label>Opción ${index}:</label>
        <input type="text" class="opcion" required>
    `;
    opcionesContainer.insertAdjacentHTML('beforeend', opcionHTML);
}

// Función para eliminar una pregunta
window.eliminarPregunta = function(button) {
    button.parentElement.remove();
    actualizarIndices();
}

// Función para actualizar los índices de las preguntas
function actualizarIndices() {
    const preguntaElements = document.querySelectorAll('.pregunta');
    preguntaElements.forEach((pregunta, index) => {
        const label = pregunta.querySelector('label');
        label.textContent = `Pregunta ${index + 1}:`;
        const opciones = pregunta.querySelectorAll('.opcion');
        opciones.forEach((opcion, opcionIndex) => {
            const opcionLabel = opcion.previousElementSibling;
            opcionLabel.textContent = `Opción ${opcionIndex + 1}:`;
        });
    });
}
