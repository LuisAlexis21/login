// Inicialización de Firebase
// (Asegúrate de tener tu configuración de Firebase aquí)

document.addEventListener('DOMContentLoaded', () => {
    const examForm = document.getElementById('examForm');
    const examsContainer = document.getElementById('examsContainer');

    examForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const examTitle = document.getElementById('examTitle').value;
        const examDate = document.getElementById('examDate').value;

        if (examTitle && examDate) {
            // Guardar el examen en Firebase
            const examData = {
                title: examTitle,
                date: examDate,
                createdAt: new Date().toISOString()
            };

            // Llamada a Firebase para guardar examen
            firebase.firestore().collection('exams').add(examData)
                .then(() => {
                    alert('Examen creado exitosamente');
                    examForm.reset();
                    loadExams();
                })
                .catch((error) => {
                    console.error("Error al crear el examen:", error);
                });
        }
    });

    function loadExams() {
        examsContainer.innerHTML = '';
        firebase.firestore().collection('exams').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const exam = doc.data();
                    examsContainer.innerHTML += `
                        <div class="exam-card">
                            <h3>${exam.title}</h3>
                            <p>Fecha de cierre: ${exam.date}</p>
                            <button onclick="deleteExam('${doc.id}')">Eliminar</button>
                        </div>`;
                });
            })
            .catch(error => console.error("Error al cargar exámenes:", error));
    }

    loadExams();

    window.deleteExam = function(id) {
        firebase.firestore().collection('exams').doc(id).delete()
            .then(() => {
                alert('Examen eliminado');
                loadExams();
            })
            .catch(error => console.error("Error al eliminar examen:", error));
    };
});
