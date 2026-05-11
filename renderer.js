// ============================================
// 番茄钟桌面应用 - 渲染进程脚本
// ============================================

const WORK_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;
const POMODOROS_FOR_LONG_BREAK = 4;

const GAME_WORK_TIME = 40 * 60;
const GAME_BREAK_TIME = 10 * 60;

const STATE = { WORK: 'work', SHORT_BREAK: 'short_break', LONG_BREAK: 'long_break' };
const MODE = { POMODORO: 'pomodoro', GAME: 'game' };

const LABELS = {
  pomodoro_work: '专注时间',
  pomodoro_short_break: '短休息',
  pomodoro_long_break: '长休息',
  game_work: '游戏时间',
  game_break: '游戏休息'
};

const ACCENT_COLORS = {
  pomodoro_work: '#4CAF50',
  pomodoro_short_break: '#42A5F5',
  pomodoro_long_break: '#AB47BC',
  game_work: '#FF7043',
  game_break: '#26A69A'
};

let currentMode = MODE.POMODORO;
let currentState = STATE.WORK;
let timeRemaining = WORK_TIME;
let totalTime = WORK_TIME;
let isRunning = false;
let pomodoroCount = 0;
let timerInterval = null;
let soundEnabled = true;

// Date-based 精确计时
let startedAt = 0;
let pausedRemaining = 0;

const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const timerLabel = document.getElementById('timerLabel');
const timerProgress = document.getElementById('timerProgress');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');
const pomodoroDots = document.getElementById('pomodoroDots');
const dotElements = pomodoroDots.querySelectorAll('.dot');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const themeSelect = document.getElementById('themeSelect');
const alwaysOnTopCheckbox = document.getElementById('alwaysOnTop');
const soundCheckbox = document.getElementById('soundEnabled');
const alarmSound = document.getElementById('alarmSound');
const pomodoroModeBtn = document.getElementById('pomodoroMode');
const gameModeBtn = document.getElementById('gameMode');

const CIRCUMFERENCE = 2 * Math.PI * 90;
timerProgress.style.strokeDasharray = CIRCUMFERENCE;

// ============================================
// 核心功能函数
// ============================================

function getTotalTime() {
  if (currentMode === MODE.GAME) {
    return currentState === STATE.WORK ? GAME_WORK_TIME : GAME_BREAK_TIME;
  }
  return currentState === STATE.WORK ? WORK_TIME :
         currentState === STATE.SHORT_BREAK ? SHORT_BREAK_TIME : LONG_BREAK_TIME;
}

function getStateKey() {
  return `${currentMode}_${currentState}`;
}

function refreshUI() {
  timerLabel.textContent = LABELS[getStateKey()];
  updateAccentColor();
  updateDisplay();
}

function updateDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  minutesEl.textContent = minutes.toString().padStart(2, '0');
  secondsEl.textContent = seconds.toString().padStart(2, '0');
  timerProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - timeRemaining / totalTime);
}

function updateAccentColor() {
  document.documentElement.style.setProperty('--accent-color', ACCENT_COLORS[getStateKey()]);
}

function updatePomodoroDots() {
  if (currentMode === MODE.GAME) {
    dotElements.forEach(dot => dot.classList.remove('filled'));
    return;
  }
  dotElements.forEach((dot, i) => {
    dot.classList.toggle('filled', i < pomodoroCount % POMODOROS_FOR_LONG_BREAK);
  });
}

function playSound() {
  if (!soundEnabled) return;
  alarmSound.currentTime = 0;
  alarmSound.play().catch(() => {});
}

function showNotification() {
  const isWork = currentState === STATE.WORK;
  const modeLabel = currentMode === MODE.GAME ? '游戏' : '专注';
  window.electronAPI.showNotification(
    isWork ? `${modeLabel}结束！` : '休息结束！',
    isWork ? '该休息一下了' : `继续${modeLabel}吧`
  );
}

function transitionToBreak() {
  const isLongBreak = currentMode === MODE.POMODORO && pomodoroCount % POMODOROS_FOR_LONG_BREAK === 0;
  currentState = isLongBreak ? STATE.LONG_BREAK : STATE.SHORT_BREAK;
  timeRemaining = totalTime = getTotalTime();
}

function switchState() {
  if (currentState !== STATE.WORK) {
    currentState = STATE.WORK;
    timeRemaining = totalTime = getTotalTime();
    refreshUI();
    return;
  }

  if (currentMode === MODE.POMODORO) {
    pomodoroCount++;
    updatePomodoroDots();
  }

  transitionToBreak();
  refreshUI();
}

function tick() {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  timeRemaining = Math.max(0, pausedRemaining - elapsed);
  updateDisplay();

  if (timeRemaining <= 0) {
    stopTimer();
    playSound();
    showNotification();
    switchState();
  }
}

// ============================================
// 计时器控制函数
// ============================================

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  startBtn.textContent = '暂停';
  startBtn.classList.add('paused');
  pausedRemaining = timeRemaining;
  startedAt = Date.now();
  timerInterval = setInterval(tick, 200);
}

function stopTimer() {
  if (!isRunning) return;
  isRunning = false;
  startBtn.textContent = '开始';
  startBtn.classList.remove('paused');
  clearInterval(timerInterval);
  timerInterval = null;
  // 保存精确的剩余时间
  if (startedAt) {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    timeRemaining = Math.max(0, pausedRemaining - elapsed);
    updateDisplay();
  }
}

function reset() {
  stopTimer();
  currentState = STATE.WORK;
  timeRemaining = totalTime = getTotalTime();
  refreshUI();
}

function skip() {
  stopTimer();
  switchState();
}

// ============================================
// 模式切换
// ============================================

function switchMode(mode) {
  if (mode === currentMode) return;
  stopTimer();
  currentMode = mode;
  currentState = STATE.WORK;
  pomodoroCount = 0;
  timeRemaining = totalTime = getTotalTime();
  pomodoroModeBtn.classList.toggle('active', mode === MODE.POMODORO);
  gameModeBtn.classList.toggle('active', mode === MODE.GAME);
  refreshUI();
}

// ============================================
// 事件绑定
// ============================================

startBtn.addEventListener('click', () => isRunning ? stopTimer() : startTimer());
resetBtn.addEventListener('click', reset);
skipBtn.addEventListener('click', skip);
pomodoroModeBtn.addEventListener('click', () => switchMode(MODE.POMODORO));
gameModeBtn.addEventListener('click', () => switchMode(MODE.GAME));

settingsBtn.addEventListener('click', () => settingsPanel.classList.remove('hidden'));
closeSettings.addEventListener('click', () => settingsPanel.classList.add('hidden'));

themeSelect.addEventListener('change', (e) => document.body.classList.toggle('dark', e.target.value === 'dark'));
alwaysOnTopCheckbox.addEventListener('change', (e) => window.electronAPI.setAlwaysOnTop(e.target.checked));
soundCheckbox.addEventListener('change', (e) => soundEnabled = e.target.checked);

// ============================================
// 键盘快捷键
// ============================================

document.addEventListener('keydown', (e) => {
  // 输入框内不触发快捷键
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      isRunning ? stopTimer() : startTimer();
      break;
    case 'KeyR':
      reset();
      break;
    case 'KeyS':
      skip();
      break;
    case 'Digit1':
      switchMode(MODE.POMODORO);
      break;
    case 'Digit2':
      switchMode(MODE.GAME);
      break;
  }
});

// ============================================
// 初始化
// ============================================

refreshUI();
updatePomodoroDots();
