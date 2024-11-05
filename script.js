// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDCDJxGT6Ar07iCIX_R3t95-EBhbILvOg4",
    authDomain: "login-7dbbd.firebaseapp.com",
    databaseURL: "https://login-7dbbd-default-rtdb.firebaseio.com/", // Asegúrate de que esto esté aquí
    projectId: "login-7dbbd",
    storageBucket: "login-7dbbd.appspot.com",
    messagingSenderId: "382984172488",
    appId: "1:382984172488:web:858b9fd7045b9de873c6fd"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar variables
const auth = firebase.auth();
const database = firebase.database();

// Función de registro con almacenamiento de rol
function register() {
    const full_name = document.getElementById('full_name').value;
    const email = document.getElementById('emailR').value;
    const password = document.getElementById('passwordR').value;
    const role = document.getElementById('studentBtn').classList.contains("hidden") ? 'docente' : 'estudiante'; // Determina el rol

    auth.createUserWithEmailAndPassword(email, password)
    .then(function() {
        const user = auth.currentUser;
        const user_data = {
            email: email,
            full_name: full_name,
            role: role // Añade el rol aquí
        };

        // Guardar en Firebase
        database.ref('users/' + user.uid).set(user_data);

        Swal.fire({
            title: "Registro Exitoso",
            text: "Bienvenido " + full_name,
            icon: "success"
        });
    })
    .catch(function(error) {
        alert("Error al registrar: " + error.message);
    });
}

// Función de inicio de sesión
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log("Iniciando sesión con:", email); // Log para depuración

    auth.signInWithEmailAndPassword(email, password)
    .then(() => {
        const user = auth.currentUser;
        console.log("Usuario autenticado:", user); // Log para depuración

        // Referencia a la base de datos para el usuario autenticado
        const userRef = database.ref('users/' + user.uid);

        userRef.once('value').then((snapshot) => {
            const userData = snapshot.val();
            console.log("Datos del usuario:", userData); // Log para depuración

            // Verifica el rol del usuario
            if (userData && userData.role === 'docente') {
                window.location.href = 'Docente/index.html'; // Redirige a la página del docente
            } else if (userData && userData.role === 'estudiante') {
                window.location.href = 'Estudiante/index.html'; // Redirige a la página del estudiante
            } else {
                alert('No hay datos o algún dato es incorrecto.');
            }
        });  
    })
    .catch((error) => {
        console.error("Error al iniciar sesión:", error); // Log para depuración
        alert("Error al iniciar sesión: " + error.message);
    });
}

// Programar los botones de registro e inicio de sesión
window.onload = function() {
    const registerButton = document.getElementById('registerButton');
    if (registerButton) {
        registerButton.addEventListener('click', function(event) {
            event.preventDefault(); // Evitar el envío del formulario
            register();
        });
    }

    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function(event) {
            event.preventDefault(); // Evitar el envío del formulario
            login();
        });
    }
}

// Funciones para la selección de roles
function selectRole(role) {
    document.getElementById("loginFields").classList.remove("hidden");
    if (role === 'estudiante') {
        document.getElementById("teacherBtn").classList.add("hidden");
    } else {
        document.getElementById("studentBtn").classList.add("hidden");
    }
    document.getElementById("backButton").classList.remove("hidden");
    document.getElementById("loginTitle").classList.add("static-title");
}

function goBack() {
    document.getElementById("loginFields").classList.add("hidden");
    document.getElementById("studentBtn").classList.remove("hidden");
    document.getElementById("teacherBtn").classList.remove("hidden");
    document.getElementById("backButton").classList.add("hidden");
    document.getElementById("loginTitle").classList.remove("static-title");
}

function toggleForms() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    if (loginForm.classList.contains("hidden")) {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
    } else {
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
    }
}