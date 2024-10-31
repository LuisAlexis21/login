import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Cargar exámenes y mostrarlos en la tabla
async function cargarExamenes() {
    const examenesRef = ref(database, 'examenes');
    const snapshot = await get(examenesRef);

    const examenesTable = document.getElementById('examenesTable');
    examenesTable.innerHTML = '';

    if (snapshot.exists()) {
        const examenes = snapshot.val();
        Object.keys(examenes).forEach((key) => {
            const examen = examenes[key];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${examen.titulo}</td>
                <td>${examen.fechaEntrega ? examen.fechaEntrega : 'No especificada'}</td>
                <td>${examen.calificacion || 'Sin calificar'}</td>
                <td><button onclick="verExamen('${key}')">Responder</button></td>
            `;
            examenesTable.appendChild(row);
        });
    }
}

// Mostrar preguntas del examen seleccionado
window.verExamen = async function (id) {
    const examRef = ref(database, `examenes/${id}`);
    const snapshot = await get(examRef);
    if (snapshot.exists()) {
        const examen = snapshot.val();
        document.getElementById('examTitle').textContent = examen.titulo;
        
        const questionsContainer = document.getElementById('questionsContainer');
        questionsContainer.innerHTML = '';
        
        examen.preguntas.forEach((pregunta, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.innerHTML = `
                <p><strong>${pregunta.texto}</strong></p>
                <input type="text" id="respuesta${index}" placeholder="Tu respuesta" required>
            `;
            questionsContainer.appendChild(questionDiv);
        });
        
        document.getElementById('examDetails').style.display = 'block';

        // Manejo de envío de respuestas
        document.getElementById('examForm').onsubmit = async (e) => {
            e.preventDefault();
            await enviarRespuestas(id, examen);
        };
    }
};

// Enviar respuestas y calcular calificación
async function enviarRespuestas(id, examen) {
    const respuestas = [];
    let puntosObtenidos = 0;

    examen.preguntas.forEach((pregunta, index) => {
        const respuesta = document.getElementById(`respuesta${index}`).value.trim();
        respuestas.push(respuesta);

        if (respuesta.toLowerCase() === pregunta.respuestaCorrecta.toLowerCase()) {
            puntosObtenidos++;
        }
    });

    const calificacion = (puntosObtenidos / examen.preguntas.length) * 100;
    
    // Guardar calificación en Firebase
    try {
        const examRef = ref(database, `examenes/${id}`);
        await update(examRef, { calificacion });
        alert(`Examen enviado. Calificación obtenida: ${calificacion.toFixed(2)}%`);
        
        document.getElementById('examDetails').style.display = 'none';
        cargarExamenes(); // Recargar la tabla para mostrar la calificación
    } catch (error) {
        console.error("Error al enviar las respuestas:", error);
        alert("Hubo un error al enviar las respuestas. Por favor, intenta de nuevo.");
    }
}

// Cargar exámenes al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarExamenes();
});

document.getElementById('logoutButton').addEventListener('click', () => {
    signOut(auth).then(() => {
        alert("Sesión cerrada correctamente.");
        window.location.href = 'login.html'; // Redirige al usuario a la página de inicio de sesión
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
        alert("Hubo un error al cerrar sesión. Por favor, intenta de nuevo.");
    });
});
