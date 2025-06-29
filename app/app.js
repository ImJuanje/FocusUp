document.addEventListener('DOMContentLoaded', () => {
  const timerDisplay = document.getElementById('timer');
  const timeButtons = document.querySelectorAll('.time-btn');
  const startPauseBtn = document.getElementById('start-pause');
  const logInput = document.getElementById('log-input');
  const saveLogBtn = document.getElementById('save-log');
  const logList = document.getElementById('log-list');
  const downloadBtn = document.getElementById('download-log');
  const stateSelect = document.getElementById('state-select');
  const daySummary = document.getElementById('day-summary');
  const exportContainer = document.getElementById('export-content');
  const increaseBtn = document.getElementById('increase-time');
  const decreaseBtn = document.getElementById('decrease-time');

  // Variables timer
  let isRunning = false;
  let totalDuration = 25 * 60; // segundos
  let endTime = null;
  let countdownInterval = null;

  // Variables logs
  let logs = [];

  // Función para mostrar el tiempo en formato MM:SS
  function updateTimerDisplay(secondsLeft) {
    const min = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const sec = String(secondsLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `${min}:${sec}`;
  }

  // Tick del temporizador
  function tick() {
    const secondsLeft = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    updateTimerDisplay(secondsLeft);

    if (secondsLeft <= 0) {
      clearInterval(countdownInterval);
      isRunning = false;
      startPauseBtn.textContent = '▶ Iniciar';
      alert('¡Tiempo terminado!');
    }
  }

  // Iniciar temporizador
  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    endTime = Date.now() + totalDuration * 1000;
    startPauseBtn.textContent = '⏸ Pausar';
    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  // Pausar temporizador
  function pauseTimer() {
    if (!isRunning) return;
    clearInterval(countdownInterval);
    totalDuration = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    isRunning = false;
    startPauseBtn.textContent = '▶ Reanudar';
  }

  // Alternar start/pause
  function toggleTimer() {
    isRunning ? pauseTimer() : startTimer();
  }

  // Botones de tiempo preset
  timeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      totalDuration = parseInt(btn.dataset.min, 10) * 60;
      updateTimerDisplay(totalDuration);
      pauseTimer();
    });
  });

  // Botones aumentar/disminuir tiempo
  increaseBtn.addEventListener('click', () => {
    totalDuration += 60;
    if (!isRunning) updateTimerDisplay(totalDuration);
  });

  decreaseBtn.addEventListener('click', () => {
    if (totalDuration > 60) {
      totalDuration -= 60;
      if (!isRunning) updateTimerDisplay(totalDuration);
    }
  });

  // Guardar log
  saveLogBtn.addEventListener('click', () => {
    const logText = logInput.value.trim();
    const state = stateSelect.value;
    if (!logText) {
      alert('Por favor escribe algo para guardar.');
      return;
    }
    const timestamp = new Date().toLocaleString();
    const logEntry = { timestamp, state, text: logText };
    logs.push(logEntry);
    addLogToList(logEntry);
    logInput.value = '';
  });

  // Añadir log a la lista en DOM
  function addLogToList(log) {
    const li = document.createElement('li');
    li.textContent = `[${log.timestamp}] (${log.state}) ${log.text}`;
    logList.appendChild(li);
  }

  // Descargar logs como archivo txt
  downloadBtn.addEventListener('click', () => {
    if (logs.length === 0) {
      alert('No hay logs para descargar.');
      return;
    }
    const content = logs.map(l => `[${l.timestamp}] (${l.state}) ${l.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Mostrar tiempo inicial
  updateTimerDisplay(totalDuration);

});
