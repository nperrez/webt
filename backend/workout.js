import express from 'express';
import { MongoClient } from 'mongodb';

const router = express.Router();

// MongoDB-Verbindung    - 127 zeilen
const client = new MongoClient('mongodb://localhost:27017');
const db = client.db('trainingstracker');
const workouts = db.collection('workouts');

// Index erstellen (nur einmal notwendig)
workouts.createIndex({ datum: -1 });

// Kalorienfaktoren pro Trainingsart
const kalorienFaktoren = {
    krafttraining: 8,
    laufen: 10,
    radfahren: 7,
    schwimmen: 9,
    yoga: 3
};

// POST: Neues Workout speichern
router.post('/', async function(req, res) {
    let body;

    try {
        body = JSON.parse(req.body.toString('utf-8'));
    } catch (error) {
        res.status(400);
        res.type('application/json');
        res.send(JSON.stringify({ error: 'Ungültiges JSON-Format' }));
        return;
    }

    // Validierung
    const validOptions = ['krafttraining', 'joggen', 'radfahren', 'schwimmen', 'rudern'];

    if (!body.trainingsart || !validOptions.includes(body.trainingsart)) {
        res.status(400);
        res.type('application/json');
        res.send(JSON.stringify({ error: 'Ungültige Trainingsart' }));
        return;
    }

    if (!body.dauer || body.dauer < 1 || body.dauer > 300) {
        res.status(400);
        res.type('application/json');
        res.send(JSON.stringify({ error: 'Dauer muss zwischen 1 und 300 Minuten liegen' }));
        return;
    }

    if (!body.intensitaet || body.intensitaet < 1 || body.intensitaet > 10) {
        res.status(400);
        res.type('application/json');
        res.send(JSON.stringify({ error: 'Intensität muss zwischen 1 und 10 liegen' }));
        return;
    }

    if (!body.datum) {
        res.status(400);
        res.type('application/json');
        res.send(JSON.stringify({ error: 'Datum fehlt' }));
        return;
    }

    const selectedDate = new Date(body.datum);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
        res.status(400);
        res.type('application/json');
        res.send(JSON.stringify({ error: 'Datum darf nicht in der Zukunft liegen' }));
        return;
    }

    // Kalorien berechnen
    const faktor = kalorienFaktoren[body.trainingsart];
    const kalorien = Math.round(body.dauer * body.intensitaet * faktor);

    // In Datenbank speichern
    try {
        await workouts.insertOne({
            trainingsart: body.trainingsart,
            dauer: body.dauer,
            intensitaet: body.intensitaet,
            kalorien: kalorien,
            datum: new Date(body.datum),
            timestamp: new Date()
        });

        // Cookie für bevorzugte Trainingsart setzen
        res.cookie('lastTraining', body.trainingsart, { maxAge: 30 * 24 * 60 * 60 * 1000 });

        // Letzte 7 Tage abrufen
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const letzteWorkouts = await workouts.find({
            datum: { $gte: sevenDaysAgo }
        }).sort({ datum: 1 }).toArray();

        // Wochenstatistik berechnen
        let gesamtKalorien = 0;
        let gesamtDauer = 0;
        for (let i = 0; i < letzteWorkouts.length; i++) {
            gesamtKalorien += letzteWorkouts[i].kalorien;
            gesamtDauer += letzteWorkouts[i].dauer;
        }

        // Empfehlung basierend auf Cookie
        let empfehlung = 'Weiter so!';
        if (req.cookies && req.cookies.lastTraining === body.trainingsart) {
            empfehlung = 'Du trainierst regelmässig ' + body.trainingsart + ' - super!';
        }

        const response = {
            aktuelles_workout: {
                kalorien: kalorien,
                dauer: body.dauer
            },
            letzte_workouts: letzteWorkouts,
            wochenstatistik: {
                gesamt_kalorien: gesamtKalorien,
                gesamt_dauer: gesamtDauer,
                anzahl_workouts: letzteWorkouts.length
            },
            empfehlung: empfehlung
        };

        res.type('application/json');
        res.send(JSON.stringify(response));

    } catch (error) {
        console.error('Datenbankfehler:', error);
        res.status(500);
        res.type('application/json');
        res.send(JSON.stringify({ error: 'Serverfehler beim Speichern' }));
    }
});

// GET: Workout-Daten abrufen
router.get('/', async function(req, res) {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const letzteWorkouts = await workouts.find({
            datum: { $gte: sevenDaysAgo }
        }).sort({ datum: 1 }).toArray();

        const response = {
            letzte_workouts: letzteWorkouts
        };

        res.type('application/json');
        res.send(JSON.stringify(response));

    } catch (error) {
        console.error('Datenbankfehler:', error);
        res.status(500);
        res.type('application/json');
        res.send(JSON.stringify({ error: 'Serverfehler beim Abrufen' }));
    }
});

export default router;