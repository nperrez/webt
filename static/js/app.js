// Initialisierung beim Laden der Seite    - 71 zeilen
document.addEventListener('DOMContentLoaded', function() {
    initValidation();
    loadWorkoutData();

    const form = document.getElementById('workout-form');
    form.addEventListener('submit', handleSubmit);
});

// Formular absenden
async function handleSubmit(event) {
    event.preventDefault();

    if (!validateAllFields()) {
        alert('Bitte korrigiere die Fehler im Formular.');
        return;
    }

    const formData = {
        trainingsart: document.getElementById('trainingsart').value,
        dauer: parseInt(document.getElementById('dauer').value),
        intensitaet: parseInt(document.getElementById('intensitaet').value),
        datum: document.getElementById('datum').value
    };

    try {
        const response = await fetch('/workout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
            signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
            const result = JSON.parse(await response.text());
            displayResults(result);
            document.getElementById('workout-form').reset();
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('datum').value = today;
            document.getElementById('intensitaet-wert').textContent = '5';
        } else {
            alert('Fehler beim Speichern: HTTP Status ' + response.status);
        }
    } catch (error) {
        alert('Fehler beim Speichern: ' + error.message);
    }
}

// Ergebnisse anzeigen
function displayResults(data) {
    const ausgabeDiv = document.getElementById('ausgabe-inhalt');

    let html = '<div class="w3-panel w3-pale-blue w3-border w3-border-blue">';
    html += '<h3>Workout gespeichert!</h3>';
    html += '<p><strong>Verbrannte Kalorien:</strong> ' + data.aktuelles_workout.kalorien + ' kcal</p>';
    html += '</div>';

    if (data.wochenstatistik) {
        html += '<div class="w3-panel w3-pale-green w3-border w3-border-green">';
        html += '<h3>Wochenstatistik</h3>';
        html += '<p><strong>Gesamt-Kalorien:</strong> ' + data.wochenstatistik.gesamt_kalorien + ' kcal</p>';
        html += '<p><strong>Gesamt-Dauer:</strong> ' + data.wochenstatistik.gesamt_dauer + ' Minuten</p>';
        html += '<p><strong>Anzahl Workouts:</strong> ' + data.wochenstatistik.anzahl_workouts + '</p>';
        html += '</div>';
    }

    if (data.empfehlung) {
        html += '<div class="w3-panel w3-pale-yellow w3-border w3-border-yellow">';
        html += '<p><strong>Tipp:</strong> ' + data.empfehlung + '</p>';
        html += '</div>';
    }

    ausgabeDiv.innerHTML = html;

    if (data.letzte_workouts) {
        drawWorkoutChart(data.letzte_workouts);
    }
}

// Workout-Daten beim Laden abrufen
async function loadWorkoutData() {
    try {
        const response = await fetch('/workout', {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
            const result = JSON.parse(await response.text());
            if (result.letzte_workouts && result.letzte_workouts.length > 0) {
                drawWorkoutChart(result.letzte_workouts);
            }
        }
    } catch (error) {
        console.log('Konnte keine vorhandenen Daten laden:', error.message);
    }
}