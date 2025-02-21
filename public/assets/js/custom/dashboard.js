document.addEventListener('DOMContentLoaded', function () {
    const REFRESH_INTERVAL = 30; // secondi
    let timeLeft = REFRESH_INTERVAL;
    const countdownEl = document.getElementById('countdown');
    const progressCircle = document.querySelector('.progress-ring-circle');
    const spinner = document.querySelector('.refresh-spinner');
    const circumference = 100; // valore del dash array

    function updateTimer() {
        countdownEl.textContent = timeLeft;
        const progress = (timeLeft / REFRESH_INTERVAL) * 100;
        const offset = circumference - (progress / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
    }

    function showUpdating() {
        spinner.style.display = 'inline-block';
        progressCircle.style.display = 'none';
    }

    function hideUpdating() {
        spinner.style.display = 'none';
        progressCircle.style.display = 'block';
    }

    async function updateServerStatus() {
        showUpdating();
        try {
            const response = await fetch('/dashboard/server-status');
            const servers = await response.json();
            servers.forEach(server => {
                const serverCard = document.querySelector(`[data-server-id="${server.id}"]`);
                if (!serverCard) return;

                // Aggiorna status badge
                const statusBadge = serverCard.querySelector('.status-badge');
                if (!server.is_active) {
                    statusBadge.className = 'status-badge disabled';
                    statusBadge.textContent = 'Disabled';
                } else {
                    statusBadge.className = `status-badge ${server.status ? 'online' : 'offline'}`;
                    statusBadge.textContent = server.status ? 'Online' : 'Offline';
                }

                // Aggiorna metriche
                serverCard.querySelector('.active-connections').textContent =
                    server.active_connections;
                serverCard.querySelector('.total-users').textContent =
                    `${server.total_users}/${server.max_users || '∞'}`;
            });
        } catch (error) {
            console.error('Error updating server status:', error);
        }
        hideUpdating();
    }

    // Gestione timer di aggiornamento
    function startTimer() {
        timeLeft = REFRESH_INTERVAL;
        updateTimer();

        const timer = setInterval(() => {
            timeLeft--;
            updateTimer();

            if (timeLeft <= 0) {
                clearInterval(timer);
                updateServerStatus().then(() => {
                    startTimer();
                });
            }
        }, 1000);
    }

    // Avvia il timer iniziale
    startTimer();

    // Eventi per il refresh manuale
    document.querySelector('.refresh-timer').addEventListener('click', () => {
        if (timeLeft > 1) { // Previene doppi click durante l'aggiornamento
            updateServerStatus().then(() => {
                startTimer();
            });
        }
    });
});
