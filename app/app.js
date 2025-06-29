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

  // Variables temporizador
  let isRunning = false;
  let endTime = null;
  let countdownInterval = null;
  let totalDuration = 25 * 60; // segundos

  function updateTimerDisplay(secondsLeft) {
    const min = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const sec = String(secondsLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `${min}:${sec}`;
  }

  function tick() {
    const secondsLeft = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    updateTimerDisplay(secondsLeft);

    if (secondsLeft <= 0) {
      clearInterval(countdownInterval);
      isRunning = false;
      startPauseBtn.textContent = '▶ Iniciar';
    }
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    endTime = Date.now() + totalDuration * 1000;
    startPauseBtn.textContent = '⏸ Pausar';
    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  function pauseTimer() {
    if (!isRunning) return;
    clearInterval(countdownInterval);
    totalDuration = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    isRunning = false;
    startPauseBtn.textContent = '▶ Reanudar';
  }

  function toggleTimer() {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  // Eventos temporizador
  startPauseBtn.addEventListener('click', toggleTimer);

  timeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      totalDuration = parseInt(btn.dataset.min, 10) * 60;
      updateTimerDisplay(totalDuration);
      pauseTimer();
    });
  });

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

  // Logs - manejo de localStorage con clave del día
  const todayKey = new Date().toISOString().slice(0, 10);

  function loadLogs() {
    const logs = JSON.parse(localStorage.getItem(todayKey) || '[]');
    renderLogs(logs);
    return logs;
  }

  function saveLogs(logs) {
    localStorage.setItem(todayKey, JSON.stringify(logs));
  }

  function renderLogs(logs) {
    logList.innerHTML = '';
    logs.forEach((log, index) => {
      const li = document.createElement('li');
      li.className = 'log-item';

      const span = document.createElement('span');
      span.textContent = log;
      span.className = 'log-text';

      const editBtn = document.createElement('button');
      editBtn.textContent = '🖊';
      editBtn.className = 'edit-btn';
      editBtn.addEventListener('click', () => toggleEdit(li, index));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', () => deleteLog(index));

      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      logList.appendChild(li);
    });
  }

  function toggleEdit(li, index) {
    const span = li.querySelector('.log-text');
    const editBtn = li.querySelector('.edit-btn');

    if (editBtn.textContent === '🖊') {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = span.textContent;
      input.className = 'edit-input';

      li.insertBefore(input, span);
      li.removeChild(span);

      editBtn.textContent = '💾';
    } else {
      const input = li.querySelector('.edit-input');
      const newText = input.value.trim();

      if (newText) {
        const logs = loadLogs();
        logs[index] = newText;
        saveLogs(logs);
        loadLogs();
      }
      editBtn.textContent = '🖊';
    }
  }

  function deleteLog(index) {
    const logs = loadLogs();
    logs.splice(index, 1);
    saveLogs(logs);
    loadLogs();
  }

  function showUpgradeNotice() {
    if (document.querySelector('.upgrade-toast')) return;

    const toast = document.createElement('div');
    toast.className = 'upgrade-toast';
    toast.innerHTML = `
      🚀 Has alcanzado el límite gratuito (3 logros). <br>
      ¡Explora la versión <strong>Premium</strong> para más productividad!
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 4000);
  }

  saveLogBtn.addEventListener('click', () => {
    const text = logInput.value.trim();
    if (!text) return;

    const logs = loadLogs();
    if (logs.length >= 3) {
      showUpgradeNotice();
      return;
    }

    logs.push(text);
    saveLogs(logs);
    logInput.value = '';
    loadLogs();
  });

  // Generar PDF
  function generatePDF() {
    const logs = loadLogs();
    const summary = daySummary.value.trim();
    const state = stateSelect.value;
    const todayFormatted = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const contentHTML = `
    <div style="font-family: 'Inter', sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #3a86ff; margin: 0; font-size: 28px; font-weight: 600;">FocusUp</h1>
        <p style="color: #666; margin: 5px 0 0; font-size: 16px;">Resumen de productividad</p>
        <div style="height: 2px; background: linear-gradient(to right, #3a86ff, #6a5acd); width: 100px; margin: 15px auto;"></div>
      </div>

      <div style="margin-bottom: 25px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <p style="margin: 5px 0;"><strong style="color: #444;">Fecha:</strong> ${todayFormatted}</p>
        <p style="margin: 5px 0;"><strong style="color: #444;">Estado:</strong> ${state}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h2 style="color: #3a86ff; font-size: 20px; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #eee;">Resumen de la jornada</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; min-height: 50px;">
          ${summary || '<p style="color: #999; font-style: italic; margin: 0;">No se ha escrito resumen.</p>'}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="color: #3a86ff; font-size: 20px; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #eee;">Logros del día</h2>
        <div style="background: #f8f9fa; padding: 10px 15px; border-radius: 8px;">
          ${
            logs.length > 0 
            ? `<ul style="list-style-type: none; padding-left: 0; margin: 0;">${
                logs.map(log => `
                  <li style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center;">
                    <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #3a86ff; color: white; border-radius: 50%; margin-right: 10px; font-size: 12px;">✓</span>
                    <span style="flex: 1; color: #444;">${log}</span>
                  </li>
                `).join('')}
              </ul>`
            : `<p style="color: #999; font-style: italic;">No se han registrado logros hoy.</p>`
          }
        </div>
      </div>

      <footer style="text-align: center; color: #aaa; font-size: 12px; margin-top: 25px;">
        <p>Generado con FocusUp • ${new Date().getFullYear()}</p>
      </footer>
    </div>`;

    exportContainer.innerHTML = contentHTML;

    const opt = {
      margin:       0.4,
      filename:     `FocusUp_Resumen_${todayKey}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(exportContainer).set(opt).save();
  }

  downloadBtn.addEventListener('click', generatePDF);

  // Inicializar
  updateTimerDisplay(totalDuration);
  loadLogs();
});
