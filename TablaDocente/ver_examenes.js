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

// Función para cargar exámenes
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
                    <td>${examen.limiteTiempo}</td>
                    <td>${examen.puntuacion}</td>
                    <td>
                        <button onclick="editarExamen('${key}')">Editar</button>
                        <button onclick="eliminarExamen('${key}')">Eliminar</button>
                    </td>
                `;
                tablaExamenes.appendChild(fila);
            });
        } else {
            tablaExamenes.innerHTML = '<tr><td colspan="4">No hay exámenes publicados.</td></tr>';
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

// Función para editar examen
window.editarExamen = async function(id) {
    const examenRef = ref(database, `examenes/${id}`);
    const snapshot = await get(examenRef);
    if (snapshot.exists()) {
        const examen = snapshot.val();
        document.getElementById("tituloExamen").value = examen.titulo;
        document.getElementById("limiteTiempo").value = examen.limiteTiempo;
        document.getElementById("puntuacion").value = examen.puntuacion;

        // Cargar preguntas existentes
        const preguntasContainer = document.getElementById("preguntasContainer");
        preguntasContainer.innerHTML = ''; // Limpiar preguntas anteriores
        examen.preguntas.forEach((pregunta, index) => {
            preguntasContainer.innerHTML += `
                <div>
                    <label for="pregunta${index}">Pregunta:</label>
                    <input type="text" id="pregunta${index}" value="${pregunta.texto}" required>
                    <label for="respuesta${index}">Respuesta Correcta:</label>
                    <input type="text" id="respuesta${index}" value="${pregunta.respuestaCorrecta}" required>
                    <button type="button" onclick="eliminarPregunta(this)">Eliminar Pregunta</button>
                </div>
            `;
        });
        abrirModal('modalEditar'); // Abre el modal

        // Manejar la edición
        document.getElementById('formEditarExamen').onsubmit = async (e) => {
            e.preventDefault();
            const nuevoExamen = {
                titulo: document.getElementById("tituloExamen").value,
                limiteTiempo: document.getElementById("limiteTiempo").value,
                puntuacion: document.getElementById("puntuacion").value,
                preguntas: obtenerPreguntas()
            };
            if (nuevoExamen.preguntas.length === 0) {
                alert("Debes agregar al menos una pregunta.");
                return;
            }
            try {
                await update(examenRef, nuevoExamen);
                alert('Examen actualizado con éxito');
                cerrarModal('modalEditar'); // Cierra el modal
                cargarExamenes(); // Recargar la tabla
            } catch (error) {
                console.error("Error actualizando el examen:", error);
            }
        };
    } else {
        console.error("No se encontró el examen para editar.");
    }
};

// Función para obtener las preguntas del formulario
function obtenerPreguntas() {
    const preguntas = [];
    const preguntasContainer = document.getElementById("preguntasContainer").children;
    for (let preguntaDiv of preguntasContainer) {
        const texto = preguntaDiv.querySelector('input[type="text"]').value;
        const respuesta = preguntaDiv.querySelector('input[type="text"]').nextElementSibling.value;
        preguntas.push({ texto, respuestaCorrecta: respuesta });
    }
    return preguntas;
}

// Función para agregar pregunta
window.agregarPregunta = function() {
    const preguntasContainer = document.getElementById("preguntasContainer");
    preguntasContainer.innerHTML += `
        <div>
            <label for="nuevaPregunta">Pregunta:</label>
            <input type="text" required>
            <label for="nuevaRespuesta">Respuesta Correcta:</label>
            <input type="text" required>
            <button type="button" onclick="eliminarPregunta(this)">Eliminar Pregunta</button>
        </div>
    `;
}

// Función para eliminar pregunta
function eliminarPregunta(button) {
    button.parentElement.remove();
}

// Función para eliminar examen
window.eliminarExamen = async function(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este examen?")) {
        try {
            const examenRef = ref(database, `examenes/${id}`);
            await remove(examenRef);
            alert('Examen eliminado con éxito');
            cargarExamenes(); // Recargar la tabla
        } catch (error) {
            console.error("Error eliminando el examen:", error);
        }
    }
};

// Cargar exámenes al iniciar
cargarExamenes();
