function drawWorkoutChart(workoutData) {
    const canvas = document.getElementById('workout-chart');
    const ctx = canvas.getContext('2d');

    // Canvas löschen     - 60 zeilen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!workoutData || workoutData.length === 0) {
        ctx.font = '20px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('Noch keine Daten vorhanden', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Diagramm-Dimensionen
    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;

    // Maximalwert finden
    let maxKalorien = 0;
    for (let i = 0; i < workoutData.length; i++) {
        if (workoutData[i].kalorien > maxKalorien) {
            maxKalorien = workoutData[i].kalorien;
        }
    }

    // Achsen zeichnen
    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Y-Achse Beschriftung
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('Kalorien', padding - 10, padding - 20);

    // Balken zeichnen
    const barWidth = chartWidth / workoutData.length * 0.8;
    const barSpacing = chartWidth / workoutData.length;

    for (let i = 0; i < workoutData.length; i++) {
        const workout = workoutData[i];
        const barHeight = (workout.kalorien / maxKalorien) * chartHeight;
        const x = padding + i * barSpacing + barSpacing * 0.1;
        const y = canvas.height - padding - barHeight;

        // Balken zeichnen
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Balken Umrandung
        ctx.strokeStyle = '#1976D2';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Datum als Label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const date = new Date(workout.datum);
        const dateStr = date.getDate() + '.' + (date.getMonth() + 1);
        ctx.fillText(dateStr, x + barWidth / 2, canvas.height - padding + 10);

        // Kalorienwert über Balken
        ctx.textBaseline = 'bottom';
        ctx.fillText(workout.kalorien, x + barWidth / 2, y - 5);
    }

    // Titel
    ctx.fillStyle = '#2196F3';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Verbrannte Kalorien (letzte 7 Tage)', canvas.width / 2, 10);
}