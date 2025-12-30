// Validierungsstatus für jedes Feld     - 124 zeilen
const fieldStatus = {
    trainingsart: { touched: false, valid: false },
    dauer: { touched: false, valid: false },
    intensitaet: { touched: false, valid: true },
    datum: { touched: false, valid: false }
};

// Validierungsfunktionen
function validateTrainingsart(value) {
    const validOptions = ['krafttraining', 'joggen', 'radfahren', 'schwimmen', 'rudern'];
    if (!value || value === '') {
        return { valid: false, message: 'Bitte wähle eine Trainingsart aus.' };
    }
    if (!validOptions.includes(value)) {
        return { valid: false, message: 'Ungültige Trainingsart gewählt.' };
    }
    return { valid: true, message: '' };
}

function validateDauer(value) {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
        return { valid: false, message: 'Bitte gib eine gültige Zahl ein.' };
    }
    if (num < 1 || num > 300) {
        return { valid: false, message: 'Dauer muss zwischen 1 und 300 Minuten liegen.' };
    }
    return { valid: true, message: '' };
}

function validateIntensitaet(value) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num > 10) {
        return { valid: false, message: 'Intensität muss zwischen 1 und 10 liegen.' };
    }
    return { valid: true, message: '' };
}

function validateDatum(value) {
    if (!value) {
        return { valid: false, message: 'Bitte wähle ein Datum aus.' };
    }
    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
        return { valid: false, message: 'Datum darf nicht in der Zukunft liegen.' };
    }
    const minDate = new Date('2020-01-01');
    if (selectedDate < minDate) {
        return { valid: false, message: 'Datum muss nach dem 01.01.2020 liegen.' };
    }
    return { valid: true, message: '' };
}

// Fehlermeldung anzeigen/verstecken
function showError(fieldId, message) {
    const errorElement = document.getElementById(`error-${fieldId}`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
    }
}

// Einzelnes Feld validieren
function validateField(fieldId, value) {
    let result;
    switch (fieldId) {
        case 'trainingsart':
            result = validateTrainingsart(value);
            break;
        case 'dauer':
            result = validateDauer(value);
            break;
        case 'intensitaet':
            result = validateIntensitaet(value);
            break;
        case 'datum':
            result = validateDatum(value);
            break;
        default:
            return false;
    }
    fieldStatus[fieldId].valid = result.valid;
    if (fieldStatus[fieldId].touched) {
        showError(fieldId, result.message);
    }
    return result.valid;
}

// Alle Felder validieren
function validateAllFields() {
    const trainingsart = document.getElementById('trainingsart').value;
    const dauer = document.getElementById('dauer').value;
    const intensitaet = document.getElementById('intensitaet').value;
    const datum = document.getElementById('datum').value;
    fieldStatus.trainingsart.touched = true;
    fieldStatus.dauer.touched = true;
    fieldStatus.intensitaet.touched = true;
    fieldStatus.datum.touched = true;
    const isTrainingsartValid = validateField('trainingsart', trainingsart);
    const isDauerValid = validateField('dauer', dauer);
    const isIntensitaetValid = validateField('intensitaet', intensitaet);
    const isDatumValid = validateField('datum', datum);
    return isTrainingsartValid && isDauerValid && isIntensitaetValid && isDatumValid;
}

// Event-Listener initialisieren
function initValidation() {
    const trainingsartField = document.getElementById('trainingsart');
    const dauerField = document.getElementById('dauer');
    const intensitaetField = document.getElementById('intensitaet');
    const datumField = document.getElementById('datum');
    const intensitaetWert = document.getElementById('intensitaet-wert');
    trainingsartField.addEventListener('change', function() {
        fieldStatus.trainingsart.touched = true;
        validateField('trainingsart', this.value);
    });
    dauerField.addEventListener('input', function() {
        fieldStatus.dauer.touched = true;
        validateField('dauer', this.value);
    });
    intensitaetField.addEventListener('input', function() {
        fieldStatus.intensitaet.touched = true;
        intensitaetWert.textContent = this.value;
        validateField('intensitaet', this.value);
    });
    datumField.addEventListener('change', function() {
        fieldStatus.datum.touched = true;
        validateField('datum', this.value);
    });
    const today = new Date().toISOString().split('T')[0];
    datumField.value = today;
}

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateAllFields, initValidation };
}