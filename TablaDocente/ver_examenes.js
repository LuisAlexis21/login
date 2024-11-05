// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, get, remove, update } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

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

async function cargarExamenes() {
    try {
        const examenesRef = ref(database, 'examenes');
        const snapshot = await get(examenesRef);
        const tablaExamenes = document.getElementById('tabla-examenes').querySelector('tbody');
        tablaExamenes.innerHTML = ''; // Limpiar la tabla

        if (snapshot.exists()) {
            const examenes = snapshot.val();
            Object.keys(examenes).forEach((key) => {
                const examen = examenes[key];
                const fila = document.createElement('tr');

                fila.innerHTML = `
                    <td>${examen.titulo}</td>
                    <td>${examen.fechaPublicacion || 'No especificada'}</td> <!-- Actualizado -->
                    <td>${examen.horaInicio || 'No especificada'}</td> <!-- Actualizado -->
                    <td>${examen.puntuacionMaxima || 'No especificada'}</td> <!-- Actualizado -->
                    <td>
                        <button class="btn-editar" onclick="editarExamen('${key}')">Editar</button>
                        <button class="btn-eliminar" onclick="eliminarExamen('${key}')">Eliminar</button>
                    </td>
                `;
                tablaExamenes.appendChild(fila);
            });
        } else {
            tablaExamenes.innerHTML = '<tr><td colspan="5">No hay exámenes publicados.</td></tr>';
        }
    } catch (error) {
        console.error("Error cargando los exámenes:", error);
    }
}


// Función para abrir el modal
function abrirModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

// Función para cerrar el modal
function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Manejo de la edición
window.editarExamen = async function (id) {
    const examenRef = ref(database, `examenes/${id}`);
    const snapshot = await get(examenRef);
    if (snapshot.exists()) {
        const examen = snapshot.val();
        document.getElementById("tituloExamen").value = examen.titulo;
        document.getElementById("fechaEntrega").value = examen.fechaEntrega;
        document.getElementById("horaInicio").value = examen.horaInicio;
        document.getElementById("puntuacion").value = examen.puntuacion;

        // Cargar preguntas existentes
        const preguntasContainer = document.getElementById("preguntasContainer");
        preguntasContainer.innerHTML = ''; // Limpiar preguntas anteriores

        // Verificar si existen preguntas
        if (Array.isArray(examen.preguntas)) {
            examen.preguntas.forEach((pregunta, index) => {
                preguntasContainer.innerHTML += `
                    <div class="pregunta">
                        <label for="pregunta${index}">Pregunta:</label>
                        <input type="text" id="pregunta${index}" value="${pregunta.texto}" required>
                        <label for="respuesta${index}">Respuesta Correcta:</label>
                        <input type="text" id="respuesta${index}" value="${pregunta.respuestaCorrecta}" required>
                        <button type="button" class="btn-eliminar-pregunta" onclick="eliminarPregunta(this)">Eliminar Pregunta</button>
                    </div>
                `;
            });
        }

        abrirModal('modalEditar');

        // Manejar la edición
        document.getElementById('formEditarExamen').onsubmit = async (e) => {
            e.preventDefault();
            const nuevoExamen = {
                titulo: document.getElementById("tituloExamen").value,
                fechaEntrega: document.getElementById("fechaEntrega").value,
                horaInicio: document.getElementById("horaInicio").value,
                puntuacion: document.getElementById("puntuacion").value,
                preguntas: obtenerPreguntas() // Asegúrate de que esta función retorne el formato correcto
            };

            // Validar que las preguntas no estén vacías
            const validacion = nuevoExamen.preguntas.every(pregunta => pregunta.texto && pregunta.respuestaCorrecta);
            if (!validacion) {
                alert("Debes completar todas las preguntas y respuestas.");
                return;
            }

            try {
                await update(examenRef, nuevoExamen);
                alert('Examen actualizado con éxito');
                cerrarModal('modalEditar');
                cargarExamenes(); // Recargar la tabla
            } catch (error) {
                console.error("Error actualizando el examen:", error);
            }
        };
    } else {
        console.error("No se encontró el examen para editar.");
    }
};

// Función para obtener preguntas
function obtenerPreguntas() {
    const preguntasElements = document.querySelectorAll('.pregunta');
    const preguntas = [];
    preguntasElements.forEach((preguntaElement) => {
        const textoPregunta = preguntaElement.querySelector('input[type="text"]:nth-child(2)').value;
        const respuestaCorrecta = preguntaElement.querySelector('input[type="text"]:nth-child(4)').value;
        if (textoPregunta && respuestaCorrecta) {
            preguntas.push({
                texto: textoPregunta,
                respuestaCorrecta: respuestaCorrecta
            });
        }
    });
    return preguntas;
}

// Función para agregar pregunta
window.agregarPregunta = function () {
    const preguntasContainer = document.getElementById("preguntasContainer");
    preguntasContainer.innerHTML += `
        <div class="pregunta">
            <label for="nuevaPregunta">Pregunta:</label>
            <input type="text" required>
            <label for="nuevaRespuesta">Respuesta Correcta:</label>
            <input type="text" required>
            <button type="button" class="btn-eliminar-pregunta" onclick="eliminarPregunta(this)">Eliminar Pregunta</button>
        </div>
    `;
};

// Función para eliminar pregunta
window.eliminarPregunta = function (button) {
    const preguntaDiv = button.parentElement;
    preguntaDiv.remove();
};

// Función para eliminar examen
window.eliminarExamen = async function (id) {
    const examenRef = ref(database, `examenes/${id}`);
    if (confirm("¿Estás seguro de que deseas eliminar este examen?")) {
        try {
            await remove(examenRef);
            alert('Examen eliminado con éxito');
            cargarExamenes(); // Recargar la tabla
        } catch (error) {
            console.error("Error eliminando el examen:", error);
        }
    }
};

// Cargar exámenes al iniciar la página
cargarExamenes();

// Exponer funciones al objeto window
window.cerrarModal = cerrarModal;
