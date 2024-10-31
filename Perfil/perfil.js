import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

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
const auth = getAuth(app);

// Verificar el estado de autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        cargarPerfilUsuario(user.uid); // Pasa el UID del usuario autenticado
    } else {
        console.log("No hay ningún usuario autenticado");
        window.location.href = "/LoginForm/index.html"; // Redirige si no hay usuario
    }
});

// Función para cargar los datos del usuario
async function cargarPerfilUsuario(userId) {
    if (userId) {
        const userRef = ref(database, 'users/' + userId);

        try {
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const datos = snapshot.val();
                document.getElementById("nombreUsuario").innerText = datos.full_name; // Cambia a "full_name"
                document.getElementById("correoUsuario").innerText = "Correo electrónico: " + datos.email;
                document.getElementById("rolUsuario").innerText = "Rol: " + datos.role; // Cambia a "role"
            } else {
                console.error("No se encontraron datos del usuario en la base de datos.");
            }
        } catch (error) {
            console.error("Error al obtener datos del usuario:", error);
        }
    } else {
        console.error("No se ha autenticado ningún usuario.");
    }
}

// Función para cerrar sesión
window.cerrarSesion = function() {
    signOut(auth).then(() => {
        alert("Sesión cerrada");
        window.location.href = "/LoginForm/index.html";
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
}
