// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCDJxGT6Ar07iCIX_R3t95-EBhbILvOg4",
  authDomain: "login-7dbbd.firebaseapp.com",
  databaseURL: "https://login-7dbbd-default-rtdb.firebaseio.com",
  projectId: "login-7dbbd",
  storageBucket: "login-7dbbd.appspot.com",
  messagingSenderId: "382984172488",
  appId: "1:382984172488:web:858b9fd7045b9de873c6fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Función para crear el examen
window.crearExamen = async function(event) {
    event.preventDefault(); // Prevenir el envío del formulario
    const titulo = document.getElementById('titulo').value;
    const limiteTiempo = document.getElementById('limite_tiempo').value;
    const puntuacion = document.getElementById('puntuacion').value;
    const preguntas = [];

    // Recoger las preguntas
    const preguntaElements = document.querySelectorAll('.pregunta');
    preguntaElements.forEach(pregunta => {
        const texto = pregunta.querySelector('.texto').value;
        const opciones = Array.from(pregunta.querySelectorAll('.opcion')).map(opcion => opcion.value);
        const respuestaCorrecta = pregunta.querySelector('.respuesta_correcta').value;

        preguntas.push({ texto, opciones, respuestaCorrecta });
    });

    // Guardar en Firebase
    const examRef = ref(database, 'examenes/' + titulo.replace(/\s+/g, '_'));
    await set(examRef, {
        titulo,
        limiteTiempo,
        puntuacion,
        preguntas
    });

    alert('Examen guardado con éxito!');
}

// Función para agregar preguntas dinámicamente
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
    actualizarIndices(); // Actualiza los índices de las preguntas
}

// Función para agregar opciones dinámicamente
window.agregarOpcion = function(button) {
    const opcionesContainer = button.parentElement;
    const index = opcionesContainer.querySelectorAll('.opcion').length + 1; // Contar opciones ya añadidas
    const opcionHTML = `
        <label>Opción ${index}:</label>
        <input type="text" class="opcion" required>
    `;
    opcionesContainer.insertAdjacentHTML('beforeend', opcionHTML);
}

// Función para eliminar una pregunta
window.eliminarPregunta = function(button) {
    button.parentElement.remove();
    actualizarIndices(); // Actualiza los índices después de eliminar una pregunta
}

// Función para actualizar los índices de las preguntas
function actualizarIndices() {
    const preguntaElements = document.querySelectorAll('.pregunta');
    preguntaElements.forEach((pregunta, index) => {
        const label = pregunta.querySelector('label');
        label.textContent = `Pregunta ${index + 1}:`; // Actualiza el texto de la etiqueta

        // Actualizar los índices de las opciones
        const opciones = pregunta.querySelectorAll('.opcion');
        opciones.forEach((opcion, opcionIndex) => {
            const opcionLabel = opcion.previousElementSibling; // Selecciona la etiqueta anterior
            opcionLabel.textContent = `Opción ${opcionIndex + 1}:`; // Actualiza la etiqueta de la opción
        });
    });
}
